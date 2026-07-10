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

function buildEmail(
  subject: string,
  offerLabel: string,
  message: string,
  products: { name: string; slug: string; price: number; oldPrice?: number | null; image?: string | null }[]
) {
  const BASE = "https://www.climatrapid.md";

  const productRows = products.reduce<string[]>((acc, _p, i) => {
    if (i % 3 === 0) {
      const slice = products.slice(i, i + 3);
      acc.push(`
        <tr>
          ${slice.map((p) => `
            <td style="width:33%;vertical-align:top;padding:6px">
              <a href="${BASE}/produse/${p.slug}" style="text-decoration:none;color:inherit;display:block">
                <div style="border:1px solid #f0f0f0;border-radius:10px;overflow:hidden;background:#fff">
                  ${p.image
                    ? `<img src="${p.image}" alt="${p.name}" width="100%" style="display:block;height:130px;object-fit:cover" />`
                    : `<div style="height:130px;background:#f5f5f5"></div>`
                  }
                  <div style="padding:10px">
                    <p style="margin:0 0 5px;font-size:12px;font-weight:600;color:#1a1a1a;line-height:1.3">${p.name}</p>
                    ${p.oldPrice ? `<p style="margin:0;font-size:11px;color:#999;text-decoration:line-through">${p.oldPrice.toLocaleString("ro-RO")} Lei</p>` : ""}
                    <p style="margin:2px 0 0;font-size:15px;font-weight:700;color:#c7092b">${p.price.toLocaleString("ro-RO")} Lei</p>
                  </div>
                </div>
              </a>
            </td>
          `).join("")}
        </tr>
      `);
    }
    return acc;
  }, []);

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8f8f8;padding:24px">
      <!-- Header -->
      <div style="background:#1d2353;padding:18px 24px;border-radius:10px 10px 0 0;text-align:center">
        <span style="color:#fff;font-size:20px;font-weight:900;letter-spacing:-0.5px">CLIMAT <span style="color:#c7092b">RAPID</span></span>
      </div>

      <!-- Body -->
      <div style="background:#fff;padding:28px 24px;border-radius:0 0 10px 10px">

        ${offerLabel ? `
        <div style="display:inline-block;background:#fdf2f3;border:1px solid #f5c6cb;color:#c7092b;font-size:12px;font-weight:700;padding:5px 14px;border-radius:20px;margin-bottom:16px">
          ${offerLabel}
        </div>
        ` : ""}

        <h2 style="margin:0 0 12px;font-size:20px;color:#1a1a1a;font-weight:800">${subject}</h2>

        <p style="margin:0 0 24px;color:#555;font-size:14px;line-height:1.7;white-space:pre-line">${message}</p>

        ${products.length > 0 ? `
        <div style="margin-bottom:24px">
          <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#1a1a1a;text-transform:uppercase;letter-spacing:0.5px">Produse recomandate</p>
          <table cellpadding="0" cellspacing="0" style="width:100%">
            ${productRows.join("")}
          </table>
        </div>
        ` : ""}

        <div style="text-align:center;margin-top:24px">
          <a href="${BASE}/produse" style="display:inline-block;padding:12px 32px;background:#c7092b;color:#fff;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none">
            Vezi toate produsele
          </a>
        </div>

        <p style="margin-top:28px;font-size:11px;color:#bbb;text-align:center;line-height:1.6">
          Ai primit acest email deoarece ești abonat la noutățile Climat Rapid.<br/>
          <a href="${BASE}" style="color:#bbb">climatrapid.md</a>
        </p>
      </div>
    </div>
  `;
}

export async function POST(req: NextRequest) {
  const { subscriberIds, productIds, subject, offerLabel, message } = await req.json();

  if (!subscriberIds?.length || !subject?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Completează subiectul și mesajul" }, { status: 400 });
  }

  const [subscribers, products] = await Promise.all([
    prisma.newsletterSubscriber.findMany({ where: { id: { in: subscriberIds } }, select: { email: true } }),
    productIds?.length
      ? prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { name: true, slug: true, price: true, oldPrice: true, image: true },
        })
      : Promise.resolve([]),
  ]);

  if (!subscribers.length) {
    return NextResponse.json({ error: "Niciun abonat valid" }, { status: 400 });
  }

  const html = buildEmail(subject.trim(), offerLabel?.trim() || "", message.trim(), products);
  const emails = subscribers.map((s) => s.email);

  await transporter.sendMail({
    from: `"Climat Rapid" <${process.env.EMAIL_FROM}>`,
    bcc: emails,
    subject: subject.trim(),
    html,
  });

  return NextResponse.json({ ok: true, sent: emails.length });
}
