// components/ui/ImagesEditField.tsx
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
} from '@/components/ui/form';
import { cn } from '@/lib/utils';
import type { LocalEditFormValues } from '@/types/zod-schema';

type Props = {
  control: Control<LocalEditFormValues>;
  setValue: UseFormSetValue<LocalEditFormValues>;
  nameExisting?: 'existingUrls';
  nameNew?: 'newImages';
  nameMain?: 'mainImageIndex';
};

export function ImagesEditField({
  control,
  setValue,
  nameExisting = 'existingUrls',
  nameNew = 'newImages',
  nameMain = 'mainImageIndex',
}: Props) {
  const existingCtl = useController({ control, name: nameExisting });
  const newCtl = useController({ control, name: nameNew });
  const mainIndex = useWatch({ control, name: nameMain }) ?? 0;

  const existing = existingCtl.field.value ?? [];
  const news = newCtl.field.value ?? [];

  const combinedLength = (existing?.length ?? 0) + (news?.length ?? 0);

  const setMain = (i: number) => {
    if (i < 0 || i >= combinedLength) return;
    setValue(nameMain, i, { shouldDirty: true, shouldValidate: true });
  };

  const removeExisting = (idx: number) => {
    const next = [...existing];
    next.splice(idx, 1);
    existingCtl.field.onChange(next);
    // Adjust main index if needed
    if (mainIndex === idx)
      setValue(nameMain, 0, { shouldDirty: true, shouldValidate: true });
    if (mainIndex > idx)
      setValue(nameMain, mainIndex - 1, {
        shouldDirty: true,
        shouldValidate: true,
      });
  };

  const removeNew = (idx: number) => {
    const next = [...news];
    next.splice(idx, 1);
    newCtl.field.onChange(next);
    const base = existing.length;
    const abs = base + idx;
    if (mainIndex === abs)
      setValue(nameMain, 0, { shouldDirty: true, shouldValidate: true });
    if (mainIndex > abs)
      setValue(nameMain, mainIndex - 1, {
        shouldDirty: true,
        shouldValidate: true,
      });
  };

  const onPick = (fl: FileList | null) => {
    if (!fl) return;
    const picked = Array.from(fl);
    newCtl.field.onChange([...(news as File[]), ...picked]);
    // Keep main if valid, else set to 0
    if (mainIndex < 0 || mainIndex >= existing.length + picked.length) {
      setValue(nameMain, 0, { shouldDirty: true, shouldValidate: true });
    }
  };

  return (
    <FormItem className="space-y-3">
      <FormLabel htmlFor="edit-images">Images</FormLabel>
      <FormControl>
        <input
          id="edit-images"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          onChange={e => {
            onPick(e.target.files);
            e.currentTarget.value = '';
          }}
          className="block text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0
                     file:bg-hc-cream file:text-hc-asphalt
                     hover:file:bg-hc-tan hover:file:text-white transition-colors"
        />
      </FormControl>

      {/* Existing URLs */}
      {existing.length > 0 && (
        <div className="mt-2">
          <p className="text-xs text-muted-foreground mb-2">Existing</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {existing.map((url: string, i: number) => {
              const isMain = i === mainIndex;
              return (
                <div
                  key={url}
                  className={cn(
                    'relative aspect-square overflow-hidden rounded-2xl ring-1 ring-border',
                    isMain
                      ? 'ring-2 ring-hc-orange ring-offset-2 ring-offset-hc-offwhite'
                      : 'hover:ring-2 hover:ring-hc-blue-400'
                  )}>
                  <button
                    type="button"
                    onClick={() => setMain(i)}
                    className="absolute inset-0">
                    {/* empty button to capture click */}
                  </button>
                  <Image
                    src={url}
                    alt={`image-${i}`}
                    fill
                    sizes="200px"
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeExisting(i)}
                    className="absolute top-2 right-2 rounded-md bg-black/60 text-white text-xs px-2 py-1">
                    Remove
                  </button>
                  {isMain && (
                    <span className="absolute left-2 top-2 rounded-md bg-hc-blue-600 text-white text-xs px-2 py-0.5">
                      Main
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* New Files */}
      {news.length > 0 && (
        <div className="mt-2">
          <p className="text-xs text-muted-foreground mb-2">New</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {news.map((f: File, j: number) => {
              const abs = existing.length + j;
              const isMain = abs === mainIndex;
              const url = URL.createObjectURL(f);
              return (
                <div
                  key={`${f.name}-${j}`}
                  className={cn(
                    'relative aspect-square overflow-hidden rounded-2xl ring-1 ring-border',
                    isMain
                      ? 'ring-2 ring-hc-orange ring-offset-2 ring-offset-hc-offwhite'
                      : 'hover:ring-2 hover:ring-hc-blue-400'
                  )}>
                  <button
                    type="button"
                    onClick={() => setMain(abs)}
                    className="absolute inset-0"
                  />
                  <Image
                    src={url}
                    alt={f.name}
                    fill
                    sizes="200px"
                    className="object-cover"
                    onLoad={() => URL.revokeObjectURL(url)}
                  />
                  <button
                    type="button"
                    onClick={() => removeNew(j)}
                    className="absolute top-2 right-2 rounded-md bg-black/60 text-white text-xs px-2 py-1">
                    Remove
                  </button>
                  {isMain && (
                    <span className="absolute left-2 top-2 rounded-md bg-hc-blue-600 text-white text-xs px-2 py-0.5">
                      Main
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <FormMessage />
    </FormItem>
  );
}
