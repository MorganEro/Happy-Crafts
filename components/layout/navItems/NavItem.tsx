import { useSidebar } from '@/context/sidebar-context';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavItemProps = {
  href: string;
  icon: React.ReactNode;
  label: string;
  highlight?: boolean;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  /** Optional override for active matching */
  activeWhen?: (pathname: string) => boolean;
};

function NavItem({
  href,
  icon,
  label,
  highlight = false,
  activeWhen,
}: NavItemProps) {
  const pathname = usePathname();
  const defaultActive =
    pathname === href || (href !== '/' && pathname?.startsWith(href + '/'));
  const active = activeWhen ? activeWhen(pathname) : defaultActive;

  const { open } = useSidebar();

  return (
    <Link
      href={href}
      className={[
        'group flex items-center gap-3 rounded-xl px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hc-blue-600',
        active
          ? 'bg-hc-cream/50 text-hc-asphalt'
          : 'text-hc-asphalt hover:bg-hc-cream',
        highlight ? 'ring-1 ring-hc-orange/40' : '',
      ].join(' ')}>
      <span
        aria-hidden
        className="shrink-0 opacity-90">
        {icon}
      </span>
      <span className={open ? 'truncate' : 'sr-only'}>{label}</span>
    </Link>
  );
}

export default NavItem;
