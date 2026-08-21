import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createEventPayload } from "@/lib/events";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { client_id, client_secret, userId, name, image } = body;

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

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (image !== undefined) updateData.image = image;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "no_valid_fields_provided" },
        { status: 400 }
      );
    }

    const updatedUser = await db.$transaction(async (tx) => {
      const u = await tx.user.update({
        where: { id: userId },
        data: updateData,
      });

      if (name !== undefined && name !== user.name) {
        await tx.userEvent.create({
          data: createEventPayload(user.id, "USER_NAME_CHANGED", {
            oldName: user.name,
            newName: name,
          }),
        });
      }

      if (image !== undefined && image !== user.image) {
        await tx.userEvent.create({
          data: createEventPayload(user.id, "USER_IMAGE_CHANGED", {
            oldImage: user.image,
            newImage: image,
          }),
        });
      }

      await tx.userEvent.create({
        data: createEventPayload(user.id, "USER_UPDATED", updateData),
      });

      return u;
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("sync-profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
