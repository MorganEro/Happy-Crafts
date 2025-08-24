'use client';

import * as React from 'react';
import Image from 'next/image';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';
import { cn } from '@/lib/utils';

export type GalleryImage = {
  url: string;
  alt?: string;
};

type ProductGalleryProps = {
  images: GalleryImage[]; // first item is the primary image
  className?: string;
  imageClassName?: string;
};

export function ProductGallery({
  images,
  className,
  imageClassName,
}: ProductGalleryProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [index, setIndex] = React.useState(0);

  if (!images || images.length === 0) return null;

  const openAt = (i: number) => {
    setIndex(i);
    setIsOpen(true);
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Large image */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl ring-1 ring-border">
        <Image
          key={images[index]?.url}
          src={images[index]?.url}
          alt={images[index]?.alt ?? 'Product image'}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className={cn('object-cover cursor-zoom-in', imageClassName)}
          onClick={() => openAt(index)}
          priority
        />
        <button
          aria-label="Zoom image"
          onClick={() => openAt(index)}
          className="absolute top-3 right-3 rounded-lg bg-white/70 px-2 py-1 text-xs text-hc-asphalt hover:bg-white">
          Zoom
        </button>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {images.map((img, i) => (
            <button
              key={img.url + i}
              type="button"
              aria-label={`Show image ${i + 1}`}
              onClick={() => setIndex(i)}
              className={cn(
                'relative aspect-square overflow-hidden rounded-xl ring-1 ring-border',
                i === index
                  ? 'ring-2 ring-hc-orange ring-offset-2 ring-offset-hc-offwhite'
                  : 'hover:ring-2 hover:ring-[#7F94AD]'
              )}>
              <Image
                src={img.url}
                alt={img.alt ?? `Thumbnail ${i + 1}`}
                fill
                sizes="120px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <Lightbox
        open={isOpen}
        close={() => setIsOpen(false)}
        index={index}
        slides={images.map(im => ({ src: im.url }))}
        plugins={[Zoom]}
        controller={{
          closeOnBackdropClick: true,
          closeOnPullDown: true,
          disableSwipeNavigation: false,
        }}
        render={{
          buttonPrev: () => null,
          buttonNext: () => null,
        }}
      />
    </div>
  );
}
