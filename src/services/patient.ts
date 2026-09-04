import { Prisma, type BloodGroup } from "@prisma/client";
import { db } from "@/lib/db";
import { generatePatientCode, normalizePatientCode } from "@/lib/patient-code";

const MAX_CODE_ATTEMPTS = 10;

/**
 * Generates a unique, non-predictable patient code, checking the database
 * for collisions and retrying until a unique code is produced.
 */
export async function generateUniquePatientCode(): Promise<string> {
  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt++) {
    const code = generatePatientCode();
    const existing = await db.patient.findUnique({ where: { patientCode: code } });
    if (!existing) return code;
  }
  throw new Error("Unable to generate a unique patient code. Please try again.");
}

export interface CreatePatientInput {
  doctorId: string;
  fullName: string;
  dateOfBirth?: string | null;
  age?: number | null;
  gender: "MALE" | "FEMALE" | "OTHER";
  phone?: string | null;
  address?: string | null;
  emergencyContact?: string | null;
  bloodGroup?: string | null;
  knownAllergies?: string | null;
  existingConditions?: string | null;
  preferredLanguage?: string;
}

function computeAge(dateOfBirth?: string | null, age?: number | null): number | null {
  if (age != null && age > 0) return age;
  if (dateOfBirth) {
    const d = new Date(dateOfBirth);
    if (!isNaN(d.getTime())) {
      const now = new Date();
      let years = now.getFullYear() - d.getFullYear();
      const m = now.getMonth() - d.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < d.getDate())) years--;
      return years >= 0 ? years : 0;
    }
  }
  return null;
}

export async function createPatient(input: CreatePatientInput) {
  const patientCode = await generateUniquePatientCode();
  const computedAge = computeAge(input.dateOfBirth, input.age);

  const patient = await db.patient.create({
    data: {
      patientCode,
      doctorId: input.doctorId,
      fullName: input.fullName.trim(),
      dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
      age: computedAge,
      gender: input.gender,
      phone: input.phone || null,
      address: input.address || null,
      emergencyContact: input.emergencyContact || null,
      bloodGroup: (input.bloodGroup as BloodGroup) ?? null,
      knownAllergies: input.knownAllergies || null,
      existingConditions: input.existingConditions || null,
      preferredLanguage: input.preferredLanguage || "en"
    },
    include: { _count: { select: { consultations: true } } }
  });

  return patient;
}

export interface PatientSearchResult {
  id: string;
  patientCode: string;
  fullName: string;
  age: number | null;
  gender: string;
  lastConsultationAt: Date | null;
  consultationCount: number;
}

export async function searchPatients(
  doctorId: string,
  query: string
): Promise<PatientSearchResult[]> {
  const term = query.trim();
  if (!term) return [];

  const normalized = normalizePatientCode(term);

  const patients = await db.patient.findMany({
    where: {
      doctorId,
      OR: [
        { patientCode: { contains: normalized, mode: "insensitive" } },
        { fullName: { contains: term, mode: "insensitive" } }
      ]
    },
    include: {
      _count: { select: { consultations: true } },
      consultations: {
        select: { createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 1
      }
    },
    orderBy: { createdAt: "desc" },
    take: 20
  });

  return patients.map((p) => ({
    id: p.id,
    patientCode: p.patientCode,
    fullName: p.fullName,
    age: p.age,
    gender: p.gender,
    lastConsultationAt: p.consultations[0]?.createdAt ?? null,
    consultationCount: p._count.consultations
  }));
}

export interface PatientDetail extends Prisma.PatientGetPayload<{
  include: {
    _count: { select: { consultations: boolean } };
    medications: boolean;
    allergies: boolean;
    investigations: boolean;
    medicalConditions: boolean;
    consultations: {
      orderBy: { createdAt: "asc" };
    };
  };
}> {}

export async function getPatientById(
  doctorId: string,
  patientId: string
): Promise<PatientDetail | null> {
  const patient = await db.patient.findFirst({
    where: { id: patientId, doctorId },
    include: {
      _count: { select: { consultations: true } },
      medications: { orderBy: { createdAt: "desc" } },
      allergies: { orderBy: { createdAt: "desc" } },
      investigations: { orderBy: { createdAt: "desc" } },
      medicalConditions: { orderBy: { createdAt: "desc" } },
      consultations: {
        orderBy: { createdAt: "asc" }
      }
    }
  });
  return (patient as PatientDetail) ?? null;
}

export async function getPatientByCode(
  doctorId: string,
  code: string
): Promise<PatientDetail | null> {
  const normalized = normalizePatientCode(code);
  const patient = await db.patient.findFirst({
    where: { patientCode: { equals: normalized, mode: "insensitive" }, doctorId },
    include: {
      _count: { select: { consultations: true } },
      medications: { orderBy: { createdAt: "desc" } },
      allergies: { orderBy: { createdAt: "desc" } },
      investigations: { orderBy: { createdAt: "desc" } },
      medicalConditions: { orderBy: { createdAt: "desc" } },
      consultations: { orderBy: { createdAt: "asc" } }
    }
  });
  return (patient as PatientDetail) ?? null;
}

export interface UpdatePatientInput extends Partial<CreatePatientInput> {
  id: string;
}

export async function updatePatient(input: UpdatePatientInput) {
  const existing = await getPatientById(input.doctorId!, input.id);
  if (!existing) throw new Error("Patient not found");

  const computedAge =
    input.age != null && input.age > 0
      ? input.age
      : computeAge(input.dateOfBirth, input.age);

  return db.patient.update({
    where: { id: input.id },
    data: {
      fullName: input.fullName?.trim(),
      dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
      age: computedAge,
      gender: input.gender,
      phone: input.phone || null,
      address: input.address || null,
      emergencyContact: input.emergencyContact || null,
      bloodGroup: (input.bloodGroup as BloodGroup) || undefined,
      knownAllergies: input.knownAllergies || null,
      existingConditions: input.existingConditions || null,
      preferredLanguage: input.preferredLanguage
    }
  });
}
