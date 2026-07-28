import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { verifyPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  secret:
    process.env.NEXTAUTH_SECRET ||
    process.env.ADMIN_DASHBOARD_SECRET ||
    "maze-admin-secret-key-default-12345",
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

        // 1. Try matching Prisma database user if configured
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
            }
          } catch {
            // Fallback to environment credentials if DB lookup fails
          }
        }

        // 2. Validate against ADMIN_DASHBOARD_SECRET or ADMIN_ENQUIRIES_SECRET
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

        // 3. Fallback default admin credentials if no secret is set
        if (
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
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        token.role = (user as unknown as { role?: string }).role || "ADMIN";
        token.isDefaultPassword = (user as unknown as { isDefaultPassword?: boolean }).isDefaultPassword ?? false;
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
        (session.user as unknown as { id: string }).id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string | null;
        (session.user as unknown as { role: string }).role =
          (token.role as string) || "ADMIN";
        (session.user as unknown as { isDefaultPassword: boolean }).isDefaultPassword =
          Boolean(token.isDefaultPassword);
      }
      return session;
    },
  },
};
