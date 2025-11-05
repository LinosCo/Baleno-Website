/**
 * Safe fetch wrapper that handles errors and validates array responses
 */
export async function safeFetch<T = any>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Safe fetch that ensures the response is an array
 */
export async function safeFetchArray<T = any>(
  url: string,
  options?: RequestInit
): Promise<T[]> {
  const data = await safeFetch(url, options);
  return Array.isArray(data) ? data : [];
}

/**
 * Safe fetch with token authentication
 */
export async function authenticatedFetch<T = any>(
  url: string,
  token?: string | null,
  options?: RequestInit
): Promise<T> {
  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null);

  return safeFetch<T>(url, {
    ...options,
    headers: {
      ...options?.headers,
      'Authorization': authToken ? `Bearer ${authToken}` : '',
    },
  });
}

/**
 * Safe fetch array with token authentication
 */
export async function authenticatedFetchArray<T = any>(
  url: string,
  token?: string | null,
  options?: RequestInit
): Promise<T[]> {
  const data = await authenticatedFetch(url, token, options);
  return Array.isArray(data) ? data : [];
}
