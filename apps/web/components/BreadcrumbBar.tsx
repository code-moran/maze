import Link from "next/link";

export default function BreadcrumbBar({
  current,
  items,
}: {
  current?: string;
  items?: { label: string; href?: string }[];
}) {
  const crumbs = items || (current ? [{ label: current }] : []);

  return (
    <div className="breadcrumb-bar">
      <div className="container">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb maze-breadcrumb mb-0">
            <li className="breadcrumb-item">
              <Link href="/">Home</Link>
            </li>
            {crumbs.map((crumb, index) => {
              const isLast = index === crumbs.length - 1;
              if (isLast || !crumb.href) {
                return (
                  <li
                    key={`${crumb.label}-${index}`}
                    className="breadcrumb-item active"
                    aria-current="page"
                  >
                    {crumb.label}
                  </li>
                );
              }
              return (
                <li key={`${crumb.label}-${index}`} className="breadcrumb-item">
                  <Link href={crumb.href}>{crumb.label}</Link>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
}
