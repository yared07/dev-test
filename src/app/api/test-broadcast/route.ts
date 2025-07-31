import type { NextRequest } from "next/server";
import SSEManager from "@/utils/SSEManager";
import { SSE_CONFIG } from "@/config/sse";
import type { TestBroadcastRequest, TestBroadcastResponse } from "@/types/sse";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as TestBroadcastRequest;
    const message = body.message ?? "Hello from server!";
    const targetClientId = body.targetClientId;
    const eventType = body.eventType ?? "test-event";

    const sseManager = SSEManager.getInstance();

    if (targetClientId) {
      const success = sseManager.send(targetClientId, eventType, {
        message,
        timestamp: new Date().toISOString(),
        from: "server",
        type: "private",
      });

      if (!success) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Target client not found or connection failed",
          } as TestBroadcastResponse),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      const clientCount = sseManager.getClientCount();
      const connectedClients = sseManager.getConnectedClients();

      console.log(
        `[POST] Private message sent. Client count: ${clientCount}, Connected clients:`,
        connectedClients,
      );

      return new Response(
        JSON.stringify({
          success: true,
          message: "Private message sent successfully",
          targetClientId,
          clientCount,
          connectedClients,
        } as TestBroadcastResponse),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    } else {
      sseManager.broadcast(eventType, {
        message,
        timestamp: new Date().toISOString(),
        clientCount: sseManager.getClientCount(),
      });

      const clientCount = sseManager.getClientCount();
      const connectedClients = sseManager.getConnectedClients();

      console.log(
        `[POST] Broadcast sent. Client count: ${clientCount}, Connected clients:`,
        connectedClients,
      );

      return new Response(
        JSON.stringify({
          success: true,
          message: "Event broadcasted successfully",
          clientCount,
          connectedClients,
        } as TestBroadcastResponse),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  } catch (error) {
    console.error("Test broadcast error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: SSE_CONFIG.ERROR_MESSAGES.BROADCAST_FAILED,
      } as TestBroadcastResponse),
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
    const clientCount = sseManager.getClientCount();
    const connectedClients = sseManager.getConnectedClients();

    console.log(
      `[GET] Status check. Client count: ${clientCount}, Connected clients:`,
      connectedClients,
    );

    return new Response(
      JSON.stringify({
        success: true,
        clientCount,
        connectedClients,
      } as TestBroadcastResponse),
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
      } as TestBroadcastResponse),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
