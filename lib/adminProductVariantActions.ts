"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { requireAdmin } from "./adminAuth";

export interface VariantFormState {
  error?: string;
}

function parseVariantSpecs(formData: FormData): { label: string; value: string }[] {
  const labels = formData.getAll("specLabel").map((v) => String(v).trim());
  const values = formData.getAll("specValue").map((v) => String(v).trim());
  const specs: { label: string; value: string }[] = [];
  for (let i = 0; i < labels.length; i++) {
    if (labels[i] && values[i]) specs.push({ label: labels[i], value: values[i] });
  }
  return specs;
}

function readVariantFields(formData: FormData) {
  const label = String(formData.get("label") ?? "").trim();
  const price = Number(formData.get("price") ?? 0);
  const btuRaw = String(formData.get("btu") ?? "").trim();
  const surfaceRaw = String(formData.get("surface") ?? "").trim();
  const oldPriceRaw = String(formData.get("oldPrice") ?? "").trim();
  const badge = String(formData.get("badge") ?? "").trim() || null;
  const orderRaw = String(formData.get("order") ?? "0").trim();
  const availability = String(formData.get("availability") ?? "În stoc").trim() || "În stoc";
  const isDefault = formData.get("isDefault") === "on";
  const specifications = parseVariantSpecs(formData);

  return {
    label,
    price,
    oldPrice: oldPriceRaw ? Number(oldPriceRaw) : null,
    btu: btuRaw ? Number(btuRaw) : null,
    surface: surfaceRaw ? Number(surfaceRaw) : null,
    badge,
    order: orderRaw ? Number(orderRaw) : 0,
    availability,
    isDefault,
    specifications,
  };
}

export async function createVariantAction(
  _prevState: VariantFormState,
  formData: FormData
): Promise<VariantFormState> {
  await requireAdmin();

  const productId = String(formData.get("productId") ?? "").trim();
  if (!productId) return { error: "Produs invalid." };

  const data = readVariantFields(formData);
  if (!data.label) return { error: "Completează eticheta variantei (ex: 25 m²)." };
  if (!data.price || data.price <= 0) return { error: "Introdu un preț valid." };

  if (data.isDefault) {
    await prisma.productVariant.updateMany({ where: { productId }, data: { isDefault: false } });
  }

  await prisma.productVariant.create({ data: { productId, ...data } });

  const product = await prisma.product.findUnique({ where: { id: productId }, select: { slug: true } });
  if (product?.slug) revalidatePath(`/produse/${product.slug}`);
  revalidatePath(`/admin/produse/${productId}`);
  redirect(`/admin/produse/${productId}`);
}

export async function updateVariantAction(
  _prevState: VariantFormState,
  formData: FormData
): Promise<VariantFormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const productId = String(formData.get("productId") ?? "").trim();
  if (!id) return { error: "Variantă invalidă." };

  const data = readVariantFields(formData);
  if (!data.label) return { error: "Completează eticheta variantei." };
  if (!data.price || data.price <= 0) return { error: "Introdu un preț valid." };

  if (data.isDefault) {
    await prisma.productVariant.updateMany({ where: { productId }, data: { isDefault: false } });
  }

  await prisma.productVariant.update({ where: { id }, data });

  const product = await prisma.product.findUnique({ where: { id: productId }, select: { slug: true } });
  if (product?.slug) revalidatePath(`/produse/${product.slug}`);
  revalidatePath(`/admin/produse/${productId}`);
  redirect(`/admin/produse/${productId}`);
}

export async function deleteVariantAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const variant = await prisma.productVariant.findUnique({ where: { id }, select: { productId: true } });
  await prisma.productVariant.delete({ where: { id } });
  if (variant?.productId) {
    const product = await prisma.product.findUnique({ where: { id: variant.productId }, select: { slug: true } });
    if (product?.slug) revalidatePath(`/produse/${product.slug}`);
    revalidatePath(`/admin/produse/${variant.productId}`);
  }
}
