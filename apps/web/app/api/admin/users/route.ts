import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/authOptions";
import { hashPassword } from "@/lib/auth/password";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

async function requireAdminRole() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return { error: NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }), session: null };
  }
  const role = (session.user as unknown as { role?: string }).role || "ADMIN";
  if (role !== "ADMIN") {
    return {
      error: NextResponse.json({ ok: false, error: "Forbidden: Admin role required." }, { status: 403 }),
      session: null,
    };
  }
  return { error: null, session };
}

export async function GET() {
  const { error } = await requireAdminRole();
  if (error) return error;

  if (!isDatabaseConfigured() || !prisma) {
    return NextResponse.json({ ok: true, users: [] });
  }

  try {
    const users = await prisma.adminUser.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ ok: true, users });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch users";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { error } = await requireAdminRole();
  if (error) return error;

  if (!isDatabaseConfigured() || !prisma) {
    return NextResponse.json({ ok: false, error: "Database not configured." }, { status: 503 });
  }

  try {
    const body = await req.json();
    const { email, password, name, role, image } = body;

    const userEmail = (email || "").trim().toLowerCase();
    if (!userEmail) {
      return NextResponse.json({ ok: false, error: "Email is required." }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json({ ok: false, error: "Password must be at least 6 characters." }, { status: 400 });
    }

    const existing = await prisma.adminUser.findUnique({
      where: { email: userEmail },
    });

    if (existing) {
      return NextResponse.json({ ok: false, error: "A user with this email already exists." }, { status: 400 });
    }

    const hashedPassword = hashPassword(password);

    const newUser = await prisma.adminUser.create({
      data: {
        email: userEmail,
        password: hashedPassword,
        name: name?.trim() || "Admin User",
        role: role === "EDITOR" ? "EDITOR" : "ADMIN",
        image: image || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ ok: true, user: newUser });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create user";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const { error } = await requireAdminRole();
  if (error) return error;

  if (!isDatabaseConfigured() || !prisma) {
    return NextResponse.json({ ok: false, error: "Database not configured." }, { status: 503 });
  }

  try {
    const body = await req.json();
    const { id, email, password, name, role, image } = body;

    if (!id) {
      return NextResponse.json({ ok: false, error: "User ID is required." }, { status: 400 });
    }

    const existing = await prisma.adminUser.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ ok: false, error: "User not found." }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (email !== undefined) updateData.email = email.trim().toLowerCase();
    if (role !== undefined) updateData.role = role === "EDITOR" ? "EDITOR" : "ADMIN";
    if (image !== undefined) updateData.image = image || null;
    if (password && password.length >= 6) {
      updateData.password = hashPassword(password);
    }

    const updatedUser = await prisma.adminUser.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ ok: true, user: updatedUser });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update user";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { error, session } = await requireAdminRole();
  if (error) return error;

  if (!isDatabaseConfigured() || !prisma) {
    return NextResponse.json({ ok: false, error: "Database not configured." }, { status: 503 });
  }

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ ok: false, error: "User ID parameter is required." }, { status: 400 });
    }

    // Prevent deleting your own account
    const currentUserId = (session?.user as unknown as { id?: string })?.id;
    const currentUserEmail = session?.user?.email;

    const userToDelete = await prisma.adminUser.findUnique({
      where: { id },
    });

    if (!userToDelete) {
      return NextResponse.json({ ok: false, error: "User not found." }, { status: 404 });
    }

    if (userToDelete.id === currentUserId || userToDelete.email === currentUserEmail) {
      return NextResponse.json({ ok: false, error: "You cannot delete your own account." }, { status: 400 });
    }

    await prisma.adminUser.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true, message: "User deleted successfully." });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete user";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
