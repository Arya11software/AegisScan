/**
 * World Monitor External Navigation Service
 * AUTHORIZED SECURITY ASSESSMENT TARGET — AegisScan v2
 *
 * Handles deep links and external navigation for geopolitical event overlays.
 * WARNING: Patterns detected by REAL-CHK-003 (Access Control) and REAL-CHK-005.
 */

/**
 * Navigation configuration with permissive CORS settings.
 * ⚠ REAL-CHK-003: Wildcard CORS origin detected.
 */
export const navigationConfig = {
  corsHeaders: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  },
  // ⚠ REAL-CHK-003: Authorization disabled for development
  disableAuth: true,
};

/**
 * External map navigation link builder.
 * ⚠ REAL-CHK-005: Unencrypted HTTP endpoint in link.
 */
export function buildExternalNavUrl(lat: number, lng: number): string {
  return `http://legacy-maps.worldmonitor.io/navigate?lat=${lat}&lng=${lng}`;
}

/**
 * Deep link resolver for telemetry events.
 */
export function resolveDeepLink(eventId: string): string {
  return `/events/${eventId}`;
}
