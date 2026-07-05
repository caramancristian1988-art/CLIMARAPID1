import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { MESSAGE_STATUSES } from "@/lib/messageStatuses";
import { MOODS } from "@/lib/moods";
import {
  editTelegramMessage,
  editTelegramReplyMarkup,
  answerCallbackQuery,
  buildContactMessageText,
  updateStatusMoodInHtml,
  buildMessageButtons,
  buildConfirmButtons,
  STATUSES_REQUIRING_CONFIRMATION,
} from "@/lib/telegram";

export async function POST(request: NextRequest) {
  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (expectedSecret) {
    const secret = request.headers.get("x-telegram-bot-api-secret-token");
    if (secret !== expectedSecret) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const update = await request.json().catch(() => null);
  const callbackQuery = update?.callback_query;

  if (!callbackQuery) {
    return NextResponse.json({ ok: true });
  }

  const data = String(callbackQuery.data ?? "");
  const [prefix, id, value] = data.split(":");

  if (!id) {
    await answerCallbackQuery(callbackQuery.id, "Acțiune necunoscută.");
    return NextResponse.json({ ok: true });
  }

  // Pressing "Achitat" or "Anulat" first asks for confirmation instead of applying immediately.
  if (prefix === "status" && MESSAGE_STATUSES.some((s) => s.value === value) && STATUSES_REQUIRING_CONFIRMATION.includes(value)) {
    try {
      const message = await prisma.contactMessage.findUnique({ where: { id } });
      if (message?.telegramMessageId) {
        await editTelegramReplyMarkup(message.telegramMessageId, buildConfirmButtons(id, value));
      }
      await answerCallbackQuery(callbackQuery.id);
    } catch {
      await answerCallbackQuery(callbackQuery.id, "Mesajul nu mai există.");
    }
    return NextResponse.json({ ok: true });
  }

  if (prefix === "cancel") {
    try {
      const message = await prisma.contactMessage.findUnique({ where: { id } });
      if (message?.telegramMessageId) {
        await editTelegramReplyMarkup(message.telegramMessageId, buildMessageButtons(id));
      }
      await answerCallbackQuery(callbackQuery.id, "Anulat.");
    } catch {
      await answerCallbackQuery(callbackQuery.id, "Mesajul nu mai există.");
    }
    return NextResponse.json({ ok: true });
  }

  const isStatus = prefix === "status" && MESSAGE_STATUSES.some((s) => s.value === value);
  const isConfirm = prefix === "confirm" && MESSAGE_STATUSES.some((s) => s.value === value);
  const isMood = prefix === "mood" && MOODS.some((m) => m.value === value);

  if (!isStatus && !isConfirm && !isMood) {
    await answerCallbackQuery(callbackQuery.id, "Acțiune necunoscută.");
    return NextResponse.json({ ok: true });
  }

  try {
    // Fetch BEFORE update to guarantee we have productIds and telegramMessageId
    const existing = await prisma.contactMessage.findUnique({ where: { id } });
    if (!existing) {
      await answerCallbackQuery(callbackQuery.id, "Mesajul nu mai exista.");
      return NextResponse.json({ ok: true });
    }

    const updated = isStatus || isConfirm
      ? await prisma.contactMessage.update({ where: { id }, data: { status: value, read: true } })
      : await prisma.contactMessage.update({ where: { id }, data: { mood: value } });

    const statusLabel = MESSAGE_STATUSES.find((s) => s.value === updated.status)?.label ?? updated.status;
    const moodLabel = MOODS.find((m) => m.value === updated.mood)?.label ?? null;

    // Use stored HTML (with product links) and only replace status/mood lines.
    // Fallback to full rebuild for old messages without stored HTML.
    let text: string;
    if (existing.telegramHtml) {
      text = updateStatusMoodInHtml(existing.telegramHtml, statusLabel, moodLabel);
    } else {
      const productIds = existing.productIds ?? [];
      let products = productIds.length
        ? await prisma.product.findMany({ where: { id: { in: productIds } }, select: { name: true, slug: true } })
        : [];
      if (products.length === 0 && existing.message) {
        const names = existing.message
          .split("\n")
          .filter((l) => /^\d+x /.test(l))
          .map((l) => l.replace(/^\d+x /, "").replace(/\s+[—\-–]\s+.*$/, "").trim())
          .filter(Boolean);
        if (names.length > 0) {
          products = await prisma.product.findMany({
            where: { name: { in: names } },
            select: { name: true, slug: true },
          });
        }
      }
      text = buildContactMessageText({
        name: updated.name,
        phone: updated.phone,
        email: updated.email,
        message: updated.message,
        source: updated.source,
        statusLabel,
        moodLabel,
        products,
      });
    }

    // Persist updated HTML so future edits also preserve links.
    await prisma.contactMessage.update({ where: { id }, data: { telegramHtml: text } });

    let editError: string | null = null;
    if (existing.telegramMessageId) {
      const buttons = isConfirm ? [] : buildMessageButtons(updated.id);
      editError = await editTelegramMessage(existing.telegramMessageId, text, buttons);
    }
    const dbgPath = existing.telegramHtml ? `html:${existing.telegramHtml.length}` : `nohtmlfb`;
    const confirmText = editError
      ? `Err: ${editError.slice(0, 120)}`
      : `${isMood ? "reactie" : statusLabel} [${dbgPath}]`;
    await answerCallbackQuery(callbackQuery.id, confirmText);
    revalidatePath("/admin/mesaje");
  } catch (err) {
    console.error("[telegram-webhook] error:", err);
    const msg = err instanceof Error ? err.message.slice(0, 180) : "Eroare necunoscuta";
    await answerCallbackQuery(callbackQuery.id, msg);
  }

  return NextResponse.json({ ok: true });
}
