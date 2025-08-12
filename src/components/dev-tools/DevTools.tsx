'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Control, FieldValues } from 'react-hook-form';

// Dynamically import dev tools with SSR disabled
const ReactQueryDevtools = dynamic(
  () => import('@tanstack/react-query-devtools').then((mod) => mod.ReactQueryDevtools),
  { ssr: false }
);

const HookFormDevTool = dynamic(
  () => import('@hookform/devtools').then((mod) => mod.DevTool),
  { ssr: false }
);

interface DevToolsProps<TFieldValues extends FieldValues = FieldValues> {
  control?: Control<TFieldValues>;
}

/**
 * Development tools wrapper component that conditionally renders dev tools
 * based on the environment. Only renders on client-side to prevent hydration issues.
 */
export function DevTools({ control }: DevToolsProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (process.env.NODE_ENV === 'production' || !isMounted) return null;

  return (
    <>
      <ReactQueryDevtools initialIsOpen={false} />
      {control && <HookFormDevTool control={control} placement="top-right" />}
    </>
  );
}
