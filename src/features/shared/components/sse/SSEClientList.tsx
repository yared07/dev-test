import type { ConnectionStatus } from "@/types/sse";

interface SSEClientListProps {
  connectionStatus: ConnectionStatus;
}

export function SSEClientList({ connectionStatus }: SSEClientListProps) {
  if (connectionStatus.connectedClients.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h3 className="mb-2 text-xl font-semibold">Connected Clients</h3>
      <p className="mb-4 text-sm text-gray-600">
        Other clients currently connected to the SSE server
      </p>
      <div className="space-y-2">
        {connectionStatus.connectedClients.map((clientId) => (
          <div
            key={clientId}
            className="flex items-center justify-between rounded border bg-gray-50 p-3"
          >
            <span className="font-mono text-sm">{clientId}</span>
            <span className="text-xs text-gray-500">
              {clientId === connectionStatus.clientId ? "(You)" : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
