import { isVerboseLoggingEnabled, logExternalApiEvent, previewResponseBody } from '../utils/observability';

export interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
  responseType?: 'json' | 'text';
}

const RETRYABLE_NETWORK_ERROR_CODES = new Set([
  'UND_ERR_CONNECT_TIMEOUT',
  'UND_ERR_HEADERS_TIMEOUT',
  'UND_ERR_SOCKET',
]);

export class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>
  private sourceName: string;

  constructor(baseURL: string, defaultHeaders: Record<string, string> = {}, sourceName?: string) {
    this.baseURL = baseURL;
    this.defaultHeaders = defaultHeaders;
    this.sourceName = sourceName ?? new URL(baseURL).hostname;
  }

  async request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { headers = {}, responseType = 'json', ...requestOptions } = options;
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      ...requestOptions,
      headers: {
        'Content-Type': 'application/json',
        ...this.defaultHeaders,
        ...headers,
      },
    };

    const method = (config.method ?? 'GET').toUpperCase();
    const maxAttempts = this.shouldRetryMethod(method) ? 3 : 1;
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        logExternalApiEvent(this.sourceName, 'request', {
          url,
          method,
          attempt,
          maxAttempts,
          responseType,
        });

        const response: Response = await fetch(url, config);
        const responsePreview = isVerboseLoggingEnabled()
          ? await this.tryPreviewResponse(response)
          : null;
        
        if (!response.ok) {
          logExternalApiEvent(this.sourceName, 'error', {
            url,
            method,
            attempt,
            status: response.status,
            statusText: response.statusText,
            responsePreview,
          });
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        logExternalApiEvent(this.sourceName, 'response', {
          url,
          method,
          attempt,
          status: response.status,
          statusText: response.statusText,
          responseType,
          responsePreview,
        });
        
        if (responseType === 'text') {
          return await response.text() as T;
        }
        
        return await response.json();
      } catch (error) {
        lastError = error;

        if (!this.shouldRetryRequest(error, attempt, maxAttempts)) {
          logExternalApiEvent(this.sourceName, 'error', {
            url,
            method,
            attempt,
            maxAttempts,
            error: this.stringifyError(error),
          });
          throw error;
        }
      }
    }

    logExternalApiEvent(this.sourceName, 'error', {
      url,
      method,
      maxAttempts,
      error: this.stringifyError(lastError),
    });
    throw lastError;
  }

  private shouldRetryMethod(method: string): boolean {
    return method === 'GET' || method === 'HEAD';
  }

  private shouldRetryRequest(error: unknown, attempt: number, maxAttempts: number): boolean {
    if (attempt >= maxAttempts) {
      return false;
    }

    const errorCode = this.getRetryableErrorCode(error);
    return errorCode !== null && RETRYABLE_NETWORK_ERROR_CODES.has(errorCode);
  }

  private getRetryableErrorCode(error: unknown): string | null {
    if (!error || typeof error !== 'object') {
      return null;
    }

    const cause = 'cause' in error ? error.cause : null;
    if (!cause || typeof cause !== 'object') {
      return null;
    }

    const code = 'code' in cause ? cause.code : null;
    return typeof code === 'string' ? code : null;
  }

  get<T = any>(endpoint: string, headers: Record<string, string> = {}): Promise<T> {
    return this.request(endpoint, { method: 'GET', headers });
  }

  getText(endpoint: string, headers: Record<string, string> = {}): Promise<string> {
    return this.request<string>(endpoint, { 
      method: 'GET', 
      headers,
      responseType: 'text' 
    });
  }

  post<T = any>(endpoint: string, data: any, headers: Record<string, string> = {}): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      headers,
    });
  }

  private async tryPreviewResponse(response: Response): Promise<Record<string, unknown> | null> {
    if (typeof response.clone !== 'function') {
      return null;
    }

    try {
      const bodyText = await response.clone().text();
      return previewResponseBody(bodyText);
    } catch (error) {
      return {
        previewError: this.stringifyError(error),
      };
    }
  }

  private stringifyError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return String(error);
  }
}