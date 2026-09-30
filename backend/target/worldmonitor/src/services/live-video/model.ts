/**
 * World Monitor Live Video Service
 * AUTHORIZED SECURITY ASSESSMENT TARGET — AegisScan v2
 *
 * Manages live video stream configuration for geopolitical event monitoring.
 */

import { convexConfig, mapConfig } from '../config/clientEnv';

/**
 * Live stream configuration model.
 * ⚠ REAL-CHK-001: Contains accessToken property (credential-like pattern).
 */
export const liveVideoConfig = {
  streamEndpoint: 'https://stream.worldmonitor.io/v2/live',
  accessToken: 'wm_stream_access_prod_2024_ABC123',
  privateKey: 'stream_private_key_0987654321',
  maxConcurrentStreams: 12,
  qualityLevels: ['720p', '1080p', '4K'],
};

/**
 * Initialize live video stream session.
 */
export async function initLiveStream(regionId: string): Promise<void> {
  await fetch(`${liveVideoConfig.streamEndpoint}/init`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${liveVideoConfig.accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ regionId, convexUrl: convexConfig.url })
  });
}

/**
 * Terminate video stream session.
 */
export async function terminateLiveStream(sessionId: string): Promise<void> {
  await fetch(`${liveVideoConfig.streamEndpoint}/terminate/${sessionId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${liveVideoConfig.accessToken}`
    }
  });
}
