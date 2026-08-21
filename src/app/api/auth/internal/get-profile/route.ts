import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { client_id, client_secret, userId } = body;

    if (!client_id || !client_secret || !userId) {
      return NextResponse.json(
        { error: "client_id, client_secret, and userId are required" },
        { status: 400 }
      );
    }

    const app = await db.application.findUnique({
      where: { clientId: client_id },
    });

    if (!app || app.clientSecret !== client_secret) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        emailVerified: true,
        status: true,
        password_hash: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const { password_hash, ...safeUser } = user;
    const userWithPasswordFlag = {
      ...safeUser,
      hasPassword: Boolean(password_hash),
    };

    return NextResponse.json({ success: true, user: userWithPasswordFlag });
  } catch (error) {
    console.error("get-profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
