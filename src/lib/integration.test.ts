import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createDoctorSession, getDoctorFromCookie, destroySession } from "@/lib/auth/session";
import { createPatient, searchPatients, getPatientById } from "@/services/patient";
import { createConsultation } from "@/services/consultation";

const TEST_EMAIL = `integration.${Date.now()}@test.com`;

let doctorId: string;
let patientId: string;
let cookie: string;

beforeAll(async () => {
  const hash = await hashPassword("IntegrationPass123");
  const doctor = await db.doctor.create({
    data: {
      name: "Integration Doctor",
      email: TEST_EMAIL,
      passwordHash: hash
    }
  });
  doctorId = doctor.id;
});

afterAll(async () => {
  await db.doctor.delete({ where: { id: doctorId } }).catch(() => {});
  await db.$disconnect();
});

describe("authentication integration", () => {
  it("verifies a hashed password round-trips", async () => {
    expect(await verifyPassword("IntegrationPass123", (await db.doctor.findUniqueOrThrow({ where: { id: doctorId } })).passwordHash)).toBe(true);
  });

  it("creates a session and resolves the doctor from the cookie", async () => {
    cookie = await createDoctorSession(doctorId);
    const resolved = await getDoctorFromCookie(cookie);
    expect(resolved?.id).toBe(doctorId);
  });

  it("rejects an invalid/malformed cookie", async () => {
    const result = await getDoctorFromCookie("invalid-token.signature");
    expect(result).toBeNull();
  });

  it("destroys the session on logout", async () => {
    await destroySession(cookie);
    const resolved = await getDoctorFromCookie(cookie);
    expect(resolved).toBeNull();
  });
});

describe("patient + consultation integration", () => {
  it("creates a patient with a unique patient code and retrieves by search", async () => {
    const patient = await createPatient({
      doctorId,
      fullName: "Integration Patient",
      gender: "MALE",
      age: 35,
      dateOfBirth: null,
      bloodGroup: "",
      phone: "+91 90000 00000"
    });
    patientId = patient.id;
    expect(patient.patientCode).toMatch(/^[A-Z]{2}-\d{4}$/);

    const results = await searchPatients(doctorId, patient.patientCode);
    expect(results.some((r) => r.id === patientId)).toBe(true);
  });

  it("prevents cross-doctor access to a patient", async () => {
    const otherDoctor = await db.doctor.create({
      data: {
        name: "Other Doctor",
        email: `other.${Date.now()}@test.com`,
        passwordHash: await hashPassword("OtherPass123")
      }
    });
    const results = await searchPatients(otherDoctor.id, "Integration Patient");
    expect(results.some((r) => r.id === patientId)).toBe(false);
    const direct = await getPatientById(otherDoctor.id, patientId);
    expect(direct).toBeNull();
    await db.doctor.delete({ where: { id: otherDoctor.id } }).catch(() => {});
  });

  it("creates a consultation that persists and appears in patient history", async () => {
    await createConsultation(doctorId, {
      patientId,
      chiefComplaintLang: "en",
      chiefComplaint: "Testing headache for 2 weeks",
      symptoms: "Frontal headache"
    });

    const patient = await getPatientById(doctorId, patientId);
    expect(patient).not.toBeNull();
    const consults = patient!.consultations;
    expect(consults.length).toBe(1);
    expect(consults[0].chiefComplaint).toBe("Testing headache for 2 weeks");
  });
});
