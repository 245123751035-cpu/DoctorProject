import { NextResponse } from "next/server";
import { currentDoctor } from "@/lib/auth/current";
import { patientRegisterSchema } from "@/lib/validation/schemas";
import { createPatient } from "@/services/patient";
import { writeAuditLog } from "@/services/audit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const doctor = await currentDoctor();
    if (!doctor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const parsed = patientRegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid patient details.", details: flatten(parsed.error) },
        { status: 400 }
      );
    }

    const {
      fullName,
      dateOfBirth,
      age,
      gender,
      phone,
      address,
      emergencyContact,
      bloodGroup,
      knownAllergies,
      existingConditions,
      preferredLanguage
    } = parsed.data;

    const patient = await createPatient({
      doctorId: doctor.id,
      fullName,
      dateOfBirth: dateOfBirth || null,
      age: age ?? null,
      gender,
      phone,
      address,
      emergencyContact,
      bloodGroup,
      knownAllergies,
      existingConditions,
      preferredLanguage
    });

    writeAuditLog({
      doctorId: doctor.id,
      patientId: patient.id,
      action: "patient.register",
      details: patient.patientCode
    });

    return NextResponse.json(
      { ok: true, patient: { id: patient.id, patientCode: patient.patientCode } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Patient register error:", error);
    return NextResponse.json(
      { error: "Something went wrong while registering the patient. Please try again." },
      { status: 500 }
    );
  }
}

function flatten(error: { issues: Array<{ path: (string | number)[]; message: string }> }) {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!result[key]) result[key] = issue.message;
  }
  return result;
}
