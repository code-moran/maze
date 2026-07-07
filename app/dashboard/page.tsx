import { siteData } from "../data/siteData";

export default function DashboardPage() {
  const data = siteData;

  return (
    <main className="dashboard-shell">
      <div className="topbar d-none d-md-block">
        <div className="container d-flex justify-content-between align-items-center">
          <div className="d-flex gap-3">
            <span>
              <i className="bi bi-shield-lock-fill me-1"></i>Content Dashboard
            </span>
            <span>
              <i className="bi bi-database-fill me-1"></i>Local data preview
            </span>
          </div>
          <div className="d-flex gap-2 align-items-center">
            <a href="/" className="text-white-50">
              View Website
            </a>
          </div>
        </div>
      </div>

      <nav className="navbar navbar-expand-lg sticky-top" id="mainNav">
        <div className="container">
          <a className="navbar-brand" href="/">
            Maze<span>Tech</span>
          </a>
          <div className="ms-auto d-flex align-items-center gap-2">
            <a href="/" className="btn btn-maze-outline btn-sm">
              <i className="bi bi-globe me-1"></i>View Site
            </a>
          </div>
        </div>
      </nav>

      <div className="breadcrumb-bar">
        <div className="container">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb maze-breadcrumb mb-0">
              <li className="breadcrumb-item">
                <a href="/">Website</a>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Dashboard
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <section className="dashboard-hero py-5">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <p
                className="section-label text-white mb-2"
                style={{ letterSpacing: "3px" }}
              >
                MazeTech Admin
              </p>
              <h1>Website Dashboard</h1>
              <p className="mb-0 text-white-50">
                Preview site content and metadata in a Next.js dashboard page.
              </p>
            </div>
            <div className="col-lg-4">
              <div className="dashboard-note">
                This dashboard is a static content preview built from the same
                site data.
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="py-5">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-3">
              <div className="dashboard-nav">
                <a className="nav-link active" href="#overview">
                  <i className="bi bi-speedometer2 me-2"></i>Overview
                </a>
                <a className="nav-link" href="#content">
                  <i className="bi bi-layout-text-window-reverse me-2"></i>
                  Content
                </a>
                <a className="nav-link" href="#products">
                  <i className="bi bi-box-seam me-2"></i>Products
                </a>
                <a className="nav-link" href="#blogs">
                  <i className="bi bi-journal-text me-2"></i>Blogs
                </a>
              </div>
            </div>
            <div className="col-lg-9">
              <section id="overview" className="mb-4 dashboard-panel">
                <div className="row g-3">
                  <div className="col-md-4">
                    <div className="dashboard-stat">
                      <div className="value">{data.products.length}</div>
                      <div className="label">Products Managed</div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="dashboard-stat">
                      <div className="value">{data.inquiries.length}</div>
                      <div className="label">Saved Inquiries</div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="dashboard-stat">
                      <div className="value">
                        {Object.keys(data.sectionSeo).length +
                          Object.keys(data.categorySeo).length}
                      </div>
                      <div className="label">SEO Records</div>
                    </div>
                  </div>
                </div>
                <div className="dashboard-panel mt-4">
                  <h3>Data Actions</h3>
                  <div className="d-flex flex-wrap gap-2">
                    <button className="btn btn-maze" type="button">
                      <i className="bi bi-download me-2"></i>Export Preview
                    </button>
                    <button className="btn btn-maze-outline" type="button">
                      <i className="bi bi-arrow-counterclockwise me-2"></i>Reset
                      Preview
                    </button>
                  </div>
                </div>
              </section>

              <section id="content" className="dashboard-panel mb-4">
                <h3>Home Content</h3>
                <div className="row g-4">
                  <div className="col-md-4">
                    <strong>Hero Slides</strong>
                    <p>{data.sections.heroSlides.length} items</p>
                  </div>
                  <div className="col-md-4">
                    <strong>About Section</strong>
                    <p>{data.sections.aboutIntro.title}</p>
                  </div>
                  <div className="col-md-4">
                    <strong>Contact</strong>
                    <p>{data.generalSettings.email}</p>
                  </div>
                </div>
              </section>

              <section id="products" className="dashboard-panel mb-4">
                <h3>Products ({data.products.length})</h3>
                <div className="dashboard-table-wrap">
                  <table className="table dashboard-table mb-0">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Short Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.products.slice(0, 8).map((product: any) => (
                        <tr key={product.id}>
                          <td>{product.name}</td>
                          <td>{product.catLabel}</td>
                          <td>{product.shortDesc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section id="blogs" className="dashboard-panel mb-4">
                <h3>Blog Entries</h3>
                <div className="dashboard-table-wrap">
                  <table className="table dashboard-table mb-0">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Date</th>
                        <th>Excerpt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.blogs.map((blog: any) => (
                        <tr key={blog.id}>
                          <td>{blog.title}</td>
                          <td>{blog.date}</td>
                          <td>{blog.excerpt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </main>
  );
}
