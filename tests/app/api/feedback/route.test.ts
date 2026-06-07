jest.mock("next-auth", () => ({
  default: jest.fn(),
  getServerSession: jest.fn(),
}));

jest.mock("@/app/auth", () => ({
  authOptions: {},
}));

jest.mock("@/lib/auth/allowlist", () => ({
  isBetaAllowed: jest.fn().mockReturnValue(true),
  isAdmin: jest.fn().mockReturnValue(false),
  normalizeEmail: jest.fn((e: string) => e.toLowerCase().trim()),
}));

jest.mock("@/lib/repositories/feedbackRepository", () => ({
  createFeedback: jest.fn(),
  getAllFeedback: jest.fn(),
}));

import { GET, POST } from "@/app/api/feedback/route";
import { getServerSession } from "next-auth";
import { isBetaAllowed, isAdmin } from "@/lib/auth/allowlist";
import { createFeedback, getAllFeedback } from "@/lib/repositories/feedbackRepository";

const mockGetServerSession = getServerSession as jest.Mock;
const mockIsBetaAllowed = isBetaAllowed as jest.Mock;
const mockIsAdmin = isAdmin as jest.Mock;
const mockCreateFeedback = createFeedback as jest.Mock;
const mockGetAllFeedback = getAllFeedback as jest.Mock;

const AUTHED_SESSION = { user: { id: "user-1", email: "beta@example.com" } };
const ADMIN_SESSION = { user: { id: "admin-1", email: "admin@example.com" } };

describe("POST /api/feedback", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetServerSession.mockResolvedValue(AUTHED_SESSION);
    mockIsBetaAllowed.mockReturnValue(true);
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetServerSession.mockResolvedValue(null);
    const req = new Request("http://localhost/api/feedback", {
      method: "POST",
      body: JSON.stringify({ resultContext: { species: "boletus-edulis" } }),
    });
    const res = await POST(req as any);
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Unauthorized" });
  });

  it("returns 403 when authenticated but not on beta allowlist", async () => {
    mockIsBetaAllowed.mockReturnValue(false);
    const req = new Request("http://localhost/api/feedback", {
      method: "POST",
      body: JSON.stringify({ resultContext: { species: "boletus-edulis" } }),
    });
    const res = await POST(req as any);
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: "Forbidden" });
  });

  it("returns 400 when neither resultContext nor note is provided", async () => {
    const req = new Request("http://localhost/api/feedback", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it("returns 201 and creates feedback when beta user submits valid body", async () => {
    const mockRecord = { id: "f-1", email: "beta@example.com", resultContext: { species: "boletus-edulis" }, createdAt: new Date().toISOString() };
    mockCreateFeedback.mockResolvedValue(mockRecord);
    const req = new Request("http://localhost/api/feedback", {
      method: "POST",
      body: JSON.stringify({ resultContext: { species: "boletus-edulis" } }),
    });
    const res = await POST(req as any);
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual(mockRecord);
    expect(mockCreateFeedback).toHaveBeenCalledWith(
      expect.objectContaining({ email: "beta@example.com", resultContext: { species: "boletus-edulis" } })
    );
  });
});

describe("GET /api/feedback", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetServerSession.mockResolvedValue(ADMIN_SESSION);
    mockIsAdmin.mockReturnValue(false);
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetServerSession.mockResolvedValue(null);
    const req = new Request("http://localhost/api/feedback");
    const res = await GET(req as any);
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Unauthorized" });
  });

  it("returns 403 when authenticated but not admin (beta tester only)", async () => {
    mockGetServerSession.mockResolvedValue(AUTHED_SESSION);
    mockIsAdmin.mockReturnValue(false);
    const req = new Request("http://localhost/api/feedback");
    const res = await GET(req as any);
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: "Forbidden" });
  });

  it("returns 200 with all feedback records when admin user requests", async () => {
    mockIsAdmin.mockReturnValue(true);
    const mockRecords = [
      { id: "f-1", email: "beta@example.com", resultContext: { species: "boletus-edulis" }, createdAt: new Date().toISOString() },
    ];
    mockGetAllFeedback.mockResolvedValue(mockRecords);
    const req = new Request("http://localhost/api/feedback");
    const res = await GET(req as any);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(mockRecords);
    expect(mockGetAllFeedback).toHaveBeenCalled();
  });

  it("beta-tester-in-BETA_ALLOWED but not in BETA_ADMIN gets 403", async () => {
    // Ensures beta access does NOT imply admin access
    mockGetServerSession.mockResolvedValue(AUTHED_SESSION);
    mockIsAdmin.mockReturnValue(false);
    const req = new Request("http://localhost/api/feedback");
    const res = await GET(req as any);
    expect(res.status).toBe(403);
  });
});
