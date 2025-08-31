import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

function Logo() {
  return (
    <Button
      variant="ghost"
      size="lg"
      className={cn(
        'p-2 flex items-center justify-center hover:bg-transparent hover:scale-105 transition-transform duration-200 dark:hover:bg-transparent'
      )}>
      <Link href="/">
        <Image
          src="/logo.svg"
          alt="Logo"
          width={48}
          height={48}
        />
      </Link>
    </Button>
  );
}
export default Logo;
