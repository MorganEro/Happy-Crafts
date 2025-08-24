import Link from 'next/link';

type EmptyStateProps = {
  href?: string;
  heading: string;
  content?: string;
  buttonContent?: string;
};

function EmptyState({
  href,
  heading,
  content,
  buttonContent,
}: EmptyStateProps) {
  return (
    <div className="mx-auto max-w-md mt-20 text-center rounded-2xl border p-8">
      <h2 className="text-xl font-semibold">{heading}</h2>
      <p className="mt-2 text-sm text-hc-teal-500">{content || ''}</p>
      <Link
        href={href || '/products'}
        className="mt-4 inline-block rounded-lg bg-hc-blue-600 px-4 py-2 text-hc-offwhite hover:bg-hc-blue-400">
        {buttonContent || 'Browse products'}
      </Link>
    </div>
  );
}
export default EmptyState;
