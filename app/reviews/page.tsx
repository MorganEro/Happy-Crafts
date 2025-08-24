import { PageHeader } from '@/components/ui/PageHeader';
import { ReviewsListClient } from './reviews-client';

export const metadata = {
  title: 'Reviews • Happy Crafts',
};

export default function ReviewsPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      <PageHeader
        title="All Reviews"
        subtitle="What customers are saying"
      />
      {/* Client list (hydrates from React Query) */}
      <ReviewsListClient />
    </div>
  );
}
