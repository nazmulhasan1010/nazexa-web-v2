"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { db } from "./db";

export async function login(data: { email: string; password: string }) {
  try {
    const user = await db.user.findUnique({ where: { email: data.email } });
    if (!user) return { error: "Invalid email or password" };

    const valid = await bcrypt.compare(data.password, user.password_hash);
    if (!valid) return { error: "Invalid email or password" };

    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

    await db.session.create({
      data: {
        id: sessionId,
        userId: user.id,
        expiresAt,
      },
    });

    const cookieStore = await cookies();
    cookieStore.set("session_id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    });

    return { success: true };
  } catch (err: any) {
    console.error("Login error:", err);
    return { error: "Server error or database unreachable." };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_id")?.value;
  if (sessionId) {
    await db.session.deleteMany({ where: { id: sessionId } });
  }
  cookieStore.delete("session_id");
  return true;
}

export async function getSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_id")?.value;
  if (!sessionId) return null;

  const session = await db.session.findUnique({
    where: { id: sessionId },
    include: { user: { select: { id: true, email: true } } },
  });

  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await db.session.delete({ where: { id: sessionId } });
    return null;
  }

  return session;
}
