import NextAuth, { type NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import { accounts, sessions, users } from "@/lib/db/schema";
import { pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

const verificationTokensTable = pgTable("verificationTokens", {
  identifier: text("email").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.identifier, table.token] }),
}));

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable,
  }),
  providers: [
    EmailProvider({
      server: {
        host: "smtp.resend.com",
        port: 465,
        secure: true,
        auth: {
          user: "resend",
          pass: process.env.RESEND_API_KEY || "",
        },
      },
      from: process.env.EMAIL_FROM || "Mushroom Mood <noreply@example.com>",
      maxAge: 24 * 60 * 60, // 24 hours
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user && user?.id) {
        (session.user as any).id = user.id;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
};

export const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
