import { NextResponse } from "next/server";
import { currentDoctor } from "@/lib/auth/current";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const doctor = await currentDoctor();
    if (!doctor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");

    if (!patientId) {
      return NextResponse.json({ error: "patientId is required" }, { status: 400 });
    }

    const patient = await db.patient.findFirst({
      where: { id: patientId, doctorId: doctor.id }
    });
    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const reports = await db.patientReport.findMany({
      where: { patientId },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ ok: true, reports });
  } catch (error) {
    console.error("Get patient reports error:", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
