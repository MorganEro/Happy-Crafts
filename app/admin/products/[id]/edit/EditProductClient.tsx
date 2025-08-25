// app/products/[id]/edit/EditProductClient.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

import { updateProductAction } from '@/actions/product-actions';
import { ImagesEditField } from '@/components/ui/ImagesEditField';
import {
  PRODUCT_CATEGORIES,
  PRODUCT_TAGS,
  ProductCategory,
  ProductTag,
} from '@/lib/constants';
import { deleteImage, uploadImage } from '@/lib/supabase';
import {
  clientEditFormSchema,
  LocalEditFormValues,
  UpdateFormValues,
} from '@/types/zod-schema';
import { DevTool } from '@hookform/devtools';

// A tiny images editor for edit: shows existing urls + new uploads, lets you remove and set primary

type Props = {
  productId: string;
  defaults: LocalEditFormValues;
};

const EditProductClient = ({ productId, defaults }: Props) => {
  const router = useRouter();

  const form = useForm<LocalEditFormValues>({
    resolver: zodResolver(clientEditFormSchema),
    defaultValues: defaults,
  });

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: async (vals: LocalEditFormValues) => {
      // 1) Upload new files
      const uploaded: string[] = [];
      try {
        for (const f of vals.newImages ?? []) {
          const url = await uploadImage(f, 'PRODUCTS');
          uploaded.push(url);
        }

        // 2) Build final images list (existing kept + newly uploaded)
        const finalImages = [...(vals.existingUrls ?? []), ...uploaded];

        // Ensure mainImageIndex is in range
        const mainIndex =
          vals.mainImageIndex >= 0 && vals.mainImageIndex < finalImages.length
            ? vals.mainImageIndex
            : 0;

        // 3) Call update action
        const payload: UpdateFormValues = {
          id: productId,
          name: vals.name,
          company: vals.company,
          description: vals.description,
          category: vals.category, // ProductCategory
          options: vals.options,
          tags: vals.tags, // ProductTag[]
          price: vals.price,
          images: finalImages, // string[]
          mainImageIndex: mainIndex,
        };

        const res = await updateProductAction(payload);
        if (!res.success) {
          // cleanup newly uploaded if DB fails
          await Promise.allSettled(
            uploaded.map(u => deleteImage(u, 'PRODUCTS'))
          );
          throw new Error(res.error);
        }

        return res.productId;
      } catch (e) {
        // cleanup partial uploads on any thrown error
        await Promise.allSettled(uploaded.map(u => deleteImage(u, 'PRODUCTS')));
        throw e;
      }
    },
    onSuccess: id => router.push(`/products/${id}`),
  });

  const onSubmit = (vals: LocalEditFormValues) => mutate(vals);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <PageHeader title="Edit Product" />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8">
          {/* Basics */}
          <section className="space-y-6 rounded-2xl border bg-background p-6">
            <h2 className="text-xl font-semibold text-foreground">Basics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <input
                    type="hidden"
                    {...field}
                    value="Happy Crafts"
                    readOnly
                  />
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={val =>
                          field.onChange(val as ProductCategory)
                        }
                        value={field.value}
                        className="grid grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] gap-3 items-stretch">
                        {[...PRODUCT_CATEGORIES]
                          .sort((a, b) => a.localeCompare(b))
                          .map(cat => (
                            <FormItem
                              key={cat}
                              className="w-full h-auto flex items-start gap-2 rounded-2xl border px-3 py-2">
                              <FormControl>
                                <RadioGroupItem
                                  value={cat}
                                  className="shrink-0 mt-[2px]"
                                />
                              </FormControl>
                              <FormLabel className="m-0 font-normal leading-snug whitespace-normal break-words hyphens-auto flex-1 capitalize">
                                {cat}
                              </FormLabel>
                            </FormItem>
                          ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <input
                    type="hidden"
                    {...field}
                    value={field.value || 0}
                  />
                )}
              />
            </div>
          </section>

          {/* Metadata */}
          <section className="space-y-6 rounded-2xl border p-6">
            <h2 className="text-xl font-semibold text-foreground">Metadata</h2>

            <FormField
              control={form.control}
              name="options"
              render={() => (
                <FormItem>
                  {/* your ChipsEditor */}
                  {/* <ChipsEditor ... /> */}
                  <FormDescription>Options</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => {
                const selected = new Set(field.value ?? []);
                const toggle = (tag: string, checked: boolean | string) => {
                  const next = new Set<ProductTag>(selected);
                  if (checked) next.add(tag as ProductTag);
                  else next.delete(tag as ProductTag);
                  field.onChange(Array.from(next));
                };
                return (
                  <FormItem className="space-y-3">
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <ScrollArea className="h-56 rounded-xl border p-3">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                          {[...PRODUCT_TAGS]
                            .sort((a, b) => a.localeCompare(b))
                            .map(tag => (
                              <label
                                key={tag}
                                className="flex items-center gap-2 rounded-xl border px-3 py-2 hover:bg-hc-offwhite">
                                <Checkbox
                                  checked={selected.has(tag)}
                                  onCheckedChange={checked =>
                                    toggle(tag, checked)
                                  }
                                  className="data-[state=checked]:bg-hc-tan data-[state=checked]:border-hc-tan"
                                />
                                <span className="text-sm capitalize">
                                  {tag}
                                </span>
                              </label>
                            ))}
                        </div>
                      </ScrollArea>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </section>

          {/* Images */}
          <section className="space-y-6 rounded-2xl border p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Images</h2>
              <span className="text-sm text-muted-foreground">
                Pick a new main if needed.
              </span>
            </div>

            <ImagesEditField
              control={form.control}
              setValue={form.setValue}
            />

            {/* Keep mainImageIndex in the form */}
            <input
              type="hidden"
              {...form.register('mainImageIndex', { valueAsNumber: true })}
            />
          </section>

          {isError && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-destructive text-sm">
              {String(
                error instanceof Error ? error.message : 'Something went wrong'
              )}
            </div>
          )}

          <Separator className="my-2" />
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-hc-tan hover:bg-hc-orange text-white"
              disabled={isPending}>
              {isPending ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Form>

      <DevTool control={form.control} />
    </div>
  );
};

export default EditProductClient;
