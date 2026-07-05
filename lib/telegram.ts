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

export async function editTelegramMessage(messageId: number, text: string, buttons: InlineButton[][]): Promise<string | null> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return null;

  try {
    const res = await fetch(`${TELEGRAM_API}/bot${token}/editMessageText`, {
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
    const data = await res.json();
    if (!data.ok) {
      console.error("[telegram] editMessageText failed:", data.description, "| text length:", text.length);
      return data.description ?? "unknown error";
    }
    return null;
  } catch (e) {
    console.error("[telegram] editMessageText exception:", e);
    return String(e);
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
  const siteUrl = getSiteUrl();

  // Explicit product links built directly from the products array —
  // never depends on text matching, always present when products exist.
  const productLinks = products.length > 0
    ? products.map((p) => `<a href="${siteUrl}/produse/${encodeURI(p.slug)}">${escapeHtml(p.name)}</a>`).join("  |  ")
    : null;

  const lines = [
    `📩 <b>Mesaj nou</b>`,
    ``,
    `👤 ${escapeHtml(message.name)}`,
    `📞 ${escapeHtml(message.phone)}`,
    message.email ? `✉️ ${escapeHtml(message.email)}` : null,
    escapedMessage ? `\n${escapedMessage}` : null,
    productLinks ? `🛒 ${productLinks}` : null,
    ``,
    `🔗 Sursă: ${escapedSource}`,
    `📌 Status: <b>${escapeHtml(message.statusLabel)}</b>`,
    message.moodLabel ? `🙂 Reacție: <b>${escapeHtml(message.moodLabel)}</b>` : null,
  ].filter((l) => l !== null);
  return lines.join("\n");
}

// Updates only the status and mood lines in a previously-built Telegram HTML
// string, preserving all product links and other content unchanged.
export function updateStatusMoodInHtml(html: string, statusLabel: string, moodLabel: string | null): string {
  let updated = html.replace(
    /📌 Status: <b>[^<]*<\/b>/,
    `📌 Status: <b>${escapeHtml(statusLabel)}</b>`
  );
  const moodLine = moodLabel ? `🙂 Reacție: <b>${escapeHtml(moodLabel)}</b>` : null;
  if (moodLine) {
    if (/🙂 Reacție:/.test(updated)) {
      updated = updated.replace(/🙂 Reacție: <b>[^<]*<\/b>/, moodLine);
    } else {
      updated += "\n" + moodLine;
    }
  } else {
    updated = updated.replace(/\n🙂 Reacție: <b>[^<]*<\/b>/, "");
  }
  return updated;
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

export function buildMessageButtons(messageId: string, currentStatusLabel?: string): InlineButton[][] {
  const statusRows = rowsToButtons(STATUS_BUTTON_ROWS, "status", messageId);
  const moodRows = rowsToButtons(MOOD_BUTTON_ROWS, "mood", messageId);
  if (currentStatusLabel) {
    const indicator: InlineButton[][] = [[{ text: `📌 ${currentStatusLabel}`, callback_data: `noop:${messageId}` }]];
    return [...indicator, ...statusRows, ...moodRows];
  }
  return [...statusRows, ...moodRows];
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
