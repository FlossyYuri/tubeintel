import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const putSchema = z.object({ apiKey: z.string().min(1) });

export async function GET() {
  try {
    const settings = await prisma.settings.upsert({
      where: { id: 1 },
      create: { id: 1, apiKey: "" },
      update: {},
    });
    return NextResponse.json({ apiKey: settings.apiKey || "" });
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json(
      { error: "Failed to load settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { apiKey } = putSchema.parse(body);

    await prisma.settings.upsert({
      where: { id: 1 },
      create: { id: 1, apiKey },
      update: { apiKey },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 400 }
      );
    }
    console.error("Settings PUT error:", error);
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}
