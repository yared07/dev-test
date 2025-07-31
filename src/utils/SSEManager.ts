/**
 * Server-Sent Events (SSE) Manager
 *
 * A singleton class that manages SSE client connections, handles broadcasting,
 * and maintains heartbeat functionality to keep connections alive.
 *
 * Usage:
 * - SSEManager.getInstance().addClient(clientId, response)
 * - SSEManager.getInstance().broadcast(eventName, data)
 * - SSEManager.getInstance().send(clientId, eventName, data)
 */

import type { SSEClient, SSEEvent } from "@/types/sse";
import { SSE_CONFIG } from "@/config/sse";

class SSEManager {
  private static instance: SSEManager;
  private clients = new Map<string, SSEClient>();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.startHeartbeat();
  }

  /**
   * Get the singleton instance of SSEManager
   */
  public static getInstance(): SSEManager {
    if (!SSEManager.instance) {
      SSEManager.instance = new SSEManager();
    }
    return SSEManager.instance;
  }

  /**
   * Add a new SSE client connection
   * @param clientId - Unique identifier for the client
   * @param response - Custom response object with write/end/on methods
   */
  public addClient(clientId: string, response: SSEClient["response"]): void {
    // Send initial connection message
    this.sendSSEMessage(response, {
      event: "connected",
      data: { clientId, timestamp: new Date().toISOString() },
      id: clientId,
    });

    // Store client
    this.clients.set(clientId, {
      id: clientId,
      response,
      connectedAt: new Date(),
    });

    console.log(
      `SSE Client connected: ${clientId} (Total clients: ${this.clients.size})`,
    );

    // Handle client disconnect
    response.on("close", () => {
      this.removeClient(clientId);
    });
  }

  /**
   * Remove a client connection
   * @param clientId - Unique identifier for the client
   */
  public removeClient(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      try {
        client.response.end();
      } catch (error) {
        console.error(`Error ending response for client ${clientId}:`, error);
      }
      this.clients.delete(clientId);
      console.log(
        `SSE Client disconnected: ${clientId} (Total clients: ${this.clients.size})`,
      );
    }
  }

  /**
   * Broadcast an event to all connected clients
   * @param eventName - Name of the event
   * @param data - Event payload
   */
  public broadcast(eventName: string, data: Record<string, unknown>): void {
    const event: SSEEvent = {
      event: eventName,
      data,
      id: Date.now().toString(),
    };

    this.clients.forEach((client, clientId) => {
      try {
        this.sendSSEMessage(client.response, event);
      } catch (error) {
        console.error(`Error broadcasting to client ${clientId}:`, error);
        this.removeClient(clientId);
      }
    });

    console.log(
      `Broadcasted event '${eventName}' to ${this.clients.size} clients`,
    );
  }

  /**
   * Send an event to a specific client
   * @param clientId - Target client ID
   * @param eventName - Name of the event
   * @param data - Event payload
   */
  public send(
    clientId: string,
    eventName: string,
    data: Record<string, unknown>,
  ): boolean {
    const client = this.clients.get(clientId);
    if (!client) {
      console.warn(`Client ${clientId} not found`);
      return false;
    }

    const event: SSEEvent = {
      event: eventName,
      data,
      id: Date.now().toString(),
    };

    try {
      this.sendSSEMessage(client.response, event);
      console.log(`Sent event '${eventName}' to client ${clientId}`);
      return true;
    } catch (error) {
      console.error(`Error sending to client ${clientId}:`, error);
      this.removeClient(clientId);
      return false;
    }
  }

  /**
   * Get all connected client IDs
   */
  public getConnectedClients(): string[] {
    return Array.from(this.clients.keys());
  }

  /**
   * Get the number of connected clients
   */
  public getClientCount(): number {
    return this.clients.size;
  }

  /**
   * Start heartbeat to keep connections alive
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.clients.forEach((client, clientId) => {
        try {
          // Send a comment to keep the connection alive
          client.response.write(": heartbeat\n\n");
        } catch (error) {
          console.error(`Heartbeat error for client ${clientId}:`, error);
          this.removeClient(clientId);
        }
      });
    }, SSE_CONFIG.HEARTBEAT_INTERVAL);

    console.log("SSE Heartbeat started");
  }

  /**
   * Stop heartbeat and cleanup resources
   */
  public cleanup(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    // Close all client connections
    this.clients.forEach((client, clientId) => {
      this.removeClient(clientId);
    });

    console.log("SSE Manager cleaned up");
  }

  /**
   * Send an SSE message to a specific response
   * @param response - Custom response object
   * @param event - SSE event object
   */
  private sendSSEMessage(
    response: SSEClient["response"],
    event: SSEEvent,
  ): void {
    const message = [
      `event: ${event.event}`,
      `data: ${JSON.stringify(event.data)}`,
      event.id ? `id: ${event.id}` : "",
      "", // Empty line to end the message
    ]
      .filter(Boolean)
      .join("\n");

    response.write(message + "\n");
  }
}

export default SSEManager;
