import { NextResponse } from "next/server";
import { z } from "zod";

import { runUxRayScan } from "@/lib/uxray/scan";

const requestSchema = z.object({
  url: z.string().url(),
  extractedPage: z
    .object({
      url: z.string().url(),
      title: z.string(),
      screenshot: z.object({
        src: z.string(),
        width: z.number(),
        height: z.number(),
      }),
      elements: z.array(z.any()),
    })
    .optional(),
});

export async function POST(request: Request) {
  try {
    const body = requestSchema.parse(await request.json());
    const result = await runUxRayScan(body);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to process scan request.",
      },
      { status: 400 }
    );
  }
}
