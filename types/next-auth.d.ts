import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      isImpersonating?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
    isImpersonating?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    isImpersonating?: boolean;
  }
}
