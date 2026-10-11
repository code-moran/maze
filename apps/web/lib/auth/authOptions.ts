import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { verifyPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";

function googleAllowlist(): string[] {
  return (
    process.env.ADMIN_GOOGLE_ALLOWLIST ||
    process.env.ADMIN_EMAIL ||
    ""
  )
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

function resolveAuthSecret(): string | undefined {
  const secret =
    process.env.NEXTAUTH_SECRET?.trim() ||
    process.env.ADMIN_DASHBOARD_SECRET?.trim();
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") return undefined;
  return "maze-dev-only-secret-change-me";
}

const authSecret = resolveAuthSecret();

export const authOptions: NextAuthOptions = {
  secret: authSecret,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "Admin Credentials",
      credentials: {
        email: { label: "Email / Username", type: "text" },
        password: { label: "Password / Secret", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email && !credentials?.password) {
          return null;
        }

        const inputEmail = (credentials.email || "").trim();
        const inputPassword = credentials.password || "";

        const derivedEmail =
          inputEmail && inputEmail.includes("@")
            ? inputEmail.toLowerCase()
            : "admin@mazetechnologies.co.ke";

        if (prisma) {
          try {
            const dbUser = await prisma.adminUser.findFirst({
              where: {
                OR: [
                  { email: derivedEmail },
                  { email: inputEmail.toLowerCase() },
                ],
              },
            });

            if (dbUser && dbUser.password) {
              const isValid = verifyPassword(inputPassword, dbUser.password);
              if (isValid) {
                return {
                  id: dbUser.id,
                  email: dbUser.email,
                  name: dbUser.name || "Admin User",
                  image: dbUser.image || null,
                  role: dbUser.role || "ADMIN",
                  isDefaultPassword: false,
                };
              }
              return null;
            }

            const anyDbAdminWithPassword = await prisma.adminUser.findFirst({
              where: { password: { not: null } },
            });
            if (anyDbAdminWithPassword && dbUser) {
              return null;
            }
          } catch {
            // Fall through to env credentials if DB is unreachable
          }
        }

        const validSecret =
          process.env.ADMIN_DASHBOARD_SECRET?.trim() ||
          process.env.ADMIN_ENQUIRIES_SECRET?.trim();

        if (validSecret) {
          if (inputPassword === validSecret || inputEmail === validSecret) {
            return {
              id: `env-${derivedEmail}`,
              email: derivedEmail,
              name: derivedEmail.split("@")[0] || "Maze Administrator",
              image: null,
              role: "ADMIN",
              isDefaultPassword: false,
            };
          }
        }

        // Dev-only fallback — never in production
        if (
          process.env.NODE_ENV !== "production" &&
          !validSecret &&
          (inputPassword === "admin123" || inputEmail === "admin123")
        ) {
          return {
            id: `default-${derivedEmail}`,
            email: derivedEmail,
            name: derivedEmail.split("@")[0] || "Maze Admin",
            image: null,
            role: "ADMIN",
            isDefaultPassword: true,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google") return true;
      const allow = googleAllowlist();
      if (!allow.length) {
        console.warn(
          "Google sign-in blocked: set ADMIN_GOOGLE_ALLOWLIST or ADMIN_EMAIL"
        );
        return false;
      }
      const email = (user.email || "").toLowerCase();
      return allow.includes(email);
    },
    async jwt({ token, user, account, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        const roleFromUser = (user as { role?: string }).role;
        token.role =
          roleFromUser ||
          (account?.provider === "google" ? "ADMIN" : "ADMIN");
        token.isDefaultPassword =
          (user as { isDefaultPassword?: boolean }).isDefaultPassword ?? false;
      }
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.email) token.email = session.email;
        if (session.image) token.picture = session.image;
        if (session.role) token.role = session.role;
        if (typeof session.isDefaultPassword === "boolean") {
          token.isDefaultPassword = session.isDefaultPassword;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id: string }).id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string | null;
        (session.user as { role: string }).role =
          (token.role as string) || "ADMIN";
        (session.user as { isDefaultPassword: boolean }).isDefaultPassword =
          Boolean(token.isDefaultPassword);
      }
      return session;
    },
  },
};
