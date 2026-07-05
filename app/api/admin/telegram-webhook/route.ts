import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";

export async function POST() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const siteUrl = process.env.SITE_URL ?? "https://climatrapid.md";

  if (!token) {
    return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN not set" }, { status: 500 });
  }

  const webhookUrl = `${siteUrl}/api/telegram/webhook`;

  const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: webhookUrl,
      ...(secret ? { secret_token: secret } : {}),
    }),
  });

  const data = await res.json();
  return NextResponse.json({ webhookUrl, telegram: data });
}

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN not set" }, { status: 500 });

  const res = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
  const data = await res.json();
  return NextResponse.json(data);
}
