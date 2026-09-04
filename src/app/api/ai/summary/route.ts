import { NextResponse } from "next/server";
import { currentDoctor } from "@/lib/auth/current";
import { generatePatientHistorySummary } from "@/services/ai";
import { writeAuditLog } from "@/services/audit";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const doctor = await currentDoctor();
    if (!doctor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const patientId = typeof body?.patientId === "string" ? body.patientId : "";
    const language = typeof body?.language === "string" ? body.language : "en";

    if (!patientId) {
      return NextResponse.json({ error: "Patient is required." }, { status: 400 });
    }

    const summary = await generatePatientHistorySummary(doctor.id, patientId, language);

    writeAuditLog({
      doctorId: doctor.id,
      patientId,
      action: "ai.summary.generated"
    });

    return NextResponse.json({ ok: true, summary });
  } catch (error) {
    console.error("AI summary error:", error);
    // Never crash; patient records remain available.
    return NextResponse.json(
      {
        error:
          "Unable to generate the AI summary right now. Your patient's stored history is still available."
      },
      { status: 500 }
    );
  }
}
