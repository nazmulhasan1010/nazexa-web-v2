import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/auth/github/callback`;

  if (!clientId) {
    return NextResponse.json(
      { error: "GitHub OAuth not configured in environment" },
      { status: 500 },
    );
  }

  const scope = "user:email";
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;

  return NextResponse.redirect(authUrl);
}
