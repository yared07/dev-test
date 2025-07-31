"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type {
  SSEEvent,
  ConnectionStatus,
  TestBroadcastResponse,
} from "@/types/sse";
import {
  SSEConnectionStatus,
  SSEClientList,
  SSEMessageForm,
  SSEMessageList,
} from "@/features/shared/components/sse";

export default function SSEDemoPage() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    clientId: "",
    clientCount: 0,
    connectedClients: [],
  });
  const [messages, setMessages] = useState<SSEEvent[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const generateClientId = useCallback(() => {
    return `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const connectToSSE = useCallback(() => {
    const clientId = generateClientId();

    try {
      const eventSource = new EventSource(`/api/sse?clientId=${clientId}`);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log("SSE connection opened");
        setConnectionStatus((prev) => ({
          ...prev,
          connected: true,
          clientId,
        }));
        setError(null);
      };

      eventSource.onmessage = (event: MessageEvent) => {
        console.log("SSE message received:", event);
        try {
          const data = JSON.parse(event.data as string) as Record<
            string,
            unknown
          >;
          const sseEvent: SSEEvent = {
            event: event.type ?? "message",
            data,
            id: event.lastEventId ?? undefined,
          };
          setMessages((prev) => [...prev, sseEvent]);
        } catch (error) {
          console.error("Error parsing SSE message:", error);
        }
      };

      eventSource.addEventListener("connected", (event: MessageEvent) => {
        console.log("Connected event received:", event);
        try {
          const data = JSON.parse(event.data as string) as Record<
            string,
            unknown
          >;
          setConnectionStatus((prev) => ({
            ...prev,
            connected: true,
            clientId: String(data.clientId),
          }));
        } catch (error) {
          console.error("Error parsing connected event:", error);
        }
      });

      eventSource.addEventListener("test-event", (event: MessageEvent) => {
        console.log("Test event received:", event);
        try {
          const data = JSON.parse(event.data as string) as Record<
            string,
            unknown
          >;
          const sseEvent: SSEEvent = {
            event: "test-event",
            data,
            id: event.lastEventId ?? undefined,
          };
          setMessages((prev) => [...prev, sseEvent]);
        } catch (error) {
          console.error("Error parsing test event:", error);
        }
      });

      eventSource.addEventListener("private-message", (event: MessageEvent) => {
        console.log("Private message received:", event);
        try {
          const data = JSON.parse(event.data as string) as Record<
            string,
            unknown
          >;
          const sseEvent: SSEEvent = {
            event: "private-message",
            data,
            id: event.lastEventId ?? undefined,
          };
          setMessages((prev) => [...prev, sseEvent]);
        } catch (error) {
          console.error("Error parsing private message:", error);
        }
      });

      eventSource.onerror = (error: Event) => {
        console.error("SSE connection error:", error);
        setError("Connection error occurred");
        setConnectionStatus((prev) => ({
          ...prev,
          connected: false,
        }));
      };
    } catch (error) {
      console.error("Error creating EventSource:", error);
      setError("Failed to connect to SSE");
    }
  }, [generateClientId]);

  const disconnectFromSSE = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setConnectionStatus((prev) => ({
        ...prev,
        connected: false,
      }));
      setError(null);
    }
  }, []);

  const sendMessage = useCallback(
    async (message: string, targetClientId?: string) => {
      setIsSending(true);
      try {
        const response = await fetch("/api/test-broadcast", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message,
            ...(targetClientId && {
              targetClientId,
              eventType: "private-message",
            }),
          }),
        });

        const result = (await response.json()) as TestBroadcastResponse;

        if (result.success) {
          setConnectionStatus((prev) => ({
            ...prev,
            clientCount: result.clientCount ?? 0,
            connectedClients: result.connectedClients ?? [],
          }));
        } else {
          setError("Failed to send message");
        }
      } catch (error) {
        console.error("Error sending message:", error);
        setError("Failed to send message");
      } finally {
        setIsSending(false);
      }
    },
    [],
  );

  const getConnectionStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/test-broadcast");
      const result = (await response.json()) as TestBroadcastResponse;

      if (result.success) {
        setConnectionStatus((prev) => ({
          ...prev,
          clientCount: result.clientCount ?? 0,
          connectedClients: result.connectedClients ?? [],
        }));
      }
    } catch (error) {
      console.error("Error getting connection status:", error);
    }
  }, []);

  useEffect(() => {
    connectToSSE();

    const statusInterval = setInterval(() => {
      void getConnectionStatus();
    }, 5000);

    return () => {
      disconnectFromSSE();
      clearInterval(statusInterval);
    };
  }, [connectToSSE, disconnectFromSSE, getConnectionStatus]);

  return (
    <div className="container mx-auto max-w-7xl p-6">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">SSE Demo</h1>
        <p className="text-muted-foreground">
          Server-Sent Events (SSE) demonstration with real-time messaging
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <SSEConnectionStatus
            connectionStatus={connectionStatus}
            onConnect={connectToSSE}
            onDisconnect={disconnectFromSSE}
          />

          <SSEClientList connectionStatus={connectionStatus} />

          <div className="space-y-6">
            <SSEMessageForm
              type="broadcast"
              connectionStatus={connectionStatus}
              onSend={sendMessage}
              isSending={isSending}
            />

            {connectionStatus.connectedClients.length > 1 && (
              <SSEMessageForm
                type="private"
                connectionStatus={connectionStatus}
                onSend={sendMessage}
                isSending={isSending}
              />
            )}
          </div>
        </div>

        <div>
          <SSEMessageList messages={messages} />
        </div>
      </div>
    </div>
  );
}
