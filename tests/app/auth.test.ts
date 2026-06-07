jest.mock("next-auth", () => ({
  __esModule: true,
  default: jest.fn(() => ({ GET: jest.fn(), POST: jest.fn() })),
}));

jest.mock("next-auth/providers/email", () => ({
  __esModule: true,
  default: jest.fn(() => ({ id: "email", type: "email" })),
}));

jest.mock("@auth/drizzle-adapter", () => ({
  DrizzleAdapter: jest.fn(() => ({})),
}));

jest.mock("@/lib/db", () => ({
  db: {},
}));

import { getTableColumns, getTableName } from "drizzle-orm";

describe("auth adapter wiring", () => {
  it("passes the repository auth tables to DrizzleAdapter", () => {
    jest.isolateModules(() => {
      require("@/app/auth");

      const { DrizzleAdapter } = require("@auth/drizzle-adapter");
      const mockDrizzleAdapter = DrizzleAdapter as jest.Mock;

      expect(mockDrizzleAdapter).toHaveBeenCalledTimes(1);

      const [, adapterSchema] = mockDrizzleAdapter.mock.calls[0];
      expect(getTableName(adapterSchema.usersTable)).toBe("users");
      expect(getTableName(adapterSchema.accountsTable)).toBe("accounts");
      expect(getTableName(adapterSchema.sessionsTable)).toBe("sessions");
      expect(getTableName(adapterSchema.verificationTokensTable)).toBe("verificationTokens");

      const userColumns = getTableColumns(adapterSchema.usersTable);
      expect(userColumns.id.hasDefault).toBe(true);

      const verificationTokenColumns = getTableColumns(adapterSchema.verificationTokensTable);
      expect(verificationTokenColumns.identifier.name).toBe("email");
      expect(verificationTokenColumns.token.name).toBe("token");
    });
  });
});