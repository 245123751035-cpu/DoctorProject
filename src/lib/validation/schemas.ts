import { z } from "zod";
import { isValidPatientCodeFormat } from "@/lib/patient-code";

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
  phone: z.string().max(20, "Phone number is too long").optional().or(z.literal("")),
  clinicName: z.string().max(100, "Clinic name is too long").optional().or(z.literal(""))
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required")
});

export const patientCodeSchema = z.string().refine(
  (code) => isValidPatientCodeFormat(code),
  "Patient code must look like MX-1234"
);

export const patientRegisterSchema = z.object({
  fullName: z.string().min(2, "Full name is required").max(150),
  dateOfBirth: z.string().optional().nullable().or(z.literal("")).or(z.literal(null)),
  age: z.coerce.number().int().min(0).max(120).optional().nullable(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"], {
    errorMap: () => ({ message: "Please select a gender" })
  }),
  phone: z.string().max(20).optional().or(z.literal("")),
  address: z.string().max(500).optional().or(z.literal("")),
  emergencyContact: z.string().max(150).optional().or(z.literal("")),
  bloodGroup: z.enum(["A_POS", "A_NEG", "B_POS", "B_NEG", "AB_POS", "AB_NEG", "O_POS", "O_NEG", "UNKNOWN"])
    .optional()
    .or(z.literal("")),
  knownAllergies: z.string().max(1000).optional().or(z.literal("")),
  existingConditions: z.string().max(1000).optional().or(z.literal("")),
  preferredLanguage: z.string().max(10).optional().default("en")
});

export const consultationSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  chiefComplaint: z.string().min(2, "Chief complaint is required").max(2000),
  chiefComplaintLang: z.string().max(10).optional().default("en"),
  symptoms: z.string().max(4000).optional().or(z.literal("")),
  duration: z.string().max(200).optional().or(z.literal("")),
  severity: z.string().max(100).optional().or(z.literal("")),
  medicalHistory: z.string().max(4000).optional().or(z.literal("")),
  previousDiagnosis: z.string().max(4000).optional().or(z.literal("")),
  currentMedications: z.string().max(4000).optional().or(z.literal("")),
  allergies: z.string().max(4000).optional().or(z.literal("")),
  previousTreatment: z.string().max(4000).optional().or(z.literal("")),
  investigations: z.string().max(4000).optional().or(z.literal("")),
  doctorObservations: z.string().max(4000).optional().or(z.literal("")),
  assessment: z.string().max(4000).optional().or(z.literal("")),
  diagnosis: z.string().max(4000).optional().or(z.literal("")),
  prescription: z.string().max(4000).optional().or(z.literal("")),
  followUpNotes: z.string().max(4000).optional().or(z.literal(""))
});

export type ConsultationInput = z.infer<typeof consultationSchema>;

export const updatePatientSchema = patientRegisterSchema.partial().extend({
  id: z.string().min(1)
});
