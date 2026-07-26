import Link from "next/link";

type Crumb = { label: string; href?: string };

type Cta = {
  href: string;
  label: string;
  outline?: boolean;
};

type Props = {
  label?: string;
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  crumbs?: Crumb[];
  ctas?: Cta[];
  compact?: boolean;
};

export default function PageHero({
  label,
  title,
  subtitle,
  backgroundImage,
  crumbs,
  ctas,
  compact = true,
}: Props) {
  return (
    <section
      className={`page-hero${compact ? " page-hero-compact" : ""}`}
      style={
        backgroundImage
          ? { ["--page-hero-image" as string]: `url('${backgroundImage}')` }
          : undefined
      }
    >
      <div className="page-hero-bg" aria-hidden="true" />
      <div className="page-hero-overlay" aria-hidden="true" />
      <div className="container page-hero-content">
        {crumbs?.length ? (
          <nav aria-label="breadcrumb" className="page-hero-crumbs">
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
                  <li
                    key={`${crumb.label}-${index}`}
                    className="breadcrumb-item"
                  >
                    <Link href={crumb.href}>{crumb.label}</Link>
                  </li>
                );
              })}
            </ol>
          </nav>
        ) : null}
        {label ? <p className="page-hero-label">{label}</p> : null}
        <h1 className="page-hero-title">{title}</h1>
        {subtitle ? <p className="page-hero-subtitle">{subtitle}</p> : null}
        {ctas?.length ? (
          <div className="d-flex flex-wrap gap-2 page-hero-actions">
            {ctas.map((cta) => (
              <Link
                key={cta.label}
                href={cta.href}
                className={cta.outline ? "btn btn-maze-outline" : "btn btn-maze"}
                style={
                  cta.outline
                    ? { borderColor: "#c8f5c8", color: "#c8f5c8" }
                    : undefined
                }
              >
                {cta.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
