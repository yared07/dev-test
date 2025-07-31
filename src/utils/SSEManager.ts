interface SSEClient {
  id: string;
  response: {
    write: (data: string) => void;
    writeHead?: (status: number, headers: Record<string, string>) => void;
    end: () => void;
    on: (event: string, callback: (data?: unknown) => void) => void;
  };
  connectedAt: Date;
}

interface SSEEvent {
  event: string;
  data: Record<string, unknown>;
  id?: string;
}

class SSEManager {
  private static instance: SSEManager;
  private clients = new Map<string, SSEClient>();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private readonly HEARTBEAT_INTERVAL = 30000;

  private constructor() {
    this.startHeartbeat();
  }

  public static getInstance(): SSEManager {
    if (!SSEManager.instance) {
      SSEManager.instance = new SSEManager();
    }
    return SSEManager.instance;
  }

  public addClient(clientId: string, response: SSEClient["response"]): void {
    this.sendSSEMessage(response, {
      event: "connected",
      data: { clientId, timestamp: new Date().toISOString() },
      id: clientId,
    });

    this.clients.set(clientId, {
      id: clientId,
      response,
      connectedAt: new Date(),
    });

    console.log(
      `SSE Client connected: ${clientId} (Total clients: ${this.clients.size})`,
    );

    response.on("close", () => {
      this.removeClient(clientId);
    });
  }

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

  public getConnectedClients(): string[] {
    return Array.from(this.clients.keys());
  }

  public getClientCount(): number {
    return this.clients.size;
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.clients.forEach((client, clientId) => {
        try {
          client.response.write(": heartbeat\n\n");
        } catch (error) {
          console.error(`Heartbeat error for client ${clientId}:`, error);
          this.removeClient(clientId);
        }
      });
    }, this.HEARTBEAT_INTERVAL);

    console.log("SSE Heartbeat started");
  }

  public cleanup(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    this.clients.forEach((client, clientId) => {
      this.removeClient(clientId);
    });

    console.log("SSE Manager cleaned up");
  }

  private sendSSEMessage(
    response: SSEClient["response"],
    event: SSEEvent,
  ): void {
    const message = [
      `event: ${event.event}`,
      `data: ${JSON.stringify(event.data)}`,
      event.id ? `id: ${event.id}` : "",
      "",
    ]
      .filter(Boolean)
      .join("\n");

    response.write(message + "\n");
  }
}

export default SSEManager;
