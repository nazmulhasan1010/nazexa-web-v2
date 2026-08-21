import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, verifyPassword, hashPassword } from "@/lib/auth";

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Get the user from db to get the password_hash
    const user = await db.user.findUnique({
      where: { id: session.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.password_hash) {
      return NextResponse.json(
        {
          error:
            "Your account is managed by an external provider (Google/GitHub). You cannot set a password.",
        },
        { status: 400 },
      );
    }

    const isValid = await verifyPassword(currentPassword, user.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Incorrect current password" },
        { status: 400 },
      );
    }

    const newHashedPassword = await hashPassword(newPassword);

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
