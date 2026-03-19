import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id: collectionId, itemId } = await params;

    const item = await prisma.savedVideo.findFirst({
      where: { id: itemId, collectionId },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Item não encontrado nesta colecção" },
        { status: 404 }
      );
    }

    await prisma.savedVideo.delete({ where: { id: itemId } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete collection item error:", error);
    return NextResponse.json(
      { error: "Failed to remove item" },
      { status: 500 }
    );
  }
}
