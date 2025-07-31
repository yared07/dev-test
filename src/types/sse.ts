/**
 * SSE (Server-Sent Events) Types
 *
 * Centralized type definitions for SSE functionality
 */

export interface SSEClient {
  id: string;
  response: {
    write: (data: string) => void;
    writeHead?: (status: number, headers: Record<string, string>) => void;
    end: () => void;
    on: (event: string, callback: (data?: unknown) => void) => void;
  };
  connectedAt: Date;
}

export interface SSEEvent {
  event: string;
  data: Record<string, unknown>;
  id?: string;
}

export interface ConnectionStatus {
  connected: boolean;
  clientId: string;
  clientCount: number;
  connectedClients: string[];
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  clientCount?: number;
  connectedClients?: string[];
}

// API Request/Response Types
export interface TestBroadcastRequest {
  message?: string;
  targetClientId?: string;
  eventType?: string;
}

export interface TestBroadcastResponse {
  success: boolean;
  message?: string;
  error?: string;
  clientCount?: number;
  connectedClients?: string[];
  targetClientId?: string;
}
