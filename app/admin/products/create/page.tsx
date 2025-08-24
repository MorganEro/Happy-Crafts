'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { createProductAction } from '@/actions/product-actions';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import ChipsEditor from '@/components/ui/ChipsEditor';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ImagesField } from '@/components/ui/ImagesField';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/PageHeader';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  PRODUCT_CATEGORIES,
  PRODUCT_TAGS,
  ProductCategory,
  ProductTag,
} from '@/lib/constants';
import { deleteImage, uploadImage } from '@/lib/supabase';
import {
  clientFormSchema,
  LocalFormValues,
  ProductFormValues,
} from '@/types/zod-schema';
import { DevTool } from '@hookform/devtools';

export default function CreateProductPage() {
  const router = useRouter();

  const form = useForm<LocalFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: '',
      company: 'Happy Crafts',
      description: '',
      category: 'other', // must be one of your allowed categories
      options: [],
      tags: [],
      price: 0,
      images: [], // File[] in the client form
      mainImageIndex: 0,
    },
  });

  const { mutate, isPending, error, isError } = useMutation({
    mutationFn: async (vals: LocalFormValues) => {
      if (!vals.images?.length)
        throw new Error('Please select at least one image');

      // 1) Upload files on the client
      const uploaded: string[] = [];
      try {
        for (const f of vals.images) {
          const url = await uploadImage(f, 'PRODUCTS');
          uploaded.push(url);
        }

        // 2) Build payload for server (now matches ProductFormValues exactly)
        const payload: ProductFormValues = {
          ...vals,
          images: uploaded, // string[] urls
        };

        // 3) Call server action
        const res = await createProductAction(payload);
        if (!res.success) {
          // cleanup uploaded files if server DB write fails
          await Promise.allSettled(
            uploaded.map(u => deleteImage(u, 'PRODUCTS'))
          );
          throw new Error(res.error);
        }

        return res.productId;
      } catch (e) {
        // if upload failed mid-way, cleanup whatever got uploaded
        await Promise.allSettled(uploaded.map(u => deleteImage(u, 'PRODUCTS')));
        throw e;
      }
    },
    onSuccess: id => router.push(`/products/${id}`),
  });

  const onSubmit = (vals: LocalFormValues) => {
    // Ensure mainImageIndex is in range
    if (
      vals.mainImageIndex < 0 ||
      vals.mainImageIndex >= (vals.images?.length ?? 0)
    ) {
      // default to 0 if out of range
      vals.mainImageIndex = 0;
    }
    mutate(vals);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <PageHeader title="Create New Product" />

      <Form {...form}>
        <form
          // onSubmit={form.handleSubmit(onSubmit)}
          onSubmit={form.handleSubmit(
            vals => {
              console.log('✅ RHF onSubmit firing with values:', vals);
              onSubmit(vals);
            },
            errors => {
              console.log('⛔ RHF validation errors:', errors);
            }
          )}
          className="space-y-8">
          {/* Essentials */}
          <section className="space-y-6 rounded-2xl border bg-hc-offwhite p-6">
            <h2 className="text-xl font-semibold text-hc-asphalt">Basics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Hand‑loomed Linen Tote"
                        {...field}
                      />
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
                        placeholder="Describe materials, craftsmanship, and care…"
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

                              {/* Text must be allowed to wrap */}
                              <FormLabel className="m-0 font-normal leading-snug whitespace-normal break-words hyphens-auto flex-1 capitalize">
                                {cat}
                              </FormLabel>
                            </FormItem>
                          ))}
                      </RadioGroup>
                    </FormControl>
                    <FormDescription>Pick a category</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Price & Customer */}
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
            <h2 className="text-xl font-semibold text-hc-asphalt">Metadata</h2>

            {/* Options as chips */}
            <FormField
              control={form.control}
              name="options"
              render={({ field }) => (
                <FormItem>
                  <ChipsEditor
                    value={field.value ?? []}
                    onChange={v => field.onChange(v)}
                    label="Options"
                    placeholder="Enter option then press add"
                  />
                  <FormDescription>
                    Click a chip to remove. Press Enter to add.
                  </FormDescription>
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

                    {/* Quick actions */}
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => field.onChange(PRODUCT_TAGS.slice())}
                        className="h-8">
                        Select all
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => field.onChange([])}
                        className="h-8">
                        Clear
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        {selected.size}/{PRODUCT_TAGS.length} selected
                      </span>
                    </div>

                    {/* Checkbox grid (scrollable on small screens) */}
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

                    {/* Helpful hint + validation message */}
                    <FormDescription>Choose all that apply.</FormDescription>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </section>

          <section className="space-y-6 rounded-2xl border p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-hc-asphalt">Images</h2>
              <span className="text-sm text-muted-foreground">
                Select one image as <strong>Main</strong>.
              </span>
            </div>

            {/* RHF-integrated images field */}
            <ImagesField
              control={form.control}
              setValue={form.setValue}
            />

            {/* Keep mainImageIndex in the form (hidden) */}
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
              {isPending ? 'Creating…' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Form>
      <DevTool control={form.control} />
    </div>
  );
}
