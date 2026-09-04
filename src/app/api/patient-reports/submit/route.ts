import { NextResponse } from "next/server";
import { currentPatientUser } from "@/lib/auth/current";
import { db } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const reportSchema = z.object({
  symptoms: z.string().max(4000).optional().or(z.literal("")),
  complaint: z.string().max(4000).optional().or(z.literal("")),
  medicalHistory: z.string().max(4000).optional().or(z.literal("")),
  currentCondition: z.string().max(4000).optional().or(z.literal("")),
  duration: z.string().max(200).optional().or(z.literal("")),
  additionalNotes: z.string().max(4000).optional().or(z.literal(""))
});

export async function POST(request: Request) {
  try {
    const patientUser = await currentPatientUser();
    if (!patientUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const patient = await db.patient.findUnique({
      where: { patientUserId: patientUser.id }
    });
    if (!patient) {
      return NextResponse.json({ error: "No patient profile found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = reportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid report data." }, { status: 400 });
    }

    const { symptoms, complaint, medicalHistory, currentCondition, duration, additionalNotes } = parsed.data;

    if (!symptoms && !complaint && !medicalHistory && !currentCondition && !additionalNotes) {
      return NextResponse.json(
        { error: "Please provide at least one field of information." },
        { status: 400 }
      );
    }

    const report = await db.patientReport.create({
      data: {
        patientId: patient.id,
        symptoms: symptoms || null,
        complaint: complaint || null,
        medicalHistory: medicalHistory || null,
        currentCondition: currentCondition || null,
        duration: duration || null,
        additionalNotes: additionalNotes || null
      }
    });

    return NextResponse.json({ ok: true, report }, { status: 201 });
  } catch (error) {
    console.error("Create patient report error:", error);
    return NextResponse.json(
      { error: "Something went wrong while saving the report." },
      { status: 500 }
    );
  }
}
