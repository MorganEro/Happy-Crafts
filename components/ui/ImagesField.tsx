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
import type { LocalFormValues } from '@/types';

/** Normalize FileList | File[] | undefined -> File[] */
function toFiles(val: unknown): File[] {
  if (!val) return [];
  if (typeof FileList !== 'undefined' && val instanceof FileList)
    return Array.from(val);
  if (Array.isArray(val))
    return val.filter((f): f is File => f instanceof File);
  return [];
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

  const onPick = (fileList: FileList | null) => {
    if (!fileList) return;
    const picked = Array.from(fileList);
    const current = toFiles(field.value);
    const next = [...current, ...picked]; // append; change to "picked" if you prefer replace
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

      {files.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
          {files.map((f, i) => {
            const url = URL.createObjectURL(f);
            const isMain = i === currentMainIndex;

            return (
              <button
                key={i}
                type="button"
                onClick={() => setMainIndex(i)}
                className={cn(
                  'relative aspect-square overflow-hidden rounded-2xl ring-1 ring-border',
                  isMain
                    ? 'ring-2 ring-offset-2 ring-offset-hc-offwhite ring-hc-orange'
                    : 'hover:ring-2 hover:ring-hc-blue-400'
                )}
                title={isMain ? 'Main image' : 'Set as main image'}>
                <Image
                  src={url}
                  alt={f.name}
                  fill
                  sizes="200px"
                  className="object-cover"
                  onLoad={() => URL.revokeObjectURL(url)}
                />
                <span
                  className={cn(
                    'absolute top-2 left-2 rounded-full px-2 py-0.5 text-xs bg-black/60 text-white',
                    isMain && 'bg-hc-blue-600'
                  )}>
                  {isMain ? 'Main' : 'Set main'}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <FormMessage />
    </FormItem>
  );
}
