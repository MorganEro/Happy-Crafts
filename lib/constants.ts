// List of allowed product tags
export const PRODUCT_TAGS = [
  'wedding',
  'birthday',
  'travel',
  'gifts',
  'baby',
  'pet',
  'cancer',
  'christmas',
  'bridal shower',
  'girls trip',
  'buttons',
  'glass etching',
  'color-changing',
  'love',
  'meal prep',
  'personalized',
  'letter',
  'name',
  'couple',
  'custom',
  'family',
  'easy plant',
  'monogram',
  'happy',
  'mom',
  'dad',
  'coffee',
  "mother's day",
  "father's day",
  'milestone',
  'vintage',
  'retirement',
  'holiday',
  'pride',
] as const;

// Type for the product tags
export type ProductTag = (typeof PRODUCT_TAGS)[number];

// Type guard to check if a string is a valid product tag
export function isProductTag(tag: string): tag is ProductTag {
  return (PRODUCT_TAGS as readonly string[]).includes(tag);
}

export const PRODUCT_CATEGORIES = [
  'wine-Champagne glasses and tumblers',
  'whiskey and pint glasses',
  'tumblers',
  'button art',
  'christmas ornaments',
  'other',
] as const;

// Type for the product categories
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

// Type guard to check if a string is a valid product category
export function isProductCategory(
  category: string
): category is ProductCategory {
  return (PRODUCT_CATEGORIES as readonly string[]).includes(category);
}
