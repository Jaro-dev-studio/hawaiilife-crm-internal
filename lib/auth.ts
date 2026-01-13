import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    // Admin impersonation provider
    Credentials({
      id: "admin-impersonate",
      name: "Admin Impersonate",
      credentials: {
        userId: { label: "User ID", type: "text" },
        adminPassword: { label: "Admin Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("[Auth] Admin impersonation attempt...");
        
        const adminPass = process.env.ADMIN_PASS;
        if (!adminPass || credentials?.adminPassword !== adminPass) {
          console.log("[Auth] Invalid admin password");
          return null;
        }

        const userId = credentials?.userId as string;
        if (!userId) {
          console.log("[Auth] No user ID provided");
          return null;
        }

        // Find the user to impersonate
        const user = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          console.log("[Auth] User not found:", userId);
          return null;
        }

        // Cannot impersonate admin users
        if (user.role === "admin") {
          console.log("[Auth] Cannot impersonate admin users");
          return null;
        }

        console.log("[Auth] Impersonation successful for user:", user.email);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          isImpersonating: true,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        // On sign in, add user data to token
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "user";
        token.isImpersonating = (user as { isImpersonating?: boolean }).isImpersonating ?? false;
      }

      // If session update is triggered, refresh user data from DB
      if (trigger === "update") {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.name = dbUser.name;
          token.email = dbUser.email;
          token.picture = dbUser.image;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.isImpersonating = token.isImpersonating as boolean;
      }
      return session;
    },
    async signIn({ user, account }) {
      // For OAuth providers, ensure user has a role
      if (account?.provider !== "admin-impersonate") {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
        });
        if (dbUser && !dbUser.role) {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: "user" },
          });
        }
      }
      return true;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  events: {
    async createUser({ user }) {
      console.log("[Auth] New user created:", user.email);
    },
  },
});

// Helper function to check if user is admin
export async function isAdmin() {
  const session = await auth();
  return session?.user?.role === "admin";
}

// Helper function to get current user
export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;

  return prisma.user.findUnique({
    where: { id: session.user.id },
  });
}
