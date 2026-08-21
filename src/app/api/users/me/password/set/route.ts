import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 },
      );
    }

    // Get the user from db to get current state
    const user = await db.user.findUnique({
      where: { id: session.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        { error: "Email must be verified first" },
        { status: 403 },
      );
    }

    if (user.password_hash) {
      return NextResponse.json(
        { error: "Password already configured. Use the change password flow." },
        { status: 400 },
      );
    }

    const newHashedPassword = await hashPassword(password);

    await db.user.update({
      where: { id: user.id },
      data: { password_hash: newHashedPassword },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
