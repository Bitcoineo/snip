import { NextRequest, NextResponse } from "next/server";
import { getLinkByCode } from "@/lib/links";
import { recordClick } from "@/lib/clicks";
import { parseHeaders } from "@/lib/parse-headers";
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

  const result = await getLinkByCode(code);

  if ("error" in result) {
    return NextResponse.json(
      { error: result.error, message: result.message },
      { status: 404 }
    );
  }

  const metadata = parseHeaders(request.headers);
  void recordClick(result.data.id, metadata);

  return NextResponse.redirect(result.data.originalUrl, {
    status: 302,
    headers: { "Cache-Control": "no-store" },
  });
}
