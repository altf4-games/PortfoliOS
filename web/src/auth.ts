import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

// Single-user site: only this GitHub login may ever get an authenticated session.
// Everyone else who signs in with GitHub is rejected at the signIn callback below.
const ALLOWED_LOGIN = process.env.ALLOWED_GITHUB_LOGIN;

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    async signIn({ profile }) {
      if (!ALLOWED_LOGIN) return false;
      return profile?.login === ALLOWED_LOGIN;
    },
    async jwt({ token, profile }) {
      if (profile?.login) token.login = profile.login as string;
      return token;
    },
    async session({ session, token }) {
      if (token.login) session.user.login = token.login as string;
      return session;
    },
  },
});
