// proxy.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/app/lib/auth"

export function proxy(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { userId, role } = verifyToken(authHeader);

  
    const headers = new Headers(req.headers);
    headers.set("x-user-id", String(userId));
    headers.set("x-user-role", role);

    return NextResponse.next({
      request: {
        headers,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ message: "Invalid or expired token" }, { status: 401 });
  }
}

// Only apply to your tickets API
export const config = {
  matcher: ["/api/tickets/:path*"], 
};