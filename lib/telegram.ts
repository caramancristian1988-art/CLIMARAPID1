const TELEGRAM_API = "https://api.telegram.org";

interface InlineButton {
  text: string;
  callback_data: string;
}

export async function sendTelegramMessage(text: string, buttons: InlineButton[][]): Promise<number | null> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return null;

  try {
    const res = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        reply_markup: { inline_keyboard: buttons },
      }),
    });
    const data = await res.json();
    return data?.result?.message_id ?? null;
  } catch {
    return null;
  }
}

export async function editTelegramMessage(messageId: number, text: string, buttons: InlineButton[][]): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  try {
    await fetch(`${TELEGRAM_API}/bot${token}/editMessageText`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: "HTML",
        reply_markup: { inline_keyboard: buttons },
      }),
    });
  } catch {
    // ignore
  }
}

export async function editTelegramReplyMarkup(messageId: number, buttons: InlineButton[][]): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  try {
    await fetch(`${TELEGRAM_API}/bot${token}/editMessageReplyMarkup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        reply_markup: { inline_keyboard: buttons },
      }),
    });
  } catch {
    // ignore
  }
}

export async function answerCallbackQuery(callbackQueryId: string, text?: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;

  try {
    await fetch(`${TELEGRAM_API}/bot${token}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ callback_query_id: callbackQueryId, text }),
    });
  } catch {
    // ignore
  }
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function getSiteUrl(): string {
  if (process.env.SITE_URL) return process.env.SITE_URL;
  if (process.env.NODE_ENV === "production") return "https://www.climatrapid.md";
  return "http://localhost:3000";
}

// Wraps any mentioned product names in an HTML link to that product's page,
// so tapping the (already-visible) product name in Telegram jumps straight
// to it — no extra/visible URL text cluttering the message.
function linkifyProducts(text: string, products: { name: string; slug: string }[]): string {
  let result = text;
  for (const p of products) {
    const escapedName = escapeHtml(p.name);
    if (!escapedName || !result.includes(escapedName)) continue;
    const url = `${getSiteUrl()}/produse/${p.slug}`;
    result = result.split(escapedName).join(`<a href="${url}">${escapedName}</a>`);
  }
  return result;
}

export function buildContactMessageText(message: {
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  source: string;
  statusLabel: string;
  moodLabel?: string | null;
  products?: { name: string; slug: string }[];
}): string {
  const products = message.products ?? [];
  const escapedMessage = message.message ? escapeHtml(message.message) : null;
  const escapedSource = escapeHtml(message.source);

  const lines = [
    `📩 <b>Mesaj nou</b>`,
    ``,
    `👤 ${escapeHtml(message.name)}`,
    `📞 ${escapeHtml(message.phone)}`,
    message.email ? `✉️ ${escapeHtml(message.email)}` : null,
    escapedMessage ? `\n${linkifyProducts(escapedMessage, products)}` : null,
    ``,
    `🔗 Sursă: ${linkifyProducts(escapedSource, products)}`,
    `📌 Status: <b>${escapeHtml(message.statusLabel)}</b>`,
    message.moodLabel ? `🙂 Reacție: <b>${escapeHtml(message.moodLabel)}</b>` : null,
  ].filter((l) => l !== null);
  return lines.join("\n");
}

const STATUS_BUTTON_ROWS: { value: string; label: string }[][] = [
  [{ value: "sunat", label: "📞 Sunat" }, { value: "nu_raspunde", label: "🚫 Nu răspunde" }, { value: "se_gandeste", label: "🤔 Se gândește" }],
  [{ value: "programat", label: "🗓 Programat" }, { value: "in_lucru", label: "🛠 În lucru" }, { value: "achitat", label: "💰 Achitat" }],
  [{ value: "anulat", label: "❌ Anulat" }],
];

const MOOD_BUTTON_ROWS: { value: string; label: string }[][] = [
  [{ value: "incantat", label: "🤑" }, { value: "fericit", label: "😁" }, { value: "nervos", label: "😠" }, { value: "furios", label: "🤬" }],
];

export const STATUS_BUTTONS = STATUS_BUTTON_ROWS.flat();
export const MOOD_BUTTONS = MOOD_BUTTON_ROWS.flat();

function rowsToButtons(rows: { value: string; label: string }[][], prefix: string, messageId: string): InlineButton[][] {
  return rows.map((row) => row.map((b) => ({ text: b.label, callback_data: `${prefix}:${messageId}:${b.value}` })));
}

export function buildStatusButtons(messageId: string): InlineButton[][] {
  return rowsToButtons(STATUS_BUTTON_ROWS, "status", messageId);
}

export function buildMessageButtons(messageId: string): InlineButton[][] {
  return [...rowsToButtons(STATUS_BUTTON_ROWS, "status", messageId), ...rowsToButtons(MOOD_BUTTON_ROWS, "mood", messageId)];
}

export const STATUSES_REQUIRING_CONFIRMATION = ["achitat", "anulat"];

export function buildConfirmButtons(messageId: string, value: string): InlineButton[][] {
  return [
    [
      { text: "✅ Da", callback_data: `confirm:${messageId}:${value}` },
      { text: "❌ Nu", callback_data: `cancel:${messageId}` },
    ],
  ];
}
