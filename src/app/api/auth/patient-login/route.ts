import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validation/schemas";
import { verifyPassword } from "@/lib/auth/password";
import { db } from "@/lib/db";
import { createPatientSession, SESSION_COOKIE } from "@/lib/auth/session";
import { writeAuditLog } from "@/services/audit";

const MAX_ATTEMPTS = 8;
const WINDOW_MS = 15 * 60 * 1000;
const attempts = new Map<string, { count: number; resetAt: number }>();

function limiter(key: string): { allowed: boolean; retryAfterSec?: number } {
  const now = Date.now();
  const record = attempts.get(key);
  if (!record || record.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }
  record.count += 1;
  if (record.count > MAX_ATTEMPTS) {
    return { allowed: false, retryAfterSec: Math.ceil((record.resetAt - now) / 1000) };
  }
  return { allowed: true };
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const limiterResult = limiter(ip);
    if (!limiterResult.allowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Please enter a valid email and password." }, { status: 400 });
    }

    const { email, password } = parsed.data;

    const patientUser = await db.patientUser.findUnique({ where: { email: email.toLowerCase() } });

    const genericError = { error: "Incorrect email or password." };
    if (!patientUser) {
      return NextResponse.json(genericError, { status: 401 });
    }

    const valid = await verifyPassword(password, patientUser.passwordHash);
    if (!valid) {
      return NextResponse.json(genericError, { status: 401 });
    }

    const sessionCookie = await createPatientSession(patientUser.id);

    writeAuditLog({ action: "patient.login", details: patientUser.email, ip });

    const response = NextResponse.json(
      { ok: true, patient: { id: patientUser.id, name: patientUser.name, email: patientUser.email } },
      { status: 200 }
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
    console.error("Patient login error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
