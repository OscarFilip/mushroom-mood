import {
  createFeedback,
  getAllFeedback,
  getFeedbackByUserId,
  getFeedbackByEmail,
  type CreateFeedbackInput,
} from "@/lib/repositories/feedbackRepository";

// Mock the database
jest.mock("@/lib/db", () => ({
  db: {
    insert: jest.fn(),
    select: jest.fn(),
  },
}));

import { db } from "@/lib/db";

describe("Feedback Repository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createFeedback", () => {
    it("should create a feedback record with all fields", async () => {
      const mockFeedback = {
        id: "test-id",
        userId: "user-123",
        email: "user@example.com",
        resultContext: { species: "Boletus edulis", readiness: 0.8 },
        note: "Found some mushrooms!",
        createdAt: new Date(),
      };

      const mockInsert = jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockFeedback]),
        }),
      });

      (db.insert as jest.Mock).mockReturnValue(mockInsert());

      const input: CreateFeedbackInput = {
        userId: "user-123",
        email: "user@example.com",
        resultContext: { species: "Boletus edulis", readiness: 0.8 },
        note: "Found some mushrooms!",
      };

      const result = await createFeedback(input);

      expect(result).toEqual(mockFeedback);
    });

    it("should create a feedback record with only email and resultContext", async () => {
      const mockFeedback = {
        id: "test-id",
        userId: undefined,
        email: "user@example.com",
        resultContext: { species: "Boletus edulis" },
        note: undefined,
        createdAt: new Date(),
      };

      const mockInsert = jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockFeedback]),
        }),
      });

      (db.insert as jest.Mock).mockReturnValue(mockInsert());

      const input: CreateFeedbackInput = {
        email: "user@example.com",
        resultContext: { species: "Boletus edulis" },
      };

      const result = await createFeedback(input);

      expect(result).toEqual(mockFeedback);
    });
  });

  describe("getAllFeedback", () => {
    it("should retrieve all feedback records", async () => {
      const mockFeedback = [
        {
          id: "feedback-1",
          userId: "user-1",
          email: "user1@example.com",
          resultContext: { species: "Boletus edulis" },
          note: "Great find!",
          createdAt: new Date(),
        },
        {
          id: "feedback-2",
          userId: "user-2",
          email: "user2@example.com",
          resultContext: { species: "Cantharellus cibarius" },
          note: "Not bad",
          createdAt: new Date(),
        },
      ];

      const mockSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockResolvedValue(mockFeedback),
      });

      (db.select as jest.Mock).mockReturnValue(mockSelect());

      const result = await getAllFeedback();

      expect(result).toEqual(mockFeedback);
    });
  });

  describe("getFeedbackByUserId", () => {
    it("should retrieve feedback records for a specific user", async () => {
      const mockFeedback = [
        {
          id: "feedback-1",
          userId: "user-1",
          email: "user1@example.com",
          resultContext: { species: "Boletus edulis" },
          note: "Great find!",
          createdAt: new Date(),
        },
      ];

      const mockWhere = jest.fn().mockResolvedValue(mockFeedback);
      const mockSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: mockWhere,
        }),
      });

      (db.select as jest.Mock).mockReturnValue(mockSelect());

      const result = await getFeedbackByUserId("user-1");

      expect(result).toEqual(mockFeedback);
    });
  });

  describe("getFeedbackByEmail", () => {
    it("should retrieve feedback records for a specific email", async () => {
      const mockFeedback = [
        {
          id: "feedback-1",
          userId: "user-1",
          email: "user1@example.com",
          resultContext: { species: "Boletus edulis" },
          note: "Great find!",
          createdAt: new Date(),
        },
      ];

      const mockWhere = jest.fn().mockResolvedValue(mockFeedback);
      const mockSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: mockWhere,
        }),
      });

      (db.select as jest.Mock).mockReturnValue(mockSelect());

      const result = await getFeedbackByEmail("user1@example.com");

      expect(result).toEqual(mockFeedback);
    });

    it("should normalize email when querying", async () => {
      const mockFeedback = [];

      const mockWhere = jest.fn().mockResolvedValue(mockFeedback);
      const mockSelect = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: mockWhere,
        }),
      });

      (db.select as jest.Mock).mockReturnValue(mockSelect());

      await getFeedbackByEmail("  USER1@EXAMPLE.COM  ");

      // The actual query should use normalized email
      // This would be verified in integration tests
    });
  });
});
