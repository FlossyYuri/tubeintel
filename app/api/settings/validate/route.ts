import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/youtube";
import { z } from "zod";

const schema = z.object({ apiKey: z.string().min(1) });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { apiKey } = schema.parse(body);
    const valid = await validateApiKey(apiKey);
    return NextResponse.json({ valid });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ valid: false }, { status: 400 });
    }
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
