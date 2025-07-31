import type { SSEEvent } from "@/types/sse";

interface SSEMessageListProps {
  messages: SSEEvent[];
}

export function SSEMessageList({ messages }: SSEMessageListProps) {
  return (
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
                {message.event === "private-message" && (
                  <span className="inline-flex items-center rounded-full border bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-700">
                    🔒 Private
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
  );
}
