import { ApiClient } from '@/lib/repositories/apiClient';

describe('ApiClient', () => {
  beforeEach(() => {
    global.fetch = jest.fn() as jest.Mock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('merges default headers and request headers for JSON requests', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
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
    });

    const client = new ApiClient('https://example.test');

    await expect(client.get('/weather')).rejects.toThrow('HTTP 503: Service Unavailable');
  });

  it('serializes JSON bodies for post requests', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
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
});
