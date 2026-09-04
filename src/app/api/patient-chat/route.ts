import { NextResponse } from "next/server";
import { requirePatientAuth } from "@/lib/auth/current";
import { db } from "@/lib/db";
import { getTriageOutcome, type SupportLang } from "@/lib/chat/triage";
import { writeAuditLog } from "@/services/audit";

export const dynamic = "force-dynamic";

const SUPPORTED_LANGS = ["en", "hi", "te"];

function toSupportLang(value: unknown): SupportLang {
  return typeof value === "string" && (SUPPORTED_LANGS as string[]).includes(value)
    ? (value as SupportLang)
    : "en";
}

export async function POST(request: Request) {
  try {
    const patientUser = await requirePatientAuth();

    const body = await request.json().catch(() => null);
    const message = typeof body?.message === "string" ? body.message.trim().slice(0, 500) : "";
    const language = toSupportLang(body?.language);

    if (!message) {
      return NextResponse.json(
        { error: "Please describe how you are feeling so I can help." },
        { status: 400 }
      );
    }

    const patient = await db.patient.findUnique({
      where: { patientUserId: patientUser.id },
      select: { id: true, knownAllergies: true, existingConditions: true }
    });

    const outcome = getTriageOutcome(message, language);

    writeAuditLog({
      patientId: patient?.id,
      action: "chat.suggestions",
      details: `${patientUser.email}: "${message.slice(0, 120)}" -> ${outcome.urgency}`
    });

    return NextResponse.json({
      ok: true,
      reply: {
        title: outcome.title,
        summary: outcome.summary,
        urgency: outcome.urgency,
        emergency: outcome.emergency,
        selfCare: outcome.selfCare,
        seeDoctorWhen: outcome.seeDoctorWhen,
        matches: outcome.matches,
        isGreeting: outcome.isGreeting,
        context: {
          hasAllergies: Boolean(patient?.knownAllergies),
          hasConditions: Boolean(patient?.existingConditions)
        }
      }
    });
  } catch (error) {
    console.error("Patient chat error:", error);
    return NextResponse.json(
      { error: "Sorry, I could not respond right now. Please try again." },
      { status: 500 }
    );
  }
}