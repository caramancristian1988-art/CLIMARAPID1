import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const OBJECT_ID_RE = /^[a-f\d]{24}$/i;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const search = searchParams.get("search") || "";
  const categoryId = searchParams.get("categoryId") || "";
  const brand = searchParams.get("brand") || "";
  const limit = 9;
  const skip = (page - 1) * limit;

  const searchFilter = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          ...(OBJECT_ID_RE.test(search) ? [{ id: search }] : []),
        ],
      }
    : {};

  const where = {
    ...searchFilter,
    ...(categoryId ? { categoryId } : {}),
    ...(brand ? { brand } : {}),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, slug: true, price: true, oldPrice: true, image: true, brand: true, categoryId: true },
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({ products, total, pages: Math.ceil(total / limit) });
}
