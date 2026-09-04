import { PrismaClient, type BloodGroup, type Gender } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateUniquePatientCode } from "../src/services/patient";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding demo data...");

  const DEMO_PASSWORD = "Doctor@123";
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  const demoDoctor = await prisma.doctor.create({
    data: {
      name: "Dr. Meera Reddy",
      email: "demo@doctordemo.com",
      passwordHash,
      phone: "+91 90000 12345",
      clinicName: "Sunrise Multispeciality Clinic"
    }
  });
  console.log("Demo doctor created:", demoDoctor.email);

  const patients = [
    {
      fullName: "Ravi Kumar",
      gender: "MALE" as const,
      age: 45,
      phone: "+91 98111 22334",
      address: "Hyderabad, Telangana",
      bloodGroup: "O_POS",
      knownAllergies: "Penicillin",
      existingConditions: "Hypertension, Type 2 Diabetes",
      preferredLanguage: "te",
      consultations: [
        {
          createdAt: daysAgo(240),
          chiefComplaint: "Recurrent headaches for 3 weeks",
          chiefComplaintLang: "en",
          symptoms: "Bilateral frontal headache, worse in the evening, associated with occasional dizziness. No visual disturbance.",
          duration: "3 weeks",
          severity: "moderate",
          medicalHistory: "Known hypertensive for 5 years.",
          previousDiagnosis: "None recorded",
          currentMedications: "Losartan 50 mg daily, Metformin 500 mg twice daily",
          allergies: "Penicillin",
          previousTreatment: "NSAIDs occasionally",
          investigations: "Blood pressure 150/95 mmHg at presentation",
          doctorObservations: "BP elevated. Rest of systemic exam normal.",
          assessment: "Headache likely tension-type, monitor BP control.",
          followUpNotes: "Continue current medicines, review BP readings, follow up in 2 weeks."
        },
        {
          createdAt: daysAgo(150),
          chiefComplaint: "Follow-up for blood pressure control",
          chiefComplaintLang: "en",
          symptoms: "Better headache control but notes occasional palpitations.",
          duration: "2 weeks",
          severity: "low",
          medicalHistory: "Hypertension, Type 2 Diabetes.",
          previousDiagnosis: "Tension-type headache, HTN.",
          currentMedications: "Losartan 50 mg daily, Metformin 500 mg twice daily",
          allergies: "Penicillin",
          previousTreatment: "Continued current regimen",
          investigations: "BP 140/88 mmHg, FBS 128 mg/dL",
          doctorObservations: "BP improving. Advised continued salt restriction.",
          assessment: "Hypertension responding to current treatment.",
          followUpNotes: "Repeat HbA1c in 3 months."
        },
        {
          createdAt: daysAgo(60),
          chiefComplaint: "Routine diabetes review",
          chiefComplaintLang: "te",
          symptoms: "No new complaints. Reports good glycaemic control.",
          duration: "Ongoing",
          severity: "low",
          medicalHistory: "Type 2 Diabetes, Hypertension.",
          previousDiagnosis: "HTN, T2DM",
          currentMedications: "Losartan 50 mg, Metformin 500 mg twice daily",
          allergies: "Penicillin",
          previousTreatment: "None additional",
          investigations: "HbA1c 7.1%, BP 135/84 mmHg",
          doctorObservations: "Well controlled.",
          assessment: "T2DM stable.",
          followUpNotes: "Continue care, review in 4 months."
        }
      ]
    },
    {
      fullName: "Ananya Verma",
      gender: "FEMALE" as const,
      age: 28,
      phone: "+91 98222 33445",
      address: "New Delhi",
      bloodGroup: "B_POS",
      knownAllergies: "Sulphonamides",
      existingConditions: "Asthma",
      preferredLanguage: "hi",
      consultations: [
        {
          createdAt: daysAgo(200),
          chiefComplaint: "Cough and breathlessness for 1 week",
          chiefComplaintLang: "hi",
          symptoms: "Dry cough, wheezing, shortness of breath on exertion, worse at night. No fever.",
          duration: "1 week",
          severity: "moderate",
          medicalHistory: "Known asthmatic since childhood.",
          previousDiagnosis: "Acute asthma exacerbation",
          currentMedications: "Inhaled salbutamol as needed",
          allergies: "Sulphonamides",
          previousTreatment: "Salbutamol inhaler",
          investigations: "Chest auscultation shows bilateral wheeze",
          doctorObservations: "Wheeze both lung fields.",
          assessment: "Acute asthma exacerbation, mild to moderate.",
          followUpNotes: "Use regular inhaler, avoid triggers, follow up if worsening."
        },
        {
          createdAt: daysAgo(90),
          chiefComplaint: "Follow-up for asthma control",
          chiefComplaintLang: "en",
          symptoms: "Improving. Occasional morning wheeze only.",
          duration: "Ongoing",
          severity: "low",
          medicalHistory: "Asthma.",
          previousDiagnosis: "Asthma exacerbation (resolved)",
          currentMedications: "Inhaled salbutamol as needed",
          allergies: "Sulphonamides",
          previousTreatment: "Continued inhaler use",
          investigations: "PEV/US surrogate: no wheeze at rest",
          doctorObservations: "No distress, clear lung fields.",
          assessment: "Asthma well controlled.",
          followUpNotes: "Ensure correct inhaler technique."
        },
        {
          createdAt: daysAgo(20),
          chiefComplaint: "Mild itchy skin rash on forearms",
          chiefComplaintLang: "hi",
          symptoms: "Erythematous papular rash on both forearms, mild itching. No other systemic symptoms.",
          duration: "4 days",
          severity: "low",
          medicalHistory: "Asthma (stable).",
          previousDiagnosis: "Contact dermatitis (suspected)",
          currentMedications: "Inhaled salbutamol PRN",
          allergies: "Sulphonamides",
          previousTreatment: "Topical moisturiser",
          investigations: "Clinical examination",
          doctorObservations: "Localised papular erythematous rash forearms.",
          assessment: "Likely contact dermatitis, advise avoidance of irritants.",
          followUpNotes: "If rash persists in 1 week, review."
        }
      ]
    },
    {
      fullName: "Mohammed Irfan",
      gender: "MALE" as const,
      age: 61,
      phone: "+91 98333 44556",
      address: "Bengaluru, Karnataka",
      bloodGroup: "A_POS",
      knownAllergies: "None known",
      existingConditions: "Ischaemic heart disease, Hyperlipidaemia",
      preferredLanguage: "en",
      consultations: [
        {
          createdAt: daysAgo(300),
          chiefComplaint: "Chest tightness on exertion for 2 months",
          chiefComplaintLang: "en",
          symptoms: "Retrosternal pressure on climbing stairs, relieved by rest. No rest pain.",
          duration: "2 months",
          severity: "moderate",
          medicalHistory: "IHD on treatment, Hyperlipidaemia.",
          previousDiagnosis: "Stable angina",
          currentMedications: "Aspirin 75 mg, Atorvastatin 20 mg, Metoprolol 25 mg",
          allergies: "None known",
          previousTreatment: "Current anti-anginal regimen",
          investigations: "ECG: ST changes in inferior leads. Treadmill test positive.",
          doctorObservations: "BP 138/86 mmHg, HR 74, no murmur.",
          assessment: "Stable angina, optimise medical therapy.",
          followUpNotes: "Refer to cardiology for further evaluation."
        },
        {
          createdAt: daysAgo(120),
          chiefComplaint: "Follow-up after cardiac evaluation",
          chiefComplaintLang: "en",
          symptoms: "Improved exertional tolerance on current therapy.",
          duration: "Ongoing",
          severity: "low",
          medicalHistory: "IHD, Hyperlipidaemia. Coronary angiography done at tertiary centre.",
          previousDiagnosis: "Stable angina, single vessel disease",
          currentMedications: "Aspirin 75 mg, Atorvastatin 20 mg, Metoprolol 25 mg",
          allergies: "None known",
          previousTreatment: "Medical management",
          investigations: "Angiography: single vessel stenosis ~60%. Lipids controlled.",
          doctorObservations: "Stable, well maintained.",
          assessment: "Stable IHD, continue medical therapy.",
          followUpNotes: "Continue medicines, cardiac rehab, review in 3 months."
        },
        {
          createdAt: daysAgo(40),
          chiefComplaint: "Routine cardiac follow-up",
          chiefComplaintLang: "en",
          symptoms: "No chest pain. Good exercise tolerance.",
          duration: "Ongoing",
          severity: "low",
          medicalHistory: "IHD, Hyperlipidaemia.",
          previousDiagnosis: "Stable angina",
          currentMedications: "Aspirin 75 mg, Atorvastatin 20 mg, Metoprolol 25 mg",
          allergies: "None known",
          previousTreatment: "Medical management",
          investigations: "BP 132/82 mmHg, lipid profile within target.",
          doctorObservations: "Stable.",
          assessment: "Stable, treatment effective.",
          followUpNotes: "Continue therapy, annual review."
        },
        {
          createdAt: daysAgo(10),
          chiefComplaint: "Mild joint pain in knees",
          chiefComplaintLang: "en",
          symptoms: "Bilateral knee joint pain, worse with activity, mild morning stiffness < 30 min.",
          duration: "3 weeks",
          severity: "low",
          medicalHistory: "IHD (stable), Hyperlipidaemia.",
          previousDiagnosis: "Osteoarthritis (suspected)",
          currentMedications: "Aspirin 75 mg, Atorvastatin 20 mg, Metoprolol 25 mg",
          allergies: "None known",
          previousTreatment: "None for joints",
          investigations: "Clinical. X-ray suggested.",
          doctorObservations: "Knee crepitus, no effusion.",
          assessment: "Likely degenerative joint disease. Avoid NSAIDs given cardiac history.",
          followUpNotes: "Physiotherapy and paracetamol if needed."
        }
      ]
    }
  ];

  for (const p of patients) {
    const code = await generateUniquePatientCode();
    const created = await prisma.patient.create({
      data: {
        patientCode: code,
        doctorId: demoDoctor.id,
        fullName: p.fullName,
        gender: p.gender,
        age: p.age,
        phone: p.phone,
        address: p.address,
        bloodGroup: p.bloodGroup as BloodGroup,
        knownAllergies: p.knownAllergies,
        existingConditions: p.existingConditions,
        preferredLanguage: p.preferredLanguage,
        medicalConditions: {
          create: p.existingConditions
            ? p.existingConditions.split(",").map((c) => ({ name: c.trim() }))
            : []
        },
        allergies: {
          create: p.knownAllergies && p.knownAllergies !== "None known"
            ? p.knownAllergies.split(",").map((a) => ({ name: a.trim() }))
            : []
        }
      }
    });

    for (const c of p.consultations) {
      await prisma.consultation.create({
        data: {
          patientId: created.id,
          doctorId: demoDoctor.id,
          createdAt: c.createdAt,
          chiefComplaint: c.chiefComplaint,
          chiefComplaintLang: c.chiefComplaintLang,
          symptoms: c.symptoms,
          duration: c.duration,
          severity: c.severity,
          medicalHistory: c.medicalHistory,
          previousDiagnosis: c.previousDiagnosis,
          currentMedications: c.currentMedications,
          allergies: c.allergies,
          previousTreatment: c.previousTreatment,
          investigations: c.investigations,
          doctorObservations: c.doctorObservations,
          assessment: c.assessment,
          followUpNotes: c.followUpNotes
        }
      });
    }

    console.log(`Patient seeded: ${p.fullName} (${code})`);
  }

  console.log("\nSeed complete!");
  console.log("====================");
  console.log("DEMO LOGIN");
  console.log("Email:    demo@doctordemo.com");
  console.log("Password: Doctor@123");
  console.log("====================");
}

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(10, 30, 0, 0);
  return d;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
