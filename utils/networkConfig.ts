/**
 * @fileoverview Network configuration and API URL management
 * @description Handles API URL detection and caching for network requests
 * Uses Azure production URL as primary endpoint with environment variable override support
 * @version 1.0.0
 */

// Cache: Store the found URL to avoid re-initialization
let cachedApiUrl: string | null = null;
let lastDetectionTime: number = 0;
const CACHE_DURATION_MS = 10 * 1000; // 10 second cache duration (for testing)

/**
 * Gets the API URL - uses Azure production URL by default
 * 
 * Strategy:
 * 1. If explicit environment variable is set (non-empty), use it
 * 2. If cached URL is available and fresh, use it
 * 3. Use Azure production URL (no local network detection)
 * 
 * @async
 * @function getApiUrl
 * @returns {Promise<string>} The API URL endpoint
 */
export async function getApiUrl(): Promise<string> {
  // If cached URL exists and is still valid, use it
  const now = Date.now();
  if (cachedApiUrl && (now - lastDetectionTime) < CACHE_DURATION_MS) {
    console.log('[NetworkConfig] Using cached URL:', cachedApiUrl);
    return cachedApiUrl;
  }

  // If explicit non-empty URL is set in environment, use it
  const explicitUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (explicitUrl && !explicitUrl.includes('localhost')) {
    console.log('[NetworkConfig] Using explicit environment URL:', explicitUrl);
    cachedApiUrl = explicitUrl;
    lastDetectionTime = now;
    return explicitUrl;
  }

  // Use Azure production URL (instant, no waiting for IP detection)
  console.log('[NetworkConfig] Using Azure production URL');
  const azureUrl = 'https://clippdservice-g5fce7cyhshmd9as.eastus2-01.azurewebsites.net';
  cachedApiUrl = azureUrl;
  lastDetectionTime = now;
  return azureUrl;
}
