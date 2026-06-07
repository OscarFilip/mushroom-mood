import { logStartupEnvSummaryOnce } from "@/lib/utils/startupDiagnostics";

export async function register(): Promise<void> {
  logStartupEnvSummaryOnce("instrumentation");
}