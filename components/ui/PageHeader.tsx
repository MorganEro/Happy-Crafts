// components/ui/PageHeader.tsx
import { cn } from '@/lib/utils';

type PageHeaderProps = {
  title?: string;
  subtitle?: string;
  className?: string;
};

export function PageHeader({ title, subtitle, className }: PageHeaderProps) {
  return (
    <header className={cn('mb-4 bg-teal-500/5 p-4 rounded-lg', className)}>
      <h1 className="text-3xl font-bold text-hc-blue-600 uppercase">{title}</h1>
      {subtitle && <p className="text-hc-teal-500 capitalize">{subtitle}</p>}
    </header>
  );
}
