'use client';

import * as React from 'react';
import Image from 'next/image';
import {
  useController,
  useWatch,
  type Control,
  type UseFormSetValue,
} from 'react-hook-form';
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';
import type { LocalFormValues } from '@/types';

// ---------- helpers ----------
/** Normalize FileList | File[] | undefined -> File[] */
function toFiles(val: unknown): File[] {
  if (!val) return [];
  if (typeof FileList !== 'undefined' && val instanceof FileList)
    return Array.from(val);
  if (Array.isArray(val))
    return val.filter((f): f is File => f instanceof File);
  return [];
}

function reorder<T>(list: T[], startIdx: number, endIdx: number): T[] {
  const next = [...list];
  const [moved] = next.splice(startIdx, 1);
  next.splice(endIdx, 0, moved);
  return next;
}

type Props = {
  control: Control<LocalFormValues>;
  setValue: UseFormSetValue<LocalFormValues>;
  name?: 'images';
  mainImageIndexName?: 'mainImageIndex';
};

export function ImagesField({
  control,
  setValue,
  name = 'images',
  mainImageIndexName = 'mainImageIndex',
}: Props) {
  const { field, fieldState } = useController<LocalFormValues>({
    name,
    control,
  });
  const currentMainIndex = useWatch({ control, name: mainImageIndexName }) ?? 0;

  const files = React.useMemo(() => toFiles(field.value), [field.value]);

  // drag state
  const [dragIndex, setDragIndex] = React.useState<number | null>(null);
  const [overIndex, setOverIndex] = React.useState<number | null>(null);

  const onPick = (fileList: FileList | null) => {
    if (!fileList) return;
    const picked = Array.from(fileList);
    const current = toFiles(field.value);
    const next = [...current, ...picked]; // append
    field.onChange(next);

    // Keep main index in range (default to 0 if out of range)
    const safeIndex =
      typeof currentMainIndex === 'number' &&
      currentMainIndex >= 0 &&
      currentMainIndex < next.length
        ? currentMainIndex
        : 0;
    setValue(mainImageIndexName, safeIndex, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const setMainIndex = (i: number) => {
    if (i < 0 || i >= files.length) return;
    setValue(mainImageIndexName, i, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  // ---------- reordering (DnD + keyboard) ----------
  const applyReorder = (from: number, to: number) => {
    if (from === to) return;
    const current = toFiles(field.value);
    const mainFile = current[currentMainIndex]; // track which file is "main" by reference
    const next = reorder(current, from, to);
    field.onChange(next);

    // recompute main index by identity
    const newMainIdx = Math.max(0, next.indexOf(mainFile));
    setValue(mainImageIndexName, newMainIdx, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };
  return (
    <FormItem className="space-y-2">
      <FormLabel htmlFor="product-images">Images</FormLabel>

      <FormControl>
        <input
          id="product-images"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          onChange={e => {
            onPick(e.target.files);
            e.currentTarget.value = ''; // allow re-selecting the same files
          }}
          className="block text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0
                     file:bg-hc-cream file:text-hc-asphalt
                     hover:file:bg-hc-tan hover:file:text-white transition-colors"
        />
      </FormControl>

      {fieldState.error?.message ? (
        <p className="text-sm text-destructive">{fieldState.error.message}</p>
      ) : null}
      <p className="text-xs text-muted-foreground">
        {files.length} image{files.length !== 1 ? 's' : ''} uploaded
      </p>
      {files.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
          {files.map((f, i) => {
            const url = URL.createObjectURL(f);
            const isMain = i === currentMainIndex;
            const isDragging = i === dragIndex;
            const isOver = i === overIndex;

            return (
              <div
                key={`${f.name}-${i}`}
                className="space-y-2 border rounded-2xl pb-2">
                {/* Draggable image tile */}
                <div
                  className={cn(
                    'relative aspect-square overflow-hidden rounded-2xl ring-1 ring-border rounded-b-none',
                    isMain
                      ? 'ring-2 ring-offset-2 ring-offset-hc-offwhite ring-hc-orange'
                      : 'hover:ring-2 hover:ring-hc-blue-400',
                    isDragging && 'opacity-70',
                    isOver && !isDragging && 'ring-2 ring-hc-blue-400'
                  )}
                  draggable
                  onDragStart={() => setDragIndex(i)}
                  onDragOver={e => {
                    e.preventDefault();
                    setOverIndex(i);
                  }}
                  onDrop={() => {
                    if (dragIndex !== null) {
                      applyReorder(dragIndex, i);
                      setDragIndex(null);
                      setOverIndex(null);
                    }
                  }}
                  onDragEnd={() => {
                    setDragIndex(null);
                    setOverIndex(null);
                  }}
                  style={{ cursor: 'grab' }}
                  title={isMain ? 'Main image' : 'Drag to reorder'}>
                  <Image
                    src={url}
                    alt={f.name}
                    fill
                    sizes="200px"
                    className="object-cover select-none pointer-events-none"
                    onLoad={() => URL.revokeObjectURL(url)}
                  />
                  {/* Optional: small badge only when main */}
                  {isMain && (
                    <span className="absolute top-2 left-2 rounded-full px-2 py-0.5 text-xs bg-hc-blue-600 text-white">
                      Main
                    </span>
                  )}
                </div>

                {/* Footer row: choose main (outside draggable area) */}
                <div className="flex flex-col items-center justify-between">
                  {/* Tiny filename hint (optional) */}
                  <span className="text-[10px] text-muted-foreground truncate max-w-[8rem] mb-2">
                    {f.name}
                  </span>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="main-image"
                      checked={isMain}
                      onChange={() => setMainIndex(i)}
                      className="h-4 w-4 accent-[var(--hc-orange)]"
                      draggable={false}
                    />
                    <span className="text-xs">Set as main</span>
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <FormDescription>
        You can drag and drop to reorder images.
      </FormDescription>

      <FormMessage />
    </FormItem>
  );
}
