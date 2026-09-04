import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth/password";
import { db } from "@/lib/db";
import { createPatientSession, SESSION_COOKIE } from "@/lib/auth/session";
import { patientSignupSchema } from "@/lib/validation/schemas";
import { writeAuditLog } from "@/services/audit";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = patientSignupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please check the highlighted fields below.", details: flatten(parsed.error) },
        { status: 400 }
      );
    }

    const { name, email, password, phone } = parsed.data;

    const existing = await db.patientUser.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
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

    const sessionCookie = await createPatientSession(patientUser.id);

    writeAuditLog({ action: "patient.register", details: patientUser.email });

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
