import { NextResponse } from "next/server";
import { SESSION_COOKIE, getDoctorFromCookie } from "@/lib/auth/session";
import { cookies } from "next/headers";
import { destroySession } from "@/lib/auth/session";

export async function POST() {
  const cookieStore = cookies();
  const value = cookieStore.get(SESSION_COOKIE)?.value;

  if (value) {
    await destroySession(value);
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    path: "/",
    maxAge: 0
  });
  return response;
}
