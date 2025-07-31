import type { ConnectionStatus } from "@/types/sse";

interface SSEConnectionStatusProps {
  connectionStatus: ConnectionStatus;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function SSEConnectionStatus({
  connectionStatus,
  onConnect,
  onDisconnect,
}: SSEConnectionStatusProps) {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
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
        {connectionStatus.connected ? (
          <button
            className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50"
            onClick={onDisconnect}
          >
            Disconnect
          </button>
        ) : (
          <button
            className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50"
            onClick={onConnect}
          >
            Connect
          </button>
        )}
      </div>
    </div>
  );
}
