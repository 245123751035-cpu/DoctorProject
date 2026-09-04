import { db } from "@/lib/db";

export interface DashboardStats {
  totalPatients: number;
  todayConsultations: number;
  totalConsultations: number;
}

export async function getDashboardStats(doctorId: string): Promise<DashboardStats> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [totalPatients, todayConsultations, totalConsultations] = await Promise.all([
    db.patient.count({ where: { doctorId } }),
    db.consultation.count({
      where: { doctorId, createdAt: { gte: startOfDay } }
    }),
    db.consultation.count({ where: { doctorId } })
  ]);

  return { totalPatients, todayConsultations, totalConsultations };
}

export async function getRecentPatients(doctorId: string, limit = 6) {
  const patients = await db.patient.findMany({
    where: { doctorId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      _count: { select: { consultations: true } },
      consultations: {
        select: { createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 1
      }
    }
  });

  return patients.map((p) => ({
    id: p.id,
    patientCode: p.patientCode,
    fullName: p.fullName,
    age: p.age,
    gender: p.gender,
    lastConsultationAt: p.consultations[0]?.createdAt ?? null,
    consultationCount: p._count.consultations
  }));
}
