'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Button } from './button';

function BackLink() {
  const router = useRouter();
  return (
    <Button
      variant="link"
      className="!px-0 mb-4"
      onClick={() => router.back()}>
      <ChevronLeft className="w-4 h-4" />
      Back
    </Button>
  );
}

export default BackLink;
