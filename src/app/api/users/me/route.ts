import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { createEventPayload } from "@/lib/events";

export async function GET() {
  const user = await getSession();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    image: user.image,
    createdAt: user.createdAt,
    status: user.status,
  });
}

export async function PATCH(request: Request) {
  const user = await getSession();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.status !== "active") {
    return NextResponse.json({ error: "account_disabled" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, image } = body;

    // Filter out restricted fields. We only process allowed profile fields.
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (image !== undefined) updateData.image = image;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "no_valid_fields_provided" },
        { status: 400 },
      );
    }

    // Execute User update and Event creation in a single transaction
    const updatedUser = await db.$transaction(async (tx) => {
      const u = await tx.user.update({
        where: { id: user.id },
        data: updateData,
      });

      // Generate events for what changed
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

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        emailVerified: updatedUser.emailVerified,
        image: updatedUser.image,
        createdAt: updatedUser.createdAt,
        status: updatedUser.status,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "internal_server_error" },
      { status: 500 },
    );
  }
}
