export const runtime = "nodejs";

import { isApiMockMode } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api/http";
import type { CreateMessageBody, MessageDto } from "@/lib/api/contracts";
import { mockMessagesByThread } from "@/lib/api/mock-data";
import { requireAuthUser } from "@/lib/auth-session";
import {
  isNegotiationParticipant,
  loadThreadWithNegotiationAccess,
  mockListingSellerId,
  mockNegotiationForThread,
} from "@/lib/api/negotiation-access";

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
  const user = await requireAuthUser();
  if (!user) return jsonError("Unauthorized", 401);

  const { id } = await ctx.params;

  if (isApiMockMode()) {
    const negotiation = mockNegotiationForThread(id);
    if (!negotiation) return jsonError("Thread not found", 404);
    const sellerId = mockListingSellerId(negotiation.listingId);
    if (!sellerId) return jsonError("Listing not found", 404);
    if (!isNegotiationParticipant(user.id, negotiation.buyerId, sellerId)) {
      return jsonError("Forbidden", 403);
    }
    return jsonOk([...(mockMessagesByThread[id] ?? [])]);
  }

  const db = getPrisma();
  if (!db) return jsonOk([]);

  const thread = await loadThreadWithNegotiationAccess(db, id);
  if (!thread) return jsonError("Thread not found", 404);
  if (
    !isNegotiationParticipant(
      user.id,
      thread.negotiation.buyerId,
      thread.negotiation.listing.userId,
    )
  ) {
    return jsonError("Forbidden", 403);
  }

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
  const user = await requireAuthUser();
  if (!user) return jsonError("Unauthorized", 401);

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
  if (isSystem) return jsonError("Only the server can create system messages", 403);

  const userId = isSystem ? null : user.id;

  const body: CreateMessageBody = {
    content,
    isSystem,
  };

  if (isApiMockMode()) {
    const negotiation = mockNegotiationForThread(id);
    if (!negotiation) return jsonError("Thread not found", 404);
    const sellerId = mockListingSellerId(negotiation.listingId);
    if (!sellerId) return jsonError("Listing not found", 404);
    if (!isNegotiationParticipant(user.id, negotiation.buyerId, sellerId)) {
      return jsonError("Forbidden", 403);
    }

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

  const thread = await loadThreadWithNegotiationAccess(db, id);
  if (!thread) return jsonError("Thread not found", 404);
  if (
    !isNegotiationParticipant(
      user.id,
      thread.negotiation.buyerId,
      thread.negotiation.listing.userId,
    )
  ) {
    return jsonError("Forbidden", 403);
  }

  const senderId = body.isSystem ? null : userId;

  const row = await db.message.create({
    data: {
      threadId: id,
      senderId,
      content: body.content,
      isSystem: body.isSystem,
    },
  });

  return jsonOk(toMessageDto(row), { status: 201 });
}
