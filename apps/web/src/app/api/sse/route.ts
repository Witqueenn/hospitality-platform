import { db } from "@repo/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const token =
    req.headers.get("authorization")?.replace("Bearer ", "") ??
    new URL(req.url).searchParams.get("token");

  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  const session = await db.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: unknown) => {
        const msg = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(new TextEncoder().encode(msg));
      };

      // Send initial connection ack
      send({ type: "connected", userId });

      // Poll for new notifications every 5s
      const interval = setInterval(async () => {
        try {
          const unread = await db.notification.count({
            where: { recipientId: userId, readAt: null },
          });
          send({ type: "notification_count", count: unread });
        } catch {
          clearInterval(interval);
          controller.close();
        }
      }, 5000);

      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
