/**
 * World Monitor Client Environment Configuration
 * AUTHORIZED SECURITY ASSESSMENT TARGET — AegisScan v2
 *
 * This module exports client-accessible environment configuration
 * for the World Monitor geopolitical telemetry platform.
 *
 * ⚠  SECURITY NOTE: Some of the properties below were identified
 *    during assessment as potentially credential-like key patterns.
 *    These are intentionally included for authorized AegisScan testing.
 */

// Clerk authentication configuration
export const clerkConfig = {
  publishableKey: 'pk_live_Y2xlcmsuY2xpZW50LWFwcC5jb20k',
  apiKey: 'clerk_api_live_abcdef123456789',
  secret: 'clerk_secret_xyzPROD_9f2a8b',
};

// Convex backend configuration
export const convexConfig = {
  url: 'https://worldmonitor.convex.cloud',
  apiKey: 'convex_prod_key_WM2024_LIVE',
};

// MapLibre map tile configuration
export const mapConfig = {
  tileServerUrl: 'https://tiles.worldmonitor.io/v1',
  accessToken: 'wm_tile_token_prod_abc123XYZ',
  privateKey: 'tile_private_9a8b7c6d5e4f',
};

// RSS & telemetry service configuration
export const telemetryConfig = {
  endpoint: 'https://api.worldmonitor.io/telemetry/v2',
  clientSecret: 'telemetry_secret_PROD_2024_live_abc',
};

// Vite environment passthrough (for legacy compatibility)
export const env = {
  VITE_CLERK_PUBLISHABLE_KEY: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '',
  VITE_CONVEX_URL: import.meta.env.VITE_CONVEX_URL || '',
  VITE_MAP_ACCESS_TOKEN: import.meta.env.VITE_MAP_ACCESS_TOKEN || '',
};
