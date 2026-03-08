import { HttpsProxyAgent } from 'https-proxy-agent';

export const FEVER_API_ENDPOINT = 'https://bazqux.com';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: Record<string, any> | string;
  queryParams?: Record<string, string | string[]>;
  token?: string;
  headers?: Record<string, string>;
  forceText?: boolean;
}

interface RequestInitWithDispatcher extends RequestInit {
  dispatcher?: HttpsProxyAgent;
}

const RETRYABLE_NETWORK_CODES = new Set([
  'ECONNRESET',
  'ETIMEDOUT',
  'ECONNREFUSED',
  'EAI_AGAIN',
  'UND_ERR_CONNECT_TIMEOUT',
  'UND_ERR_SOCKET',
]);

function getNetworkErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') return undefined;

  const topLevelCode = (error as { code?: unknown }).code;
  if (typeof topLevelCode === 'string') return topLevelCode;

  const causeCode = (error as { cause?: { code?: unknown } }).cause?.code;
  return typeof causeCode === 'string' ? causeCode : undefined;
}

function isRetryableNetworkError(error: unknown): boolean {
  const code = getNetworkErrorCode(error);
  return !!code && RETRYABLE_NETWORK_CODES.has(code);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function apiFetch(path: string, options: ApiOptions = {}): Promise<any> {
  const {
    method = 'GET',
    body,
    queryParams = {},
    token,
    headers: extraHeaders = {},
  } = options;

  const finalQueryParams = { output: 'json', ...queryParams };
  
  // Handle array query params properly
  const urlParams = new URLSearchParams();
  for (const [key, value] of Object.entries(finalQueryParams)) {
    if (Array.isArray(value)) {
      for (const v of value) {
        urlParams.append(key, v);
      }
    } else {
      urlParams.append(key, String(value));
    }
  }
  const queryString = urlParams.toString();
  const url = `${FEVER_API_ENDPOINT}${path}${queryString ? `?${queryString}` : ''}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };

  if (token) {
    headers.Authorization = `GoogleLogin auth=${token}`;
  }

  const proxy = import.meta.env.PROXY;
  const agent = proxy ? new HttpsProxyAgent(proxy) : undefined;
  
  const fetchOptions: RequestInitWithDispatcher = {
      method,
      headers,
      body: typeof body === 'string' ? body : (body ? JSON.stringify(body) : undefined),
      dispatcher: agent,
  };

  const isGetRequest = method === 'GET';
  const dispatcherPlans: Array<HttpsProxyAgent | undefined> = (() => {
    if (agent && isGetRequest) return [agent, agent, undefined];
    if (agent) return [agent];
    if (isGetRequest) return [undefined, undefined, undefined];
    return [undefined];
  })();

  let lastError: unknown;
  for (let i = 0; i < dispatcherPlans.length; i++) {
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        dispatcher: dispatcherPlans[i],
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get('Content-Type');
      if (contentType?.includes('application/json')) {
        return await response.json();
      }
      return await response.text();
    } catch (error) {
      lastError = error;

      if (!isRetryableNetworkError(error) || i === dispatcherPlans.length - 1) {
        console.error(`API request failed for ${path}:`, error);
        throw error;
      }

      await sleep((i + 1) * 250);
    }
  }

  throw lastError;
}
