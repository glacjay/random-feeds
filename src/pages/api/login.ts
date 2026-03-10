import type { APIRoute } from 'astro';
import qs from 'qs';
import { FEVER_API_ENDPOINT } from '@/lib/api';
import { setToken } from '@/lib/auth';

function parseClientLoginResult(result: unknown): string | undefined {
  if (typeof result === 'string') {
    const parsed: Record<string, string> = {};
    result
      .split('\n')
      .filter((line) => line)
      .forEach((line) => {
        const idx = line.indexOf('=');
        if (idx > 0) {
          parsed[line.slice(0, idx)] = line.slice(idx + 1);
        }
      });

    return parsed.Auth;
  }

  if (typeof result === 'object' && result !== null && 'Auth' in result) {
    const auth = (result as { Auth?: unknown }).Auth;
    return typeof auth === 'string' ? auth : undefined;
  }

  return undefined;
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

async function requestClientLogin(username: string, password: string): Promise<string> {
  const body = qs.stringify({
    Email: username,
    Passwd: password,
  });

  const maxAttempts = 3;

  let lastError: unknown;
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(`${FEVER_API_ENDPOINT}/accounts/ClientLogin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
      });
      return await response.text();
    } catch (error) {
      lastError = error;

      if (!isRetryableNetworkError(error) || i === maxAttempts - 1) {
        throw error;
      }

      await sleep((i + 1) * 250);
    }
  }

  throw lastError;
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const { username, password } = await request.json();

  if (!username || !password) {
    return new Response('Username and password are required', { status: 400 });
  }

  try {
    const loginResponseText = await requestClientLogin(username, password);
    const authData = loginResponseText;

    const authToken = parseClientLoginResult(authData);

    if (!authToken) {
      return new Response('Authentication failed. Check username or password.', { status: 401 });
    }

    setToken(cookies, authToken);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Login API error:', error);
    const networkCode = getNetworkErrorCode(error);
    const message = networkCode
      ? `Network error (${networkCode}) while connecting to bazqux.com. Please retry.`
      : (error instanceof Error ? error.message : 'An internal server error occurred.');
    return new Response(message, { status: 500 });
  }
};
