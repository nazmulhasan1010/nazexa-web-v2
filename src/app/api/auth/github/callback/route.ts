import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  if (error) {
    return NextResponse.redirect(`${baseUrl}/login?error=oauth_rejected`);
  }

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/login?error=no_code`);
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const redirectUri = `${baseUrl}/api/auth/github/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      `${baseUrl}/login?error=github_not_configured`,
    );
  }

  try {
    // Exchange code for token
    const tokenRes = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: redirectUri,
        }),
      },
    );

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token)
      throw new Error("No access token returned from GitHub");

    // Fetch user profile
    const profileRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: "application/json",
      },
    });
    const profileData = await profileRes.json();

    let email = profileData.email;

    // If email is null (private), fetch from user/emails
    if (!email) {
      const emailRes = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          Accept: "application/json",
        },
      });
      const emails = await emailRes.json();
      const primaryEmail = emails.find((e: any) => e.primary && e.verified);
      email = primaryEmail ? primaryEmail.email : emails[0]?.email;
    }

    if (!email) throw new Error("No verified email returned from GitHub");

    // Link or create user
    let user = await db.user.findUnique({ where: { email } });

    if (!user) {
      user = await db.user.create({
        data: {
          email,
          name: profileData.name || profileData.login,
          image: profileData.avatar_url,
          emailVerified: new Date(),
        },
      });
    } else {
      if (!user.image && profileData.avatar_url) {
        user = await db.user.update({
          where: { id: user.id },
          data: {
            image: profileData.avatar_url,
            emailVerified: user.emailVerified || new Date(),
          },
        });
      }
    }

    // Link account
    const account = await db.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: "github",
          providerAccountId: profileData.id.toString(),
        },
      },
    });

    if (!account) {
      await db.account.create({
        data: {
          userId: user.id,
          type: "oauth",
          provider: "github",
          providerAccountId: profileData.id.toString(),
          access_token: tokenData.access_token,
        },
      });
    }

    await createSession(user.id);
    return NextResponse.redirect(`${baseUrl}/`);
  } catch (err) {
    console.error(err);
    return NextResponse.redirect(`${baseUrl}/login?error=oauth_failed`);
  }
}
