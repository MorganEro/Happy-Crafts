import { useUser } from '@clerk/nextjs';
import { useMemo } from 'react';

export const AdminOnly = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();
  const isAdmin = useMemo(() => {
    const role = (user?.publicMetadata as Record<string, unknown> | null)?.role;
    return role === 'admin';
  }, [user]);
  if (!isAdmin) return null;
  return <>{children}</>;
};
