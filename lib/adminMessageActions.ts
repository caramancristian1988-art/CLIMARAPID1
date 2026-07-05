"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { requireAdmin } from "./adminAuth";
import { MESSAGE_STATUSES } from "./messageStatuses";
import { MOODS } from "./moods";
import {
  sendTelegramMessage,
  editTelegramMessage,
  buildContactMessageText,
  updateStatusMoodInHtml,
  buildMessageButtons,
  STATUSES_REQUIRING_CONFIRMATION,
} from "./telegram";

export interface ContactFormState {
  error?: string;
  success?: boolean;
}

// Resolves the actual product(s) tied to a message — by id (single product
// requests) or by slug (cart orders, which can list several) — so the
// Telegram link and admin "Vezi produsul" link point at the real product
// instead of relying on fuzzy name matching.
async function resolveProducts(formData: FormData): Promise<{ id: string; name: string; slug: string }[]> {
  try {
    const productId = String(formData.get("productId") ?? "").trim();
    if (productId) {
      return await prisma.product.findMany({ where: { id: productId }, select: { id: true, name: true, slug: true } });
    }
    const slugsRaw = String(formData.get("productSlugs") ?? "").trim();
    const slugs = slugsRaw ? slugsRaw.split(",").map((s) => s.trim()).filter(Boolean) : [];
    if (slugs.length === 0) return [];
    return await prisma.product.findMany({ where: { slug: { in: slugs } }, select: { id: true, name: true, slug: true } });
  } catch {
    return [];
  }
}

async function getProductsByIds(productIds: string[]): Promise<{ id: string; name: string; slug: string }[]> {
  if (productIds.length === 0) return [];
  try {
    return await prisma.product.findMany({ where: { id: { in: productIds } }, select: { id: true, name: true, slug: true } });
  } catch {
    return [];
  }
}

export async function submitContactMessageAction(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const messageText = String(formData.get("message") ?? "").trim();
  const sourcePath = String(formData.get("source") ?? "").trim();

  if (!name || !phone) {
    return { error: `Lipsește ${!name ? "numele" : ""}${!name && !phone ? " și " : ""}${!phone ? "numărul de telefon" : ""}.` };
  }

  const message = [subject && `Subiect: ${subject}`, messageText].filter(Boolean).join("\n\n") || null;
  const source = sourcePath === "/contact" ? "Pagina de contact" : sourcePath || "Pagina de contact";

  const products = await resolveProducts(formData);
  const productIds = products.map((p) => p.id);

  let created;
  try {
    created = await prisma.contactMessage.create({ data: { name, phone, email: email || null, message, source, productIds } });
  } catch {
    return { error: "Nu am putut trimite mesajul. Încearcă din nou." };
  }

  const statusLabel = MESSAGE_STATUSES.find((s) => s.value === created.status)?.label ?? created.status;
  const text = buildContactMessageText({ name, phone, email: email || null, message, source, statusLabel, products });
  const telegramMessageId = await sendTelegramMessage(text, buildMessageButtons(created.id));
  if (telegramMessageId) {
    await prisma.contactMessage.update({ where: { id: created.id }, data: { telegramMessageId, telegramHtml: text } });
  }

  revalidatePath("/admin/mesaje");
  return { success: true };
}

export async function markMessageReadAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.contactMessage.update({ where: { id }, data: { read: true } });
  revalidatePath("/admin/mesaje");
  revalidatePath("/admin/notificari");
}

async function syncTelegramMessage(updated: {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  source: string;
  status: string;
  mood: string | null;
  telegramMessageId: number | null;
  telegramHtml: string | null;
  productIds: string[];
}) {
  if (!updated.telegramMessageId) return;
  const statusLabel = MESSAGE_STATUSES.find((s) => s.value === updated.status)?.label ?? updated.status;
  const moodLabel = MOODS.find((m) => m.value === updated.mood)?.label ?? null;

  let text: string;
  if (updated.telegramHtml) {
    text = updateStatusMoodInHtml(updated.telegramHtml, statusLabel, moodLabel);
  } else {
    const products = await getProductsByIds(updated.productIds);
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
  await prisma.contactMessage.update({ where: { id: updated.id }, data: { telegramHtml: text } });
  const buttons = STATUSES_REQUIRING_CONFIRMATION.includes(updated.status) ? [] : buildMessageButtons(updated.id);
  await editTelegramMessage(updated.telegramMessageId, text, buttons);
}

export async function setMessageStatusAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !MESSAGE_STATUSES.some((s) => s.value === status)) return;
  const updated = await prisma.contactMessage.update({ where: { id }, data: { status, read: true } });
  await syncTelegramMessage(updated);
  revalidatePath("/admin/mesaje");
}

export async function setMoodAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const mood = String(formData.get("mood") ?? "");
  if (!id || !MOODS.some((m) => m.value === mood)) return;
  const updated = await prisma.contactMessage.update({ where: { id }, data: { mood } });
  await syncTelegramMessage(updated);
  revalidatePath("/admin/mesaje");
}

export async function deleteMessageAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.contactMessage.delete({ where: { id } });
  revalidatePath("/admin/mesaje");
  revalidatePath("/admin/notificari");
}
