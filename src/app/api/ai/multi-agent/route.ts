import { NextResponse } from "next/server";
import { currentDoctor } from "@/lib/auth/current";
import { runMultiAgentAnalysis } from "@/lib/agents/coordinator-agent";
import { writeAuditLog } from "@/services/audit";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const doctor = await currentDoctor();
    if (!doctor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const patientId = typeof body?.patientId === "string" ? body.patientId : "";
    const consultationId =
      typeof body?.consultationId === "string" && body.consultationId.length > 0
        ? body.consultationId
        : undefined;
    const language = typeof body?.language === "string" ? body.language : "en";

    if (!patientId) {
      return NextResponse.json(
        { error: "Patient is required." },
        { status: 400 }
      );
    }

    const analysis = await runMultiAgentAnalysis({
      doctorId: doctor.id,
      patientId,
      consultationId,
      language
    });

    writeAuditLog({
      doctorId: doctor.id,
      patientId,
      action: "ai.multiAgent.generated",
      details: analysis.consultationId ?? undefined
    });

    return NextResponse.json({ ok: true, analysis });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "";
    if (message === "Patient not found") {
      return NextResponse.json({ error: "Patient not found." }, { status: 404 });
    }
    if (
      message === "Consultation not found" ||
      message === "No consultation recorded for this patient yet."
    ) {
      return NextResponse.json({ error: message + "." }, { status: 400 });
    }
    console.error("Multi-agent analysis error:", error);
    // Never crash; patient records remain available.
    return NextResponse.json(
      {
        error:
          "Unable to run the multi-agent analysis right now. Your patient's stored records are still available."
      },
      { status: 500 }
    );
  }
}