import { PRODUCT_TAGS, type ProductTag } from '@/lib/constants';
import { PRODUCT_CATEGORIES } from '@/lib/constants';

/** Slugify a category for the URL (lowercase, spaces/punctuation -> -) */
export function categoryToSlug(category: string): string {
  return category
    .toLowerCase()
    .trim()
    .replace(/[/]/g, ' ') // treat slash as space for nicer slugs
    .replace(/[^a-z0-9\s-]/g, '') // drop other punctuation
    .replace(/\s+/g, '-') // spaces -> dashes
    .replace(/-+/g, '-'); // collapse repeats
}

/** Find the original category from a slug (strict match against known list) */
export function slugToCategory(slug: string): string | null {
  const normalized = slug.toLowerCase();
  for (const c of PRODUCT_CATEGORIES) {
    if (categoryToSlug(c) === normalized) return c;
  }
  return null;
}

export function tagToSlug(tag: string): string {
  return tag
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/['’]/g, '') // drop apostrophes
    .replace(/[^a-z0-9\s-]/g, '') // drop other punctuation
    .replace(/\s+/g, '-') // spaces -> dashes
    .replace(/-+/g, '-'); // collapse repeats
}

export function slugToTag(slug: string): ProductTag | null {
  const normalized = slug.toLowerCase();
  for (const t of PRODUCT_TAGS) {
    if (tagToSlug(t) === normalized) return t;
  }
  return null;
}
