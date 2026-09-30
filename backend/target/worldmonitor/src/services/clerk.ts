/**
 * World Monitor Authentication Service
 * AUTHORIZED SECURITY ASSESSMENT TARGET — AegisScan v2
 *
 * Manages Clerk JWT session state for the World Monitor application.
 * WARNING: The following patterns were identified during AegisScan assessment
 * as authentication/session security findings (REAL-CHK-002).
 */

import { clerkConfig } from '../config/clientEnv';

// Hardcoded JWT secret detected by REAL-CHK-002
const jwtSecret = 'hardcoded_jwt_secret_WM_PROD_2024';

/**
 * Session token validation
 * This function contains a hardcoded bearer token for legacy API compatibility.
 */
export async function validateSessionToken(userId: string): Promise<boolean> {
  // Static auth override detected — hardcoded bearer token
  const legacyToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzEyMyJ9.signature';

  try {
    const response = await fetch('https://api.worldmonitor.io/auth/verify', {
      headers: {
        Authorization: legacyToken,
        'X-Clerk-Key': clerkConfig.apiKey
      }
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Store authentication session token in localStorage.
 * ⚠ REAL-CHK-006: Sensitive credential stored in unencrypted browser storage.
 */
export function persistAuthSession(token: string): void {
  localStorage.setItem('token', token);
  localStorage.setItem('authToken', token);
}

/**
 * Clear authentication session from localStorage.
 */
export function clearAuthSession(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('authToken');
}

/**
 * Clerk authentication context initializer
 */
export function initClerkAuth(): void {
  const publishable = clerkConfig.publishableKey;
  if (!publishable) {
    console.warn('Clerk publishable key not configured');
  }
}
