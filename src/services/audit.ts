import { db } from "@/lib/db";

export async function writeAuditLog(params: {
  doctorId?: string | null;
  patientId?: string | null;
  action: string;
  details?: string | null;
  ip?: string | null;
}): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        doctorId: params.doctorId ?? null,
        patientId: params.patientId ?? null,
        action: params.action,
        details: params.details ?? null,
        ip: params.ip ?? null
      }
    });
  } catch {
    // Audit logging must never block the primary workflow.
  }
}
