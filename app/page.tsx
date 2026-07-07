import { siteData } from "./data/siteData";

const formatNumber = (value: string) => value.replace(/\+/, "");

export default function HomePage() {
  const data = siteData;
  const phoneLink = `tel:${formatNumber(data.generalSettings.phone)}`;
  const emailLink = `mailto:${data.generalSettings.email}`;

  return (
    <main>
      <div className="topbar d-none d-md-block">
        <div className="container d-flex justify-content-between align-items-center">
          <div className="d-flex gap-3">
            <span>
              <i className="bi bi-telephone-fill me-1"></i>
              <a href={phoneLink}>{data.generalSettings.phone}</a>
            </span>
            <span>
              <i className="bi bi-envelope-fill me-1"></i>
              <a href={emailLink}>{data.generalSettings.email}</a>
            </span>
          </div>
          <div className="d-flex gap-2 align-items-center"></div>
        </div>
      </div>

      <nav className="navbar navbar-expand-lg sticky-top" id="mainNav">
        <div className="container">
          <a className="navbar-brand" href="#home">
            Maze<span>Tech</span>
          </a>
          <button
            className="navbar-toggler border-0"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#mobileMenu"
            aria-label="Toggle navigation"
          >
            <i
              className="bi bi-list fs-4"
              style={{ color: "var(--maze-green)" }}
            ></i>
          </button>
          <div className="collapse navbar-collapse" id="mainNavCollapse">
            <ul className="navbar-nav ms-auto align-items-center gap-1">
              <li className="nav-item">
                <a className="nav-link active" href="#home">
                  Home
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#about">
                  About Us
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#products">
                  Products
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#services">
                  Installation Services
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#contact">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="offcanvas offcanvas-start" id="mobileMenu" tabIndex={-1}>
        <div
          className="offcanvas-header"
          style={{ background: "var(--maze-green)" }}
        >
          <span className="fw-bold fs-5 text-white">
            Maze<span style={{ color: "#c8f5c8" }}>Tech</span>
          </span>
          <button
            type="button"
            className="btn-close btn-close-white"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div className="offcanvas-body p-0">
          <div className="accordion accordion-flush" id="mobileAccordion">
            <div className="accordion-item border-0">
              <h2 className="accordion-header">
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#mc1"
                >
                  About Us
                </button>
              </h2>
              <div
                id="mc1"
                className="accordion-collapse collapse"
                data-bs-parent="#mobileAccordion"
              >
                <div className="accordion-body py-0">
                  <a
                    className="d-block py-2 ps-3 text-decoration-none text-dark border-bottom"
                    href="#about"
                    data-bs-dismiss="offcanvas"
                  >
                    About Maze
                  </a>
                  <a
                    className="d-block py-2 ps-3 text-decoration-none text-dark border-bottom"
                    href="#blog"
                    data-bs-dismiss="offcanvas"
                  >
                    Blog
                  </a>
                  <a
                    className="d-block py-2 ps-3 text-decoration-none text-dark"
                    href="#location"
                    data-bs-dismiss="offcanvas"
                  >
                    Location
                  </a>
                </div>
              </div>
            </div>
            <div className="accordion-item border-0">
              <h2 className="accordion-header">
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#mc2"
                >
                  Products
                </button>
              </h2>
              <div
                id="mc2"
                className="accordion-collapse collapse"
                data-bs-parent="#mobileAccordion"
              >
                <div className="accordion-body py-0">
                  <a
                    className="d-block py-2 ps-3 text-decoration-none text-dark border-bottom"
                    href="#products"
                    data-bs-dismiss="offcanvas"
                  >
                    TV Wall Mounts
                  </a>
                  <a
                    className="d-block py-2 ps-3 text-decoration-none text-dark border-bottom"
                    href="#products"
                    data-bs-dismiss="offcanvas"
                  >
                    Guards
                  </a>
                  <a
                    className="d-block py-2 ps-3 text-decoration-none text-dark border-bottom"
                    href="#products"
                    data-bs-dismiss="offcanvas"
                  >
                    Solar Outdoor Lights
                  </a>
                  <a
                    className="d-block py-2 ps-3 text-decoration-none text-dark"
                    href="#products"
                    data-bs-dismiss="offcanvas"
                  >
                    Extension Cables
                  </a>
                </div>
              </div>
            </div>
          </div>
          <a
            href="#services"
            className="d-block px-4 py-3 border-top text-decoration-none text-dark fw-500"
            data-bs-dismiss="offcanvas"
          >
            Installation Services
          </a>
          <a
            href="#contact"
            className="d-block px-4 py-3 border-top text-decoration-none text-dark fw-500"
            data-bs-dismiss="offcanvas"
          >
            Contact Us
          </a>
          <div className="px-4 pt-3">
            <a href={phoneLink} className="btn btn-maze w-100">
              <i className="bi bi-telephone-fill me-2"></i>
              {data.generalSettings.phone}
            </a>
          </div>
        </div>
      </div>

      <section id="home">
        <div
          id="heroCarousel"
          className="carousel slide hero-carousel"
          data-bs-ride="carousel"
          data-bs-interval="5000"
        >
          <div className="carousel-indicators">
            {data.sections.heroSlides.map((slide: any, index: number) => (
              <button
                key={index}
                type="button"
                data-bs-target="#heroCarousel"
                data-bs-slide-to={index}
                className={index === 0 ? "active" : ""}
              ></button>
            ))}
          </div>
          <div className="carousel-inner">
            {data.sections.heroSlides.map((slide: any, index: number) => (
              <div
                key={index}
                className={`carousel-item ${index === 0 ? "active" : ""}`}
                style={{
                  background:
                    index === 0
                      ? "linear-gradient(135deg,#003300 0%,#005500 60%,#007700 100%)"
                      : index === 1
                        ? "linear-gradient(135deg,#002200 0%,#004400 60%,#006600 100%)"
                        : "linear-gradient(135deg,#001800 0%,#003300 60%,#005500 100%)",
                }}
              >
                <div className="hero-caption">
                  <div className="fade-up">
                    <span
                      className="badge mb-3"
                      style={{
                        background: "rgba(255,255,255,.15)",
                        color: "#c8f5c8",
                        fontSize: ".8rem",
                        padding: "6px 14px",
                        borderRadius: "20px",
                      }}
                    >
                      {slide.badge}
                    </span>
                    <h1 dangerouslySetInnerHTML={{ __html: slide.title }} />
                    <p>{slide.description}</p>
                    <div className="d-flex flex-wrap gap-2">
                      <a href="#products" className="btn btn-maze">
                        View Products
                      </a>
                      <a
                        href="#services"
                        className="btn btn-maze-outline"
                        style={{ borderColor: "#c8f5c8", color: "#c8f5c8" }}
                      >
                        Request Installation
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="stats-bar">
        <div className="container">
          <div className="row g-4 text-center">
            <div className="col-6 col-md-3 stat-item">
              <div className="stat-num">
                {data.products.length.toLocaleString()}+
              </div>
              <div className="stat-label">Products Installed</div>
            </div>
            <div className="col-6 col-md-3 stat-item">
              <div className="stat-num">1,800+</div>
              <div className="stat-label">Happy Clients</div>
            </div>
            <div className="col-6 col-md-3 stat-item">
              <div className="stat-num">8+</div>
              <div className="stat-label">Years Experience</div>
            </div>
            <div className="col-6 col-md-3 stat-item">
              <div className="stat-num">24/7</div>
              <div className="stat-label">Customer Support</div>
            </div>
          </div>
        </div>
      </div>

      <section id="products" className="py-5" style={{ background: "#fafffe" }}>
        <div className="container">
          <div className="text-center mb-4">
            <p className="section-label">{data.sections.productsIntro.label}</p>
            <h2 className="section-title">
              {data.sections.productsIntro.title}
            </h2>
            <div className="divider-green mx-auto"></div>
            <p className="section-sub">
              {data.sections.productsIntro.subtitle}
            </p>
          </div>
          <div className="row g-4">
            {data.products.map((product: any) => (
              <div key={product.id} className="col-12 col-md-6 col-lg-4">
                <div className="card product-card h-100 shadow-sm border-0">
                  <img
                    src={product.imgs[0]}
                    className="card-img-top"
                    alt={product.name}
                  />
                  <div className="card-body">
                    <span className="badge bg-success mb-2">
                      {product.catLabel}
                    </span>
                    <h5 className="card-title">{product.name}</h5>
                    <p className="card-text">{product.shortDesc}</p>
                    <a href="#contact" className="btn btn-maze btn-sm">
                      Request Quote
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="services" className="py-5">
        <div className="container">
          <div className="text-center mb-4">
            <p className="section-label">{data.sections.servicesIntro.label}</p>
            <h2 className="section-title">
              {data.sections.servicesIntro.title}
            </h2>
            <div className="divider-green mx-auto"></div>
            <p className="section-sub">
              {data.sections.servicesIntro.subtitle}
            </p>
          </div>
          <div className="row g-4">
            {Object.values(data.serviceCharges).map(
              (service: any, index: number) => (
                <div key={index} className="col-12 col-md-4">
                  <div className="service-card p-4 h-100 shadow-sm border-0">
                    <h5>{service.label}</h5>
                    <p>{service.amount}</p>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      <section id="about" className="py-5" style={{ background: "#f4f8f4" }}>
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-6">
              <p className="section-label">{data.sections.aboutIntro.label}</p>
              <h2 className="section-title">
                {data.sections.aboutIntro.title}
              </h2>
              <p>{data.sections.aboutIntro.paragraphOne}</p>
              <p>{data.sections.aboutIntro.paragraphTwo}</p>
            </div>
            <div className="col-lg-6">
              <div className="about-grid">
                <div className="about-card">
                  <h5>{data.sections.aboutIntro.visionTitle}</h5>
                  <p>{data.sections.aboutIntro.visionText}</p>
                </div>
                <div className="about-card">
                  <h5>{data.sections.aboutIntro.missionTitle}</h5>
                  <p>{data.sections.aboutIntro.missionText}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="blog" className="py-5">
        <div className="container">
          <div className="text-center mb-4">
            <p className="section-label">News & Tips</p>
            <h2 className="section-title">Latest from Our Blog</h2>
            <div className="divider-green mx-auto"></div>
          </div>
          <div className="row g-4">
            {data.blogs.map((entry: any) => (
              <div key={entry.id} className="col-12 col-md-4">
                <div className="card blog-card h-100 shadow-sm border-0">
                  <img
                    src={entry.image}
                    className="card-img-top"
                    alt={entry.title}
                  />
                  <div className="card-body">
                    <h5>{entry.title}</h5>
                    <p>{entry.excerpt}</p>
                    <a href={entry.link} className="text-success">
                      Read more
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-5" style={{ background: "#fafffe" }}>
        <div className="container">
          <div className="row g-4 align-items-center">
            <div className="col-lg-6">
              <p className="section-label">
                {data.sections.contactIntro.label}
              </p>
              <h2 className="section-title">
                {data.sections.contactIntro.title}
              </h2>
              <p>{data.sections.contactIntro.subtitle}</p>
              <div className="contact-list">
                <a href={phoneLink} className="contact-item">
                  <i className="bi bi-telephone-fill"></i>
                  {data.generalSettings.phone}
                </a>
                <a href={emailLink} className="contact-item">
                  <i className="bi bi-envelope-fill"></i>
                  {data.generalSettings.email}
                </a>
                <div className="contact-item">
                  <i className="bi bi-geo-alt-fill"></i>
                  {data.generalSettings.location}
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="contact-card p-4 shadow-sm border-0">
                <h5>Send a message</h5>
                <form>
                  <div className="mb-3">
                    <input className="form-control" placeholder="Name" />
                  </div>
                  <div className="mb-3">
                    <input className="form-control" placeholder="Email" />
                  </div>
                  <div className="mb-3">
                    <textarea
                      className="form-control"
                      rows={4}
                      placeholder="Message"
                    />
                  </div>
                  <button type="button" className="btn btn-maze">
                    Submit
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
