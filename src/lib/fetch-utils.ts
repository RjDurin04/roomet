/**
 * Shared fetch utilities with timeout and resilience patterns.
 * SYS-001: All external fetch calls MUST use fetchWithTimeout.
 */

/** Default timeout for file upload requests (30s) */
export const UPLOAD_TIMEOUT_MS = 30_000;


/**
 * Fetch with an AbortController-based timeout.
 * Throws a descriptive error on timeout instead of hanging indefinitely.
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = UPLOAD_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Validates a fetch response for file upload.
 * Ensures the response is OK and contains a valid storageId.
 */
export async function parseUploadResponse(
  result: Response,
  fileName: string = 'file'
): Promise<string> {
  if (!result.ok) {
    throw new Error(`Upload failed for "${fileName}" (HTTP ${result.status})`);
  }

  let json: unknown;
  try {
    json = await result.json();
  } catch {
    throw new Error(`Upload response for "${fileName}" was not valid JSON`);
  }

  const storageId = (json as Record<string, unknown>)['storageId'];
  if (typeof storageId !== 'string') {
    throw new Error(`Upload response missing storageId for "${fileName}"`);
  }
  return storageId;
}
