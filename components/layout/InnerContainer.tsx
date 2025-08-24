import { cn } from '@/lib/utils';

function InnerContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn('p-4', className)}>{children}</div>;
}
export default InnerContainer;
