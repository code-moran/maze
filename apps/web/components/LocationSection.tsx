import {
  extractMapEmbedSrc,
  telHref,
} from "@/data/siteData";
import type { FooterContent, GeneralSettings } from "@/data/types";

export default function LocationSection({
  settings,
  footer,
}: {
  settings: GeneralSettings;
  footer: FooterContent;
}) {
  const mapSrc =
    extractMapEmbedSrc(settings.mapEmbed) ||
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.8175952!2d36.8193!3d-1.2833!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f10d22dc5ac9b%3A0x8e7a1e5aebc9ed82!2sNairobi%20CBD!5e0!3m2!1sen!2ske!4v1686000000000!5m2!1sen!2ske";

  const hoursLines = (footer.businessHoursDetail || "").split("\n");

  return (
    <section id="location" className="py-5 bg-white">
      <div className="container">
        <div className="text-center mb-5">
          <p className="section-label">Find Us</p>
          <h2 className="section-title">Our Location</h2>
          <div className="divider-green mx-auto"></div>
        </div>
        <div className="row g-4 align-items-stretch">
          <div className="col-lg-4">
            <div
              className="p-4 rounded-3 h-100"
              style={{ background: "var(--maze-green-light)" }}
            >
              <h5 className="fw-bold mb-4">Visit Our Showroom</h5>
              <div className="d-flex gap-3 mb-3">
                <i className="bi bi-geo-alt-fill text-success fs-5 mt-1"></i>
                <div>
                  <strong>Address</strong>
                  <br />
                  <span className="text-secondary small">
                    {settings.location}
                    <br />
                    Nairobi, Kenya
                  </span>
                </div>
              </div>
              <div className="d-flex gap-3 mb-3">
                <i className="bi bi-clock-fill text-success fs-5 mt-1"></i>
                <div>
                  <strong>Business Hours</strong>
                  <br />
                  <span className="text-secondary small">
                    {hoursLines.map((line) => (
                      <span key={line}>
                        {line}
                        <br />
                      </span>
                    ))}
                  </span>
                </div>
              </div>
              <div className="d-flex gap-3 mb-3">
                <i className="bi bi-telephone-fill text-success fs-5 mt-1"></i>
                <div>
                  <strong>Phone</strong>
                  <br />
                  <a
                    href={telHref(settings.phone)}
                    className="text-success small"
                  >
                    {settings.phone}
                  </a>
                </div>
              </div>
              <div className="d-flex gap-3">
                <i className="bi bi-envelope-fill text-success fs-5 mt-1"></i>
                <div>
                  <strong>Email</strong>
                  <br />
                  <a
                    href={`mailto:${settings.email}`}
                    className="text-success small"
                  >
                    {settings.email}
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-8">
            <div
              className="ratio ratio-16x9 rounded-3 overflow-hidden"
              style={{ minHeight: 300 }}
            >
              <iframe
                src={mapSrc}
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Maze location map"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
