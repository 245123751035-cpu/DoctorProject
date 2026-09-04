import { NextResponse } from "next/server";
import { currentPatientUser } from "@/lib/auth/current";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const patientUser = await currentPatientUser();
    if (!patientUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const patient = await db.patient.findUnique({
      where: { patientUserId: patientUser.id },
      include: {
        doctor: { select: { name: true, clinicName: true } },
        consultations: { orderBy: { createdAt: "desc" }, take: 10 },
        patientReports: { orderBy: { createdAt: "desc" }, take: 10 },
        medications: { orderBy: { createdAt: "desc" } },
        allergies: true,
        medicalConditions: true
      }
    });

    if (!patient) {
      return NextResponse.json({ ok: true, patient: null });
    }

    return NextResponse.json({
      ok: true,
      patient: {
        id: patient.id,
        fullName: patient.fullName,
        patientCode: patient.patientCode,
        age: patient.age,
        gender: patient.gender,
        dateOfBirth: patient.dateOfBirth,
        phone: patient.phone,
        address: patient.address,
        bloodGroup: patient.bloodGroup,
        knownAllergies: patient.knownAllergies,
        existingConditions: patient.existingConditions,
        doctor: patient.doctor,
        consultations: patient.consultations,
        patientReports: patient.patientReports,
        medications: patient.medications,
        allergies: patient.allergies,
        medicalConditions: patient.medicalConditions
      }
    });
  } catch (error) {
    console.error("Get patient profile error:", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
