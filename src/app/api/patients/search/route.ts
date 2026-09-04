import { NextResponse } from "next/server";
import { currentDoctor } from "@/lib/auth/current";
import { searchPatients } from "@/services/patient";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const doctor = await currentDoctor();
    if (!doctor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") ?? "";

    const results = await searchPatients(doctor.id, query);

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Patient search error:", error);
    return NextResponse.json(
      { error: "Something went wrong while searching for patients." },
      { status: 500 }
    );
  }
}
