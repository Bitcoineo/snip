import { NextRequest, NextResponse } from "next/server";
import { getLinkByCode } from "@/lib/links";
import { generateQRCode } from "@/lib/qrcode";

const CODE_REGEX = /^[a-zA-Z0-9]{7}$/;

export async function GET(
  _request: NextRequest,
  { params }: { params: { code: string } }
) {
  const { code } = params;

  if (!CODE_REGEX.test(code)) {
    return NextResponse.json(
      { error: "NOT_FOUND", message: "Short link not found." },
      { status: 404 }
    );
  }

  const linkResult = await getLinkByCode(code);
  if ("error" in linkResult) {
    return NextResponse.json(
      { error: linkResult.error, message: linkResult.message },
      { status: 404 }
    );
  }

  const host = _request.headers.get("host") ?? "localhost:3000";
  const protocol = _request.headers.get("x-forwarded-proto") ?? "http";
  const shortUrl = `${protocol}://${host}/${linkResult.data.shortCode}`;

  const buffer = await generateQRCode(shortUrl);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
