import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminPageHeader from "@/app/admin/components/AdminPageHeader";
import VariantForm from "../../../VariantForm";
import { createVariantAction } from "@/lib/adminProductVariantActions";

export default async function NewVariantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id }, select: { id: true, name: true } });
  if (!product) notFound();

  return (
    <div>
      <AdminPageHeader title={`Adaugă variantă — ${product.name}`} />
      <VariantForm action={createVariantAction} productId={product.id} submitLabel="Adaugă variantă" />
    </div>
  );
}
