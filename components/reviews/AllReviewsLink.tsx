import Link from 'next/link';
import { Button } from '@/components/ui/button';

function AllReviewsLink() {
  return (
    <div className="flex justify-end">
      <Button
        variant="link"
        className="ps-0">
        <Link
          className="mt-4 capitalize"
          href={`/reviews`}>
          View All Reviews
        </Link>
      </Button>
    </div>
  );
}
export default AllReviewsLink;
