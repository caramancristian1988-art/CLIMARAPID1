import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminPageHeader from "@/app/admin/components/AdminPageHeader";
import VariantForm from "../../../VariantForm";
import { updateVariantAction } from "@/lib/adminProductVariantActions";

export default async function EditVariantPage({
  params,
}: {
  params: Promise<{ id: string; variantId: string }>;
}) {
  const { id, variantId } = await params;
  const [product, variant] = await Promise.all([
    prisma.product.findUnique({ where: { id }, select: { id: true, name: true } }),
    prisma.productVariant.findUnique({ where: { id: variantId } }),
  ]);
  if (!product || !variant) notFound();

  return (
    <div>
      <AdminPageHeader title={`Editează variantă — ${product.name}`} />
      <VariantForm
        action={updateVariantAction}
        productId={product.id}
        defaults={variant}
        submitLabel="Salvează modificările"
      />
    </div>
  );
}
