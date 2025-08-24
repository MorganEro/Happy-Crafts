import Banner from '@/components/layout/Banner';
import Container from '@/components/layout/Container';
import CategorySection from '@/components/products/CategorySection';
import { ReviewFormHome } from '@/components/reviews/ReviewFormHome';
import Loading from '@/components/ui/Loading';
import { Separator } from '@/components/ui/separator';
import { Suspense } from 'react';

function HomePage() {
  return (
    <div>
      <Banner />
      <Container>
        <Suspense fallback={<Loading />}>
          <CategorySection />
        </Suspense>
        <Separator />
        <ReviewFormHome />
      </Container>
    </div>
  );
}
export default HomePage;
