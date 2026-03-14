import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { videoId, title, channelTitle, thumbnail, views, viralScore } = body;

    if (!videoId || !title || !channelTitle) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const item = await prisma.savedVideo.create({
      data: {
        collectionId: id,
        videoId,
        title,
        channelTitle,
        thumbnail: thumbnail || "",
        views: views || 0,
        viralScore: viralScore || 0,
      },
    });
    return NextResponse.json(item);
  } catch (error) {
    console.error("Save video error:", error);
    return NextResponse.json(
      { error: "Failed to save video" },
      { status: 500 }
    );
  }
}
