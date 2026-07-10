import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Email invalid" }, { status: 400 });
  }

  try {
    await prisma.newsletterSubscriber.create({ data: { email } });
  } catch {
    return NextResponse.json({ error: "Ești deja abonat" }, { status: 409 });
  }

  await transporter.sendMail({
    from: `"Climat Rapid" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Te-ai abonat la noutățile Climat Rapid!",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#fff;border-radius:12px">
        <h2 style="color:#c7092b;margin:0 0 16px">Bun venit la Climat Rapid!</h2>
        <p style="color:#333;line-height:1.6">Felicitări! Te-ai abonat cu succes la noutățile noastre.</p>
        <p style="color:#333;line-height:1.6">Vei fi primul care află despre cele mai noi oferte, promoții și produse de climatizare.</p>
        <div style="margin:24px 0;padding:16px;background:#fdf2f3;border-radius:8px;border-left:4px solid #c7092b">
          <p style="margin:0;color:#c7092b;font-weight:bold">Climat Rapid — Soluții complete de climatizare în Moldova</p>
        </div>
        <p style="color:#666;font-size:13px">Dacă nu ai solicitat această abonare, poți ignora acest mesaj.</p>
      </div>
    `,
  }).catch(() => {});

  return NextResponse.json({ ok: true });
}
