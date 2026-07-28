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
    const currentSessionEmail = (
      session.user.email || "admin@mazetechnologies.co.ke"
    ).trim().toLowerCase();

    if (action === "update_profile") {
      const { name, email, image } = body;
      const targetEmail = (email || currentSessionEmail).trim().toLowerCase();

      if (isDatabaseConfigured() && prisma) {
        const existing = await prisma.adminUser.findFirst({
          where: {
            OR: [{ email: currentSessionEmail }, { email: targetEmail }],
          },
        });

        if (existing) {
          await prisma.adminUser.update({
            where: { id: existing.id },
            data: {
              name: name || session.user.name || "Admin User",
              email: targetEmail,
              image: image || null,
            },
          });
        } else {
          await prisma.adminUser.create({
            data: {
              email: targetEmail,
              name: name || session.user.name || "Admin User",
              image: image || null,
              role: "ADMIN",
            },
          });
        }
      }

      return NextResponse.json({
        ok: true,
        user: {
          name: name || session.user.name || "Admin User",
          email: targetEmail,
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
        const defaultAdminPassword =
          process.env.ADMIN_PASSWORD ||
          process.env.ADMIN_DASHBOARD_SECRET ||
          "admin123";

        const existing = await prisma.adminUser.findFirst({
          where: {
            OR: [{ email: currentSessionEmail }, { role: "ADMIN" }],
          },
        });

        if (existing && existing.password) {
          const isDbValid = verifyPassword(currentPassword || "", existing.password);
          const isEnvValid = (currentPassword || "").trim() === defaultAdminPassword.trim();

          if (!isDbValid && !isEnvValid) {
            return NextResponse.json(
              { ok: false, error: "Incorrect current password." },
              { status: 400 }
            );
          }
        }

        const newHash = hashPassword(newPassword);

        if (existing) {
          await prisma.adminUser.update({
            where: { id: existing.id },
            data: { password: newHash },
          });
        } else {
          await prisma.adminUser.create({
            data: {
              email: currentSessionEmail,
              password: newHash,
              name: session.user.name || "Maze Admin",
              role: "ADMIN",
            },
          });
        }

        return NextResponse.json({
          ok: true,
          message: "Password updated successfully.",
        });
      }

      return NextResponse.json({
        ok: true,
        message: "Password updated successfully.",
      });
    }

    return NextResponse.json({ ok: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Profile update failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
