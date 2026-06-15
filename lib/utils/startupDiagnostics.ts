import { isVerboseLoggingEnabled, logInfo } from "@/lib/utils/observability";

type GlobalStartupDiagnostics = {
  startupEnvSummaryLogged?: boolean;
};

const globalForStartupDiagnostics = global as unknown as GlobalStartupDiagnostics;

export function logStartupEnvSummaryOnce(source: string): void {
  if (globalForStartupDiagnostics.startupEnvSummaryLogged) {
    return;
  }

  globalForStartupDiagnostics.startupEnvSummaryLogged = true;

  logInfo("[startup] env summary", {
    source,
    nodeEnv: process.env.NODE_ENV,
    authSecretConfigured: Boolean(process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET),
    nextAuthSecretPresent: Boolean(process.env.NEXTAUTH_SECRET),
    authSecretPresent: Boolean(process.env.AUTH_SECRET),
    authUrl: summarizePublicUrl(process.env.AUTH_URL || process.env.NEXTAUTH_URL),
    databaseUrl: summarizeConnectionUrl(process.env.DATABASE_URL),
    resendApiKeyPresent: Boolean(process.env.RESEND_API_KEY),
    emailFromDomain: summarizeEmailDomain(process.env.EMAIL_FROM),
    betaAllowedEmailsCount: countCommaSeparatedItems(process.env.BETA_ALLOWED_EMAILS),
    betaAdminEmailsCount: countCommaSeparatedItems(process.env.BETA_ADMIN_EMAILS),
    artDatabankenApiKeyPresent: Boolean(process.env.ARTDATABANKEN_API_KEY),
    verboseLoggingEnabled: isVerboseLoggingEnabled(),
  });
}

function countCommaSeparatedItems(value: string | undefined): number {
  if (!value) {
    return 0;
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0).length;
}

function summarizeEmailDomain(emailFrom: string | undefined): string | null {
  if (!emailFrom) {
    return null;
  }

  const match = emailFrom.match(/<([^>]+)>/);
  const email = (match?.[1] || emailFrom).trim();
  const atIndex = email.lastIndexOf("@");

  if (atIndex === -1 || atIndex === email.length - 1) {
    return null;
  }

  return email.slice(atIndex + 1).toLowerCase();
}

function summarizePublicUrl(rawUrl: string | undefined): Record<string, string | number | boolean | null> {
  if (!rawUrl) {
    return {
      present: false,
      protocol: null,
      hostKind: null,
      port: null,
      pathname: null,
      hasSearch: false,
    };
  }

  try {
    const url = new URL(rawUrl);

    return {
      present: true,
      protocol: url.protocol.replace(":", ""),
      hostKind: classifyHost(url.hostname),
      port: url.port || null,
      pathname: url.pathname || null,
      hasSearch: url.search.length > 0,
    };
  } catch {
    return {
      present: true,
      protocol: "unparsed",
      hostKind: null,
      port: null,
      pathname: null,
      hasSearch: false,
    };
  }
}

function summarizeConnectionUrl(rawUrl: string | undefined): Record<string, string | number | boolean | null> {
  if (!rawUrl) {
    return {
      present: false,
      protocol: null,
      hostKind: null,
      portPresent: false,
      pathnamePresent: false,
      hasSearch: false,
      hasCredentials: false,
    };
  }

  try {
    const url = new URL(rawUrl);

    return {
      present: true,
      protocol: url.protocol.replace(":", ""),
      hostKind: classifyHost(url.hostname),
      portPresent: url.port.length > 0,
      pathnamePresent: url.pathname.length > 1,
      hasSearch: url.search.length > 0,
      hasCredentials: url.username.length > 0 || url.password.length > 0,
    };
  } catch {
    return {
      present: true,
      protocol: "unparsed",
      hostKind: null,
      portPresent: null,
      pathnamePresent: null,
      hasSearch: false,
      hasCredentials: null,
    };
  }
}

function classifyHost(hostname: string): string {
  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") {
    return "local";
  }

  if (hostname.endsWith(".internal")) {
    return "internal";
  }

  return "remote";
}