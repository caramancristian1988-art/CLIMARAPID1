import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { MESSAGE_STATUSES } from "@/lib/messageStatuses";
import { MOODS } from "@/lib/moods";
import {
  editTelegramReplyMarkup,
  answerCallbackQuery,
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

    // Never edit message text — links would be lost on rebuild.
    // Only update the reply markup: show current status in a top indicator button.
    if (existing.telegramMessageId) {
      const moodLabel2 = MOODS.find((m) => m.value === updated.mood)?.label ?? null;
      const statusDisplay = moodLabel2 ? `${statusLabel} ${moodLabel2}` : statusLabel;
      const buttons = isConfirm ? [] : buildMessageButtons(updated.id, statusDisplay);
      await editTelegramReplyMarkup(existing.telegramMessageId, buttons);
    }
    await answerCallbackQuery(callbackQuery.id, isMood ? `Reacție salvată.` : `Status: ${statusLabel}`);
    revalidatePath("/admin/mesaje");
  } catch (err) {
    console.error("[telegram-webhook] error:", err);
    const msg = err instanceof Error ? err.message.slice(0, 180) : "Eroare necunoscuta";
    await answerCallbackQuery(callbackQuery.id, msg);
  }

  return NextResponse.json({ ok: true });
}
