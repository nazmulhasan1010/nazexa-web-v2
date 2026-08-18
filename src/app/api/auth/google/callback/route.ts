import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  if (error) {
    return NextResponse.redirect(`${baseUrl}/auth/login?error=oauth_rejected`);
  }

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/auth/login?error=no_code`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      `${baseUrl}/auth/login?error=google_not_configured`,
    );
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) throw new Error("No access token");

    const profileRes = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      },
    );
    const profileData = await profileRes.json();

    if (!profileData.email) throw new Error("No email returned from Google");

    let user = await db.user.findUnique({
      where: { email: profileData.email },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          email: profileData.email,
          name: profileData.name,
          image: profileData.picture,
          emailVerified: new Date(),
        },
      });
    } else {
      if (!user.image && profileData.picture) {
        user = await db.user.update({
          where: { id: user.id },
          data: {
            image: profileData.picture,
            emailVerified: user.emailVerified || new Date(),
          },
        });
      }
    }

    const account = await db.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: "google",
          providerAccountId: profileData.id,
        },
      },
    });

    if (!account) {
      await db.account.create({
        data: {
          userId: user.id,
          type: "oauth",
          provider: "google",
          providerAccountId: profileData.id,
          access_token: tokenData.access_token,
          id_token: tokenData.id_token,
        },
      });
    }

    await createSession(user.id);
    return NextResponse.redirect(`${baseUrl}/`);
  } catch (err) {
    console.error(err);
    return NextResponse.redirect(`${baseUrl}/auth/login?error=oauth_failed`);
  }
}
