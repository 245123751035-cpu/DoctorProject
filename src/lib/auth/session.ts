import { createHash, randomBytes, createHmac } from "crypto";
import { db } from "@/lib/db";

const AUTH_SECRET = process.env.AUTH_SECRET ?? "";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const SESSION_COOKIE = "dp_session";

function generateToken(): string {
  return randomBytes(32).toString("base64url");
}

function sign(value: string): string {
  const hmac = createHmac("sha256", AUTH_SECRET);
  hmac.update(value);
  return hmac.digest("base64url");
}

function createCookieValue(payload: string): string {
  const sig = sign(payload);
  return `${payload}.${sig}`;
}

function verifyCookieValue(cookie: string | undefined): string | null {
  if (!cookie) return null;
  const parts = cookie.split(".");
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  const expected = sign(payload);
  if (sig.length !== expected.length) return null;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) {
    diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  if (diff !== 0) return null;
  return payload;
}

export async function createDoctorSession(doctorId: string): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.session.create({
    data: { token, doctorId, expiresAt }
  });
  return createCookieValue(token);
}

export async function createPatientSession(patientUserId: string): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.session.create({
    data: { token, patientUserId, expiresAt }
  });
  return createCookieValue(token);
}

export async function getDoctorFromCookie(cookieHeader?: string | null) {
  if (!cookieHeader) return null;
  const token = verifyCookieValue(cookieHeader);
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { token },
    include: { doctor: true }
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await db.session.delete({ where: { id: session.id } }).catch(() => {});
    }
    return null;
  }

  return session.doctor;
}

export async function getPatientUserFromCookie(cookieHeader?: string | null) {
  if (!cookieHeader) return null;
  const token = verifyCookieValue(cookieHeader);
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { token },
    include: { patientUser: { include: { patient: true } } }
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await db.session.delete({ where: { id: session.id } }).catch(() => {});
    }
    return null;
  }

  return session.patientUser;
}

export async function destroySession(cookieHeader?: string | null): Promise<void> {
  if (!cookieHeader) return;
  const token = verifyCookieValue(cookieHeader);
  if (!token) return;
  await db.session.deleteMany({ where: { token } }).catch(() => {});
}

export function getCookieValue(cookieHeader: string | undefined | null, name: string): string | undefined {
  if (!cookieHeader) return undefined;
  for (const part of cookieHeader.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (key === name) return decodeURIComponent(value);
  }
  return undefined;
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
