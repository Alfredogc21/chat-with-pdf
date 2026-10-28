export const responseSSE = (
  { request }: { request: Request },
  callback: (sendEvent: (data: any) => void) => Promise<void>
) => {
  // Text encoder for converting strings to Uint8Array
  const encoder = new TextEncoder();
  let isClosed = false;

  const body = new ReadableStream({
    start(controller) {
      // Close the stream only once. The runtime may have already closed it
      // (e.g. the client disconnected) and closing it again throws.
      const close = () => {
        if (isClosed) return;
        isClosed = true;
        try {
          controller.close();
        } catch {
          // Stream already closed or canceled
        }
      };

      // Send event to client (ignored once the stream is closed)
      const sendEvent = (data: any) => {
        if (isClosed) return;
        const message = `data: ${JSON.stringify(data)}\n\n`;
        try {
          controller.enqueue(encoder.encode(message));
        } catch {
          isClosed = true;
        }
      };

      // Handle the connection closing
      request.signal.addEventListener('abort', close, { once: true });

      // Errors from the AI provider must not crash the server: log them and
      // close the stream so the client's EventSource fires `onerror`.
      callback(sendEvent)
        .catch((error) => {
          console.error('[SSE] Error while streaming the response:', error);
        })
        .finally(close);
    },
    cancel() {
      // The client disconnected before the stream finished
      isClosed = true;
    },
  });

  return new Response(body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    }
  });
}
