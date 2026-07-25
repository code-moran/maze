import type { WhyChooseItem } from "@/data/types";

export default function WhyChoose({ items }: { items: WhyChooseItem[] }) {
  return (
    <section className="py-5" style={{ background: "var(--gray-light)" }}>
      <div className="container">
        <div className="text-center mb-5">
          <p className="section-label">Why Maze</p>
          <h2 className="section-title">Why Choose Us</h2>
          <div className="divider-green mx-auto"></div>
        </div>
        <div className="row g-4">
          {items.map((item) => (
            <div key={item.title} className="col-md-6 col-lg-3">
              <div className="why-card h-100">
                <div className="icon-box">
                  <i className={`bi ${item.icon}`}></i>
                </div>
                <h6 className="fw-bold">{item.title}</h6>
                <p className="text-secondary small mb-0">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
