import { db } from "@/lib/db";
import { feedback } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface CreateFeedbackInput {
  userId?: string;
  email: string;
  resultContext?: Record<string, any>;
  note?: string;
}

export interface FeedbackRecord {
  id: string;
  userId?: string;
  email: string;
  resultContext?: Record<string, any>;
  note?: string;
  createdAt: Date;
}

/**
 * Create a new feedback record
 */
export async function createFeedback(
  input: CreateFeedbackInput
): Promise<FeedbackRecord> {
  const feedbackRecord: typeof feedback.$inferInsert = {
    id: randomUUID(),
    userId: input.userId,
    email: input.email,
    resultContext: input.resultContext,
    note: input.note,
    createdAt: new Date(),
  };

  const result = await db.insert(feedback).values(feedbackRecord).returning();
  return result[0] as FeedbackRecord;
}

/**
 * Get all feedback records (for admin review)
 */
export async function getAllFeedback(): Promise<FeedbackRecord[]> {
  const records = await db.select().from(feedback);
  return records as FeedbackRecord[];
}

/**
 * Get feedback records for a specific user
 */
export async function getFeedbackByUserId(userId: string): Promise<FeedbackRecord[]> {
  const records = await db
    .select()
    .from(feedback)
    .where(eq(feedback.userId, userId));
  return records as FeedbackRecord[];
}

/**
 * Get feedback records for a specific email
 */
export async function getFeedbackByEmail(email: string): Promise<FeedbackRecord[]> {
  const records = await db
    .select()
    .from(feedback)
    .where(eq(feedback.email, email.toLowerCase().trim()));
  return records as FeedbackRecord[];
}
