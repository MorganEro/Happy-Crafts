// app/loading.tsx
import type { JSX } from 'react';

function BrandLockup(): JSX.Element {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-sm tracking-[0.25em] uppercase text-hc-teal-500">
        Happy Crafts
      </span>
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
        Happy Crafts <span className="text-hc-blue-600">by Leslie&nbsp;P.</span>
      </h1>
    </div>
  );
}

function Spinner(): JSX.Element {
  // Minimal, accessible spinner that respects reduced motion
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading content"
      className="flex items-center gap-3">
      <div className="relative size-8">
        <div className="absolute inset-0 rounded-full border-4 border-hc-cream" />
        <div className="absolute inset-0 rounded-full border-4 border-t-hc-blue-600 motion-safe:animate-spin" />
      </div>
      <span className="text-sm text-foreground/80">Loading…</span>
    </div>
  );
}

function SkeletonRow(): JSX.Element {
  return <div className="h-4 w-full rounded bg-hc-cream/70 animate-pulse" />;
}

export default function Loading(): JSX.Element {
  return (
    <main
      className="min-h-dvh bg-background text-foreground grid place-items-center p-6"
      aria-busy="true">
      <div className="w-full max-w-xl">
        {/* Brand / Header */}
        <div className="flex flex-col items-center text-center gap-6">
          <BrandLockup />
          <Spinner />
        </div>

        {/* “Magazine-clean” placeholder content */}
        <div className="mt-10 space-y-4">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
          <div className="grid grid-cols-3 gap-3 mt-2">
            <div className="h-24 rounded bg-hc-cream/70 animate-pulse" />
            <div className="h-24 rounded bg-hc-cream/70 animate-pulse" />
            <div className="h-24 rounded bg-hc-cream/70 animate-pulse" />
          </div>
          <SkeletonRow />
          <SkeletonRow />
        </div>

        {/* Subtle footer bar for visual polish */}
        <div className="mt-10 h-1 w-full overflow-hidden rounded-full bg-hc-cream">
          <div className="h-full w-1/3 rounded-full bg-hc-orange motion-safe:animate-pulse" />
        </div>
      </div>
    </main>
  );
}
