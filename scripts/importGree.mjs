/**
 * Import script: Gree/Platinium/Kyato catalog from Excel
 * Run: node scripts/importGree.mjs
 */
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import XLSX from "xlsx";

const __dirname = dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

// ─── helpers ────────────────────────────────────────────────────────────────
function slug(str) {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function val(v) {
  return v !== null && v !== undefined && v !== "" ? v : null;
}

function numVal(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = parseFloat(String(v).replace(",", "."));
  return isNaN(n) ? null : n;
}

function spec(label, value) {
  if (value === null || value === undefined || value === "") return null;
  return { label, value: String(value) };
}

// ─── category mapping ────────────────────────────────────────────────────────
const CATEGORY_SLUGS = {
  "Sistem split de perete": "conditioane-rezidentiale",
  "Unitate interioară de perete": "sisteme-multisplit",
  "Unitate interioară tip casetă": "conditioane-comerciale",
  "Unitate exterioară multi-split": "sisteme-multisplit",
  "Sistem tip canal (duct)": "conditioane-comerciale",
  "Sistem tip tavan-podea": "conditioane-comerciale",
};

// ─── main ───────────────────────────────────────────────────────────────────
async function main() {
  // Load Excel
  const xlsxPath = join(__dirname, "..", "public", "Catalog_conditionere_Gree(1).xlsx");
  const wb = XLSX.readFile(xlsxPath);
  const ws = wb.Sheets["Catalog complet"];
  const rawData = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
  const allRows = rawData.slice(4).filter((r) => r[0]); // skip header rows, skip empty

  // Group by series (col 2), keep all rows per series
  const bySeries = {};
  for (const r of allRows) {
    const s = r[2];
    if (!bySeries[s]) bySeries[s] = [];
    bySeries[s].push(r);
  }

  // Load category ids
  const categories = await prisma.category.findMany({ select: { id: true, slug: true } });
  const catById = Object.fromEntries(categories.map((c) => [c.slug, c.id]));

  let created = 0;
  let skipped = 0;

  for (const [series, rows] of Object.entries(bySeries)) {
    // Take the row with the lowest price as base (or first row if no prices)
    const withPrice = rows.filter((r) => r[10] !== null && r[10] > 0);
    const baseRow = withPrice.length > 0
      ? withPrice.reduce((a, b) => (a[10] < b[10] ? a : b))
      : rows[0];

    const r = baseRow;
    const brand = val(r[30]);
    const productName = `${brand ?? ""} ${series}`.trim();
    const productSlug = slug(`${brand ?? ""}-${series}`).replace(/\s+/g, "-");
    const tipEchipament = val(r[3]) ?? "Sistem split de perete";
    const catSlug = CATEGORY_SLUGS[tipEchipament] ?? "conditioane-rezidentiale";
    const categoryId = catById[catSlug];

    if (!categoryId) {
      console.warn(`  ⚠ Category not found: ${catSlug} for ${productName}`);
      skipped++;
      continue;
    }

    // Check if already exists
    const existing = await prisma.product.findUnique({ where: { slug: productSlug } });
    if (existing) {
      console.log(`  ↩ Skip (exists): ${productName}`);
      skipped++;
      continue;
    }

    const price = r[10] ? Number(r[10]) : 1;
    const availability = r[10] ? "În stoc" : "La comandă";

    // Build specifications from technical data
    const specs = [
      spec("Tip echipament", val(r[3])),
      spec("Putere răcire", val(r[11]) ? `${r[11]} kW` : null),
      spec("Putere încălzire", val(r[13]) ? `${r[13]} kW` : null),
      spec("Consum răcire", val(r[12]) ? `${r[12]} kW` : null),
      spec("Consum încălzire", val(r[14]) ? `${r[14]} kW` : null),
      spec("Debit aer interior", val(r[15]) ? `${r[15]} m³/h` : null),
      spec("Nivel zgomot interior", val(r[16]) ? `${r[16]} dB` : null),
      spec("Traseu maxim", val(r[18]) ? `${r[18]} m` : null),
      spec("Cădere maximă", val(r[19]) ? `${r[19]} m` : null),
      spec("Conexiune", val(r[20])),
      spec("Dimensiuni bloc intern", val(r[21])),
      spec("Dimensiuni bloc extern", val(r[22])),
      spec("Greutate internă", val(r[23]) ? `${r[23]} kg` : null),
      spec("Greutate externă", val(r[24]) ? `${r[24]} kg` : null),
      spec("Temp. răcire exterior", val(r[25])),
      spec("Temp. încălzire exterior", val(r[26])),
      spec("Nr. max. blocuri", val(r[27]) ? String(r[27]) : null),
      spec("SEER", val(r[37]) ? String(r[37]) : null),
      spec("SCOP", val(r[39]) ? String(r[39]) : null),
      spec("Consum anual răcire", val(r[41]) ? `${r[41]} kWh` : null),
      spec("Consum anual încălzire", val(r[42]) ? `${r[42]} kWh` : null),
      spec("Alimentare", val(r[51])),
      spec("Debit aer exterior", val(r[63]) ? `${r[63]} m³/h` : null),
      spec("Kit instalare inclus", val(r[33])),
    ].filter(Boolean);

    // WiFi detection
    const wifiRaw = val(r[79]);
    const featuresRaw = val(r[32]);
    const hasWifi =
      wifiRaw === "Da" ||
      (featuresRaw && /wi-?fi/i.test(featuresRaw));

    const product = {
      name: productName,
      slug: productSlug,
      price,
      availability,
      btu: r[8] ? Number(r[8]) : null,
      technology: "Inverter",
      brand: brand || null,
      energyClass: val(r[9]),
      specifications: specs,
      model: val(r[6]),
      surface: r[7] ? Number(r[7]) : null,
      wifi: hasWifi ? true : null,
      features: featuresRaw,
      refrigerant: val(r[17]),
      seer: numVal(r[37]),
      scop: numVal(r[39]),
      color: val(r[4]),
      productType: val(r[3]),
      categoryId,
      installmentsEnabled: true,
    };

    await prisma.product.create({ data: product });
    console.log(`  ✓ Created: ${productName} (${price} MDL, ${r[8]} BTU, cat: ${catSlug})`);
    created++;
  }

  console.log(`\nDone: ${created} created, ${skipped} skipped.`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
