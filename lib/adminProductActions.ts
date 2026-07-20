"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { requireAdmin } from "./adminAuth";

export interface ProductFormState {
  error?: string;
}

function parseImageLines(formData: FormData): string[] {
  return String(formData.get("images") ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseSpecifications(formData: FormData): { label: string; value: string }[] {
  const labels = formData.getAll("specLabel").map((v) => String(v).trim());
  const values = formData.getAll("specValue").map((v) => String(v).trim());
  const specs: { label: string; value: string }[] = [];
  for (let i = 0; i < labels.length; i++) {
    if (labels[i] && values[i]) specs.push({ label: labels[i], value: values[i] });
  }
  return specs;
}

function readProductFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const price = Number(formData.get("price") ?? 0);
  const oldPriceRaw = String(formData.get("oldPrice") ?? "").trim();
  const image = String(formData.get("image") ?? "").trim() || null;
  const images = parseImageLines(formData);
  const btuRaw = String(formData.get("btu") ?? "").trim();
  const technology = String(formData.get("technology") ?? "").trim() || "On/Off";
  const brand = String(formData.get("brand") ?? "").trim() || null;
  const energyClass = String(formData.get("energyClass") ?? "").trim() || null;
  const badge = String(formData.get("badge") ?? "").trim() || null;
  const availability = String(formData.get("availability") ?? "").trim() || "În stoc";
  const installmentsEnabled = formData.get("installmentsEnabled") === "on";
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const specifications = parseSpecifications(formData);
  const model = String(formData.get("model") ?? "").trim() || null;
  const surfaceRaw = String(formData.get("surface") ?? "").trim();
  const features = String(formData.get("features") ?? "").trim() || null;
  const refrigerant = String(formData.get("refrigerant") ?? "").trim() || null;
  const seerRaw = String(formData.get("seer") ?? "").trim();
  const scopRaw = String(formData.get("scop") ?? "").trim();
  const color = String(formData.get("color") ?? "").trim() || null;
  const productType = String(formData.get("productType") ?? "").trim() || null;
  const wifiRaw = formData.get("wifi");
  const wifi = wifiRaw === null ? null : wifiRaw === "on" || wifiRaw === "true";

  return {
    name,
    slug,
    description: description || null,
    price,
    oldPrice: oldPriceRaw ? Number(oldPriceRaw) : null,
    image,
    images,
    btu: btuRaw ? Number(btuRaw) : null,
    technology,
    brand,
    energyClass,
    badge,
    availability,
    installmentsEnabled,
    categoryId,
    specifications,
    model,
    surface: surfaceRaw ? Number(surfaceRaw) : null,
    features,
    refrigerant,
    seer: seerRaw ? Number(seerRaw) : null,
    scop: scopRaw ? Number(scopRaw) : null,
    color,
    productType,
    wifi,
  };
}

export async function createProductAction(_prevState: ProductFormState, formData: FormData): Promise<ProductFormState> {
  await requireAdmin();

  const data = readProductFields(formData);
  if (!data.name) return { error: "Completează numele produsului." };
  if (!data.slug) return { error: "Completează slug-ul." };
  if (!data.price || data.price <= 0) return { error: "Introdu un preț valid." };
  if (!data.categoryId) return { error: "Selectează o categorie." };

  const existing = await prisma.product.findUnique({ where: { slug: data.slug } });
  if (existing) return { error: "Există deja un produs cu acest slug." };

  await prisma.product.create({ data });
  revalidatePath("/admin/produse");
  revalidatePath("/produse");
  revalidatePath(`/produse/${data.slug}`);
  redirect("/admin/produse");
}

export async function updateProductAction(_prevState: ProductFormState, formData: FormData): Promise<ProductFormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const data = readProductFields(formData);

  if (!id) return { error: "Produs invalid." };
  if (!data.name) return { error: "Completează numele produsului." };
  if (!data.slug) return { error: "Completează slug-ul." };
  if (!data.price || data.price <= 0) return { error: "Introdu un preț valid." };
  if (!data.categoryId) return { error: "Selectează o categorie." };

  const existing = await prisma.product.findUnique({ where: { slug: data.slug } });
  if (existing && existing.id !== id) return { error: "Există deja un produs cu acest slug." };

  await prisma.product.update({ where: { id }, data });
  revalidatePath("/admin/produse");
  revalidatePath("/produse");
  revalidatePath(`/produse/${data.slug}`);
  redirect("/admin/produse");
}

export async function deleteProductAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const product = await prisma.product.findUnique({ where: { id }, select: { slug: true } });
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/produse");
  revalidatePath("/produse");
  if (product?.slug) revalidatePath(`/produse/${product.slug}`);
}
