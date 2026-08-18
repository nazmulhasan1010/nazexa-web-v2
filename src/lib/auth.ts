import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "fallback-secret-for-development-only-do-not-use-in-prod";
const encodedKey = new TextEncoder().encode(JWT_SECRET);

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const sessionId =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);

  await db.session.create({
    data: {
      id: sessionId,
      userId,
      expiresAt,
    },
  });

  const fullToken = await new SignJWT({ userId, sessionId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);

  const cookieStore = await cookies();
  cookieStore.set("nazexa_session", fullToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("nazexa_session")?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, encodedKey);
    if (!payload.userId || !payload.sessionId) return null;

    const session = await db.session.findUnique({
      where: { id: payload.sessionId as string },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    return session.user;
  } catch (error) {
    return null;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("nazexa_session")?.value;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, encodedKey);
      if (payload.sessionId) {
        await db.session
          .delete({
            where: { id: payload.sessionId as string },
          })
          .catch(() => {});
      }
    } catch (e) {
      // Ignore
    }
  }

  cookieStore.delete("nazexa_session");
}
