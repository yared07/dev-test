import type { NextRequest } from "next/server";
import SSEManager from "@/utils/SSEManager";
import { SSE_CONFIG } from "@/config/sse";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { message?: string };
    const message = body.message ?? "Hello from server!";

    const sseManager = SSEManager.getInstance();

    sseManager.broadcast("test-event", {
      message,
      timestamp: new Date().toISOString(),
      clientCount: sseManager.getClientCount(),
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Event broadcasted successfully",
        clientCount: sseManager.getClientCount(),
        connectedClients: sseManager.getConnectedClients(),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Test broadcast error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: SSE_CONFIG.ERROR_MESSAGES.BROADCAST_FAILED,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

export async function GET() {
  try {
    const sseManager = SSEManager.getInstance();

    return new Response(
      JSON.stringify({
        success: true,
        clientCount: sseManager.getClientCount(),
        connectedClients: sseManager.getConnectedClients(),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Get SSE status error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: SSE_CONFIG.ERROR_MESSAGES.STATUS_FAILED,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
