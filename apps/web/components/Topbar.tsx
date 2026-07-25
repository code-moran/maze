import type { GeneralSettings } from "@/data/types";
import { telHref } from "@/data/siteData";

export default function Topbar({ settings }: { settings: GeneralSettings }) {
  const enabledSocial = (settings.socialLinks || []).filter(
    (item) => item.enabled && (item.url || item.handle)
  );

  return (
    <div className="topbar d-none d-md-block">
      <div className="container d-flex justify-content-between align-items-center">
        <div className="d-flex gap-3">
          <span>
            <i className="bi bi-telephone-fill me-1"></i>
            <a href={telHref(settings.phone)}>{settings.phone}</a>
          </span>
          <span>
            <i className="bi bi-envelope-fill me-1"></i>
            <a href={`mailto:${settings.email}`}>{settings.email}</a>
          </span>
        </div>
        <div className="d-flex gap-2 align-items-center">
          {enabledSocial.map((item) => (
            <a
              key={item.platform}
              href={item.url || "#"}
              className="topbar-social-link text-white-50"
              aria-label={item.platform}
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className={`bi bi-${item.icon}`}></i>
              {item.handle ? (
                <span className="topbar-handle">{item.handle}</span>
              ) : null}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
