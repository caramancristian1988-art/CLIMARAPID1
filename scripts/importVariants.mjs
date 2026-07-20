/**
 * Import product variants from Excel — one ProductVariant per row.
 * Run: node scripts/importVariants.mjs
 *
 * Strategy per series:
 * - FAIRY grp5(Alb) + grp7(Negru): different prices → label with color
 * - CLIVIA grp8A(Gri) + grp8B(Negru): same prices → deduplicate; grp14(bloc interior): labeled
 * - U-CROWN grp9(Gri) + grp11(Auriu): same prices → deduplicate
 * - FREE-MATCH grp16(casetă interior) + grp17(exterior multi-split): labeled by type
 * - U-Match Standard grp18(duct) + grp19(duct PS) + grp20(tavan-podea): labeled by type
 */
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import XLSX from "xlsx";

const __dirname = dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function v(val) {
  return val !== null && val !== undefined && val !== "" ? val : null;
}

function spec(label, value) {
  if (value === null || value === undefined || value === "") return null;
  return { label, value: String(value).trim() };
}

function buildSpecs(r) {
  return [
    spec("Tip echipament", v(r[3])),
    spec("Cod model", v(r[6])),
    spec("Clasă energetică", v(r[9])),
    spec("Putere răcire", v(r[11]) ? `${r[11]} kW` : null),
    spec("Consum răcire", v(r[12]) ? `${r[12]} kW` : null),
    spec("Putere încălzire", v(r[13]) ? `${r[13]} kW` : null),
    spec("Consum încălzire", v(r[14]) ? `${r[14]} kW` : null),
    spec("Debit aer interior", v(r[15]) ? `${r[15]} m³/h` : null),
    spec("Nivel zgomot", v(r[16]) ? `${r[16]} dB` : null),
    spec("Agent frigorific", v(r[17])),
    spec("Traseu maxim", v(r[18]) ? `${r[18]} m` : null),
    spec("Cădere maximă", v(r[19]) ? `${r[19]} m` : null),
    spec("Conexiune", v(r[20])),
    spec("Dim. bloc intern", v(r[21])),
    spec("Dim. bloc extern", v(r[22])),
    spec("Greutate internă", v(r[23]) ? `${r[23]} kg` : null),
    spec("Greutate externă", v(r[24]) ? `${r[24]} kg` : null),
    spec("Temp. răcire exterior", v(r[25])),
    spec("Temp. încălzire exterior", v(r[26])),
    spec("SEER", v(r[37]) ? String(r[37]) : null),
    spec("SCOP", v(r[39]) ? String(r[39]) : null),
    spec("Consum anual răcire", v(r[41]) ? `${r[41]} kWh` : null),
    spec("Consum anual încălzire", v(r[42]) ? `${r[42]} kWh` : null),
    spec("Alimentare", v(r[51])),
    spec("Debit aer exterior", v(r[65]) ? `${r[65]} m³/h` : null),
    spec("WiFi", v(r[81]) === "Da" ? "Da" : null),
  ].filter(Boolean);
}

// Returns a label suffix for color if non-standard (not Alb / —)
function colorSuffix(culoare) {
  if (!culoare || culoare === "Alb" || culoare === "—") return "";
  return ` (${culoare})`;
}

// Map (series|grp) → { slug, labelSuffix, dedup }
// dedup: true means skip rows where same m² already imported at same price
const GROUP_RULES = {
  "BORA|1":   { slug: "gree-bora" },
  "SMART|2":  { slug: "gree-smart" },
  "COSMO|3":  { slug: "gree-cosmo" },
  "POLAR|4":  { slug: "gree-polar" },
  "FAIRY|5":  { slug: "gree-fairy" },
  "FAIRY|7":  { slug: "gree-fairy", useColor: true }, // Negru, higher price
  "AIRY|6":   { slug: "gree-airy" },
  "CLIVIA|8A": { slug: "gree-clivia" },
  "CLIVIA|8B": { slug: "gree-clivia", dedup: true },  // same prices as 8A → skip dups
  "CLIVIA|14": { slug: "gree-clivia", labelSuffix: " (bloc interior)" },
  "U-CROWN|9":  { slug: "gree-u-crown" },
  "U-CROWN|11": { slug: "gree-u-crown", dedup: true }, // same prices → skip dups
  "FREAIR|10":  { slug: "gree-freair" },
  "AMBER|12":   { slug: "gree-amber" },
  "SOYAL|13":   { slug: "gree-soyal" },
  "LOMO|15":    { slug: "gree-lomo" },
  "FREE-MATCH|16": { slug: "gree-free-match" },        // cassette interior — main product
  // FREE-MATCH|17 (exterior multi-split) excluded: separate component, confuses variants
  "U-Match Standard|18": { slug: "gree-u-match-standard" }, // duct standard — main type
  // U-Match Standard|19 (duct PS) and |20 (tavan-podea) excluded: separate product types
  "GENTLE|P1":  { slug: "platinium-gentle" },
  "NORDIC|P2":  { slug: "platinium-nordic" },
  "Kyato|P3":   { slug: "kyato" },
  "PureAir|P4": { slug: "platinium-pureair" },
};

async function main() {
  const xlsxPath = join(__dirname, "..", "public", "Catalog_conditionere_Gree(1).xlsx");
  const wb = XLSX.readFile(xlsxPath);
  const ws = wb.Sheets["Catalog complet"];
  const rawData = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
  const allRows = rawData.slice(4).filter((r) => r[0]);

  // Group by (series|grp) maintaining insertion order
  const byGroup = new Map();
  for (const r of allRows) {
    const series = r[2];
    const grp = String(r[1]);
    if (!series || !grp) continue;
    const key = `${series}|${grp}`;
    if (!GROUP_RULES[key]) {
      console.log(`  ⚠ Unknown group key: ${key} — skipping`);
      continue;
    }
    if (!byGroup.has(key)) byGroup.set(key, []);
    byGroup.get(key).push(r);
  }

  // Collect all rows per slug, respecting dedup/suffix rules
  const bySlug = new Map();
  for (const [key, rows] of byGroup) {
    const rule = GROUP_RULES[key];
    const { slug, labelSuffix = "", useColor = false, useBtuLabel = false, dedup = false } = rule;
    if (!bySlug.has(slug)) bySlug.set(slug, []);
    bySlug.get(slug).push({ rows, labelSuffix, useColor, useBtuLabel, dedup });
  }

  let updated = 0;
  let skipped = 0;
  let variantsCreated = 0;

  for (const [slug, groups] of bySlug) {
    const product = await prisma.product.findUnique({ where: { slug } });
    if (!product) {
      console.log(`  ↩ Skip (not found in DB): ${slug}`);
      skipped++;
      continue;
    }

    // Delete existing variants
    await prisma.productVariant.deleteMany({ where: { productId: product.id } });

    let order = 0;
    // Track seen m² per price for dedup: key = `${m2}|${price}` → true
    const seenM2Price = new Set();
    let firstVariantIsDefault = true;

    for (const { rows, labelSuffix, useColor, useBtuLabel, dedup } of groups) {
      // Sort rows by BTU ascending
      const sorted = [...rows].sort((a, b) => (a[8] ?? 0) - (b[8] ?? 0));

      for (const r of sorted) {
        const surface = v(r[7]);
        const btu = v(r[8]);
        const culoare = v(r[4]);
        const price = r[10] && r[10] > 0 ? Number(r[10]) : 1;
        const availability = r[10] && r[10] > 0 ? "În stoc" : "La comandă";

        // Dedup check: skip if same m² + same price already added
        if (dedup) {
          const dedupKey = `${surface}|${price}`;
          if (seenM2Price.has(dedupKey)) {
            console.log(`    ↩ Dedup skip: ${surface}m² @ ${price} MDL`);
            continue;
          }
        }

        // Build label
        let baseLabel;
        if (useBtuLabel && btu) {
          baseLabel = `${btu.toLocaleString()} BTU`;
        } else if (surface) {
          baseLabel = `${surface} m²`;
        } else if (btu) {
          baseLabel = `${Number(btu).toLocaleString()} BTU`;
        } else {
          baseLabel = v(r[6]) ?? `Varianta ${order + 1}`;
        }

        const colorPart = useColor ? colorSuffix(culoare) : "";
        const label = `${baseLabel}${colorPart}${labelSuffix}`;

        const m2PriceKey = `${surface}|${price}`;
        seenM2Price.add(m2PriceKey);

        const isDefault = order === 0;
        const specs = buildSpecs(r);

        await prisma.productVariant.create({
          data: {
            productId: product.id,
            label,
            btu: btu ? Number(btu) : null,
            surface: surface ? Number(surface) : null,
            price,
            oldPrice: null,
            badge: null,
            isDefault,
            order,
            availability,
            specifications: specs,
          },
        });

        console.log(`    + ${label} — ${price} MDL (${availability})`);
        order++;
        variantsCreated++;
      }
    }

    // Update product base price to price of first (default) variant
    const firstVariant = await prisma.productVariant.findFirst({
      where: { productId: product.id },
      orderBy: { order: "asc" },
    });
    if (firstVariant) {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          price: firstVariant.price,
          specifications: [],
        },
      });
    }

    console.log(`  ✓ ${product.name}: ${order} variante create`);
    updated++;
  }

  console.log(`\nDone: ${updated} produse actualizate, ${variantsCreated} variante create, ${skipped} sărite.`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
