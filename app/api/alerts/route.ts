import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const alerts = await prisma.alert.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(alerts);
  } catch (error) {
    console.error("Alerts GET error:", error);
    return NextResponse.json(
      { error: "Failed to load alerts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, value, threshold = 0 } = body;
    if (!type || !value) {
      return NextResponse.json({ error: "Type and value required" }, { status: 400 });
    }
    const alert = await prisma.alert.create({
      data: { type, value, threshold },
    });
    return NextResponse.json(alert);
  } catch (error) {
    console.error("Alerts POST error:", error);
    return NextResponse.json(
      { error: "Failed to create alert" },
      { status: 500 }
    );
  }
}
