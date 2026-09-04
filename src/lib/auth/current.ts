import { cookies } from "next/headers";
import { getDoctorFromCookie, getPatientUserFromCookie, SESSION_COOKIE } from "@/lib/auth/session";

export async function currentDoctor() {
  const cookieStore = cookies();
  const value = cookieStore.get(SESSION_COOKIE)?.value;
  return getDoctorFromCookie(value);
}

export async function currentPatientUser() {
  const cookieStore = cookies();
  const value = cookieStore.get(SESSION_COOKIE)?.value;
  return getPatientUserFromCookie(value);
}

export async function currentUser() {
  const cookieStore = cookies();
  const value = cookieStore.get(SESSION_COOKIE)?.value;
  if (!value) return null;

  const doctor = await getDoctorFromCookie(value);
  if (doctor) return { role: "DOCTOR" as const, doctor, patientUser: null };

  const patientUser = await getPatientUserFromCookie(value);
  if (patientUser) return { role: "PATIENT" as const, doctor: null, patientUser };

  return null;
}

export function requireDoctorAuth(): Promise<NonNullable<Awaited<ReturnType<typeof currentDoctor>>>> {
  return currentDoctor().then((doctor) => {
    if (!doctor) {
      throw new Error("Unauthorized");
    }
    return doctor as NonNullable<Awaited<ReturnType<typeof currentDoctor>>>;
  });
}

export function requirePatientAuth(): Promise<NonNullable<Awaited<ReturnType<typeof currentPatientUser>>>> {
  return currentPatientUser().then((patientUser) => {
    if (!patientUser) {
      throw new Error("Unauthorized");
    }
    return patientUser as NonNullable<Awaited<ReturnType<typeof currentPatientUser>>>;
  });
}
