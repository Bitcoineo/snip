import { NextRequest, NextResponse } from "next/server";
import { getLinkByCode } from "@/lib/links";
import { getLinkStats } from "@/lib/analytics";
import { getBaseUrl } from "@/lib/base-url";
import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { clicks } from "@/db/schema";
import { CODE_REGEX } from "@/lib/constants";

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  const { code } = params;

  if (!CODE_REGEX.test(code)) {
    return NextResponse.json(
      { error: "NOT_FOUND", message: "Short link not found." },
      { status: 404 }
    );
  }

  const { searchParams } = request.nextUrl;
  const daysParam = searchParams.get("days");
  const days = daysParam ? Number(daysParam) : 7;

  if (isNaN(days) || days < 1 || days > 90) {
    return NextResponse.json(
      { error: "INVALID_PARAM", message: "days must be between 1 and 90." },
      { status: 400 }
    );
  }

  const linkResult = await getLinkByCode(code);
  if ("error" in linkResult) {
    return NextResponse.json(
      { error: linkResult.error, message: linkResult.message },
      { status: 404 }
    );
  }

  const link = linkResult.data;

  const [statsResult, [{ totalClicks }]] = await Promise.all([
    getLinkStats(link.id, days),
    db
      .select({ totalClicks: count() })
      .from(clicks)
      .where(eq(clicks.linkId, link.id)),
  ]);

  if ("error" in statsResult) {
    return NextResponse.json(
      { error: statsResult.error, message: statsResult.message },
      { status: 500 }
    );
  }

  const baseUrl = getBaseUrl(request);

  return NextResponse.json({
    link: {
      id: link.id,
      shortCode: link.shortCode,
      shortUrl: `${baseUrl}/${link.shortCode}`,
      originalUrl: link.originalUrl,
      createdAt: link.createdAt.toISOString(),
      totalClicks,
    },
    ...statsResult.data,
  });
}
