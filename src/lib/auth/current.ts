import { cookies } from "next/headers";
import { getDoctorFromCookie, SESSION_COOKIE } from "@/lib/auth/session";

/**
 * Returns the currently authenticated doctor for server components,
 * API route handlers, and server actions. Returns null when unauthenticated.
 */
export async function currentDoctor() {
  const cookieStore = cookies();
  const value = cookieStore.get(SESSION_COOKIE)?.value;
  return getDoctorFromCookie(value);
}

export function requireAuth(): Promise<NonNullable<Awaited<ReturnType<typeof currentDoctor>>>> {
  return currentDoctor().then((doctor) => {
    if (!doctor) {
      throw new Error("Unauthorized");
    }
    return doctor as NonNullable<Awaited<ReturnType<typeof currentDoctor>>>;
  });
}
