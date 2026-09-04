import { NextResponse } from "next/server";
import { currentDoctor } from "@/lib/auth/current";
import { db } from "@/lib/db";
import { writeAuditLog } from "@/services/audit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const doctor = await currentDoctor();
    if (!doctor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const patientId = typeof body?.patientId === "string" ? body.patientId.trim() : "";
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!patientId || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Enter a valid email address of the patient's account." },
        { status: 400 }
      );
    }

    const patient = await db.patient.findFirst({
      where: { id: patientId, doctorId: doctor.id }
    });
    if (!patient) {
      return NextResponse.json({ error: "Patient not found." }, { status: 404 });
    }

    if (patient.patientUserId) {
      return NextResponse.json(
        { error: "This patient record is already linked to an account." },
        { status: 409 }
      );
    }

    const patientUser = await db.patientUser.findUnique({ where: { email } });
    if (!patientUser) {
      return NextResponse.json(
        { error: "No patient account was found with that email." },
        { status: 404 }
      );
    }

    const alreadyLinked = await db.patient.findUnique({
      where: { patientUserId: patientUser.id }
    });
    if (alreadyLinked) {
      return NextResponse.json(
        { error: "That account is already linked to another patient record." },
        { status: 409 }
      );
    }

    await db.patient.update({
      where: { id: patient.id },
      data: { patientUserId: patientUser.id }
    });

    writeAuditLog({
      doctorId: doctor.id,
      patientId: patient.id,
      action: "patient.link",
      details: email
    });

    return NextResponse.json({ ok: true, email: patientUser.email });
  } catch (error) {
    console.error("Link patient account error:", error);
    return NextResponse.json(
      { error: "Something went wrong while linking the account." },
      { status: 500 }
    );
  }
}