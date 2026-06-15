jest.mock("@/app/auth", () => ({
  GET: jest.fn(),
  POST: jest.fn(),
}));

import { GET, POST } from "@/app/api/auth/[...nextauth]/route";
import * as authModule from "@/app/auth";

describe("/api/auth/[...nextauth] route wiring", () => {
  it("re-exports GET and POST from app/auth", () => {
    expect(GET).toBe(authModule.GET);
    expect(POST).toBe(authModule.POST);
  });
});