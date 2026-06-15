import { getServerSession } from "next-auth";
import { authOptions } from "@/app/auth";
import { isBetaAllowed, isAdmin } from "./allowlist";
import { redirect } from "next/navigation";

/**
 * Guard for protecting pages - ensures user is authenticated and beta-approved
 */
export async function requireBetaAuth() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  const userEmail = session.user?.email;
  if (!userEmail || !isBetaAllowed(userEmail)) {
    redirect("/denied");
  }

  return session;
}

/**
 * Guard for protecting API routes - ensures user is authenticated and beta-approved
 */
export async function requireBetaAuthApi() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return { error: "Unauthorized", status: 401 };
  }

  const userEmail = session.user?.email;
  if (!userEmail || !isBetaAllowed(userEmail)) {
    return { error: "Forbidden", status: 403 };
  }

  return { session };
}

/**
 * Guard for protecting admin/restricted API routes - uses BETA_ADMIN_EMAILS separately from beta entry
 */
export async function requireAdminApi() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return { error: "Unauthorized", status: 401 };
  }

  const userEmail = session.user?.email;
  if (!userEmail || !isAdmin(userEmail)) {
    return { error: "Forbidden", status: 403 };
  }

  return { session };
}
