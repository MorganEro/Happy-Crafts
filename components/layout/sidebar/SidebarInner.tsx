import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useSidebar } from '@/context/sidebar-context';
import { Package, Plus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { BsLayoutSidebar } from 'react-icons/bs';
import { FaRegCommentAlt } from 'react-icons/fa';
import { AdminOnly } from '../navItems/AdminOnly';
import FavoritesItem from '../navItems/FavoritesItem';
import NavItem from '../navItems/NavItem';
import SectionLabel from '../navItems/SectionLabel';
import SidebarTaxonomy from './SidebarTaxonomy';

function SidebarInner() {
  const { open, toggle } = useSidebar();

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-3  border-b h-15">
        {open && (
          <div className="ml-3 flex-1">
            <Link href="/">
              <Image
                src="/logo.svg"
                alt="Logo"
                width={48}
                height={48}
              />
            </Link>
          </div>
        )}
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                onClick={toggle}
                aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}
                className="hidden lg:inline-flex shrink-0" // desktop only
              >
                <BsLayoutSidebar
                  className={`h-8 w-8 ${open ? 'rotate-180' : ''}`}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              className="bg-hc-asphalt text-hc-offwhite">
              <p>{open ? 'Collapse' : 'Expand'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Nav */}
      <ScrollArea className="flex-1 overflow-hidden mt-5">
        <div className="max-w-[90%] min-w-0">
          <nav className="flex flex-col w-full max-w-full min-w-0 overflow-x-hidden box-border">
            <SectionLabel hidden={!open}>Browse</SectionLabel>
            <ul className="px-2 space-y-1">
              <li>
                <FavoritesItem />
              </li>
              <li>
                <NavItem
                  href="/products"
                  icon={<Package className="h-5 w-5" />}
                  label="Products"
                  activeWhen={path => {
                    if (!path.startsWith('/products')) return false;
                    const parts = path.split('/').filter(Boolean); // e.g. ['products', 'favorites']
                    const seg = parts[1] ?? ''; // segment after 'products'
                    const reserved = new Set([
                      'favorites',
                      'tags',
                      'categories',
                    ]);
                    return seg === '' || !reserved.has(seg); // root or product detail
                  }}
                />
              </li>
              <li>
                <NavItem
                  href="/reviews"
                  icon={<FaRegCommentAlt className="h-5 w-5" />}
                  label="Reviews"
                  activeWhen={pathname => pathname.startsWith('/reviews')}
                />
              </li>
            </ul>

            <div className={!open ? 'hidden' : ''}>
              <div className="my-3 px-2">
                <Separator />
              </div>
              <SidebarTaxonomy />
            </div>

            <AdminOnly>
              <div className="my-3 px-2">
                <Separator />
              </div>
              <ul className="px-2 space-y-1">
                <li className="flex items-center justify-center">
                  <NavItem
                    href="/admin/products/create"
                    icon={<Plus className="h-5 w-5" />}
                    label="New Product"
                  />
                </li>
              </ul>
            </AdminOnly>
          </nav>
        </div>
      </ScrollArea>

      {/* Footnote */}
      <div className="border-t border p-3 text-[11px] tracking-wide text-foreground">
        <span className="hidden lg:inline">Crafted with Love</span>
      </div>
    </div>
  );
}
export default SidebarInner;
