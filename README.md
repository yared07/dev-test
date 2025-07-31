# Nomey Web App

This is the official repository for the Nomey web app, built on the T3 Stack with custom extensions.

## Tech Stack

- [Next.js](https://nextjs.org) - App Framework
- [NextAuth.js](https://next-auth.js.org) - Authentication
- [Prisma](https://prisma.io) - Database ORM
- [Tailwind CSS](https://tailwindcss.com) - CSS Utility Framework
- [tRPC](https://trpc.io) - API Framework
- [Mux]() - Video handling (upload / storage / etc.)
- [tolgee](https://tolgee.io/) - Translation Management
- [Meilisearch](https://www.meilisearch.com/) - Full-text search
- [Upstash](https://upstash.com/) Next compatible redis
- [Qstash](https://upstash.com/docs/qstash) Next compatible queue handling
- [Vitest](https://vitest.dev/) - Testing Framework

## Server-Sent Events (SSE) Infrastructure

The application includes a robust SSE infrastructure for real-time server-to-client communication.

### Architecture

- **SSEManager** (`src/utils/SSEManager.ts`) - Singleton class managing all SSE connections
- **SSE Types** (`src/types/sse.ts`) - TypeScript interfaces and types
- **SSE Config** (`src/config/sse.ts`) - Configuration constants
- **SSE API Routes** - `/api/sse` for connections, `/api/test-broadcast` for testing

### Backend Integration

#### Sending Events to Clients

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

#### Getting Connection Status

```typescript
// Get number of connected clients
const clientCount = sseManager.getClientCount();

// Get list of connected client IDs
const connectedClients = sseManager.getConnectedClients();
```

#### Event Types

- **Broadcast Events** - Send to all connected clients
- **Targeted Events** - Send to specific client by ID
- **System Events** - Automatic events like "connected" and heartbeat

#### Error Handling

The SSE system includes comprehensive error handling:

```typescript
try {
  sseManager.broadcast("event", data);
} catch (error) {
  console.error("SSE broadcast failed:", error);
  // Handle error appropriately
}
```

### Client-Side Usage

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

### Configuration

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

### Testing

- **Demo Page**: Visit `/sse-demo` for interactive testing
- **API Testing**: Use `/api/test-broadcast` for programmatic testing
- **Status Check**: GET `/api/test-broadcast` for connection status

## Testing

This project uses [Vitest](https://vitest.dev/) to run both client-side (browser) and server-side (Node.js) tests.

### Project Structure

Tests are split into two environments:

- **Browser (jsdom)** — for React/browser environment tests.
- **Node.js** — for backend and server-only logic.

### File Naming Conventions

- Node-specific tests: `*.node.test.ts`
- Browser tests: any other `*.test.ts`, `*.test.tsx`, etc.

### Running Tests

Run **all tests**:

```bash
npm run test
```

## Local Development

### Clone and Install

```bash
git clone git@github.com:nomeyy/nomey-next.git
cd nomey-next
npm install
```

### Run Containers

You'll need to have `docker` installed locally. We advise running `./scripts/start-services.sh` to safely start your environment, but a normal docker workflow will also work.

### Run Next

```bash
npm run dev
```

> ⚠️ **Warning:** The T3 stack hard-enforces environment variables to provide type-safety. The project will not build without all environment variables in place. Contact a dev to get their variables to quickly get yourself up and running.

## Learn More

- [Nomey Documentation (WIP)](https://nomey.mintlify.app/)
- [Next Documentation](https://nextjs.org/docs)
- [T3 Stack Documentation](https://create.t3.gg/en/usage/first-steps)
- [Mux Documentation](https://www.mux.com/docs)
