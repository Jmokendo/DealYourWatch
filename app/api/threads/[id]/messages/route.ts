import { isApiMockMode } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api/http";
import type { CreateMessageBody, MessageDto } from "@/lib/api/contracts";
import { mockMessagesByThread } from "@/lib/api/mock-data";
import { getUserIdFromCookie } from "@/lib/getUser";
import { sendEmail, createNewMessageEmail } from "@/lib/email";

function toMessageDto(m: {
  id: string;
  threadId: string;
  senderId: string | null;
  content: string;
  isSystem: boolean;
  createdAt: Date;
}): MessageDto {
  return {
    id: m.id,
    threadId: m.threadId,
    senderId: m.senderId,
    content: m.content,
    isSystem: m.isSystem,
    createdAt: m.createdAt.toISOString(),
  };
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;

  if (isApiMockMode()) {
    return jsonOk([...(mockMessagesByThread[id] ?? [])]);
  }

  const db = getPrisma();
  if (!db) return jsonOk([]);

  const thread = await db.thread.findUnique({ where: { id } });
  if (!thread) return jsonError("Thread not found", 404);

  const rows = await db.message.findMany({
    where: { threadId: id },
    orderBy: { createdAt: "asc" },
  });
  return jsonOk(rows.map(toMessageDto));
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }
  const o = raw as Record<string, unknown>;
  const content = typeof o.content === "string" ? o.content.trim() : "";
  if (!content) return jsonError("content is required", 400);

  const isSystem: boolean =
    typeof o.isSystem === "boolean" ? o.isSystem : false;
  const userId = isSystem ? null : (await getUserIdFromCookie()) || "dev-user-1";

  const body: CreateMessageBody = {
    content,
    isSystem,
  };

  if (isApiMockMode()) {
    const now = new Date().toISOString();
    const msg: MessageDto = {
      id: `mock-msg-${Date.now()}`,
      threadId: id,
      senderId: body.isSystem ? null : userId,
      content: body.content,
      isSystem: body.isSystem,
      createdAt: now,
    };
    if (!mockMessagesByThread[id]) mockMessagesByThread[id] = [];
    mockMessagesByThread[id].push(msg);
    return jsonOk(msg, { status: 201 });
  }

  const db = getPrisma();
  if (!db) return jsonError("Database not configured", 503);

  const thread = await db.thread.findUnique({ where: { id } });
  if (!thread) return jsonError("Thread not found", 404);

  const senderId = body.isSystem ? null : userId;

  const row = await db.message.create({
    data: {
      threadId: id,
      senderId,
      content: body.content,
      isSystem: body.isSystem,
    },
  });

  // Send notification email to the other participant
  if (!body.isSystem && senderId) {
    const thread = await db.thread.findUnique({
      where: { id },
      include: {
        negotiation: {
          include: {
            buyer: true,
            listing: { include: { user: true } },
          },
        },
      },
    });

    if (thread) {
      const buyer = thread.negotiation.buyer;
      const seller = thread.negotiation.listing.user;
      const recipient = senderId === buyer.id ? seller : buyer;

      if (recipient.email) {
        const sender = senderId === buyer.id ? buyer : seller;
        const emailNotification = createNewMessageEmail(
          recipient.email,
          recipient.name || "Usuario",
          sender.name || "Usuario",
          body.content,
          id
        );
        await sendEmail(emailNotification);
      }
    }
  }

  return jsonOk(toMessageDto(row), { status: 201 });
}
