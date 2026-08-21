import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 },
      );
    }

    const hashedPassword = await hashPassword(password);
    const ip = request.headers.get("x-forwarded-for") || "unknown";

    // 4. Create user and events in transaction
    const newUser = await db.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          name,
          email,
          password_hash: hashedPassword,
          lastLoginAt: new Date(),
          lastLoginIp: ip,
        },
      });

      await tx.userEvent.create({
        data: {
          eventId: crypto.randomUUID(),
          centralUserId: u.id,
          source: "nazexa-web-core",
          eventType: "USER_CREATED",
          payload: JSON.stringify({ provider: "email" }),
        },
      });
      await tx.userEvent.create({
        data: {
          eventId: crypto.randomUUID(),
          centralUserId: u.id,
          source: "nazexa-web-core",
          eventType: "USER_LOGGED_IN",
          payload: JSON.stringify({ ip, provider: "email" }),
        },
      });
      return u;
    });

    // 5. Create secure session
    await createSession(newUser.id);

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name,
        email,
        emailVerified: newUser.emailVerified,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
