import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

export function middleware(request: NextRequest) {
  if (request.method !== "POST") {
    return NextResponse.next();
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "127.0.0.1";

  const { allowed, remaining, resetAt } = checkRateLimit(ip);

  if (!allowed) {
    const retryAfter = Math.max(1, resetAt - Math.ceil(Date.now() / 1000));
    return NextResponse.json(
      {
        error: "RATE_LIMITED",
        message: `Too many requests. Try again in ${retryAfter} seconds.`,
        retryAfter,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
          "X-RateLimit-Limit": "10",
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(resetAt),
        },
      }
    );
  }

  const response = NextResponse.next();
  response.headers.set("X-RateLimit-Limit", "10");
  response.headers.set("X-RateLimit-Remaining", String(remaining));
  response.headers.set("X-RateLimit-Reset", String(resetAt));
  return response;
}

export const config = {
  matcher: "/api/links",
};
