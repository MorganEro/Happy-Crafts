// lib/server/products.ts
import prisma from '@/lib/db';
import { Prisma } from '@prisma/client';

export type ProductsPageResult = {
  items: { id: string; name: string; image: string }[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  filters: { category: string; tag: string };
};

export type RawSearchParams =
  | URLSearchParams
  | Record<string, string | string[] | undefined>;

export function pickParam(sp: RawSearchParams, key: string): string {
  if (sp instanceof URLSearchParams) return sp.get(key) ?? '';
  const v = sp[key];
  if (Array.isArray(v)) return v[0] ?? '';
  return (v as string) ?? '';
}

function safeInt(v: string, def: number) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : def;
}

/** Build a query string from a param bag (ignore undefined/empty) */
export function buildQuery(params: Record<string, string | undefined>) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v && v.length > 0) qs.set(k, v);
  }
  const s = qs.toString();
  return s ? `?${s}` : '';
}

export async function fetchProductsPage(
  sp: RawSearchParams
): Promise<ProductsPageResult> {
  const where: Prisma.ProductWhereInput = {};
  const category = pickParam(sp, 'category');
  const tag = pickParam(sp, 'tag');

  if (category) where.category = category;
  if (tag) where.tags = { has: tag };

  const page = Math.max(1, safeInt(pickParam(sp, 'page'), 1));
  const perPageRaw = safeInt(pickParam(sp, 'perPage'), 12);
  const perPage = Math.min(48, Math.max(1, perPageRaw));

  const skip = (page - 1) * perPage;

  const [items, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, image: true },
      skip,
      take: perPage,
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return {
    items,
    total,
    page,
    perPage,
    totalPages,
    filters: { category, tag },
  };
}
