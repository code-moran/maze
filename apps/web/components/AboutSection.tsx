import Link from "next/link";
import type { AboutIntro } from "@/data/types";

export default function AboutSection({
  intro,
  images,
  teaser = false,
}: {
  intro: AboutIntro;
  images: string[];
  teaser?: boolean;
}) {
  return (
    <section id="about" className="py-5 bg-white">
      <div className="container">
        <div className="row g-5 align-items-center">
          <div className="col-lg-6">
            <p className="section-label">{intro.label}</p>
            <h2 className="section-title">{intro.title}</h2>
            <div className="divider-green" style={{ margin: "0 0 1.2rem 0" }}></div>
            <p className="text-secondary">{intro.paragraphOne}</p>
            {!teaser ? (
              <p className="text-secondary">{intro.paragraphTwo}</p>
            ) : null}
            <div className="row g-3 mt-2">
              <div className="col-6">
                <div
                  className="p-3 rounded-3"
                  style={{ background: "var(--maze-green-light)" }}
                >
                  <i className="bi bi-eye-fill text-success fs-4 mb-2 d-block"></i>
                  <h6 className="fw-bold mb-1">{intro.visionTitle}</h6>
                  <p className="small text-secondary mb-0">{intro.visionText}</p>
                </div>
              </div>
              <div className="col-6">
                <div
                  className="p-3 rounded-3"
                  style={{ background: "var(--maze-green-light)" }}
                >
                  <i className="bi bi-bullseye text-success fs-4 mb-2 d-block"></i>
                  <h6 className="fw-bold mb-1">{intro.missionTitle}</h6>
                  <p className="small text-secondary mb-0">{intro.missionText}</p>
                </div>
              </div>
            </div>
            <Link href={teaser ? "/about" : "/contact"} className="btn btn-maze mt-4">
              {teaser ? "Learn More" : "Get in Touch"}
            </Link>
          </div>
          <div className="col-lg-6">
            <div className="row g-3">
              <div className="col-6">
                <img
                  src={images[0]}
                  className="img-fluid rounded-3 w-100"
                  style={{ height: 200, objectFit: "cover" }}
                  alt="TV mounting service"
                />
              </div>
              <div className="col-6">
                <img
                  src={images[1]}
                  className="img-fluid rounded-3 w-100"
                  style={{ height: 200, objectFit: "cover" }}
                  alt="Solar installation"
                />
              </div>
              <div className="col-12">
                <img
                  src={images[2]}
                  className="img-fluid rounded-3 w-100"
                  style={{ height: 180, objectFit: "cover" }}
                  alt="Team working"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
