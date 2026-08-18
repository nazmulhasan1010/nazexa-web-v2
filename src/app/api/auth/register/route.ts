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

    const password_hash = await hashPassword(password);
    const user = await db.user.create({
      data: { name, email, password_hash },
    });

    // TODO: Integrate with Resend/AWS SES to send a verification email with a token
    // For now we'll create the session (users can log in, but emailVerified is null)

    await createSession(user.id);

    return NextResponse.json({
      success: true,
      user: { id: user.id, name, email, emailVerified: user.emailVerified },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
