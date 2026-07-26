import Link from "next/link";
import type { ServiceCharge, ServicesIntro } from "@/data/types";

const SERVICE_ICONS: Record<string, string> = {
  tv: "bi-tv",
  solar: "bi-sun",
};

export default function ServicesSection({
  intro,
  charges,
  teaser = false,
}: {
  intro: ServicesIntro;
  charges: Record<string, ServiceCharge>;
  teaser?: boolean;
}) {
  const keys = ["tv", "solar"];

  return (
    <section id="services" className="py-5 bg-white">
      <div className="container">
        <div className="text-center mb-5">
          <p className="section-label">{intro.label}</p>
          <h2 className="section-title">{intro.title}</h2>
          <div className="divider-green mx-auto"></div>
          <p className="section-sub">{intro.subtitle}</p>
        </div>
        <div className="row g-4 justify-content-center">
          {keys.map((key) => {
            const charge = charges[key];
            if (!charge) return null;
            return (
              <div key={key} className="col-md-6 col-lg-5">
                <div className="service-card h-100">
                  <div className="card-body text-center">
                    <div className="service-icon mx-auto">
                      <i className={`bi ${SERVICE_ICONS[key] || "bi-tools"}`}></i>
                    </div>
                    <h5 className="fw-bold">{charge.label}</h5>
                    <p className="text-secondary small">{charge.description}</p>
                    {charge.enabled && charge.amount ? (
                      <p className="fw-bold text-success mb-3">{charge.amount}</p>
                    ) : null}
                    <Link href="/contact" className="btn btn-maze w-100">
                      Request Quote
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {teaser ? (
          <div className="text-center mt-4">
            <Link href="/services" className="btn btn-maze-outline">
              View All Services <i className="bi bi-arrow-right ms-1"></i>
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
