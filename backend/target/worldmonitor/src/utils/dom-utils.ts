/**
 * World Monitor DOM Utilities
 * AUTHORIZED SECURITY ASSESSMENT TARGET — AegisScan v2
 *
 * Utility functions for rendering geopolitical telemetry data in the DOM.
 * WARNING: Multiple patterns detected by REAL-CHK-004 (Input Validation Weaknesses).
 */

/**
 * Render RSS feed item HTML content.
 * ⚠ REAL-CHK-004: dangerouslySetInnerHTML used without DOMPurify sanitization.
 */
export function renderFeedItem(container: HTMLElement, htmlContent: string): void {
  // Direct innerHTML assignment without sanitization
  container.innerHTML = htmlContent;
}

/**
 * Render telemetry alert panel.
 * ⚠ REAL-CHK-004: dangerouslySetInnerHTML equivalent (innerHTML binding).
 */
export function renderAlertPanel(data: { message: string; severity: string }): JSX.Element {
  return (
    <div
      className="alert-panel"
      dangerouslySetInnerHTML={{ __html: data.message }}
    />
  );
}

/**
 * Render map tooltip content.
 * ⚠ REAL-CHK-004: dangerouslySetInnerHTML without input validation.
 */
export function renderMapTooltip(tooltipHtml: string): JSX.Element {
  return (
    <div
      className="map-tooltip"
      dangerouslySetInnerHTML={{ __html: tooltipHtml }}
    />
  );
}

/**
 * Format geopolitical event data for display.
 */
export function formatEventData(event: Record<string, unknown>): string {
  return JSON.stringify(event, null, 2);
}
