'use client';

import {
  reviewClientSchema,
  type ReviewClientValues,
} from '@/types/zod-schema';
import { SignInButton, useUser } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useCreateReview, useMyReview } from '@/lib/queries/review';
import Loading from '../ui/Loading';
import AllReviewsLink from './AllReviewsLink';
import { ReviewCard } from './ReviewCard';

export function ReviewFormHome() {
  const { user } = useUser();
  const { data: myReview, isLoading } = useMyReview();
  const { mutate, isPending } = useCreateReview();

  const form = useForm<ReviewClientValues>({
    resolver: zodResolver(reviewClientSchema),
    defaultValues: {
      rating: 5,
      comment: '',
      authorName: user
        ? [user.firstName, user.lastName].filter(Boolean).join(' ')
        : '',
      authorImageUrl: user?.imageUrl ?? '',
    },
  });

  if (!user) {
    return (
      <div className="rounded-2xl border p-4 bg-hc-offwhite text-hc-asphalt">
        <p className="text-sm mb-3">Please sign in to leave a review.</p>
        <SignInButton mode="modal">
          <Button
            variant="outline"
            className="cursor-pointer">
            Sign in
          </Button>
        </SignInButton>
      </div>
    );
  }

  if (isLoading) {
    return <Loading />;
  }

  if (myReview) {
    return (
      <section className="rounded-2xl border bg-hc-blue-400/10 shadow-sm max-w-6xl mx-auto p-6 mb-12">
        <ReviewCard review={myReview} />
        <AllReviewsLink />
      </section>
    );
  }

  return (
    <section className="rounded-2xl border bg-hc-blue-400/10 shadow-sm max-w-6xl mx-auto p-6 mb-12">
      <div className="p-4">
        <h2 className="text-hc-blue-600 text-lg font-medium">Leave a review</h2>
        <p className="text-sm text-muted-foreground">One review per user.</p>
      </div>

      <div className="p-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(vals => mutate(vals))}
            className="space-y-6">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={String(field.value)}
                      onValueChange={v => field.onChange(Number(v))}
                      className="flex gap-3">
                      {[1, 2, 3, 4, 5].map(n => (
                        <label
                          key={n}
                          className="inline-flex items-center gap-2">
                          <RadioGroupItem value={String(n)} />
                          <span className="text-sm">{n}</span>
                        </label>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comment</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Share your experience…"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Hidden fields (prefilled from Clerk; still validated server-side) */}
            <input
              type="hidden"
              {...form.register('authorName')}
            />
            <input
              type="hidden"
              {...form.register('authorImageUrl')}
            />

            <div className="flex justify-end">
              <Button
                type="submit"
                className="bg-hc-tan hover:bg-hc-orange text-white"
                disabled={isPending}>
                {isPending ? 'Submitting…' : 'Submit review'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </section>
  );
}
