import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

function Logo() {
  return (
    <Button
      variant="secondary"
      size="lg"
      className={cn(
        'bg-hc-asphalt/30 rounded-full p-2 border border-hc-blue-400/50'
      )}>
      <Link href="/">
        <Image
          src="/logo.svg"
          alt="Logo"
          width={25}
          height={25}
        />
      </Link>
    </Button>
  );
}
export default Logo;
