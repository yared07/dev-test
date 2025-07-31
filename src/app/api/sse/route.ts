import type { NextRequest } from "next/server";
import SSEManager from "@/utils/SSEManager";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId");

  if (!clientId) {
    return new Response(
      JSON.stringify({ error: "clientId parameter is required" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  try {
    const sseManager = SSEManager.getInstance();

    const encoder = new TextEncoder();
    let streamController: ReadableStreamDefaultController | null = null;

    const stream = new ReadableStream({
      start(controller) {
        streamController = controller;

        const initialMessage = [
          "event: connected",
          `data: ${JSON.stringify({ clientId, timestamp: new Date().toISOString() })}`,
          `id: ${clientId}`,
          "",
          "",
        ].join("\n");

        controller.enqueue(encoder.encode(initialMessage));
      },
    });

    const response = new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Cache-Control",
      },
    });

    const customResponse = {
      write: (data: string) => {
        if (streamController) {
          streamController.enqueue(encoder.encode(data));
        }
      },
      writeHead: (_status: number, _headers: Record<string, string>) => {
        // Headers are already set in the response object
      },
      end: () => {
        if (streamController) {
          streamController.close();
        }
      },
      on: (event: string, callback: (data?: unknown) => void) => {
        if (event === "close") {
          request.signal.addEventListener("abort", callback);
        }
      },
    };

    sseManager.addClient(clientId, customResponse);

    return response;
  } catch (error) {
    console.error("SSE connection error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to establish SSE connection" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
