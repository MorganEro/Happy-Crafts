import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

function BreadCrumbs({
  homeName,
  homeLink,
  previousName,
  previousLink,
  currentName,
}: {
  homeName?: string;
  homeLink?: string;
  previousName?: string;
  previousLink?: string;
  currentName?: string;
}) {
  return (
    <Breadcrumb className="my-4">
      <BreadcrumbList>
        {homeName && (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink
                href={homeLink || '/'}
                className="capitalize text-md">
                {homeName || 'Home'}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        )}
        {previousName && (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink
                href={previousLink || '/products'}
                className="capitalize text-md">
                {previousName || 'Products'}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        )}
        <BreadcrumbItem>
          <BreadcrumbPage className="capitalize text-md">
            {currentName}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
export default BreadCrumbs;
