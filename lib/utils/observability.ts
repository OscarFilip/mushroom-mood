type LogValue = string | number | boolean | null | undefined | Record<string, unknown> | Array<unknown>;

const MAX_PREVIEW_LENGTH = 1200;
const MAX_SAMPLE_ITEMS = 3;
const DEBUG_LOG_VALUES = new Set(['1', 'true', 'debug', 'verbose', 'on']);

export function isVerboseLoggingEnabled(): boolean {
  const level = process.env.MUSHROOM_MOOD_LOG_LEVEL?.trim().toLowerCase();
  if (level && DEBUG_LOG_VALUES.has(level)) {
    return true;
  }

  const verboseFlag = process.env.ENABLE_VERBOSE_API_LOGGING?.trim().toLowerCase();
  return Boolean(verboseFlag && DEBUG_LOG_VALUES.has(verboseFlag));
}

export function logInfo(message: string, details: Record<string, LogValue>): void {
  console.info(message, sanitizeForLog(details));
}

export function logDebug(message: string, details: Record<string, LogValue>): void {
  if (!isVerboseLoggingEnabled()) {
    return;
  }

  console.info(message, sanitizeForLog(details));
}

export function logError(message: string, details: Record<string, LogValue>): void {
  console.error(message, sanitizeForLog(details));
}

export function logExternalApiEvent(
  source: string,
  stage: 'request' | 'response' | 'error',
  details: Record<string, LogValue>,
): void {
  const message = `[external-api:${source}] ${stage}`;

  if (stage === 'error') {
    logError(message, details);
    return;
  }

  logDebug(message, details);
}

export function summarizeMeasurements<T>(
  measurements: T[],
  formatter: (value: T) => Record<string, unknown>,
): { count: number; first: Array<Record<string, unknown>>; last: Array<Record<string, unknown>> } {
  return {
    count: measurements.length,
    first: measurements.slice(0, MAX_SAMPLE_ITEMS).map(formatter),
    last: measurements.slice(-MAX_SAMPLE_ITEMS).map(formatter),
  };
}

export function previewResponseBody(bodyText: string): { preview: string; length: number; truncated: boolean; lineCount: number } {
  const preview = bodyText.slice(0, MAX_PREVIEW_LENGTH);

  return {
    preview,
    length: bodyText.length,
    truncated: bodyText.length > MAX_PREVIEW_LENGTH,
    lineCount: bodyText === '' ? 0 : bodyText.split(/\r?\n/).length,
  };
}

function sanitizeForLog(value: LogValue): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeForLog(item as LogValue));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, sanitizeForLog(entry as LogValue)]),
    );
  }

  if (typeof value === 'string') {
    return value.length > MAX_PREVIEW_LENGTH
      ? `${value.slice(0, MAX_PREVIEW_LENGTH)}...[truncated ${value.length - MAX_PREVIEW_LENGTH} chars]`
      : value;
  }

  return value;
}