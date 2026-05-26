import { ApiClient } from '@/lib/repositories/apiClient';

describe('ApiClient', () => {
  let infoSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    delete process.env.MUSHROOM_MOOD_LOG_LEVEL;
    delete process.env.ENABLE_VERBOSE_API_LOGGING;
    global.fetch = jest.fn() as jest.Mock;
    infoSpy = jest.spyOn(console, 'info').mockImplementation(() => undefined);
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
    infoSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('merges default headers and request headers for JSON requests', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      clone: jest.fn().mockReturnValue({
        text: jest.fn().mockResolvedValue('{"ok":true}'),
      }),
      json: jest.fn().mockResolvedValue({ ok: true }),
    });

    const client = new ApiClient('https://example.test', {
      Authorization: 'Bearer token',
    });

    const result = await client.request('/weather', {
      method: 'GET',
      headers: {
        'X-Request-Id': 'req-1',
      },
    });

    expect(global.fetch).toHaveBeenCalledWith('https://example.test/weather', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer token',
        'X-Request-Id': 'req-1',
      },
    });
    expect(result).toEqual({ ok: true });
  });

  it('returns text when the response type is text', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      clone: jest.fn().mockReturnValue({
        text: jest.fn().mockResolvedValue('plain response'),
      }),
      text: jest.fn().mockResolvedValue('plain response'),
    });

    const client = new ApiClient('https://example.test');
    const result = await client.getText('/export.csv', { Accept: 'text/csv' });

    expect(global.fetch).toHaveBeenCalledWith('https://example.test/export.csv', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/csv',
      },
    });
    expect(result).toBe('plain response');
  });

  it('throws a descriptive error when the response is not ok', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
      clone: jest.fn().mockReturnValue({
        text: jest.fn().mockResolvedValue('{"error":"outage"}'),
      }),
    });

    const client = new ApiClient('https://example.test');

    await expect(client.get('/weather')).rejects.toThrow('HTTP 503: Service Unavailable');
  });

  it('retries transient GET network failures before succeeding', async () => {
    const timeoutError = Object.assign(new TypeError('fetch failed'), {
      cause: { code: 'UND_ERR_CONNECT_TIMEOUT' },
    });

    (global.fetch as jest.Mock)
      .mockRejectedValueOnce(timeoutError)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        clone: jest.fn().mockReturnValue({
          text: jest.fn().mockResolvedValue('{"ok":true}'),
        }),
        json: jest.fn().mockResolvedValue({ ok: true }),
      });

    const client = new ApiClient('https://example.test');

    const result = await client.get('/weather');

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ ok: true });
  });

  it('does not retry non-idempotent requests after a transient network failure', async () => {
    const timeoutError = Object.assign(new TypeError('fetch failed'), {
      cause: { code: 'UND_ERR_CONNECT_TIMEOUT' },
    });

    (global.fetch as jest.Mock).mockRejectedValue(timeoutError);

    const client = new ApiClient('https://example.test');

    await expect(client.post('/settings', { enabled: true })).rejects.toThrow('fetch failed');
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('stops retrying GET requests after exhausting transient network attempts', async () => {
    const timeoutError = Object.assign(new TypeError('fetch failed'), {
      cause: { code: 'UND_ERR_CONNECT_TIMEOUT' },
    });

    (global.fetch as jest.Mock).mockRejectedValue(timeoutError);

    const client = new ApiClient('https://example.test');

    await expect(client.get('/weather')).rejects.toThrow('fetch failed');
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  it('serializes JSON bodies for post requests', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      clone: jest.fn().mockReturnValue({
        text: jest.fn().mockResolvedValue('{"created":true}'),
      }),
      json: jest.fn().mockResolvedValue({ created: true }),
    });

    const client = new ApiClient('https://example.test');
    const payload = { stationId: '123', enabled: true };

    const result = await client.post('/settings', payload, { 'X-Test': 'true' });

    expect(global.fetch).toHaveBeenCalledWith('https://example.test/settings', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
        'X-Test': 'true',
      },
    });
    expect(result).toEqual({ created: true });
  });

  it('does not log successful external request details by default', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      clone: jest.fn().mockReturnValue({
        text: jest.fn().mockResolvedValue('{"station":[{"key":"abc"}]}'),
      }),
      json: jest.fn().mockResolvedValue({ station: [{ key: 'abc' }] }),
    });

    const client = new ApiClient('https://example.test', {}, 'smhi');

    await client.get('/stations');

    expect(infoSpy).not.toHaveBeenCalled();
  });

  it('logs request and response previews for external calls in debug mode', async () => {
    process.env.MUSHROOM_MOOD_LOG_LEVEL = 'debug';

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      clone: jest.fn().mockReturnValue({
        text: jest.fn().mockResolvedValue('{"station":[{"key":"abc"}]}'),
      }),
      json: jest.fn().mockResolvedValue({ station: [{ key: 'abc' }] }),
    });

    const client = new ApiClient('https://example.test', {}, 'smhi');

    await client.get('/stations');

    expect(infoSpy).toHaveBeenCalledWith(
      '[external-api:smhi] request',
      expect.objectContaining({
        url: 'https://example.test/stations',
        method: 'GET',
        attempt: 1,
      }),
    );
    expect(infoSpy).toHaveBeenCalledWith(
      '[external-api:smhi] response',
      expect.objectContaining({
        url: 'https://example.test/stations',
        status: 200,
        responsePreview: expect.objectContaining({
          preview: '{"station":[{"key":"abc"}]}',
        }),
      }),
    );
  });
});
