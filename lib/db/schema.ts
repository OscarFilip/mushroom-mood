import { pgTable, text, timestamp, integer, json, primaryKey } from "drizzle-orm/pg-core";
import { InferSelectModel } from "drizzle-orm";

/**
 * Auth.js required tables for Drizzle adapter
 */

export const accounts = pgTable("accounts", {
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("providerAccountId").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
}, (table) => ({
  pk: primaryKey({ columns: [table.provider, table.providerAccountId] }),
}));

export const sessions = pgTable("sessions", {
  sessionToken: text("sessionToken").notNull().primaryKey(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const users = pgTable("users", {
  id: text("id").notNull().primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});

export const verificationTokens = pgTable("verificationTokens", {
  email: text("email").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.email, table.token] }),
}));

/**
 * Beta feedback table for storing feedback from beta testers
 */

export const feedback = pgTable("feedback", {
  id: text("id").notNull().primaryKey(),
  userId: text("userId").references(() => users.id, { onDelete: "set null" }),
  email: text("email").notNull(),
  resultContext: json("resultContext"),
  note: text("note"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull(),
});

// TypeScript types for each table
export type Account = InferSelectModel<typeof accounts>;
export type Session = InferSelectModel<typeof sessions>;
export type User = InferSelectModel<typeof users>;
export type VerificationToken = InferSelectModel<typeof verificationTokens>;
export type Feedback = InferSelectModel<typeof feedback>;
