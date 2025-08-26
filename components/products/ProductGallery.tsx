'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';
import * as React from 'react';
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';

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
  const count = images.length;
  const goPrev = React.useCallback(
    () => setIndex(i => (i - 1 + count) % count),
    [count]
  );
  const goNext = React.useCallback(
    () => setIndex(i => (i + 1) % count),
    [count]
  );
  const openAt = (i: number) => {
    setIndex(i);
    setIsOpen(true);
  };
  const containerRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      }
    };
    el.addEventListener('keydown', onKey);
    return () => el.removeEventListener('keydown', onKey);
  }, [count, containerRef, goPrev, goNext]);

  if (!images || images.length === 0) return null;

  // Keyboard left/right when container is focused

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className={cn('w-full focus:outline-none', className)}
      aria-label="Product image gallery">
      {/* Large image */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl ring-1 ring-border group">
        <Image
          key={images[index]?.url}
          src={images[index]?.url}
          alt={images[index]?.alt ?? 'Product image'}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className={cn(
            'object-cover cursor-zoom-in select-none',
            imageClassName
          )}
          onClick={() => openAt(index)}
          priority
        />

        {/* Prev / Next arrows */}
        {count > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={e => {
                e.stopPropagation();
                goPrev();
              }}
              className={cn(
                'absolute left-2 top-1/2 -translate-y-1/2',
                'rounded-full px-2 py-2 text-sm',
                'bg-white/80 text-hc-asphalt ring-1 ring-border',
                'hover:bg-white focus:bg-white',
                'transition-opacity opacity-100 sm:opacity-0 sm:group-hover:opacity-100'
              )}>
              <MdArrowBackIos />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={e => {
                e.stopPropagation();
                goNext();
              }}
              className={cn(
                'absolute right-2 top-1/2 -translate-y-1/2',
                'rounded-full px-2 py-2 text-sm',
                'bg-white/80 text-hc-asphalt ring-1 ring-border',
                'hover:bg-white focus:bg-white',
                'transition-opacity opacity-100 sm:opacity-0 sm:group-hover:opacity-100'
              )}>
              <MdArrowForwardIos />
            </button>
          </>
        )}

        <button
          aria-label="Zoom image"
          onClick={() => openAt(index)}
          className="absolute top-3 right-3 rounded-lg bg-hc-offwhite/50 px-2 py-1 text-xs text-hc-asphalt ring-1 ring-border hover:bg-hc-offwhite">
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

      {/* Lightbox (with default prev/next buttons enabled) */}
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
        // remove the custom render that nulled the buttons
      />
    </div>
  );
}
