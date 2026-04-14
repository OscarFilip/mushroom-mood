export interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
  responseType?: 'json' | 'text';
}

export class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>

  constructor(baseURL: string, defaultHeaders: Record<string, string> = {}) {
    this.baseURL = baseURL;
    this.defaultHeaders = defaultHeaders;
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

    try {
      const response: Response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Handle different response types
      if (responseType === 'text') {
        return await response.text() as T;
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
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
}