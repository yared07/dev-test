import { useState } from "react";

interface SSEMessageFormProps {
  type: "broadcast" | "private";
  connectionStatus: {
    connected: boolean;
    connectedClients: string[];
    clientId: string;
  };
  onSend: (message: string, targetClientId?: string) => void;
  isSending: boolean;
}

export function SSEMessageForm({
  type,
  connectionStatus,
  onSend,
  isSending,
}: SSEMessageFormProps) {
  const [message, setMessage] = useState("");
  const [targetClientId, setTargetClientId] = useState("");

  const handleSubmit = () => {
    if (!message.trim()) return;

    if (type === "private" && !targetClientId.trim()) return;

    onSend(message, type === "private" ? targetClientId : undefined);
    setMessage("");
    if (type === "private") {
      setTargetClientId("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isDisabled =
    !message.trim() ||
    isSending ||
    !connectionStatus.connected ||
    (type === "private" && !targetClientId.trim());

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h3 className="mb-2 text-xl font-semibold">
        {type === "broadcast" ? "Broadcast Message" : "Private Message"}
      </h3>
      <p className="mb-4 text-sm text-gray-600">
        {type === "broadcast"
          ? "Send a message to all connected clients"
          : "Send a message to a specific client (demonstrates individual targeting)"}
      </p>

      <div className="space-y-3">
        {type === "private" && (
          <div className="flex gap-2">
            <select
              value={targetClientId}
              onChange={(e) => setTargetClientId(e.target.value)}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Select a client...</option>
              {connectionStatus.connectedClients
                .filter((clientId) => clientId !== connectionStatus.clientId)
                .map((clientId) => (
                  <option key={clientId} value={clientId}>
                    {clientId}
                  </option>
                ))}
            </select>
          </div>
        )}

        <div className="flex gap-2">
          <textarea
            placeholder={`Enter your ${type} message...`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[80px] w-full flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <button
            onClick={handleSubmit}
            disabled={isDisabled}
            className={`rounded-md px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50 ${
              type === "broadcast"
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {isSending ? "⏳" : type === "broadcast" ? "📤" : "📨"}{" "}
            {type === "broadcast" ? "Broadcast" : "Send Private"}
          </button>
        </div>
      </div>
    </div>
  );
}
