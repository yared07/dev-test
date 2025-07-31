/**
 * SSE (Server-Sent Events) Configuration
 *
 * Centralized constants for SSE functionality
 */

export const SSE_CONFIG = {
  /**
   * Heartbeat interval in milliseconds
   * Sends a comment to keep connections alive
   */
  HEARTBEAT_INTERVAL: 30000, // 30 seconds

  /**
   * SSE headers for proper event stream setup
   */
  HEADERS: {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Cache-Control",
  } as const,

  /**
   * Error messages for SSE operations
   */
  ERROR_MESSAGES: {
    CLIENT_ID_REQUIRED: "clientId parameter is required",
    CONNECTION_FAILED: "Failed to establish SSE connection",
    BROADCAST_FAILED: "Failed to broadcast event",
    STATUS_FAILED: "Failed to get SSE status",
  } as const,
} as const;
