import Link from "next/link";
import { whatsappLink } from "@/data/siteData";
import type { CtaContent } from "@/data/types";

export default function CtaBanner({
  cta,
  whatsapp,
}: {
  cta: CtaContent;
  whatsapp: string;
}) {
  return (
    <div className="cta-banner">
      <div className="container">
        <h2>{cta.title}</h2>
        <p className="mb-4 opacity-75">{cta.subtitle}</p>
        <div className="d-flex flex-wrap gap-3 justify-content-center">
          <Link href="/contact" className="btn btn-light fw-bold px-4">
            <i className="bi bi-chat-dots me-2"></i>Get a Free Quote
          </Link>
          <a
            href={whatsappLink(whatsapp)}
            className="btn fw-bold px-4"
            style={{ background: "#25d366", color: "#fff" }}
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="bi bi-whatsapp me-2"></i>WhatsApp Us
          </a>
        </div>
      </div>
    </div>
  );
}
