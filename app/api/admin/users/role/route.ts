import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  try {
    console.log("[AdminUsersAPI] Role update request received");

    // Check authentication
    const session = await auth();
    if (!session?.user) {
      console.log("[AdminUsersAPI] Unauthorized - no session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== "admin") {
      console.log("[AdminUsersAPI] Forbidden - user is not admin");
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { userId, role } = body;

    console.log("[AdminUsersAPI] Updating user:", userId, "to role:", role);

    // Validate input
    if (!userId || !role) {
      console.log("[AdminUsersAPI] Missing required fields");
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate role value
    if (!["user", "admin"].includes(role)) {
      console.log("[AdminUsersAPI] Invalid role:", role);
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Prevent self-modification
    if (userId === session.user.id) {
      console.log("[AdminUsersAPI] Cannot modify own role");
      return NextResponse.json(
        { error: "Cannot modify your own role" },
        { status: 400 }
      );
    }

    // Check if user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      console.log("[AdminUsersAPI] User not found:", userId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    console.log("[AdminUsersAPI] Role updated successfully:", updatedUser.email);

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("[AdminUsersAPI] Error updating role:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
