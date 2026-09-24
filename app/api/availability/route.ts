import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlots } from "@/lib/application/availability.service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get("serviceId");
    const date = searchParams.get("date");
    const staffId = searchParams.get("staffId") || undefined;

    if (!serviceId || !date) {
      return NextResponse.json(
        { error: "serviceId y date (YYYY-MM-DD) son requeridos." },
        { status: 400 }
      );
    }

    const availability = await getAvailableSlots({
      serviceId,
      dateStr: date,
      staffId,
    });

    return NextResponse.json(availability);
  } catch (error: any) {
    console.error("Error in /api/availability:", error);
    return NextResponse.json(
      { error: "Error calculando disponibilidad de horarios." },
      { status: 500 }
    );
  }
}
