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

function buildEmail(products: { name: string; slug: string; price: number; oldPrice?: number | null; image?: string | null }[]) {
  const BASE = "https://www.climatrapid.md";
  const cards = products
    .map(
      (p) => `
    <td style="width:180px;vertical-align:top;padding:8px">
      <a href="${BASE}/produse/${p.slug}" style="text-decoration:none;color:inherit">
        <div style="border:1px solid #f0f0f0;border-radius:10px;overflow:hidden;background:#fff">
          ${p.image ? `<img src="${p.image}" alt="${p.name}" width="180" style="display:block;width:100%;height:140px;object-fit:cover" />` : `<div style="height:140px;background:#f5f5f5"></div>`}
          <div style="padding:10px">
            <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#1a1a1a;line-height:1.3">${p.name}</p>
            ${p.oldPrice ? `<p style="margin:0;font-size:11px;color:#999;text-decoration:line-through">${p.oldPrice.toLocaleString("ro-RO")} Lei</p>` : ""}
            <p style="margin:0;font-size:15px;font-weight:700;color:#c7092b">${p.price.toLocaleString("ro-RO")} Lei</p>
          </div>
        </div>
      </a>
    </td>`
    )
    .join("");

  // split into rows of 3
  const rows: string[] = [];
  for (let i = 0; i < products.length; i += 3) {
    const slice = products.slice(i, i + 3);
    rows.push(`<tr>${slice.map((p) => cards[products.indexOf(p)]).join("")}</tr>`);
  }

  // rebuild cards correctly in rows
  const rowsHtml = products.reduce<string[]>((acc, _p, i) => {
    if (i % 3 === 0) acc.push(`<tr>${products.slice(i, i + 3).map((p2) => `
    <td style="width:180px;vertical-align:top;padding:8px">
      <a href="${BASE}/produse/${p2.slug}" style="text-decoration:none;color:inherit">
        <div style="border:1px solid #f0f0f0;border-radius:10px;overflow:hidden;background:#fff">
          ${p2.image ? `<img src="${p2.image}" alt="${p2.name}" width="180" style="display:block;width:100%;height:140px;object-fit:cover" />` : `<div style="height:140px;background:#f5f5f5"></div>`}
          <div style="padding:10px">
            <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#1a1a1a;line-height:1.3">${p2.name}</p>
            ${p2.oldPrice ? `<p style="margin:0;font-size:11px;color:#999;text-decoration:line-through">${p2.oldPrice.toLocaleString("ro-RO")} Lei</p>` : ""}
            <p style="margin:0;font-size:15px;font-weight:700;color:#c7092b">${p2.price.toLocaleString("ro-RO")} Lei</p>
          </div>
        </div>
      </a>
    </td>`).join("")}</tr>`);
    return acc;
  }, []);

  return `
    <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;background:#f8f8f8;padding:24px">
      <div style="background:#1d2353;padding:20px 24px;border-radius:10px 10px 0 0;text-align:center">
        <span style="color:#fff;font-size:20px;font-weight:900;letter-spacing:-0.5px">CLIMAT <span style="color:#c7092b">RAPID</span></span>
      </div>
      <div style="background:#fff;padding:24px;border-radius:0 0 10px 10px">
        <h2 style="margin:0 0 8px;font-size:18px;color:#1a1a1a">Oferte speciale pentru tine!</h2>
        <p style="margin:0 0 20px;color:#666;font-size:14px">Iată cele mai noi produse și oferte de climatizare:</p>
        <table cellpadding="0" cellspacing="0" style="width:100%">
          ${rowsHtml.join("")}
        </table>
        <div style="margin-top:24px;text-align:center">
          <a href="${BASE}/produse" style="display:inline-block;padding:12px 28px;background:#c7092b;color:#fff;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none">
            Vezi toate produsele
          </a>
        </div>
        <p style="margin-top:24px;font-size:11px;color:#aaa;text-align:center">
          Ai primit acest email deoarece ești abonat la noutățile Climat Rapid.<br/>
          <a href="${BASE}" style="color:#aaa">climatrapid.md</a>
        </p>
      </div>
    </div>
  `;
}

export async function POST(req: NextRequest) {
  const { subscriberIds, productIds } = await req.json();

  if (!subscriberIds?.length || !productIds?.length) {
    return NextResponse.json({ error: "Selectează abonați și produse" }, { status: 400 });
  }

  const [subscribers, products] = await Promise.all([
    prisma.newsletterSubscriber.findMany({ where: { id: { in: subscriberIds } }, select: { email: true } }),
    prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { name: true, slug: true, price: true, oldPrice: true, image: true },
    }),
  ]);

  if (!subscribers.length || !products.length) {
    return NextResponse.json({ error: "Date invalide" }, { status: 400 });
  }

  const html = buildEmail(products);
  const emails = subscribers.map((s) => s.email);

  await transporter.sendMail({
    from: `"Climat Rapid" <${process.env.EMAIL_FROM}>`,
    bcc: emails,
    subject: "Oferte speciale de la Climat Rapid 🌡️",
    html,
  });

  return NextResponse.json({ ok: true, sent: emails.length });
}
