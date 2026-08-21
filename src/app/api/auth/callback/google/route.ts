import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { createSessionToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const host = request.headers.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`;

  if (error) {
    return NextResponse.redirect(`${baseUrl}/auth/login?error=oauth_rejected`);
  }

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/auth/login?error=no_code`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${baseUrl}/api/auth/callback/google`;

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

    const ip = request.headers.get("x-forwarded-for") || "unknown";

    let user = await db.user.findUnique({
      where: { email: profileData.email },
    });

    await db.$transaction(async (tx) => {
      // Create user if not exists
      if (!user) {
        user = await tx.user.create({
          data: {
            email: profileData.email,
            name: profileData.name,
            image: profileData.picture,
            emailVerified: new Date(),
            lastLoginAt: new Date(),
            lastLoginIp: ip,
          },
        });

        await tx.userEvent.create({
          data: {
            eventId: crypto.randomUUID(),
            centralUserId: user.id,
            source: "nazexa-web-core",
            eventType: "USER_CREATED",
            payload: JSON.stringify({ provider: "google" }),
          },
        });
      } else {
        // Update user
        const updateData: any = {
          lastLoginAt: new Date(),
          lastLoginIp: ip,
          emailVerified: user.emailVerified || new Date(),
        };
        if (!user.image && profileData.picture) {
          updateData.image = profileData.picture;
        }
        user = await tx.user.update({
          where: { id: user.id },
          data: updateData,
        });
      }

      await tx.userEvent.create({
        data: {
          eventId: crypto.randomUUID(),
          centralUserId: user.id,
          source: "nazexa-web-core",
          eventType: "USER_LOGGED_IN",
          payload: JSON.stringify({ ip, provider: "google" }),
        },
      });

      // Link account
      const account = await tx.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider: "google",
            providerAccountId: profileData.id,
          },
        },
      });

      if (!account) {
        await tx.account.create({
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
    });

    if (user.status !== "active") {
      return NextResponse.redirect(`${baseUrl}/login?error=account_disabled`);
    }

    // Create session token and set cookie on the redirect response
    const { token, expiresAt } = await createSessionToken(user.id);

    let redirectUrl = `${baseUrl}/`;

    const authPerformFrom = request.cookies.get("auth_perform_from")?.value;

    if (authPerformFrom === "nazexa-db") {
      const dbBaseUrl = process.env.NEXT_PUBLIC_NAZEXA_DB_URL || "http://localhost:8000";
      let ssoPath = "/api/auth/sso";
      
      const stateParam = url.searchParams.get("state");
      if (stateParam) {
        try {
          const decodedState = JSON.parse(
            Buffer.from(stateParam, "base64url").toString(),
          );
          if (decodedState.callback_url) {
            const parsed = new URL(decodedState.callback_url);
            ssoPath = parsed.pathname + parsed.search;
          }
        } catch (e) {
          // ignore invalid state
        }
      }
      redirectUrl = `${dbBaseUrl.replace(/\/$/, '')}${ssoPath}`;
    } else {
      // Enforce Email Verification and Password Setup flows
      if (!user.emailVerified) {
        redirectUrl = `${baseUrl}/verify`;
      } else if (!user.password_hash) {
        redirectUrl = `${baseUrl}/set-password`;
      } else {
        const stateParam = url.searchParams.get("state");
        if (stateParam) {
          try {
            const decodedState = JSON.parse(
              Buffer.from(stateParam, "base64url").toString(),
            );
            if (decodedState.callback_url) {
              const parsed = new URL(decodedState.callback_url);
              if (parsed.protocol === "http:" || parsed.protocol === "https:") {
                redirectUrl = decodedState.callback_url;
              }
            }
          } catch (e) {
            // ignore invalid state
          }
        }
      }
    }

    const response = NextResponse.redirect(redirectUrl);

    if (request.cookies.get("auth_perform_from")) {
      const cookieStore = await cookies();
      cookieStore.delete("auth_perform_from");
    }

    const isProd = process.env.NODE_ENV === "production";
    const domain = process.env.COOKIE_DOMAIN;

    response.cookies.set("nazexa_session", token, {
      httpOnly: true,
      secure: isProd,
      expires: expiresAt,
      sameSite: "lax",
      path: "/",
      ...(domain ? { domain } : {}),
    });
    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.redirect(`${baseUrl}/login?error=oauth_failed`);
  }
}
