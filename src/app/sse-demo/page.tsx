"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface SSEEvent {
  event: string;
  data: Record<string, unknown>;
  id?: string;
}

interface ConnectionStatus {
  connected: boolean;
  clientId: string;
  clientCount: number;
  connectedClients: string[];
}

interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  clientCount?: number;
  connectedClients?: string[];
}

export default function SSEDemoPage() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    clientId: "",
    clientCount: 0,
    connectedClients: [],
  });
  const [messages, setMessages] = useState<SSEEvent[]>([]);
  const [customMessage, setCustomMessage] = useState("");
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

  const sendTestMessage = useCallback(async () => {
    if (!customMessage.trim()) return;

    setIsSending(true);
    try {
      const response = await fetch("/api/test-broadcast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: customMessage }),
      });

      const result = (await response.json()) as ApiResponse;

      if (result.success) {
        setConnectionStatus((prev) => ({
          ...prev,
          clientCount: result.clientCount ?? 0,
          connectedClients: result.connectedClients ?? [],
        }));
        setCustomMessage("");
      } else {
        setError("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending test message:", error);
      setError("Failed to send message");
    } finally {
      setIsSending(false);
    }
  }, [customMessage]);

  const getConnectionStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/test-broadcast");
      const result = (await response.json()) as ApiResponse;

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
    <div className="container mx-auto max-w-4xl p-6">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">SSE Demo</h1>
        <p className="text-muted-foreground">
          Server-Sent Events (SSE) demonstration with real-time messaging
        </p>
      </div>

      {/* Connection Status */}
      <div className="mb-6 rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="mb-2 text-2xl font-semibold">
          {connectionStatus.connected ? "🟢 Connected" : "🔴 Disconnected"}
        </h3>
        <p className="mb-4 text-sm text-gray-600">
          Client ID: {connectionStatus.clientId || "Not connected"}
        </p>
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
            👥 {connectionStatus.clientCount} connected clients
          </span>
          {connectionStatus.connected && (
            <button
              className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50"
              onClick={disconnectFromSSE}
            >
              Disconnect
            </button>
          )}
          {!connectionStatus.connected && (
            <button
              className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50"
              onClick={connectToSSE}
            >
              Connect
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="mb-6 rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="mb-2 text-xl font-semibold">Send Test Message</h3>
        <p className="mb-4 text-sm text-gray-600">
          Send a message to all connected clients
        </p>
        <div className="flex gap-2">
          <textarea
            placeholder="Enter your message..."
            value={customMessage}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setCustomMessage(e.target.value)
            }
            className="min-h-[80px] w-full flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void sendTestMessage();
              }
            }}
          />
          <button
            onClick={() => void sendTestMessage()}
            disabled={
              !customMessage.trim() || isSending || !connectionStatus.connected
            }
            className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSending ? "⏳" : "📤"} Send
          </button>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="mb-2 text-xl font-semibold">Received Messages</h3>
        <p className="mb-4 text-sm text-gray-600">
          Real-time messages from the server
        </p>
        <div className="max-h-96 space-y-4 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="py-8 text-center text-gray-500">
              No messages received yet. Send a test message to see it here!
            </p>
          ) : (
            messages.map((message, index) => (
              <div
                key={`${message.id ?? index}-${message.event}`}
                className="rounded-lg border bg-gray-50 p-4"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                    {message.event}
                  </span>
                  {message.id && (
                    <span className="inline-flex items-center rounded-full border bg-gray-100 px-2.5 py-0.5 text-xs font-semibold">
                      ID: {message.id}
                    </span>
                  )}
                </div>
                <pre className="rounded border bg-white p-2 text-sm whitespace-pre-wrap">
                  {JSON.stringify(message.data, null, 2)}
                </pre>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
