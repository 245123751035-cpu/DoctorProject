import { NextResponse } from "next/server";
import { currentDoctor } from "@/lib/auth/current";
import { consultationSchema } from "@/lib/validation/schemas";
import { createConsultation } from "@/services/consultation";
import { writeAuditLog } from "@/services/audit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const doctor = await currentDoctor();
    if (!doctor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = consultationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid consultation details.", details: flatten(parsed.error) },
        { status: 400 }
      );
    }

    const consultation = await createConsultation(doctor.id, parsed.data);

    writeAuditLog({
      doctorId: doctor.id,
      patientId: parsed.data.patientId,
      action: "consultation.create",
      details: consultation.id
    });

    return NextResponse.json({ ok: true, consultation }, { status: 201 });
  } catch (error) {
    console.error("Consultation create error:", error);
    return NextResponse.json(
      { error: "Something went wrong while saving the consultation. Please try again." },
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
