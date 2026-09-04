import { NextResponse } from "next/server";
import { registerSchema } from "@/lib/validation/schemas";
import { hashPassword } from "@/lib/auth/password";
import { db } from "@/lib/db";
import { createDoctorSession, SESSION_COOKIE } from "@/lib/auth/session";
import { writeAuditLog } from "@/services/audit";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid registration details.", details: flatten(parsed.error) },
        { status: 400 }
      );
    }

    const { name, email, password, phone, clinicName } = parsed.data;

    const existing = await db.doctor.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const doctor = await db.doctor.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        phone: phone || null,
        clinicName: clinicName || null
      }
    });

    const sessionCookie = await createDoctorSession(doctor.id);

    writeAuditLog({ doctorId: doctor.id, action: "doctor.register" });

    const response = NextResponse.json(
      { ok: true, doctor: { id: doctor.id, name: doctor.name, email: doctor.email } },
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
    console.error("Register error:", error);
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
