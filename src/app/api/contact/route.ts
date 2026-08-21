import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { name, email, message } = body;
    const user = await getSession();

    if (user) {
      name = user.name || name;
      email = user.email || email;
    }

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    if (!user && (!name || !email)) {
      return NextResponse.json(
        { error: "Name and email are required for guests" },
        { status: 400 },
      );
    }

    const contactMessage = await db.contactMessage.create({
      data: {
        name,
        email,
        message,
        userId: user?.id || null,
      },
    });

    return NextResponse.json({ success: true, message: contactMessage });
  } catch (err) {
    console.error("Failed to submit contact message", err);
    return NextResponse.json(
      { error: "internal_server_error" },
      { status: 500 },
    );
  }
}
