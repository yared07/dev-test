# SSE Backend Integration Guide

This guide explains how to integrate Server-Sent Events (SSE) functionality into your backend modules.

## Overview

The SSE infrastructure provides real-time communication between server and clients. It supports broadcasting messages to all connected clients and sending targeted messages to specific clients.

## Architecture

- **SSEManager** - Singleton class managing all SSE connections
- **SSE Types** - TypeScript interfaces for type safety
- **SSE Config** - Configuration constants and settings
- **API Routes** - `/api/sse` for connections, `/api/test-broadcast` for testing

## Backend Integration

### Sending Events to Clients

```typescript
import SSEManager from "@/utils/SSEManager";

// Get the SSE manager instance
const sseManager = SSEManager.getInstance();

// Broadcast to all connected clients
sseManager.broadcast("notification", {
  message: "New update available!",
  timestamp: new Date().toISOString(),
  type: "info",
});

// Send to specific client
sseManager.send("client-123", "private-message", {
  message: "Your order has shipped!",
  orderId: "ORD-456",
});
```

### Getting Connection Status

### Loom: https://www.loom.com/share/181934c44065432e81f2aabf208c4c18

```typescript
// Get number of connected clients
const clientCount = sseManager.getClientCount();

// Get list of connected client IDs
const connectedClients = sseManager.getConnectedClients();
```

### Event Types

- **Broadcast Events** - Send to all connected clients
- **Targeted Events** - Send to specific client by ID
- **System Events** - Automatic events like "connected" and heartbeat

### Error Handling

```typescript
try {
  sseManager.broadcast("event", data);
} catch (error) {
  console.error("SSE broadcast failed:", error);
  // Handle error appropriately
}
```

## Client-Side Usage

```typescript
// Connect to SSE
const eventSource = new EventSource("/api/sse?clientId=your-client-id");

// Listen for events
eventSource.addEventListener("notification", (event) => {
  const data = JSON.parse(event.data);
  console.log("Received notification:", data);
});

// Handle connection status
eventSource.onopen = () => console.log("Connected to SSE");
eventSource.onerror = () => console.log("SSE connection error");
```

## Configuration

SSE settings can be modified in `src/config/sse.ts`:

```typescript
export const SSE_CONFIG = {
  HEARTBEAT_INTERVAL: 30000, // 30 seconds
  HEADERS: {
    /* SSE headers */
  },
  ERROR_MESSAGES: {
    /* Error messages */
  },
};
```

## Testing the Integration

### Step 1: Start the Development Server

```bash
npm run dev
```

### Step 2: Open Multiple Browser Tabs

1. Open your browser
2. Navigate to `http://localhost:3000/sse-demo`
3. Open multiple tabs to the same URL
4. Each tab represents a different client

### Step 3: Test Broadcasting

1. In any tab, use the "Broadcast Message" section
2. Enter a message and click "Broadcast"
3. All tabs should receive the message simultaneously

### Step 4: Test Individual Targeting

1. Ensure you have at least 2 tabs open
2. In the "Private Message" section, select a specific client from the dropdown
3. Enter a message and click "Send Private"
4. Only the selected client should receive the message

### Step 5: Verify Real-time Updates

- Watch the client count update in real-time
- Observe connection status changes
- Check that messages appear instantly

## Expected Results

When working correctly, you should see:

- Multiple browser tabs connected simultaneously
- Broadcast messages received by all tabs
- Private messages received only by the target tab
- Real-time client count updates
- Proper error handling for invalid operations
- Clean connection/disconnection handling

## Troubleshooting

### Common Issues

1. **No clients showing**: Make sure multiple browser tabs are open to `/sse-demo`
2. **Messages not appearing**: Check browser console for JavaScript errors
3. **Connection errors**: Verify the development server is running
4. **Private messages not working**: Ensure the target client ID is correct

### Debug Commands

```bash
# Check server logs
npm run dev

# Test API directly
curl http://localhost:3000/api/test-broadcast

# Monitor network traffic
# Open browser DevTools → Network tab
```

## Integration Examples

### Notification System

```typescript
// Send notification to all users
sseManager.broadcast("notification", {
  type: "info",
  message: "System maintenance in 5 minutes",
  timestamp: new Date().toISOString(),
});
```

### User-specific Updates

```typescript
// Send order update to specific user
sseManager.send(userId, "order-update", {
  orderId: "ORD-123",
  status: "shipped",
  trackingNumber: "TRK-456",
});
```

### Real-time Chat

```typescript
// Broadcast message to all chat participants
sseManager.broadcast("chat-message", {
  sender: "user-123",
  message: "Hello everyone!",
  timestamp: new Date().toISOString(),
});
```

This SSE infrastructure provides a robust foundation for real-time features in your application.
