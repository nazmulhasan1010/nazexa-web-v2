import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * GitHub OAuth Initiation — with callback_url support
 *
 * GET /api/auth/oauth/github/initiate?callback_url=<url>
 *
 * Used by registered Nazexa products to initiate GitHub OAuth through
 * Nazexa Central Auth. After the user authenticates with GitHub, the
 * nazexa_session cookie is set and the user is redirected to callback_url
 * (typically the product's SSO endpoint).
 *
 * The callback_url is passed through the OAuth `state` parameter so it
 * survives the GitHub redirect roundtrip.
 *
 * SECURITY:
 *  - callback_url is validated to be a safe URL (http/https only)
 *  - state is base64url encoded and decoded in the callback handler
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const rawCallbackUrl = searchParams.get("callback_url");
  const authPerformFrom = searchParams.get("auth_perform_from");
  const host = request.headers.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`;

  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = `${baseUrl}/api/auth/callback/github`;

  if (!clientId) {
    return NextResponse.json(
      { error: "GitHub OAuth not configured in environment" },
      { status: 500 },
    );
  }

  // Validate callback_url — must be a valid http/https URL
  let callbackUrl = "";
  if (rawCallbackUrl) {
    try {
      const parsed = new URL(rawCallbackUrl);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        callbackUrl = rawCallbackUrl;
      }
    } catch {
      // Invalid URL — ignore and use default
    }
  }

  // Encode callback_url in the OAuth state parameter
  const state = callbackUrl
    ? Buffer.from(JSON.stringify({ callback_url: callbackUrl })).toString(
        "base64url",
      )
    : "";

  const scope = "user:email";
  const authUrlParams = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope,
  });

  if (state) {
    authUrlParams.set("state", state);
  }

  const authUrl = `https://github.com/login/oauth/authorize?${authUrlParams.toString()}`;

  const response = NextResponse.redirect(authUrl);

  if (authPerformFrom === "nazexa-db") {
    const cookieStore = await cookies();
    cookieStore.set("auth_perform_from", "nazexa-db", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 15,
    });
  }

  return response;
}
