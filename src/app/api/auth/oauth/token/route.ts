import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  // This endpoint serves as a mini-OAuth token issuer for internal Nazexa apps.
  // In a real OAuth flow, this exchanges an authorization code for an access token.
  // Since DB Design and DEV Tools run on the same ecosystem, they can just validate via the HTTP-only session directly or exchange a short-lived ticket.

  try {
    const body = await request.json();
    const { client_id, client_secret, grant_type } = body;

    // Very basic Client Credentials/App validation
    const app = await db.application.findUnique({
      where: { clientId: client_id },
    });

    if (!app || app.clientSecret !== client_secret) {
      return NextResponse.json({ error: "invalid_client" }, { status: 401 });
    }

    // Since they share the domain cookie (e.g. nazexa.com/db-design), we can just fetch the active user session!
    // Alternatively, if this was cross-domain, we'd exchange an 'authorization_code' grant here.

    if (grant_type === "session_exchange") {
      const user = await getSession();
      if (!user) {
        return NextResponse.json(
          { error: "no_active_session" },
          { status: 401 },
        );
      }

      // Record authorization grant
      await db.authorization.upsert({
        where: {
          userId_applicationId: { userId: user.id, applicationId: app.id },
        },
        create: {
          userId: user.id,
          applicationId: app.id,
          scopes: "profile email",
        },
        update: {},
      });

      // We could issue a dedicated JWT access_token here specifically for this app
      return NextResponse.json({
        access_token: "mock-access-token-since-we-rely-on-cookie",
        user_info: { id: user.id, email: user.email, name: user.name },
      });
    }

    return NextResponse.json(
      { error: "unsupported_grant_type" },
      { status: 400 },
    );
  } catch (error) {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
