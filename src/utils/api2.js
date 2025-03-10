export const FEVER_API_ENDPOINT = 'https://bazqux.com';

/**
 * @typedef {Object} ApiOptions
 * @property {string} [method] - HTTP method (default: 'GET')
 * @property {Object} [body] - Request body
 * @property {Object} [queryParams] - Query parameters to append to URL
 * @property {boolean} [needsAuth] - Whether to include auth token (default: true)
 * @property {Object} [headers] - Additional headers
 */

/**
 * Unified API fetch function with error handling
 * @param {string} path - API path (without base URL)
 * @param {ApiOptions} [options] - Request options
 * @returns {Promise<any>} Response data
 * @throws {Error} API error with status and message
 */
export async function apiFetch(path, options = {}) {
  const {
    method = 'GET',
    body,
    queryParams = {},
    needsAuth = true,
    headers: extraHeaders = {},
  } = options;

  // Always include output=json in query params for this API
  const finalQueryParams = { output: 'json', ...queryParams };
  const queryString = new URLSearchParams(finalQueryParams).toString();
  const url = `${FEVER_API_ENDPOINT}${path}${queryString ? '?' + queryString : ''}`;

  const headers = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };

  if (needsAuth) {
    const { getToken } = await import('./token');
    const token = getToken();
    if (!token) {
      throw new Error('Authentication token not found');
    }
    headers.Authorization = `GoogleLogin auth=${token}`;
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('Content-Type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return data;
    }
    // For non-JSON responses, return the text response
    const text = await response.text();
    return text;
  } catch (error) {
    console.error(`API request failed for ${path}:`, error);
    throw error;
  }
}
