import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, filters, results } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query required" }, { status: 400 });
    }

    await prisma.searchHistory.create({
      data: {
        query,
        filters: JSON.stringify(filters || {}),
        results: typeof results === "number" ? results : 0,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Search history error:", error);
    return NextResponse.json(
      { error: "Failed to save search" },
      { status: 500 }
    );
  }
}
