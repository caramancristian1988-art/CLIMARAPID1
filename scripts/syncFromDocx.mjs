/**
 * Reads Catalog_complet_modele_si_variante.docx, parses every variant
 * (model name, surface m², BTU, price, specs), then syncs to DB.
 *
 * Mapping Word groups → DB slug:
 *  - Gree BORA                           → gree-bora
 *  - Gree SMART                          → gree-smart
 *  - Gree COSMO                          → gree-cosmo
 *  - Gree POLAR                          → gree-polar
 *  - Gree FAIRY                          → gree-fairy   (alb)
 *  - Gree FAIRY, negru                   → gree-fairy   (with color label)
 *  - Gree AIRY                           → gree-airy
 *  - Gree CLIVIA, gri                    → gree-clivia  (primary)
 *  - Gree CLIVIA, negru                  → gree-clivia  (dedup — same prices)
 *  - Gree CLIVIA, bloc interior de perete→ gree-clivia  (labeled "bloc interior")
 *  - Gree U-CROWN, gri                   → gree-u-crown (primary)
 *  - Gree U-CROWN, auriu                 → gree-u-crown (dedup — same prices)
 *  - Gree FREAIR                         → gree-freair
 *  - Gree AMBER                          → gree-amber
 *  - Gree SOYAL                          → gree-soyal
 *  - Gree LOMO, bloc interior de perete  → gree-lomo
 *  - Gree FREE-MATCH, bloc interior      → gree-free-match  (primary 3 sizes)
 *  - Gree FREE-MATCH, bloc exterior      → skipped (separate component type)
 *  - Gree U-Match Standard, tip canal    → gree-u-match-standard (primary 8 sizes)
 *  - Gree U-Match Standard, cond. canal  → skipped
 *  - Gree U-Match Standard, tavan-podea  → skipped
 *  - Platinium GENTLE                    → platinium-gentle
 *  - Platinium NORDIC                    → platinium-nordic
 *  - Kyato                               → kyato
 *  - Platinium PureAir                   → platinium-pureair
 */
import mammoth from "mammoth";
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

// Which Word model name → DB slug, and optional label suffix / dedup flag
const MODEL_MAP = [
  { pattern: /^Gree BORA$/,                          slug: "gree-bora" },
  { pattern: /^Gree SMART$/,                         slug: "gree-smart" },
  { pattern: /^Gree COSMO$/,                         slug: "gree-cosmo" },
  { pattern: /^Gree POLAR$/,                         slug: "gree-polar" },
  { pattern: /^Gree FAIRY$/,                         slug: "gree-fairy" },
  { pattern: /^Gree FAIRY, negru$/,                  slug: "gree-fairy",         useColor: "Negru" },
  { pattern: /^Gree AIRY$/,                          slug: "gree-airy" },
  { pattern: /^Gree CLIVIA, gri$/,                   slug: "gree-clivia" },
  { pattern: /^Gree CLIVIA, negru$/,                 slug: "gree-clivia",        dedup: true },
  { pattern: /^Gree CLIVIA, bloc interior/,          slug: "gree-clivia",        suffix: " (bloc interior)" },
  { pattern: /^Gree U-CROWN, gri$/,                  slug: "gree-u-crown" },
  { pattern: /^Gree U-CROWN, auriu$/,                slug: "gree-u-crown",       dedup: true },
  { pattern: /^Gree FREAIR$/,                        slug: "gree-freair" },
  { pattern: /^Gree AMBER$/,                         slug: "gree-amber" },
  { pattern: /^Gree SOYAL$/,                         slug: "gree-soyal" },
  { pattern: /^Gree LOMO/,                           slug: "gree-lomo" },
  { pattern: /^Gree FREE-MATCH, bloc interior/,      slug: "gree-free-match" },
  { pattern: /^Gree FREE-MATCH, bloc exterior/,      skip: true },
  { pattern: /^Gree U-Match Standard, tip canal/,    slug: "gree-u-match-standard" },
  { pattern: /^Gree U-Match Standard, condiționer/,  skip: true },
  { pattern: /^Gree U-Match Standard, tip tavan/,    skip: true },
  { pattern: /^Platinium GENTLE$/,                   slug: "platinium-gentle" },
  { pattern: /^Platinium NORDIC$/,                   slug: "platinium-nordic" },
  { pattern: /^Kyato$/,                              slug: "kyato" },
  { pattern: /^Platinium PureAir$/,                  slug: "platinium-pureair" },
];

function resolveModel(name) {
  for (const m of MODEL_MAP) {
    if (m.pattern.test(name)) return m;
  }
  return null;
}

// Parse price string: "10 540 MDL" → 10540
function parsePrice(str) {
  if (!str) return null;
  const digits = str.replace(/\s/g, "").replace(/MDL/i, "").replace(/,/g, ".");
  const n = parseFloat(digits);
  return isNaN(n) ? null : Math.round(n);
}

// Parse number with comma decimal: "2,5" → 2.5
function parseNum(str) {
  if (!str) return null;
  const n = parseFloat(String(str).replace(",", "."));
  return isNaN(n) ? null : n;
}

function spec(label, value) {
  if (!value && value !== 0) return null;
  return { label, value: String(value).trim() };
}

async function main() {
  const docPath = join(__dirname, "..", "public", "Catalog_complet_modele_si_variante.docx");
  const buf = readFileSync(docPath);
  const result = await mammoth.extractRawText({ buffer: buf });
  const text = result.value;
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  // ── Parse the document into variant objects ──────────────────────────────
  // The doc repeats a pattern:
  //   "Model: <name>"
  //   "Varianta N din M: <BTU> BTU"
  //   "Cod model / configurație: <model>"
  //   "Brand: <b>   •   Gamă: <g>   •   Tip: <t>   •   Culoare: <c>   •   Varianta N din 99"
  //   Then pairs of "Specificație\nValoare\nSpecificație\nValoare\n..."
  //   Actual rows: "Suprafață (m²)\n25\nClasă energetică\nA+"   etc.

  const variants = [];
  let i = 0;

  while (i < lines.length) {
    if (lines[i].startsWith("Model: ")) {
      const modelName = lines[i].replace("Model: ", "").trim();
      i++;

      // Expect "Varianta N din M: X BTU"
      if (i >= lines.length || !lines[i].startsWith("Varianta")) { continue; }
      const variantLine = lines[i]; i++;
      const btuMatch = variantLine.match(/:\s*([\d\s]+)\s*BTU/);
      const btu = btuMatch ? parseInt(btuMatch[1].replace(/\s/g, "")) : null;

      // Cod model
      if (i >= lines.length || !lines[i].startsWith("Cod model")) { continue; }
      const codLine = lines[i]; i++;
      const codModel = codLine.replace(/^Cod model \/ configurație:\s*/,"").trim();

      // Brand line
      if (i >= lines.length || !lines[i].startsWith("Brand:")) { continue; }
      i++; // skip brand meta line

      // Skip table headers "Specificație Valoare Specificație Valoare"
      while (i < lines.length && (lines[i] === "Specificație" || lines[i] === "Valoare")) i++;

      // Collect spec key-value pairs until next "Model:" or end
      const rawSpecs = {};
      while (i < lines.length && !lines[i].startsWith("Model:") && !lines[i].startsWith("Varianta ")) {
        const key = lines[i]; i++;
        if (i < lines.length && !lines[i].startsWith("Model:") && !lines[i].startsWith("Varianta ") && !lines[i].startsWith("Specificație")) {
          rawSpecs[key] = lines[i]; i++;
        }
      }

      const surface = rawSpecs["Suprafață (m²)"] ? parseInt(rawSpecs["Suprafață (m²)"]) : null;
      const priceStr = rawSpecs["Preț (MDL)"];
      const price = parsePrice(priceStr);

      const specifications = [
        spec("Cod model", codModel),
        spec("Clasă energetică", rawSpecs["Clasă energetică"]),
        spec("Putere răcire", rawSpecs["Putere răcire (kW)"] ? `${rawSpecs["Putere răcire (kW)"]} kW` : null),
        spec("Consum răcire", rawSpecs["Consum răcire (kW)"] ? `${rawSpecs["Consum răcire (kW)"]} kW` : null),
        spec("Putere încălzire", rawSpecs["Putere încălzire (kW)"] ? `${rawSpecs["Putere încălzire (kW)"]} kW` : null),
        spec("Consum încălzire", rawSpecs["Consum încălzire (kW)"] ? `${rawSpecs["Consum încălzire (kW)"]} kW` : null),
        spec("Debit aer interior", rawSpecs["Debit aer (m³/h)"] ? `${rawSpecs["Debit aer (m³/h)"]} m³/h` : null),
        spec("Nivel zgomot", rawSpecs["Nivel zgomot (dB)"] ? `${rawSpecs["Nivel zgomot (dB)"]} dB` : null),
        spec("Agent frigorific", rawSpecs["Agent frigorific"]),
        spec("Traseu maxim", rawSpecs["Traseu max. (m)"] ? `${rawSpecs["Traseu max. (m)"]} m` : null),
        spec("Cădere maximă", rawSpecs["Cădere max. (m)"] ? `${rawSpecs["Cădere max. (m)"]} m` : null),
        spec("Conexiune", rawSpecs["Conexiune (inch)"]),
        spec("Dim. bloc intern", rawSpecs["Dim. bloc intern (mm)"]),
        spec("Dim. bloc extern", rawSpecs["Dim. bloc extern (mm)"]),
        spec("Greutate internă", rawSpecs["Greutate internă (kg)"] ? `${rawSpecs["Greutate internă (kg)"]} kg` : null),
        spec("Greutate externă", rawSpecs["Greutate externă (kg)"] ? `${rawSpecs["Greutate externă (kg)"]} kg` : null),
        spec("Temp. răcire exterior", rawSpecs["Temp. răcire (°C)"]),
        spec("Temp. încălzire exterior", rawSpecs["Temp. încălzire (°C)"]),
        spec("SEER", rawSpecs["SEER"]),
        spec("SCOP", rawSpecs["SCOP"]),
        spec("Consum anual răcire", rawSpecs["Consum anual răcire (kWh)"] ? `${rawSpecs["Consum anual răcire (kWh)"]} kWh` : null),
        spec("Consum anual încălzire", rawSpecs["Consum anual încălzire (kWh)"] ? `${rawSpecs["Consum anual încălzire (kWh)"]} kWh` : null),
        spec("Alimentare", rawSpecs["Alimentare"]),
        spec("Tip echipament", rawSpecs["Tip"]),
        spec("WiFi", rawSpecs["WiFi"] === "Da" ? "Da" : null),
      ].filter(Boolean);

      variants.push({ modelName, btu, surface, price, codModel, specifications });
    } else {
      i++;
    }
  }

  console.log(`\nParsed ${variants.length} variants from docx`);

  // ── Group variants by slug ───────────────────────────────────────────────
  const bySlug = new Map();
  for (const v of variants) {
    const rule = resolveModel(v.modelName);
    if (!rule) {
      console.log(`  ⚠ No rule for: "${v.modelName}"`);
      continue;
    }
    if (rule.skip) continue;
    if (!bySlug.has(rule.slug)) bySlug.set(rule.slug, []);
    bySlug.get(rule.slug).push({ ...v, rule });
  }

  // ── Sync to DB ───────────────────────────────────────────────────────────
  let productsUpdated = 0;
  let variantsCreated = 0;

  for (const [slug, entries] of bySlug) {
    const product = await prisma.product.findUnique({ where: { slug } });
    if (!product) {
      console.log(`  ↩ Product not found: ${slug}`);
      continue;
    }

    // Delete existing variants
    await prisma.productVariant.deleteMany({ where: { productId: product.id } });

    const seenM2Price = new Set();
    let order = 0;

    for (const entry of entries) {
      const { rule, surface, btu, price, specifications } = entry;

      // Dedup check
      if (rule.dedup) {
        const key = `${surface}|${price}`;
        if (seenM2Price.has(key)) {
          console.log(`    ↩ Dedup: ${surface}m² @ ${price}`);
          continue;
        }
      }

      const m2PriceKey = `${surface}|${price}`;
      seenM2Price.add(m2PriceKey);

      // Build label
      let baseLabel = surface ? `${surface} m²` : btu ? `${btu.toLocaleString()} BTU` : `Varianta ${order + 1}`;
      const colorPart = rule.useColor ? ` (${rule.useColor})` : "";
      const suffixPart = rule.suffix ?? "";
      const label = `${baseLabel}${colorPart}${suffixPart}`;

      const priceVal = price && price > 0 ? price : 1;
      const availability = price && price > 0 ? "În stoc" : "La comandă";
      const isDefault = order === 0;

      await prisma.productVariant.create({
        data: {
          productId: product.id,
          label,
          btu: btu ?? null,
          surface: surface ?? null,
          price: priceVal,
          oldPrice: null,
          badge: null,
          isDefault,
          order,
          availability,
          specifications,
        },
      });

      console.log(`    + ${label} — ${priceVal} MDL`);
      order++;
      variantsCreated++;
    }

    // Update product base price to first variant price
    const first = await prisma.productVariant.findFirst({
      where: { productId: product.id },
      orderBy: { order: "asc" },
    });
    if (first) {
      await prisma.product.update({
        where: { id: product.id },
        data: { price: first.price, specifications: [] },
      });
    }

    console.log(`  ✓ ${product.name}: ${order} variante`);
    productsUpdated++;
  }

  console.log(`\nDone: ${productsUpdated} produse, ${variantsCreated} variante totale`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
