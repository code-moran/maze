import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/authOptions";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const action = body.action || "update_profile";

    if (action === "update_profile") {
      const { name, email, image } = body;
      const userEmail = (email || session.user.email || "").trim().toLowerCase();

      if (isDatabaseConfigured() && prisma) {
        await prisma.adminUser.upsert({
          where: { email: userEmail },
          update: {
            name: name || session.user.name,
            email: userEmail,
            image: image || null,
          },
          create: {
            email: userEmail,
            name: name || "Admin User",
            image: image || null,
            role: "ADMIN",
          },
        });
      }

      return NextResponse.json({
        ok: true,
        user: {
          name: name || session.user.name,
          email: userEmail,
          image: image || null,
        },
      });
    }

    if (action === "change_password") {
      const { currentPassword, newPassword } = body;

      if (!newPassword || newPassword.length < 6) {
        return NextResponse.json(
          { ok: false, error: "New password must be at least 6 characters long." },
          { status: 400 }
        );
      }

      if (isDatabaseConfigured() && prisma) {
        const userEmail = (session.user.email || "").trim().toLowerCase();
        const dbUser = await prisma.adminUser.findUnique({
          where: { email: userEmail },
        });

        if (dbUser && dbUser.password) {
          const isValid = verifyPassword(currentPassword || "", dbUser.password);
          if (!isValid) {
            return NextResponse.json(
              { ok: false, error: "Incorrect current password." },
              { status: 400 }
            );
          }
        }

        const newHash = hashPassword(newPassword);

        await prisma.adminUser.upsert({
          where: { email: userEmail },
          update: { password: newHash },
          create: {
            email: userEmail,
            password: newHash,
            name: session.user.name || "Admin User",
            role: "ADMIN",
          },
        });

        return NextResponse.json({
          ok: true,
          message: "Password updated successfully.",
        });
      }

      return NextResponse.json({
        ok: true,
        message:
          "Password updated. Connect a Postgres database via DATABASE_URL to persist user accounts across server restarts.",
      });
    }

    return NextResponse.json({ ok: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Profile update failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
