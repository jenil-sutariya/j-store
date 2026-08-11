import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";
import type { Role } from "@/generated/prisma/enums";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // Google verifies the email address itself, so it's safe to link a
      // Google sign-in to an existing password-based account that shares the
      // same email instead of blocking it with "OAuthAccountNotLinked".
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      credentials: {
        email: { label: "Email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") {
          return null;
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) {
          return null;
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = (user as { role?: Role }).role ?? "CUSTOMER";
        token.id = user.id;
      } else if (token.id && !token.role) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true },
        });
        token.role = dbUser?.role ?? "CUSTOMER";
      }
      return token;
    },
    session: ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
});
