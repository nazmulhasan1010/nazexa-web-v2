import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract nazexa_session from the incoming request to forward to Nazexa DB
    const cookiesStr = request.headers.get("cookie") || "";
    const nazexaSessionMatch = cookiesStr.match(
      /(?:^|[;,]\s*)nazexa_session=([^;,\s]+)/,
    );
    const nazexaSession = nazexaSessionMatch
      ? decodeURIComponent(nazexaSessionMatch[1])
      : null;

    if (!nazexaSession) {
      return NextResponse.json(
        { error: "Unauthorized. No valid session." },
        { status: 401 },
      );
    }

    // Forward the request to Nazexa DB Design
    const dbApiUrl = process.env.NEXT_PUBLIC_NAZEXA_DB_URL || "http://localhost:8000";

    const response = await fetch(`${dbApiUrl}/api/account/overview`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Pass the session cookie directly so Nazexa DB can authenticate the user
        Cookie: `nazexa_session=${encodeURIComponent(nazexaSession)}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Failed to fetch overview from Nazexa DB" },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Nazexa DB overview proxy error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
