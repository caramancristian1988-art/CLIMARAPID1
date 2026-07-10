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

const BASE = "https://www.climatrapid.md";

function absImg(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${BASE}${url}`;
}

function buildSingleProduct(p: { name: string; slug: string; price: number; oldPrice?: number | null; image?: string | null }) {
  const img = absImg(p.image);
  return `
    <table cellpadding="0" cellspacing="0" width="100%" style="border-radius:14px;overflow:hidden;border:1px solid #eee;background:#fff;margin-bottom:24px">
      <tr>
        <td>
          ${img
            ? `<a href="${BASE}/produse/${p.slug}"><img src="${img}" alt="${p.name}" width="100%" style="display:block;width:100%;height:280px;object-fit:cover" /></a>`
            : `<div style="height:280px;background:#f5f5f5"></div>`}
        </td>
      </tr>
      <tr>
        <td style="padding:20px 24px 8px">
          <p style="margin:0 0 8px;font-size:18px;font-weight:800;color:#1a1a1a;line-height:1.3;font-family:Arial,sans-serif">${p.name}</p>
          ${p.oldPrice ? `<p style="margin:0 0 4px;font-size:13px;color:#aaa;text-decoration:line-through;font-family:Arial,sans-serif">${p.oldPrice.toLocaleString("ro-RO")} Lei</p>` : ""}
          <p style="margin:0;font-size:26px;font-weight:900;color:#c7092b;font-family:Arial,sans-serif">${p.price.toLocaleString("ro-RO")} Lei</p>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 24px 24px">
          <a href="${BASE}/produse/${p.slug}" style="display:block;text-align:center;background:#c7092b;color:#fff;font-size:15px;font-weight:700;padding:14px;border-radius:10px;text-decoration:none;font-family:Arial,sans-serif">
            Comandă acum
          </a>
        </td>
      </tr>
    </table>
  `;
}

function buildProductGrid(products: { name: string; slug: string; price: number; oldPrice?: number | null; image?: string | null }[]) {
  const cards = products.map((p) => {
    const img = absImg(p.image);
    return `
      <td width="176" valign="top" style="padding:6px">
        <table cellpadding="0" cellspacing="0" width="176" style="border-radius:12px;overflow:hidden;border:1px solid #eee;background:#fff">
          <tr>
            <td>
              ${img
                ? `<a href="${BASE}/produse/${p.slug}"><img src="${img}" alt="${p.name}" width="176" height="130" style="display:block;width:176px;height:130px;object-fit:cover" /></a>`
                : `<div style="height:130px;background:#f5f5f5"></div>`}
            </td>
          </tr>
          <tr>
            <td style="padding:10px 10px 6px">
              <p style="margin:0 0 5px;font-size:12px;font-weight:700;color:#1a1a1a;line-height:1.4;font-family:Arial,sans-serif">${p.name}</p>
              ${p.oldPrice ? `<p style="margin:0 0 2px;font-size:11px;color:#aaa;text-decoration:line-through;font-family:Arial,sans-serif">${p.oldPrice.toLocaleString("ro-RO")} Lei</p>` : ""}
              <p style="margin:0;font-size:15px;font-weight:900;color:#c7092b;font-family:Arial,sans-serif">${p.price.toLocaleString("ro-RO")} Lei</p>
            </td>
          </tr>
          <tr>
            <td style="padding:6px 10px 12px">
              <a href="${BASE}/produse/${p.slug}" style="display:block;text-align:center;background:#c7092b;color:#fff;font-size:11px;font-weight:700;padding:8px;border-radius:7px;text-decoration:none;font-family:Arial,sans-serif">
                Comandă acum
              </a>
            </td>
          </tr>
        </table>
      </td>
    `;
  });

  const rows: string[] = [];
  for (let i = 0; i < cards.length; i += 3) {
    rows.push(`<tr>${cards.slice(i, i + 3).join("")}</tr>`);
  }
  return rows.join("");
}

function buildEmail(
  subject: string,
  offerLabel: string,
  message: string,
  products: { name: string; slug: string; price: number; oldPrice?: number | null; image?: string | null }[]
) {
  const hasProducts = products.length > 0;
  const singleProduct = products.length === 1;

  return `<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:Arial,sans-serif">

  <table cellpadding="0" cellspacing="0" width="100%" style="background:#f0f2f5;padding:32px 16px">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" width="600" style="max-width:600px">

          <!-- HEADER -->
          <tr>
            <td style="background:#1d2353;border-radius:16px 16px 0 0;padding:0">
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="padding:22px 32px 0">
                    <table cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td>
                          <span style="color:#fff;font-size:22px;font-weight:900;letter-spacing:-1px;font-family:Arial,sans-serif">
                            CLIMAT <span style="color:#c7092b">RAPID</span>
                          </span>
                          <p style="margin:2px 0 0;color:rgba(255,255,255,0.45);font-size:11px;font-family:Arial,sans-serif;letter-spacing:0.5px;text-transform:uppercase">
                            Soluții complete de climatizare
                          </p>
                        </td>
                        <td align="right" valign="middle">
                          <a href="${BASE}" style="color:rgba(255,255,255,0.5);font-size:12px;text-decoration:none;font-family:Arial,sans-serif">climatrapid.md</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Hero -->
                <tr>
                  <td style="padding:28px 32px 32px">
                    ${offerLabel ? `
                    <table cellpadding="0" cellspacing="0" style="margin-bottom:14px">
                      <tr>
                        <td style="background:#c7092b;color:#fff;font-size:11px;font-weight:700;padding:5px 16px;border-radius:20px;font-family:Arial,sans-serif;letter-spacing:0.5px;text-transform:uppercase">
                          ${offerLabel}
                        </td>
                      </tr>
                    </table>
                    ` : ""}
                    <h1 style="margin:0 ${message ? "0 12px" : ""};font-size:26px;font-weight:900;color:#fff;line-height:1.2;font-family:Arial,sans-serif">
                      ${subject}
                    </h1>
                    ${message ? `<p style="margin:0;color:rgba(255,255,255,0.75);font-size:14px;line-height:1.7;font-family:Arial,sans-serif;white-space:pre-line">${message}</p>` : ""}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- RED STRIPE -->
          <tr>
            <td height="5" style="background:#c7092b;font-size:0;line-height:0">&nbsp;</td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="background:#fff;padding:32px">

              ${hasProducts ? `
              <!-- Products header -->
              <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:20px">
                <tr>
                  <td>
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="4" style="background:#c7092b;border-radius:2px">&nbsp;</td>
                        <td width="12">&nbsp;</td>
                        <td>
                          <p style="margin:0;font-size:13px;font-weight:800;color:#1a1a1a;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:0.5px">
                            ${singleProduct ? "Produs recomandat" : "Produse recomandate"}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" valign="middle">
                    <a href="${BASE}/produse" style="font-size:12px;color:#c7092b;text-decoration:none;font-weight:600;font-family:Arial,sans-serif">
                      Vezi toate →
                    </a>
                  </td>
                </tr>
              </table>

              ${singleProduct
                ? buildSingleProduct(products[0])
                : `<table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px">${buildProductGrid(products)}</table>`
              }
              ` : ""}

              <!-- CTA buttons -->
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding:8px 0 4px">
                    <a href="${BASE}/produse" style="display:inline-block;background:#c7092b;color:#fff;font-size:14px;font-weight:700;padding:14px 40px;border-radius:10px;text-decoration:none;font-family:Arial,sans-serif">
                      Explorează toate produsele
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:10px 0 0">
                    <a href="${BASE}/contact" style="display:inline-block;color:#1d2353;font-size:13px;font-weight:600;padding:10px 28px;border-radius:8px;text-decoration:none;font-family:Arial,sans-serif;border:2px solid #e8eaf0">
                      Contactează-ne pentru ofertă
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table cellpadding="0" cellspacing="0" width="100%" style="margin:28px 0 24px">
                <tr><td height="1" style="background:#f0f0f0;font-size:0;line-height:0">&nbsp;</td></tr>
              </table>

              <!-- Trust icons -->
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td width="33%" align="center" style="padding:0 8px">
                    <p style="margin:0 0 5px;font-size:22px">🌡️</p>
                    <p style="margin:0;font-size:11px;font-weight:700;color:#1a1a1a;font-family:Arial,sans-serif">Instalare profesionistă</p>
                    <p style="margin:2px 0 0;font-size:10px;color:#999;font-family:Arial,sans-serif">Echipă certificată</p>
                  </td>
                  <td width="33%" align="center" style="padding:0 8px;border-left:1px solid #f0f0f0;border-right:1px solid #f0f0f0">
                    <p style="margin:0 0 5px;font-size:22px">✅</p>
                    <p style="margin:0;font-size:11px;font-weight:700;color:#1a1a1a;font-family:Arial,sans-serif">Garanție oficială</p>
                    <p style="margin:2px 0 0;font-size:10px;color:#999;font-family:Arial,sans-serif">Producători autorizați</p>
                  </td>
                  <td width="33%" align="center" style="padding:0 8px">
                    <p style="margin:0 0 5px;font-size:22px">📞</p>
                    <p style="margin:0;font-size:11px;font-weight:700;color:#1a1a1a;font-family:Arial,sans-serif">Suport non-stop</p>
                    <p style="margin:2px 0 0;font-size:10px;color:#999;font-family:Arial,sans-serif">Răspundem rapid</p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#1d2353;border-radius:0 0 16px 16px;padding:24px 32px">
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <p style="margin:0 0 6px;color:#fff;font-size:14px;font-weight:900;font-family:Arial,sans-serif;letter-spacing:-0.5px">
                      CLIMAT <span style="color:#c7092b">RAPID</span>
                    </p>
                    <p style="margin:0;color:rgba(255,255,255,0.4);font-size:11px;font-family:Arial,sans-serif;line-height:1.6">
                      Mun. Chișinău, Moldova<br/>
                      <a href="mailto:climatrapid@gmail.com" style="color:rgba(255,255,255,0.4);text-decoration:none">climatrapid@gmail.com</a>
                    </p>
                  </td>
                  <td align="right" valign="top">
                    <a href="${BASE}" style="display:inline-block;background:rgba(255,255,255,0.1);color:#fff;font-size:11px;padding:7px 16px;border-radius:6px;text-decoration:none;font-family:Arial,sans-serif;font-weight:600">
                      Vizitează site-ul
                    </a>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-top:16px">
                    <table cellpadding="0" cellspacing="0" width="100%">
                      <tr><td height="1" style="background:rgba(255,255,255,0.1);font-size:0;line-height:0">&nbsp;</td></tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-top:14px">
                    <p style="margin:0;color:rgba(255,255,255,0.3);font-size:10px;font-family:Arial,sans-serif;line-height:1.6;text-align:center">
                      Ai primit acest email deoarece ești abonat la noutățile Climat Rapid.<br/>
                      © ${new Date().getFullYear()} Climat Rapid. Toate drepturile rezervate.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

export async function POST(req: NextRequest) {
  const { subscriberIds, productIds, subject, offerLabel, message } = await req.json();

  if (!subscriberIds?.length || !subject?.trim()) {
    return NextResponse.json({ error: "Completează subiectul" }, { status: 400 });
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

  const html = buildEmail(subject.trim(), offerLabel?.trim() || "", message?.trim() || "", products);
  const emails = subscribers.map((s) => s.email);

  try {
    await transporter.sendMail({
      from: `"Climat Rapid" <${process.env.EMAIL_FROM}>`,
      to: process.env.EMAIL_FROM,
      replyTo: process.env.EMAIL_FROM,
      bcc: emails,
      subject: subject.trim(),
      html,
      headers: {
        "List-Unsubscribe": `<mailto:${process.env.EMAIL_FROM}?subject=Dezabonare>`,
        "X-Mailer": "Climat Rapid Newsletter",
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[newsletter/send] sendMail error:", msg);
    return NextResponse.json({ error: `Eroare SMTP: ${msg}` }, { status: 500 });
  }

  return NextResponse.json({ ok: true, sent: emails.length });
}
