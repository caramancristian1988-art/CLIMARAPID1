/**
 * Import product variants from Excel — one ProductVariant per row.
 * Run: node scripts/importVariants.mjs
 *
 * For each series (product), deletes existing variants and re-creates them
 * from every row in the Excel, with per-variant specs and prices.
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

async function main() {
  const xlsxPath = join(__dirname, "..", "public", "Catalog_conditionere_Gree(1).xlsx");
  const wb = XLSX.readFile(xlsxPath);
  const ws = wb.Sheets["Catalog complet"];
  const rawData = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
  const allRows = rawData.slice(4).filter((r) => r[0]); // skip headers, skip empty

  // Group by series name (col 2)
  const bySeries = {};
  for (const r of allRows) {
    const s = r[2];
    if (!s) continue;
    if (!bySeries[s]) bySeries[s] = [];
    bySeries[s].push(r);
  }

  let updated = 0;
  let skipped = 0;
  let variantsCreated = 0;

  for (const [series, rows] of Object.entries(bySeries)) {
    const r0 = rows[0];
    const brand = v(r0[30]);
    // "Kyato Kyato" was renamed to "Kyato" post-import
    const rawSlug = slugify(`${brand ?? ""}-${series}`).replace(/\s+/g, "-");
    const productSlug = rawSlug === "kyato-kyato" ? "kyato" : rawSlug;

    const product = await prisma.product.findUnique({ where: { slug: productSlug } });
    if (!product) {
      console.log(`  ↩ Skip (not found in DB): ${productSlug}`);
      skipped++;
      continue;
    }

    // Delete existing variants
    await prisma.productVariant.deleteMany({ where: { productId: product.id } });

    // Sort rows by BTU ascending so smallest capacity is first
    const sorted = [...rows].sort((a, b) => (a[8] ?? 0) - (b[8] ?? 0));

    // Find cheapest priced row for default
    const withPrice = sorted.filter((r) => r[10] && r[10] > 0);
    const cheapestPrice = withPrice.length > 0
      ? Math.min(...withPrice.map((r) => r[10]))
      : null;

    let order = 0;
    let productPriceBase = cheapestPrice ?? 1;

    for (const r of sorted) {
      const surface = v(r[7]);
      const btu = v(r[8]);
      const price = r[10] && r[10] > 0 ? Number(r[10]) : 1;
      const availability = r[10] && r[10] > 0 ? "În stoc" : "La comandă";

      // Label: prefer "X m²", fallback to "XBTU BTU"
      const label = surface
        ? `${surface} m²`
        : btu
        ? `${btu.toLocaleString()} BTU`
        : v(r[6]) ?? `Varianta ${order + 1}`;

      // isDefault: first variant with price (lowest BTU)
      const isDefault = order === 0;

      // Per-variant technical specifications
      const specs = [
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

      console.log(`    + Variantă: ${label} — ${price} MDL (${availability})`);
      order++;
      variantsCreated++;
    }

    // Update product base price to cheapest variant price
    // and clear the mixed-up specifications (variants have their own specs now)
    await prisma.product.update({
      where: { id: product.id },
      data: {
        price: productPriceBase,
        specifications: [], // cleared — specs are now per-variant
      },
    });

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
