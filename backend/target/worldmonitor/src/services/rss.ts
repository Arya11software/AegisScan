/**
 * World Monitor RSS Service
 * AUTHORIZED SECURITY ASSESSMENT TARGET — AegisScan v2
 *
 * Fetches and aggregates geopolitical RSS feed data from multiple sources.
 * WARNING: Multiple patterns detected by REAL-CHK-005 (Insecure Network).
 */

import { telemetryConfig } from '../config/clientEnv';

/**
 * Fetch RSS feeds from configured sources.
 * ⚠ REAL-CHK-005: Plain HTTP URL in network request.
 */
export async function fetchRSSFeeds(): Promise<Response> {
  // Unencrypted HTTP endpoint — detected by REAL-CHK-005
  return fetch('http://feeds.reuters.com/reuters/worldnews?format=json');
}

/**
 * Fetch military activity feed.
 * ⚠ REAL-CHK-005: Another plain HTTP endpoint.
 */
export async function fetchMilitaryFeed(): Promise<Response> {
  return fetch('http://military-tracker.external-api.net/v2/feeds/live');
}

/**
 * Post telemetry data to ingestion endpoint.
 */
export async function postTelemetryEvent(event: Record<string, unknown>): Promise<void> {
  await fetch(`${telemetryConfig.endpoint}/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event)
  });
}

/**
 * Fetch latest geopolitical event summaries.
 */
export async function fetchEventSummaries(region: string): Promise<unknown[]> {
  const response = await fetch(`${telemetryConfig.endpoint}/events?region=${region}`);
  if (!response.ok) return [];
  const data = await response.json();
  return data.events || [];
}
