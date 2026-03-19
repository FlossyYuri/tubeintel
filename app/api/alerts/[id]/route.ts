import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.alert.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Alert DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete alert" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { active } = body;

    const updateData: { active?: boolean } = {};
    if (typeof active === "boolean") updateData.active = active;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const alert = await prisma.alert.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json(alert);
  } catch (error) {
    console.error("Alert PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update alert" },
      { status: 500 }
    );
  }
}
