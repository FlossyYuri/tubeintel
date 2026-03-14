import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const collections = await prisma.collection.findMany({
      include: { _count: { select: { items: true } } },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(collections);
  } catch (error) {
    console.error("Collections GET error:", error);
    return NextResponse.json(
      { error: "Failed to load collections" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, icon = "📁", color = "#3D8BFF" } = body;
    if (!name?.trim()) {
      return NextResponse.json({ error: "Name required" }, { status: 400 });
    }
    const collection = await prisma.collection.create({
      data: { name: name.trim(), icon, color },
    });
    return NextResponse.json(collection);
  } catch (error) {
    console.error("Collections POST error:", error);
    return NextResponse.json(
      { error: "Failed to create collection" },
      { status: 500 }
    );
  }
}
