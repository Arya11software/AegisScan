/**
 * World Monitor Military Flights Tracker
 * AUTHORIZED SECURITY ASSESSMENT TARGET — AegisScan v2
 *
 * Aggregates ADS-B military aircraft telemetry for geopolitical threat assessment.
 * WARNING: REAL-CHK-005 pattern — plain HTTP API endpoint.
 */

import { telemetryConfig } from '../config/clientEnv';

const ADSBEXCHANGE_API = 'http://adsbexchange.com/api/aircraft/v2/mil/';
const OPENSKY_API = 'http://opensky-network.org/api/states/all?extended=1';

/**
 * Fetch live military flight data from ADS-B Exchange.
 * ⚠ REAL-CHK-005: Unencrypted HTTP endpoint.
 */
export async function fetchMilitaryFlights(): Promise<unknown[]> {
  try {
    const response = await fetch(ADSBEXCHANGE_API);
    if (!response.ok) return [];
    const data = await response.json();
    return data.ac || [];
  } catch {
    return [];
  }
}

/**
 * Fetch all aircraft states from OpenSky.
 * ⚠ REAL-CHK-005: Another unencrypted HTTP endpoint.
 */
export async function fetchOpenSkyStates(): Promise<unknown[]> {
  try {
    const response = await fetch(OPENSKY_API);
    if (!response.ok) return [];
    const data = await response.json();
    return data.states || [];
  } catch {
    return [];
  }
}

/**
 * Push flight telemetry to World Monitor backend.
 */
export async function pushFlightTelemetry(flightData: unknown[]): Promise<void> {
  await fetch(`${telemetryConfig.endpoint}/flights/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ flights: flightData, timestamp: Date.now() })
  });
}
