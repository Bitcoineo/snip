import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createLink, getLinks } from "@/lib/links";

const createLinkSchema = z.object({
  url: z
    .string({ message: "A valid HTTP(S) URL is required." })
    .url("A valid HTTP(S) URL is required.")
    .max(2048, "URL must be 2048 characters or fewer.")
    .refine(
      (u) => u.startsWith("http://") || u.startsWith("https://"),
      "A valid HTTP(S) URL is required."
    ),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "INVALID_BODY", message: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  const parsed = createLinkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_URL", message: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const result = await createLink(parsed.data.url);

  if ("error" in result) {
    return NextResponse.json(
      { error: result.error, message: result.message },
      { status: 500 }
    );
  }

  const host = request.headers.get("host") ?? "localhost:3000";
  const protocol = request.headers.get("x-forwarded-proto") ?? "http";
  const shortUrl = `${protocol}://${host}/${result.data.shortCode}`;

  return NextResponse.json(
    {
      id: result.data.id,
      shortCode: result.data.shortCode,
      shortUrl,
      originalUrl: result.data.originalUrl,
      createdAt: result.data.createdAt.toISOString(),
    },
    { status: 201 }
  );
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));

  const result = await getLinks(page, limit);

  if ("error" in result) {
    return NextResponse.json(
      { error: result.error, message: result.message },
      { status: 500 }
    );
  }

  const host = request.headers.get("host") ?? "localhost:3000";
  const protocol = request.headers.get("x-forwarded-proto") ?? "http";

  return NextResponse.json({
    links: result.data.links.map((link) => ({
      id: link.id,
      shortCode: link.shortCode,
      shortUrl: `${protocol}://${host}/${link.shortCode}`,
      originalUrl: link.originalUrl,
      totalClicks: link.totalClicks,
      createdAt: link.createdAt.toISOString(),
    })),
    pagination: result.data.pagination,
  });
}
