import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isBlockedBotUserAgent } from "@/lib/bot-block";

export function proxy(request: NextRequest) {
  const ua = request.headers.get("user-agent");

  if (isBlockedBotUserAgent(ua)) {
    return new NextResponse(null, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.(?:ico|png|jpg|jpeg|gif|webp|svg|woff2?|ttf|eot|css|js|map)$).*)",
  ],
};
