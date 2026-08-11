import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isAdminRoute = pathname.startsWith("/admin");
      const isAccountRoute = pathname.startsWith("/account");
      const role = auth?.user?.role;

      if (isAdminRoute) return role === "ADMIN";
      if (isAccountRoute) return Boolean(auth?.user);
      return true;
    },
  },
};
