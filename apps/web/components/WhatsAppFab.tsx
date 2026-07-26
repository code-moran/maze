import { whatsappLink } from "@/data/siteData";

export default function WhatsAppFab({ href }: { href: string }) {
  return (
    <a
      href={whatsappLink(href)}
      id="whatsappFab"
      className="whatsapp-fab"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
    >
      <i className="bi bi-whatsapp"></i>
    </a>
  );
}
