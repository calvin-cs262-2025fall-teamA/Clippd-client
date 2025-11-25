import * as Network from 'expo-network';
import { Platform } from 'react-native';

// 캐시: 한번 찾은 URL을 저장해서 매번 재감지하지 않음
let cachedApiUrl: string | null = null;
let lastDetectionTime: number = 0;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5분 캐시

/**
 * Dynamically determines the API URL based on device platform and network
 * 
 * Strategy:
 * 1. If explicit environment variable is set (non-empty), use it
 * 2. If cached URL is available and fresh, use it
 * 3. Try to auto-detect backend on local network (physical devices)
 * 4. Use platform-specific fallbacks (emulators/simulators)
 * 5. Fall back to Azure production URL
 */
export async function getApiUrl(): Promise<string> {
  // 캐시된 URL이 있고 유효하면 사용
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

  try {
    // Get the device's own IP address
    const deviceIP = await Network.getIpAddressAsync();
    console.log('[NetworkConfig] Device IP:', deviceIP, 'Platform:', Platform.OS);
    
    // For physical devices with real IP, try to find backend server
    if (deviceIP && deviceIP !== '127.0.0.1' && !deviceIP.startsWith('127.')) {
      // First, try common backend IPs on different networks
      // PC가 다른 서브넷에 있을 수 있으므로 다양한 IP 범위를 시도
      const commonBackendIPs = [
        'http://153.106.84.166:3000',   // PC (다른 서브넷)
        'http://153.106.84.1:3000',     // PC 네트워크 게이트웨이
        'http://153.106.84.100:3000',   // PC 네트워크 서버
      ];
      
      // Extract network prefix (e.g., "153.106.82" from "153.106.82.150")
      const parts = deviceIP.split('.');
      if (parts.length === 4) {
        const [a, b, c] = parts;
        const networkPrefix = `${a}.${b}.${c}`;
        
        // Try common gateway/server IPs on the device's own network (.1, .100, .166, .254)
        const deviceNetworkIPs = [
          `http://${networkPrefix}.1:3000`,      // Gateway (often .1)
          `http://${networkPrefix}.100:3000`,    // Common server IP
          `http://${networkPrefix}.166:3000`,    // Common server IP
          `http://${networkPrefix}.254:3000`,    // Broadcast adjacent
        ];
        
        // Combine both lists: first try device's network, then try common backend IPs
        const hostsToTry = [...deviceNetworkIPs, ...commonBackendIPs];
        
        console.log('[NetworkConfig] Attempting to detect backend (not in cache)');
        
        for (const hostUrl of hostsToTry) {
          try {
            console.log('[NetworkConfig] Attempting:', hostUrl);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout per attempt
            
            const response = await fetch(`${hostUrl}/clippers`, { 
              method: 'HEAD',
              signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok || response.status === 405) {
              console.log('[NetworkConfig] ✓ Found backend at:', hostUrl);
              cachedApiUrl = hostUrl;
              lastDetectionTime = now;
              return hostUrl;
            }
          } catch {
            // Continue to next host
            console.log('[NetworkConfig] ✗ Not reachable:', hostUrl);
          }
        }
        
        console.warn('[NetworkConfig] Could not find backend on local network, using fallback');
      }
    }
  } catch (error) {
    console.warn('[NetworkConfig] Error detecting network:', error);
  }

  // Platform-specific fallbacks for emulators/simulators
  if (Platform.OS === 'android') {
    console.log('[NetworkConfig] Using Android emulator fallback: 10.0.2.2:3000');
    const fallbackUrl = 'http://10.0.2.2:3000';
    cachedApiUrl = fallbackUrl;
    lastDetectionTime = now;
    return fallbackUrl;
  }
  
  if (Platform.OS === 'ios') {
    // iOS 물리 기기는 localhost 사용 불가
    // iOS 시뮬레이터는 localhost 작동
    // 하지만 물리 기기에서 localhost가 실패하면 Azure로 자동 폴백됨
    console.log('[NetworkConfig] Using iOS fallback: Azure URL');
    const fallbackUrl = 'https://clippdservice-g5fce7cyhshmd9as.eastus2-01.azurewebsites.net';
    cachedApiUrl = fallbackUrl;
    lastDetectionTime = now;
    return fallbackUrl;
  }

  // Final fallback: Azure production URL
  console.warn('[NetworkConfig] Using Azure production URL');
  const azureUrl = 'https://clippdservice-g5fce7cyhshmd9as.eastus2-01.azurewebsites.net';
  cachedApiUrl = azureUrl;
  lastDetectionTime = now;
  return azureUrl;
}
