import { useAuth } from '@clerk/nextjs';
import NavItem from './NavItem';
import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';

function FavoritesItem() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isSignedIn) {
      e.preventDefault();
      const redirect = encodeURIComponent('/favorites');
      router.push(`/sign-in?redirect_url=${redirect}`);
    }
  };

  return (
    <NavItem
      href="/products/favorites"
      icon={<Heart className="h-5 w-5" />}
      label="Favorites"
      onClick={onClick}
      activeWhen={pathname => pathname.startsWith('/products/favorites')}
    />
  );
}

export default FavoritesItem;
