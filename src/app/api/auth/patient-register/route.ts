import { NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword } from "@/lib/auth/password";
import { db } from "@/lib/db";
import { createPatientSession, SESSION_COOKIE } from "@/lib/auth/session";
import { writeAuditLog } from "@/services/audit";

const patientRegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
  phone: z.string().max(20).optional().or(z.literal("")),
  patientCode: z.string().min(1, "Patient code is required")
});

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = patientRegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid registration details.", details: flatten(parsed.error) },
        { status: 400 }
      );
    }

    const { name, email, password, phone, patientCode } = parsed.data;

    const existing = await db.patientUser.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const normalizedCode = patientCode.toUpperCase().trim();
    const patient = await db.patient.findUnique({ where: { patientCode: normalizedCode } });
    if (!patient) {
      return NextResponse.json(
        { error: "No patient found with this code. Please check the code provided by your doctor." },
        { status: 404 }
      );
    }
    if (patient.patientUserId) {
      return NextResponse.json(
        { error: "This patient code is already linked to an account." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const patientUser = await db.patientUser.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        phone: phone || null
      }
    });

    await db.patient.update({
      where: { id: patient.id },
      data: { patientUserId: patientUser.id }
    });

    const sessionCookie = await createPatientSession(patientUser.id);

    writeAuditLog({ patientId: patient.id, action: "patient.register", details: patientUser.email });

    const response = NextResponse.json(
      { ok: true, patient: { id: patientUser.id, name: patientUser.name, email: patientUser.email } },
      { status: 201 }
    );

    response.cookies.set(SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60
    });

    return response;
  } catch (error) {
    console.error("Patient register error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
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
