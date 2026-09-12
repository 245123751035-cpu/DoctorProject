# CaseTaker — SIH26047 Patient Case-Taking Software (MVP)

A production-style, hackathon-friendly **multilingual patient case-taking and
longitudinal medical-history web application** for doctors, built as a Smart
India Hackathon (SIH) demo.

> **Demo / MVP.** This is built to demonstrate a complete, reliable clinical
> workflow — not as a certified medical device. Do not use for real patient care.

---

## 1. What the project does

A doctor:

1. **Registers** a patient once (name, DOB/age, gender, phone, allergies, etc.).
2. Receives a **unique human-readable patient code**, e.g. `MX-6660`.
3. Records **consultations / cases** in *any* language (English, Hindi, Telugu);
   the original text is always preserved.
4. Later retrieves the patient's **complete history** by typing the patient code.
5. Views a **chronological medical timeline** of everything that happened before.
6. Generates an **AI-assisted Clinical History Summary** so the doctor can grasp
   the prior history instantly.
7. Runs a **Multi-Agent Case Analysis** — a coordinator orchestrates dedicated
   *Symptom*, *History*, *Language* and *Report* agents to produce a structured
   clinical report for the current visit.

The AI **never** makes the final decision, never invents data, and clearly labels
its output as a summary for clinician review — with a fallback that works offline.

## 2. Why it solves the problem

- **Fast retrieval**: one memorable patient code replaces digging through paper
  registers or searching by name.
- **Longitudinal view**: a single timeline of every consultation, symptom,
  diagnosis, medication, allergy and investigation.
- **Language barrier**: cases are entered and displayed in the patient's own
  language; the original wording is never silently replaced.
- **Doctor time**: the AI summary condenses months of notes so a follow-up visit
  starts with context, not a pile of old files.

## 3. Architecture

Clean separation between UI, business logic, database access, AI, validation and
authentication:

```
src/
  app/                  Next.js App Router pages + API route handlers
    api/
      auth/             register, login, logout
      patients/         create, search
      consultations/    create
      ai/summary        generate AI history summary
      ai/multi-agent    run multi-agent case analysis (POST)
    (login, register, dashboard, patients/...)
  components/
    ui/                 presentational primitives (toast)
    providers/          React context (locale)
    language-selector
  features/
    auth/
    layout/             shared app shell / header
    dashboard/          stats, patient search
    patients/           register form, profile tabs, timeline, AI summary
    consultations/      consultation form (with voice input)
  lib/
    db.ts               Prisma client singleton
    auth/               sessions, password hashing, current-user
    ai/                 AIService interface + mock/real providers
    agents/             coordinator + symptom/history/language/report agents
    validation/         Zod schemas
    i18n-server.ts      server-side translation helper
    patient-code.ts     code generator
  locales/              en / hi / te dictionaries
  services/             business logic (patients, consultations, dashboard, ai, audit)
```

Key design decisions:

- **Server components** fetch data and enforce authorization; **client
  components** only handle interactivity and submission. No data is ever exposed
  to unauthenticated users.
- **API routes validate with Zod** before touching the database.
- **All patient queries are scoped to the authenticated doctor** (ownership
  check) to prevent cross-doctor access.

## 4. Tech stack

| Layer       | Choice                                             |
|-------------|----------------------------------------------------|
| Framework   | Next.js 14 (App Router)                             |
| Language    | TypeScript                                          |
| Styling     | Tailwind CSS                                        |
| Database    | PostgreSQL 16                                       |
| ORM         | Prisma                                              |
| Auth        | Custom signed-cookie sessions + bcrypt password hashing + DB session table |
| Validation  | Zod                                                 |
| Forms       | React Hook Form style (controlled forms)            |
| AI          | Pluggable `AIService` (Mock + real OpenAI-compatible) |
| Testing     | Vitest (unit + integration)                         |

## 5. Database schema

Entities (all relational, no giant JSON blobs):

- **Doctor** — credentials, clinic info.
- **Patient** — belongs to a doctor; stores `patientCode` (public, unique),
  demographics, known allergies, existing conditions.
- **Consultation** — references patient + doctor; stores each structured case
  field separately (chief complaint + language, symptoms, duration, severity,
  medical history, diagnoses, medications, allergies, treatment, investigations,
  observations, assessment, follow-up notes) with `createdAt`.
- **Medication / Allergy / Investigation / PatientMedicalCondition** — searchable
  structured records per patient.
- **AiSummary** — snapshot of each generated summary.
- **Session** — active login sessions (for logout invalidation).
- **AuditLog** — audit trail of important actions.

## 6. Authentication

- **Registration**: name, email, password, optional phone + clinic name.
- **Login**: email + password with basic **rate limiting** (per-IP) and generic
  "Incorrect email or password." errors (no account enumeration).
- **Passwords** are hashed with **bcrypt** (cost 12) — never stored in plaintext.
- **Sessions**: a cryptographically **HMAC-signed** cookie referencing a row in
  the `Session` table. Logout **deletes the session**, invalidating it server-side.
- **Protected routes**: every authenticated page and API route verifies the
  session server-side and redirects/rejects otherwise.
- **Authorization**: all patient data access checks doctor ownership.

## 7. AI architecture

`AIService` interface (`src/lib/ai/types.ts`):

```
interface AIService {
  generatePatientHistorySummary(input, language): Promise<HistorySummary>
  complete(system, user, options?): Promise<string | null>  // { json?: boolean }
}
```

Two implementations selected by `AI_PROVIDER`:

- **MockAIService** — fully offline, deterministic. Builds a structured
  "Clinical History Summary" **strictly from stored records**. `complete()`
  returns `null`, so downstream agents always take the offline path. Works with
  no API key, so the demo never breaks.
- **RealAIService** — calls an OpenAI-compatible chat completions endpoint using
  `AI_API_KEY` / `AI_MODEL` / `AI_BASE_URL`. Output is validated, and on any
  failure it **falls back to the offline summary** instead of crashing.
  `complete()` requests plain chat output (or `response_format: json` when
  `{ json: true }`) and returns `null` on any failure so agents degrade
  gracefully. `isAIConfigured()` reports whether a real provider is available.

Both produce the same structure:

```
PATIENT HISTORY SUMMARY
- Key History
- Previous Conditions
- Recurring Symptoms
- Medications Mentioned
- Allergies
- Investigations
- Recent Developments
- Items for Doctor Review
```

Every output includes the disclaimer:

> "AI-generated summary for clinician review. It does not replace professional
> medical judgment."

The AI uses **only** the data in the patient's stored records and reports
"Not available in the recorded history." when something is missing.

## 8. Multi-Agent Case Analysis

A **coordinator agent** (`src/lib/agents/coordinator-agent.ts`) orchestrates
specialized agents per consultation, exposed via `POST /api/ai/multi-agent`
(`{ patientId, consultationId?, language? }`) and the **"Multi-Agent Case
Analysis"** panel on the patient profile AI tab.

```
Coordinator ── symptom agent ── extracts chief complaint, symptoms,
              │                 duration, severity
              ├─ history  agent ── recurring symptoms, prior diagnoses,
              │                    medications, allergies
              ├─ language agent ── detects consultation language,
              │                    preserves original text
              └─ report   agent ── merges the above into a structured
                                   clinical report + items for doctor review
```

- The **Symptom** agent prefers live AI extraction and falls back to the
  consultation's structured fields (chief complaint / symptoms / duration /
  severity).
- The **History** and **Language** agents reuse the existing `AIService`
  (`generatePatientHistorySummary` / `complete`); their deterministic offline
  outputs are built strictly from stored records.
- The **Report** agent composes `chiefComplaint`, `currentSymptoms`,
  `durationAndSeverity`, `relevantMedicalHistory`, `previousConditions`,
  `medications`, `allergies`, `importantObservations` and
  `itemsForDoctorReview`, using `NOT_AVAILABLE_COPY` placeholders instead of
  invented text.
- Every run ends with the exact safety line:

> "AI-generated information for clinician review. It does not replace
> professional medical judgment."

The frontend shows one status row per agent (✓ done) plus the final report; a
**fallback badge** appears whenever the run degraded to offline mode. Each run
is written to the audit log (`ai.multiAgent.generated`). The result is displayed
only — it is **not persisted** and never overrides the doctor's own records.

## 9. Multilingual architecture

- UI dictionaries live in `src/locales/{en,hi,te}.ts`. A translation resolver
  (`translate(lang, key)`) falls back to English for any missing key.
- A **language selector** in the header sets a cookie; both server and client
  components re-render in the chosen language.
- **Patient case text** is stored as entered, with an explicit `language` field
  (`chiefComplaintLang`) and the **original text preserved**. Nothing is silently
  replaced.
- The AI summary can be produced in the selected output language.

## 10. How to install

Prerequisites: **Node 18+**, **npm**, and **PostgreSQL** (or Docker).

```bash
git clone https://github.com/245123751035-cpu/DoctorProject.git
cd DoctorProject
npm install
```

## 11. Environment variables

Copy `.env.example` to `.env` and set values:

```bash
cp .env.example .env
```

| Variable             | Purpose                                        |
|----------------------|------------------------------------------------|
| `DATABASE_URL`       | Prisma PostgreSQL connection string            |
| `AUTH_SECRET`        | Secret used to HMAC-sign session cookies       |
| `AI_PROVIDER`        | `mock` (default) \| `openai` \| etc.           |
| `AI_API_KEY`         | Key for the real AI provider (optional)        |
| `AI_MODEL`           | Model name for the real AI provider (optional) |
| `AI_BASE_URL`        | OpenAI-compatible endpoint (optional)          |

`.env` is git-ignored and **never committed**.

## 12. Database setup

Using **Docker** (recommended):

```bash
docker compose up -d
```

Or point `DATABASE_URL` at any PostgreSQL instance:

```text
DATABASE_URL="postgresql://doctor:doctorpass@localhost:5433/doctor?schema=public"
```

Then create the schema (for a fresh database):

```bash
npx prisma db push
```

(For first-time setup you can also use `npx prisma migrate dev --name init`.)

## 13. Seed demo data

```bash
npx tsx prisma/seed.ts
```

This creates:

- **1 demo doctor**,
- **3 fictional patients**, each with **3–5 consultations**,
- One patient has a **Telugu / Hindi / English** mixed case history to showcase
  multilingual entry.

All seed data is **synthetic / fictional** — no real patient information.

## 14. Run the development server

```bash
npm run dev
# open http://localhost:3000
```

## 15. Build for production

```bash
npm run build
npm start
```

Quality checks:

```bash
npm run typecheck   # TypeScript
npm run lint        # ESLint
npm test            # Vitest (unit + integration)
```

## 16. Demo credentials

**Doctor account**

```
Email:    demo@doctordemo.com
Password: Doctor@123
```

Seeded patient codes (for search): `MX-4291` (Ravi Kumar), `PC-4034` (Ananya
Verma), `MX-7288` (Mohammed Irfan). *Your generated codes may differ.*

## 17. Hackathon demo flow (for a judge)

1. Open `http://localhost:3000` → **Login** with the demo account above.
2. Dashboard shows stats and recent patients. Type a patient code (e.g.
   `MX-4291`) into **Find Patient**.
3. Click **Open** to open the patient **profile** with tabs and last-visit info.
4. Click **AI History Summary** → **Generate** to get the instant summary.
5. Click **Multi-Agent Case Analysis** → **Run Analysis** to watch the agent
   pipeline (Symptom → History → Language → Report) complete and show the final
   structured clinical report with the safety disclaimer.
6. Click **Back to Dashboard** → **Register Patient** → fill the form →
   a **unique patient code** is generated with a copy button.
7. Click **Open Patient Profile** → **New Consultation**.
8. Enter a case; switch the **language selector** (English / हिन्दी / తెలుగు)
   and type a chief complaint in Hindi or Telugu. Optionally use **voice input**.
9. **Save Consultation** → it appears in the chronological timeline.
10. Return to dashboard, search the new patient's code, confirm the history and
    regenerate the AI summary.

The entire workflow takes under 3 minutes.

## 18. Limitations (MVP)

- The real AI provider is optional; the offline mock summary is the default.
- Voice input depends on browser `SpeechRecognition` support and is optional.
- Rate limiting for login is in-memory (resets on restart) — fine for a demo,
  replace with a persistent store for production.
- No multi-doctor clinic sharing / admin functionality (out of MVP scope).
- Demo data is fictional; set up for a single demo doctor by default.

## 19. Privacy & security considerations

- **Sensitive medical data**: this is a demo. Treat it as such — never load real
  patient records.
- Passwords are bcrypt-hashed; sessions are signed and revocable.
- All endpoints validate input and enforce doctor ownership of patient data.
- No API keys in frontend code; secrets live in `.env` (git-ignored).
- Patient records are only reachable by the owning doctor; unauthorized access
  returns 401/404 without leaking data.
- Minimal audit logging records important actions.
