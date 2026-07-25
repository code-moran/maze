import type { Testimonial } from "@/data/types";

export default function Testimonials({ items }: { items: Testimonial[] }) {
  return (
    <section className="py-5" style={{ background: "var(--gray-light)" }}>
      <div className="container">
        <div className="text-center mb-5">
          <p className="section-label">Client Reviews</p>
          <h2 className="section-title">What Our Clients Say</h2>
          <div className="divider-green mx-auto"></div>
        </div>
        <div className="row g-4">
          {items.map((item) => (
            <div key={item.name} className="col-md-4">
              <div className="testimonial-card">
                <div className="stars">{item.stars}</div>
                <p className="text-secondary small mb-3">&quot;{item.quote}&quot;</p>
                <div className="d-flex align-items-center gap-2">
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: "var(--maze-green)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: ".9rem",
                    }}
                  >
                    {item.initials}
                  </div>
                  <div>
                    <div className="fw-bold small">{item.name}</div>
                    <div className="text-secondary" style={{ fontSize: ".78rem" }}>
                      {item.role}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
