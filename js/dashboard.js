const CATEGORY_LABELS = {
  "tv-mounts": "TV Wall Mounts",
  guards: "Guards",
  solar: "Solar Outdoor Lights",
  cables: "Extension Cables"
};

let activeProductId = null;
let activeSubProductCategory = "tv-mounts";
let activeSubProductId = null;
let socialRowSeed = 0;
let currentProductImages = [];
let productReplaceIndex = null;
let activeBlogId = null;
let currentBlogImage = "";

const DASHBOARD_SECTION_LABELS = {
  overview: "Overview",
  "general-settings": "Settings",
  "installation-charges": "Charges",
  "page-content": "Page Text",
  "products-manager": "Products",
  "subproducts-manager": "Sub Products",
  "inquiries-manager": "Inquiries",
  "blogs-manager": "Blogs",
  "seo-manager": "SEO"
};

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("File read failed"));
    reader.readAsDataURL(file);
  });
}

function getDashboardData() {
  return window.MazeContent.getSiteData();
}

function showDashboardAlert(message) {
  const alertBox = document.getElementById("dashboardAlert");
  alertBox.textContent = message;
  alertBox.classList.remove("d-none");

  window.clearTimeout(showDashboardAlert.timeoutId);
  showDashboardAlert.timeoutId = window.setTimeout(() => {
    alertBox.classList.add("d-none");
  }, 2500);
}

function updateDashboardBreadcrumb() {
  const list = document.getElementById("dashboardBreadcrumb");
  if (!list) return;

  const hash = (window.location.hash || "#overview").replace("#", "");
  const section = DASHBOARD_SECTION_LABELS[hash] ? hash : "overview";
  const label = DASHBOARD_SECTION_LABELS[section];

  list.innerHTML = `
    <li class="breadcrumb-item"><a href="maze-technologies.html">Website</a></li>
    <li class="breadcrumb-item"><a href="dashboard.html#overview">Dashboard</a></li>
    <li class="breadcrumb-item active" aria-current="page">${label}</li>
  `;
}

function textToHtml(text) {
  return (text || "").replace(/\n/g, "<br>");
}

function htmlToText(text) {
  return (text || "").replace(/<br\s*\/?>/gi, "\n");
}

function parseLines(text) {
  return (text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseSpecs(text) {
  return parseLines(text).map((line) => {
    const parts = line.split(":");
    const label = (parts.shift() || "").trim();
    const value = parts.join(":").trim();
    return [label, value];
  }).filter(([label, value]) => label && value);
}

function formatSpecs(specs) {
  return (specs || []).map((spec) => `${spec[0]}: ${spec[1]}`).join("\n");
}

function nextProductId(products) {
  return products.reduce((maxId, product) => Math.max(maxId, Number(product.id) || 0), 0) + 1;
}

function normalizeSubProductId(value) {
  return (value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

function getSubProducts(data, category) {
  return data.subProducts && data.subProducts[category] ? data.subProducts[category] : [];
}

function getSubProductLabel(data, category, subCatId) {
  const list = getSubProducts(data, category);
  const match = list.find((item) => item.id === subCatId);
  return match ? match.label : "";
}

function ensureSubProductSelection(data, category, selectedId) {
  const list = getSubProducts(data, category);
  if (!list.length) {
    return "";
  }
  if (selectedId && list.some((item) => item.id === selectedId)) {
    return selectedId;
  }
  return list[0].id;
}

function updateProductSubCategoryOptions(category, selectedId) {
  const data = getDashboardData();
  const select = document.getElementById("productSubCategory");
  const list = getSubProducts(data, category);
  const nextSelected = ensureSubProductSelection(data, category, selectedId);

  select.innerHTML = list.map((item) => `
    <option value="${item.id}">${item.label}</option>
  `).join("");

  if (nextSelected) {
    select.value = nextSelected;
  }
}

function renderStats(data) {
  document.getElementById("statProducts").textContent = data.products.length;
  document.getElementById("statInquiries").textContent = data.inquiries.length;
  document.getElementById("statSeo").textContent = Object.keys(data.sectionSeo).length + Object.keys(data.categorySeo).length;
}

function ensureGeneralSettings(data) {
  if (!data.generalSettings) {
    data.generalSettings = {
      phone: "",
      email: "",
      whatsapp: "",
      location: "",
      mapEmbed: "",
      socialLinks: []
    };
  }
  if (!("mapEmbed" in data.generalSettings)) {
    data.generalSettings.mapEmbed = "";
  }
  if (!Array.isArray(data.generalSettings.socialLinks)) {
    data.generalSettings.socialLinks = [];
  }
}

function renderGeneralSettings(data) {
  const form = document.getElementById("generalSettingsForm");
  if (!form) return;

  ensureGeneralSettings(data);

  document.getElementById("settingsPhone").value = data.generalSettings.phone || "";
  document.getElementById("settingsEmail").value = data.generalSettings.email || "";
  document.getElementById("settingsWhatsapp").value = data.generalSettings.whatsapp || "";
  document.getElementById("settingsLocation").value = data.generalSettings.location || "";
  document.getElementById("settingsMapEmbed").value = data.generalSettings.mapEmbed || "";

  renderSocialRows(data.generalSettings.socialLinks);
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderSocialRows(links) {
  const body = document.getElementById("socialLinksBody");
  if (!body) return;

  const list = Array.isArray(links) ? links : [];
  if (!list.length) {
    body.innerHTML = `
      <tr>
        <td colspan="5">
          <div class="empty-state">No social links yet. Add platforms and activate the ones you want to show on the website.</div>
        </td>
      </tr>
    `;
    return;
  }

  body.innerHTML = list.map((item, index) => `
    <tr data-social-row="${index}">
      <td><input class="form-control form-control-sm social-platform" value="${escapeHtml(item.platform)}" placeholder="Facebook"></td>
      <td><input class="form-control form-control-sm social-icon" value="${escapeHtml(item.icon)}" placeholder="facebook"></td>
      <td><input class="form-control form-control-sm social-handle" value="${escapeHtml(item.handle)}" placeholder="@handle"></td>
      <td><input class="form-control form-control-sm social-url" value="${escapeHtml(item.url)}" placeholder="https://..."></td>
      <td class="text-center">
        <input class="form-check-input social-enabled" type="checkbox" ${item.enabled ? "checked" : ""}>
      </td>
      <td class="text-end">
        <button type="button" class="btn btn-sm btn-maze-outline remove-social">Remove</button>
      </td>
    </tr>
  `).join("");

  body.querySelectorAll(".remove-social").forEach((btn) => {
    btn.addEventListener("click", () => {
      const row = btn.closest("tr");
      const rowIndex = Number(row.getAttribute("data-social-row"));
      window.MazeContent.updateSiteData((siteData) => {
        ensureGeneralSettings(siteData);
        siteData.generalSettings.socialLinks.splice(rowIndex, 1);
        return siteData;
      });
      renderDashboard();
      showDashboardAlert("Social platform removed.");
    });
  });
}

function fillPageContentForm(data) {
  const slides = data.sections.heroSlides;
  document.getElementById("hero1Badge").value = slides[0]?.badge || "";
  document.getElementById("hero1Title").value = htmlToText(slides[0]?.title || "");
  document.getElementById("hero1Description").value = slides[0]?.description || "";
  document.getElementById("hero2Badge").value = slides[1]?.badge || "";
  document.getElementById("hero2Title").value = htmlToText(slides[1]?.title || "");
  document.getElementById("hero2Description").value = slides[1]?.description || "";
  document.getElementById("hero3Badge").value = slides[2]?.badge || "";
  document.getElementById("hero3Title").value = htmlToText(slides[2]?.title || "");
  document.getElementById("hero3Description").value = slides[2]?.description || "";

  document.getElementById("productsLabelInput").value = data.sections.productsIntro.label;
  document.getElementById("productsTitleInput").value = data.sections.productsIntro.title;
  document.getElementById("productsSubtitleInput").value = data.sections.productsIntro.subtitle;

  document.getElementById("servicesLabelInput").value = data.sections.servicesIntro.label;
  document.getElementById("servicesTitleInput").value = data.sections.servicesIntro.title;
  document.getElementById("servicesSubtitleInput").value = data.sections.servicesIntro.subtitle;

  document.getElementById("aboutLabelInput").value = data.sections.aboutIntro.label;
  document.getElementById("aboutTitleInput").value = data.sections.aboutIntro.title;
  document.getElementById("aboutParagraphOneInput").value = data.sections.aboutIntro.paragraphOne;
  document.getElementById("aboutParagraphTwoInput").value = data.sections.aboutIntro.paragraphTwo;
  document.getElementById("visionTitleInput").value = data.sections.aboutIntro.visionTitle;
  document.getElementById("visionTextInput").value = data.sections.aboutIntro.visionText;
  document.getElementById("missionTitleInput").value = data.sections.aboutIntro.missionTitle;
  document.getElementById("missionTextInput").value = data.sections.aboutIntro.missionText;

  document.getElementById("contactLabelInput").value = data.sections.contactIntro.label;
  document.getElementById("contactTitleInput").value = data.sections.contactIntro.title;
  document.getElementById("contactSubtitleInput").value = data.sections.contactIntro.subtitle;
}

function renderProductList(data) {
  const list = document.getElementById("productList");

  if (!data.products.length) {
    list.innerHTML = '<div class="empty-state">No products available yet.</div>';
    return;
  }

  list.innerHTML = data.products.map((product) => `
    <div class="dashboard-item ${product.id === activeProductId ? "active" : ""}" data-product-id="${product.id}">
      <div class="d-flex gap-3">
        <img src="${product.imgs[0] || ""}" alt="${product.name}" class="dashboard-thumb">
        <div class="flex-grow-1">
          <div class="fw-bold">${product.name}</div>
          <div class="small text-secondary">${product.catLabel}${product.subCat ? ` · ${getSubProductLabel(data, product.cat, product.subCat)}` : ""}</div>
          <div class="small text-secondary mt-2">${product.shortDesc}</div>
        </div>
      </div>
    </div>
  `).join("");

  list.querySelectorAll("[data-product-id]").forEach((item) => {
    item.addEventListener("click", () => {
      activeProductId = Number(item.getAttribute("data-product-id"));
      const latestData = getDashboardData();
      renderProductList(latestData);
      fillProductForm(latestData.products.find((product) => product.id === activeProductId));
    });
  });
}

function fillProductForm(product) {
  if (!product) return;

  document.getElementById("productId").value = product.id;
  document.getElementById("productName").value = product.name || "";
  document.getElementById("productCategory").value = product.cat || "tv-mounts";
  updateProductSubCategoryOptions(product.cat || "tv-mounts", product.subCat || "");
  currentProductImages = Array.isArray(product.imgs) ? [...product.imgs] : [];
  renderProductImagePreview();
  const fileInput = document.getElementById("productImageFiles");
  if (fileInput) fileInput.value = "";
  document.getElementById("productShortDesc").value = product.shortDesc || "";
  document.getElementById("productDesc").value = product.desc || "";
  document.getElementById("productSeoTitle").value = product.seoTitle || "";
  document.getElementById("productSeoDescription").value = product.seoDescription || "";
  document.getElementById("productSpecs").value = formatSpecs(product.specs || []);
  document.getElementById("productFeatures").value = (product.features || []).join("\n");
}

function renderProductImagePreview() {
  const preview = document.getElementById("productImagePreview");
  if (!preview) return;

  if (!currentProductImages.length) {
    preview.innerHTML = "";
    return;
  }

  preview.innerHTML = currentProductImages.map((src, index) => `
    <div class="d-inline-flex flex-column align-items-stretch" style="width:90px">
      <img src="${src}" alt="Product image ${index + 1}" class="dashboard-thumb">
      <button type="button" class="btn btn-sm btn-warning mt-1 py-0 thumb-action-btn replace-product-image" style="font-size:.75rem" data-image-index="${index}">Replace</button>
      <button type="button" class="btn btn-sm btn-danger mt-1 py-0 thumb-action-btn remove-product-image" style="font-size:.75rem" data-image-index="${index}">Remove</button>
    </div>
  `).join("");

  preview.querySelectorAll(".replace-product-image").forEach((button) => {
    button.addEventListener("click", () => {
      const idx = Number(button.getAttribute("data-image-index"));
      if (!Number.isFinite(idx)) return;
      productReplaceIndex = idx;
      const input = document.getElementById("productReplaceFile");
      if (!input) return;
      input.value = "";
      input.click();
    });
  });

  preview.querySelectorAll(".remove-product-image").forEach((button) => {
    button.addEventListener("click", () => {
      const idx = Number(button.getAttribute("data-image-index"));
      currentProductImages.splice(idx, 1);
      renderProductImagePreview();
    });
  });
}

function createBlankProduct() {
  const data = getDashboardData();
  const category = "tv-mounts";
  const subCat = ensureSubProductSelection(data, category, "");
  return {
    id: nextProductId(data.products),
    name: "New Product",
    cat: category,
    catLabel: CATEGORY_LABELS[category],
    subCat,
    shortDesc: "",
    desc: "",
    seoTitle: "",
    seoDescription: "",
    specs: [],
    features: [],
    imgs: ["https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&auto=format&fit=crop"]
  };
}

function renderSubProductsManager(data) {
  const categorySelect = document.getElementById("subProductCategorySelect");
  if (!categorySelect) return;

  categorySelect.value = activeSubProductCategory;
  const list = getSubProducts(data, activeSubProductCategory);
  const container = document.getElementById("subProductList");

  if (!activeSubProductId && list.length) {
    activeSubProductId = list[0].id;
  }

  if (!list.length) {
    container.innerHTML = '<div class="empty-state">No sub products yet. Add one to start grouping products.</div>';
  } else {
    container.innerHTML = list.map((item) => `
      <div class="dashboard-item ${item.id === activeSubProductId ? "active" : ""}" data-sub-product-id="${item.id}">
        <div class="d-flex justify-content-between align-items-start gap-3">
          <div>
            <div class="fw-bold">${item.label}</div>
            <div class="small text-secondary">${item.id}</div>
          </div>
          <button type="button" class="btn btn-sm btn-maze-outline sub-product-delete" data-sub-product-id="${item.id}">
            Delete
          </button>
        </div>
      </div>
    `).join("");
  }

  container.querySelectorAll("[data-sub-product-id]").forEach((row) => {
    row.addEventListener("click", (event) => {
      if (event.target.closest(".sub-product-delete")) return;
      activeSubProductId = row.getAttribute("data-sub-product-id");
      const latest = getDashboardData();
      renderSubProductsManager(latest);
      fillSubProductForm(latest);
    });
  });

  container.querySelectorAll(".sub-product-delete").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const id = button.getAttribute("data-sub-product-id");
      deleteSubProduct(activeSubProductCategory, id);
    });
  });

  fillSubProductForm(data);
}

function fillSubProductForm(data) {
  const list = getSubProducts(data, activeSubProductCategory);
  const current = list.find((item) => item.id === activeSubProductId) || null;
  document.getElementById("subProductOriginalId").value = current ? current.id : "";
  document.getElementById("subProductId").value = current ? current.id : "";
  document.getElementById("subProductLabel").value = current ? current.label : "";
}

function deleteSubProduct(category, subProductId) {
  if (!subProductId) return;

  const snapshot = getDashboardData();
  const currentList = getSubProducts(snapshot, category);
  if (currentList.length <= 1) {
    showDashboardAlert("Keep at least one sub product per category.");
    return;
  }

  window.MazeContent.updateSiteData((data) => {
    const list = getSubProducts(data, category).filter((item) => item.id !== subProductId);
    data.subProducts[category] = list;

    const fallback = list[0] ? list[0].id : "";
    data.products.forEach((product) => {
      if (product.cat === category && product.subCat === subProductId) {
        product.subCat = fallback;
      }
    });

    return data;
  });

  const latest = getDashboardData();
  activeSubProductId = latest.subProducts[category]?.[0]?.id || null;
  renderDashboard();
  showDashboardAlert("Sub product deleted.");
}

function renderInquiries(data) {
  const tbody = document.getElementById("inquiriesTableBody");

  if (!data.inquiries.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty-state">No inquiries have been captured yet.</div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = data.inquiries.map((inquiry) => {
    const statusClass = inquiry.status === "In Progress"
      ? "status-progress"
      : inquiry.status === "Closed"
        ? "status-closed"
        : "status-new";

    return `
      <tr>
        <td>
          <div class="fw-semibold">${inquiry.name || "-"}</div>
        </td>
        <td>
          <div>${inquiry.phone || "-"}</div>
          <div class="small text-secondary">${inquiry.email || "-"}</div>
        </td>
        <td>${inquiry.subject || "-"}</td>
        <td>
          <span class="status-pill ${statusClass} d-block mb-2">${inquiry.status || "New"}</span>
          <select class="form-select form-select-sm inquiry-status" data-inquiry-id="${inquiry.id}">
            <option ${inquiry.status === "New" ? "selected" : ""}>New</option>
            <option ${inquiry.status === "In Progress" ? "selected" : ""}>In Progress</option>
            <option ${inquiry.status === "Closed" ? "selected" : ""}>Closed</option>
          </select>
        </td>
        <td class="small">${new Date(inquiry.createdAt).toLocaleString()}</td>
        <td>
          <div class="d-flex flex-column gap-2">
            <button class="btn btn-sm btn-maze view-inquiry" type="button" data-inquiry-id="${inquiry.id}">View</button>
            <button class="btn btn-sm btn-maze-outline delete-inquiry" type="button" data-inquiry-id="${inquiry.id}">Delete</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  tbody.querySelectorAll(".view-inquiry").forEach((button) => {
    button.addEventListener("click", () => {
      const inquiryId = Number(button.getAttribute("data-inquiry-id"));
      const latest = getDashboardData();
      const inquiry = latest.inquiries.find((item) => item.id === inquiryId);
      if (!inquiry) return;

      document.getElementById("inquiryViewName").textContent = inquiry.name || "-";
      document.getElementById("inquiryViewPhone").textContent = inquiry.phone || "-";
      document.getElementById("inquiryViewEmail").textContent = inquiry.email || "-";
      document.getElementById("inquiryViewSubject").textContent = inquiry.subject || "-";
      document.getElementById("inquiryViewMessage").textContent = inquiry.message || "-";
      new bootstrap.Modal(document.getElementById("inquiryModal")).show();
    });
  });

  tbody.querySelectorAll(".inquiry-status").forEach((select) => {
    select.addEventListener("change", () => {
      const inquiryId = Number(select.getAttribute("data-inquiry-id"));
      const status = select.value;

      window.MazeContent.updateSiteData((siteData) => {
        const inquiry = siteData.inquiries.find((item) => item.id === inquiryId);
        if (inquiry) inquiry.status = status;
        return siteData;
      });

      renderDashboard();
      showDashboardAlert("Inquiry status updated.");
    });
  });

  tbody.querySelectorAll(".delete-inquiry").forEach((button) => {
    button.addEventListener("click", () => {
      const inquiryId = Number(button.getAttribute("data-inquiry-id"));

      window.MazeContent.updateSiteData((siteData) => {
        siteData.inquiries = siteData.inquiries.filter((item) => item.id !== inquiryId);
        return siteData;
      });

      renderDashboard();
      showDashboardAlert("Inquiry removed.");
    });
  });
}

function renderSeoForm(data) {
  document.getElementById("siteMetaTitle").value = data.siteMeta.title;
  document.getElementById("siteMetaKeywords").value = data.siteMeta.keywords;
  document.getElementById("siteMetaDescription").value = data.siteMeta.description;
  document.getElementById("siteOgTitle").value = data.siteMeta.ogTitle;
  document.getElementById("siteOgDescription").value = data.siteMeta.ogDescription;

  const sectionContainer = document.getElementById("sectionSeoFields");
  sectionContainer.innerHTML = Object.entries(data.sectionSeo).map(([key, value]) => `
    <div class="col-12">
      <div class="dashboard-note mb-2">${key.charAt(0).toUpperCase() + key.slice(1)} Page SEO</div>
    </div>
    <div class="col-md-6">
      <label class="form-label small fw-semibold">${key} Meta Title</label>
      <input type="text" class="form-control" data-seo-scope="section" data-seo-key="${key}" data-field="title" value="${value.title.replace(/"/g, "&quot;")}">
    </div>
    <div class="col-md-6">
      <label class="form-label small fw-semibold">${key} Meta Description</label>
      <textarea class="form-control" data-seo-scope="section" data-seo-key="${key}" data-field="description">${value.description}</textarea>
    </div>
  `).join("");

  const categoryContainer = document.getElementById("categorySeoFields");
  categoryContainer.innerHTML = Object.entries(data.categorySeo).map(([key, value]) => `
    <div class="col-12">
      <div class="dashboard-note mb-2">${value.title} Section SEO</div>
    </div>
    <div class="col-md-6">
      <label class="form-label small fw-semibold">${value.title} Display Title</label>
      <input type="text" class="form-control" data-seo-scope="category" data-seo-key="${key}" data-field="title" value="${value.title.replace(/"/g, "&quot;")}">
    </div>
    <div class="col-md-6">
      <label class="form-label small fw-semibold">${value.title} Display Description</label>
      <textarea class="form-control" data-seo-scope="category" data-seo-key="${key}" data-field="description">${value.description}</textarea>
    </div>
    <div class="col-md-6">
      <label class="form-label small fw-semibold">${value.title} Meta Title</label>
      <input type="text" class="form-control" data-seo-scope="category" data-seo-key="${key}" data-field="metaTitle" value="${value.metaTitle.replace(/"/g, "&quot;")}">
    </div>
    <div class="col-md-6">
      <label class="form-label small fw-semibold">${value.title} Meta Description</label>
      <textarea class="form-control" data-seo-scope="category" data-seo-key="${key}" data-field="metaDescription">${value.metaDescription}</textarea>
    </div>
  `).join("");
}

function ensureBlogs(data) {
  if (!Array.isArray(data.blogs)) {
    data.blogs = [];
  }
  data.blogs = data.blogs.map((blog) => ({
    ...blog,
    content: blog.content || blog.excerpt || ""
  }));
}

function ensureServiceCharges(data) {
  const defaults = window.MazeContent.DEFAULT_SITE_DATA.serviceCharges;

  if (!data.serviceCharges) {
    data.serviceCharges = structuredClone(defaults);
    return;
  }

  delete data.serviceCharges.electrical;

  ["tv", "solar"].forEach((key) => {
    if (!data.serviceCharges[key]) {
      data.serviceCharges[key] = structuredClone(defaults[key]);
    } else if (!data.serviceCharges[key].description) {
      data.serviceCharges[key].description = defaults[key].description;
    }
  });
}

function nextBlogId(blogs) {
  return blogs.reduce((maxId, blog) => Math.max(maxId, Number(blog.id) || 0), 0) + 1;
}

function renderBlogImagePreview() {
  const preview = document.getElementById("blogImagePreview");
  if (!preview) return;

  if (!currentBlogImage) {
    preview.innerHTML = "";
    return;
  }

  preview.innerHTML = `
    <div class="d-inline-flex flex-column align-items-stretch" style="width:90px">
      <img src="${currentBlogImage}" alt="Blog image" class="dashboard-thumb">
      <button type="button" class="btn btn-sm btn-warning mt-1 py-0 thumb-action-btn" style="font-size:.75rem" id="replaceBlogImageBtn">Replace</button>
      <button type="button" class="btn btn-sm btn-danger mt-1 py-0 thumb-action-btn" style="font-size:.75rem" id="removeBlogImageBtn">Remove</button>
    </div>
  `;

  document.getElementById("replaceBlogImageBtn").addEventListener("click", () => {
    const input = document.getElementById("blogImageFile");
    if (!input) return;
    input.value = "";
    input.click();
  });

  document.getElementById("removeBlogImageBtn").addEventListener("click", () => {
    currentBlogImage = "";
    renderBlogImagePreview();
  });
}

function fillBlogForm(blog) {
  if (!blog) return;

  document.getElementById("blogId").value = blog.id || "";
  document.getElementById("blogTitle").value = blog.title || "";
  document.getElementById("blogDate").value = blog.date || "";
  document.getElementById("blogAuthor").value = blog.author || "";
  document.getElementById("blogExcerpt").value = blog.excerpt || "";
  document.getElementById("blogContent").value = blog.content || blog.excerpt || "";
  document.getElementById("blogLink").value = blog.link || "";

  currentBlogImage = blog.image || "";
  renderBlogImagePreview();

  const fileInput = document.getElementById("blogImageFile");
  if (fileInput) fileInput.value = "";
}

function renderBlogList(data) {
  const list = document.getElementById("blogList");
  if (!list) return;

  ensureBlogs(data);

  if (!activeBlogId && data.blogs.length) {
    activeBlogId = data.blogs[0].id;
  }

  if (!data.blogs.length) {
    list.innerHTML = '<div class="empty-state">No blog posts yet.</div>';
    return;
  }

  list.innerHTML = data.blogs.map((blog) => `
    <div class="dashboard-item ${blog.id === activeBlogId ? "active" : ""}" data-blog-id="${blog.id}">
      <div class="d-flex gap-3">
        <img src="${blog.image || ""}" alt="${escapeHtml(blog.title)}" class="dashboard-thumb">
        <div class="flex-grow-1">
          <div class="fw-bold">${escapeHtml(blog.title)}</div>
          <div class="small text-secondary">${escapeHtml(blog.date)}${blog.author ? ` · ${escapeHtml(blog.author)}` : ""}</div>
          <div class="small text-secondary mt-2">${escapeHtml(blog.excerpt)}</div>
        </div>
      </div>
    </div>
  `).join("");

  list.querySelectorAll("[data-blog-id]").forEach((item) => {
    item.addEventListener("click", () => {
      activeBlogId = Number(item.getAttribute("data-blog-id"));
      const latest = getDashboardData();
      renderBlogList(latest);
      fillBlogForm(latest.blogs.find((blog) => blog.id === activeBlogId));
    });
  });
}

function renderDashboard() {
  const data = getDashboardData();

  if (!activeProductId && data.products.length) {
    activeProductId = data.products[0].id;
  }

  renderStats(data);
  renderGeneralSettings(data);
  ensureServiceCharges(data);
  document.getElementById("chargeTvEnabled").checked = Boolean(data.serviceCharges.tv?.enabled);
  document.getElementById("chargeTvAmount").value = data.serviceCharges.tv?.amount || "";
  document.getElementById("chargeTvDescription").value = data.serviceCharges.tv?.description || "";
  document.getElementById("chargeSolarEnabled").checked = Boolean(data.serviceCharges.solar?.enabled);
  document.getElementById("chargeSolarAmount").value = data.serviceCharges.solar?.amount || "";
  document.getElementById("chargeSolarDescription").value = data.serviceCharges.solar?.description || "";
  fillPageContentForm(data);
  renderProductList(data);
  fillProductForm(data.products.find((product) => product.id === activeProductId) || data.products[0]);
  renderSubProductsManager(data);
  renderInquiries(data);
  renderBlogList(data);
  fillBlogForm(data.blogs.find((blog) => blog.id === activeBlogId) || data.blogs[0]);
  renderSeoForm(data);
}

document.getElementById("pageContentForm").addEventListener("submit", (event) => {
  event.preventDefault();

  window.MazeContent.updateSiteData((data) => {
    data.sections.heroSlides = [
      {
        badge: document.getElementById("hero1Badge").value.trim(),
        title: textToHtml(document.getElementById("hero1Title").value.trim()),
        description: document.getElementById("hero1Description").value.trim()
      },
      {
        badge: document.getElementById("hero2Badge").value.trim(),
        title: textToHtml(document.getElementById("hero2Title").value.trim()),
        description: document.getElementById("hero2Description").value.trim()
      },
      {
        badge: document.getElementById("hero3Badge").value.trim(),
        title: textToHtml(document.getElementById("hero3Title").value.trim()),
        description: document.getElementById("hero3Description").value.trim()
      }
    ];

    data.sections.productsIntro = {
      label: document.getElementById("productsLabelInput").value.trim(),
      title: document.getElementById("productsTitleInput").value.trim(),
      subtitle: document.getElementById("productsSubtitleInput").value.trim()
    };

    data.sections.servicesIntro = {
      label: document.getElementById("servicesLabelInput").value.trim(),
      title: document.getElementById("servicesTitleInput").value.trim(),
      subtitle: document.getElementById("servicesSubtitleInput").value.trim()
    };

    data.sections.aboutIntro = {
      label: document.getElementById("aboutLabelInput").value.trim(),
      title: document.getElementById("aboutTitleInput").value.trim(),
      paragraphOne: document.getElementById("aboutParagraphOneInput").value.trim(),
      paragraphTwo: document.getElementById("aboutParagraphTwoInput").value.trim(),
      visionTitle: document.getElementById("visionTitleInput").value.trim(),
      visionText: document.getElementById("visionTextInput").value.trim(),
      missionTitle: document.getElementById("missionTitleInput").value.trim(),
      missionText: document.getElementById("missionTextInput").value.trim()
    };

    data.sections.contactIntro = {
      label: document.getElementById("contactLabelInput").value.trim(),
      title: document.getElementById("contactTitleInput").value.trim(),
      subtitle: document.getElementById("contactSubtitleInput").value.trim()
    };

    return data;
  });

  renderDashboard();
  showDashboardAlert("Saved.");
});

document.getElementById("addSocialBtn").addEventListener("click", () => {
  socialRowSeed += 1;
  window.MazeContent.updateSiteData((data) => {
    ensureGeneralSettings(data);
    data.generalSettings.socialLinks.push({
      platform: `Platform ${socialRowSeed}`,
      icon: "globe",
      handle: "",
      url: "",
      enabled: false
    });
    return data;
  });
  renderDashboard();
});

document.getElementById("generalSettingsForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const rows = Array.from(document.querySelectorAll("#socialLinksBody tr[data-social-row]"));
  const socialLinks = rows.map((row) => ({
    platform: row.querySelector(".social-platform").value.trim(),
    icon: row.querySelector(".social-icon").value.trim(),
    handle: row.querySelector(".social-handle").value.trim(),
    url: row.querySelector(".social-url").value.trim(),
    enabled: row.querySelector(".social-enabled").checked
  })).filter((item) => item.platform || item.url || item.icon);

  window.MazeContent.updateSiteData((data) => {
    ensureGeneralSettings(data);
    data.generalSettings.phone = document.getElementById("settingsPhone").value.trim();
    data.generalSettings.email = document.getElementById("settingsEmail").value.trim();
    data.generalSettings.whatsapp = document.getElementById("settingsWhatsapp").value.trim();
    data.generalSettings.location = document.getElementById("settingsLocation").value.trim();
    data.generalSettings.mapEmbed = document.getElementById("settingsMapEmbed").value.trim();
    data.generalSettings.socialLinks = socialLinks;
    return data;
  });

  renderDashboard();
  showDashboardAlert("Saved.");
});

document.getElementById("addProductBtn").addEventListener("click", () => {
  const newProduct = createBlankProduct();
  activeProductId = newProduct.id;
  fillProductForm(newProduct);
  renderProductList(getDashboardData());
});

document.getElementById("productCategory").addEventListener("change", () => {
  const category = document.getElementById("productCategory").value;
  updateProductSubCategoryOptions(category, "");
});

document.getElementById("productImageFiles").addEventListener("change", async () => {
  const input = document.getElementById("productImageFiles");
  const files = Array.from(input.files || []);
  if (!files.length) return;

  const images = await Promise.all(files.map((file) => fileToDataUrl(file)));
  currentProductImages = [...currentProductImages, ...images];
  renderProductImagePreview();
  input.value = "";
});

document.getElementById("productReplaceFile").addEventListener("change", async () => {
  const input = document.getElementById("productReplaceFile");
  const file = (input.files || [])[0];
  if (!file) return;
  if (productReplaceIndex === null || !Number.isFinite(productReplaceIndex)) {
    input.value = "";
    return;
  }

  const image = await fileToDataUrl(file);
  currentProductImages[productReplaceIndex] = image;
  productReplaceIndex = null;
  renderProductImagePreview();
  input.value = "";
});

document.getElementById("productForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const productId = Number(document.getElementById("productId").value) || null;
  const product = {
    id: productId || nextProductId(getDashboardData().products),
    name: document.getElementById("productName").value.trim(),
    cat: document.getElementById("productCategory").value,
    catLabel: CATEGORY_LABELS[document.getElementById("productCategory").value],
    subCat: document.getElementById("productSubCategory").value,
    imgs: [...currentProductImages],
    shortDesc: document.getElementById("productShortDesc").value.trim(),
    desc: document.getElementById("productDesc").value.trim(),
    seoTitle: document.getElementById("productSeoTitle").value.trim(),
    seoDescription: document.getElementById("productSeoDescription").value.trim(),
    specs: parseSpecs(document.getElementById("productSpecs").value),
    features: parseLines(document.getElementById("productFeatures").value)
  };

  if (!product.imgs.length) {
    product.imgs = ["https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&auto=format&fit=crop"];
  }

  window.MazeContent.updateSiteData((data) => {
    const index = data.products.findIndex((item) => item.id === product.id);
    if (index >= 0) {
      data.products[index] = product;
    } else {
      data.products.unshift(product);
    }
    return data;
  });

  activeProductId = product.id;
  renderDashboard();
  showDashboardAlert("Saved.");
});

document.getElementById("deleteProductBtn").addEventListener("click", () => {
  const productId = Number(document.getElementById("productId").value);
  if (!productId) return;

  window.MazeContent.updateSiteData((data) => {
    data.products = data.products.filter((item) => item.id !== productId);
    return data;
  });

  const latestData = getDashboardData();
  activeProductId = latestData.products[0]?.id || null;

  if (activeProductId) {
    fillProductForm(latestData.products[0]);
  } else {
    document.getElementById("productForm").reset();
    currentProductImages = [];
    renderProductImagePreview();
  }

  renderDashboard();
  showDashboardAlert("Product deleted.");
});

document.getElementById("subProductCategorySelect").addEventListener("change", () => {
  activeSubProductCategory = document.getElementById("subProductCategorySelect").value;
  activeSubProductId = null;
  renderDashboard();
});

document.getElementById("addSubProductBtn").addEventListener("click", () => {
  activeSubProductId = null;
  document.getElementById("subProductOriginalId").value = "";
  document.getElementById("subProductId").value = "";
  document.getElementById("subProductLabel").value = "";
});

document.getElementById("subProductForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const originalId = document.getElementById("subProductOriginalId").value.trim();
  const id = normalizeSubProductId(document.getElementById("subProductId").value);
  const label = document.getElementById("subProductLabel").value.trim();

  if (!id || !label) return;

  window.MazeContent.updateSiteData((data) => {
    if (!data.subProducts) data.subProducts = {};
    if (!data.subProducts[activeSubProductCategory]) data.subProducts[activeSubProductCategory] = [];

    const list = data.subProducts[activeSubProductCategory];
    const existingIndex = list.findIndex((item) => item.id === (originalId || id));
    const idExists = list.some((item) => item.id === id && item.id !== originalId);

    if (idExists) {
      return data;
    }

    if (existingIndex >= 0) {
      list[existingIndex] = { id, label };
    } else {
      list.push({ id, label });
    }

    if (originalId && originalId !== id) {
      data.products.forEach((product) => {
        if (product.cat === activeSubProductCategory && product.subCat === originalId) {
          product.subCat = id;
        }
      });
    }

    data.subProducts[activeSubProductCategory] = list;
    return data;
  });

  activeSubProductId = id;
  renderDashboard();
  showDashboardAlert("Saved.");
});

document.getElementById("deleteSubProductBtn").addEventListener("click", () => {
  const id = document.getElementById("subProductOriginalId").value.trim();
  deleteSubProduct(activeSubProductCategory, id);
});

document.getElementById("addBlogBtn").addEventListener("click", () => {
  const snapshot = getDashboardData();
  ensureBlogs(snapshot);
  const nextId = nextBlogId(snapshot.blogs);
  const today = new Date();
  const iso = today.toISOString().slice(0, 10);

  const blog = {
    id: nextId,
    title: "New Blog Post",
    date: iso,
    author: "Admin",
    excerpt: "",
    content: "",
    image: "",
    link: "#"
  };

  activeBlogId = blog.id;
  currentBlogImage = "";
  fillBlogForm(blog);
  renderBlogList(snapshot);
});

document.getElementById("blogImageFile").addEventListener("change", async () => {
  const input = document.getElementById("blogImageFile");
  const file = (input.files || [])[0];
  if (!file) return;
  currentBlogImage = await fileToDataUrl(file);
  renderBlogImagePreview();
  input.value = "";
});

document.getElementById("blogForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const blogId = Number(document.getElementById("blogId").value) || null;
  const blog = {
    id: blogId || nextBlogId(getDashboardData().blogs || []),
    title: document.getElementById("blogTitle").value.trim(),
    date: document.getElementById("blogDate").value,
    author: document.getElementById("blogAuthor").value.trim(),
    excerpt: document.getElementById("blogExcerpt").value.trim(),
    content: document.getElementById("blogContent").value.trim(),
    image: currentBlogImage,
    link: document.getElementById("blogLink").value.trim() || "#"
  };

  window.MazeContent.updateSiteData((data) => {
    ensureBlogs(data);
    const index = data.blogs.findIndex((item) => item.id === blog.id);
    if (index >= 0) {
      data.blogs[index] = blog;
    } else {
      data.blogs.unshift(blog);
    }
    return data;
  });

  activeBlogId = blog.id;
  renderDashboard();
  showDashboardAlert("Saved.");
});

document.getElementById("serviceChargesForm").addEventListener("submit", (event) => {
  event.preventDefault();

  window.MazeContent.updateSiteData((data) => {
    ensureServiceCharges(data);
    data.serviceCharges.tv = {
      label: "TV Mounting",
      enabled: document.getElementById("chargeTvEnabled").checked,
      amount: document.getElementById("chargeTvAmount").value.trim(),
      description: document.getElementById("chargeTvDescription").value.trim()
    };
    data.serviceCharges.solar = {
      label: "Solar Installation",
      enabled: document.getElementById("chargeSolarEnabled").checked,
      amount: document.getElementById("chargeSolarAmount").value.trim(),
      description: document.getElementById("chargeSolarDescription").value.trim()
    };
    delete data.serviceCharges.electrical;
    return data;
  });

  renderDashboard();
  showDashboardAlert("Saved.");
});

document.getElementById("deleteBlogBtn").addEventListener("click", () => {
  const blogId = Number(document.getElementById("blogId").value);
  if (!blogId) return;

  window.MazeContent.updateSiteData((data) => {
    ensureBlogs(data);
    data.blogs = data.blogs.filter((item) => item.id !== blogId);
    return data;
  });

  const latest = getDashboardData();
  activeBlogId = latest.blogs?.[0]?.id || null;
  currentBlogImage = "";
  renderDashboard();
  showDashboardAlert("Blog deleted.");
});

window.addEventListener("hashchange", updateDashboardBreadcrumb);
updateDashboardBreadcrumb();

document.getElementById("seoForm").addEventListener("submit", (event) => {
  event.preventDefault();

  window.MazeContent.updateSiteData((data) => {
    data.siteMeta = {
      title: document.getElementById("siteMetaTitle").value.trim(),
      keywords: document.getElementById("siteMetaKeywords").value.trim(),
      description: document.getElementById("siteMetaDescription").value.trim(),
      ogTitle: document.getElementById("siteOgTitle").value.trim(),
      ogDescription: document.getElementById("siteOgDescription").value.trim()
    };

    document.querySelectorAll("[data-seo-scope='section']").forEach((field) => {
      const key = field.getAttribute("data-seo-key");
      const property = field.getAttribute("data-field");
      data.sectionSeo[key][property] = field.value.trim();
    });

    document.querySelectorAll("[data-seo-scope='category']").forEach((field) => {
      const key = field.getAttribute("data-seo-key");
      const property = field.getAttribute("data-field");
      data.categorySeo[key][property] = field.value.trim();
    });

    return data;
  });

  renderDashboard();
  showDashboardAlert("Saved.");
});

document.getElementById("exportDataBtn").addEventListener("click", () => {
  const data = JSON.stringify(getDashboardData(), null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "maze-dashboard-data.json";
  link.click();
  URL.revokeObjectURL(link.href);
  showDashboardAlert("Dashboard data exported.");
});

document.getElementById("resetDataBtn").addEventListener("click", () => {
  window.MazeContent.resetSiteData();
  activeProductId = getDashboardData().products[0]?.id || null;
  renderDashboard();
  showDashboardAlert("Dashboard reset to default content.");
});

window.addEventListener("maze-data-updated", renderDashboard);

renderDashboard();
