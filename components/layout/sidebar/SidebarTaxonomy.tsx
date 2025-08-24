'use client';

import { PRODUCT_CATEGORIES, PRODUCT_TAGS } from '@/lib/constants';
import { categoryToSlug, tagToSlug } from '@/lib/slug';
import { Folder, Tag } from 'lucide-react';
import CollapsibleSection from './CollapsibleSection';

export default function SidebarTaxonomy() {
  const tags = [...PRODUCT_TAGS].sort((a, b) => a.localeCompare(b));
  const categories = [...PRODUCT_CATEGORIES].sort((a, b) => a.localeCompare(b));

  return (
    <>
      <CollapsibleSection
        icon={<Folder className="h-5 w-5" />}
        title="Categories"
        items={categories.map(c => ({
          href: `/products/categories/${categoryToSlug(c)}`,
          label: c,
        }))}
        defaultOpen={false}
      />

      <CollapsibleSection
        icon={<Tag className="h-5 w-5" />}
        title="Tags"
        items={tags.map(t => ({
          href: `/products/tags/${tagToSlug(t)}`,
          label: t,
        }))}
        defaultOpen={false}
      />
    </>
  );
}
