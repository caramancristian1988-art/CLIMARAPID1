import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

const TG = "https://api.telegram.org";

export async function POST(request: Request) {
  try { await requireAdmin(); } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;

  if (!token) return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN not set" }, { status: 500 });

  // Allow overriding the base URL via request body: { "siteUrl": "https://www.climatrapid.md" }
  let siteUrl = process.env.SITE_URL ?? "https://climatrapid.md";
  try {
    const body = await request.json().catch(() => ({}));
    if (body?.siteUrl) siteUrl = String(body.siteUrl).replace(/\/$/, "");
  } catch { /* use default */ }

  const webhookUrl = `${siteUrl}/api/telegram/webhook`;
  const body: Record<string, string> = { url: webhookUrl };
  if (secret) body.secret_token = secret;

  const res = await fetch(`${TG}/bot${token}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json({ webhookUrl, telegram: data });
}

export async function GET() {
  try { await requireAdmin(); } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const siteUrl = process.env.SITE_URL ?? "https://climatrapid.md";

  if (!token) return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN not set" }, { status: 500 });

  // Check webhook info from Telegram
  const webhookRes = await fetch(`${TG}/bot${token}/getWebhookInfo`);
  const webhookInfo = await webhookRes.json();

  // Check DB connectivity + last message
  let dbStatus = "ok";
  let lastMessage: { id: string; status: string; telegramMessageId: number | null } | null = null;
  try {
    lastMessage = await prisma.contactMessage.findFirst({
      orderBy: { createdAt: "desc" },
      select: { id: true, status: true, telegramMessageId: true, productIds: true, source: true },
    });
  } catch (e) {
    dbStatus = String(e);
  }

  return NextResponse.json({
    siteUrl,
    webhookUrl: `${siteUrl}/api/telegram/webhook`,
    hasSecret: !!process.env.TELEGRAM_WEBHOOK_SECRET,
    telegram: webhookInfo,
    db: { status: dbStatus, lastMessage },
  });
}
