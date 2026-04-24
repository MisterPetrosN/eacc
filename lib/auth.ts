import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// Admin email whitelist from environment
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(",").map(e => e.trim().toLowerCase()) ?? [];

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      isAdmin: boolean;
    };
  }
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user }) {
      // Only allow whitelisted admin emails
      const email = user.email?.toLowerCase();
      if (!email) return false;
      return ADMIN_EMAILS.includes(email);
    },
    async session({ session }) {
      // Add isAdmin flag to session
      const email = session.user?.email?.toLowerCase();
      session.user.isAdmin = email ? ADMIN_EMAILS.includes(email) : false;
      return session;
    },
    async redirect({ url, baseUrl }) {
      // After sign in, redirect to admin
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return `${baseUrl}/admin`;
    },
  },
  session: {
    strategy: "jwt",
  },
  trustHost: true,
});

// Helper to check if user is admin
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
