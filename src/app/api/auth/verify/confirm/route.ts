import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { verifyCode } from "@/lib/verification-code";
import { createEventPayload } from "@/lib/events";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const sessionUser = await getSession();

  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = sessionUser.id;

  try {
    const body = await req.json();
    const { code } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Verification code is required" },
        { status: 400 },
      );
    }

    const result = await verifyCode(userId, code);

    if (!result.verified) {
      return NextResponse.json(
        { error: result.reason, verified: false },
        { status: 400 },
      );
    }

    // Write an event log for verification
    try {
      await db.userEvent.create({
        data: createEventPayload(userId, "USER_EMAIL_VERIFIED", {
          email: sessionUser.email,
        }),
      });
    } catch {
      // audit log failures are non-blocking
    }

    return NextResponse.json({ verified: true });
  } catch (err) {
    console.error("Error confirming verification code:", err);
    return NextResponse.json(
      { error: "Failed to verify code" },
      { status: 500 },
    );
  }
}
