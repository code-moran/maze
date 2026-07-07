let products = [];
let searchData = [];
let currentFilter = "all";
let currentSubFilter = "all";
let displayedCount = 0;
const perPage = 8;

const SECTION_LABELS = {
  home: "Home",
  products: "Products",
  services: "Installation Services",
  about: "About",
  blog: "Blog",
  location: "Location",
  contact: "Contact"
};

function getData() {
  return window.MazeContent.getSiteData();
}

function updateSiteBreadcrumb() {
  const list = document.getElementById("siteBreadcrumb");
  if (!list) return;

  const hash = (window.location.hash || "#home").replace("#", "");
  const section = SECTION_LABELS[hash] ? hash : "home";
  const label = SECTION_LABELS[section];

  if (section === "home") {
    list.innerHTML = `<li class="breadcrumb-item active" aria-current="page">${label}</li>`;
    return;
  }

  if (section === "products" && currentFilter !== "all") {
    const data = getData();
    const categoryConfig = data.categorySeo[currentFilter] || {};
    const categoryLabel = categoryConfig.title || "Category";
    const categoryCrumb = `<li class="breadcrumb-item active" aria-current="page">${categoryLabel}</li>`;

    if (currentSubFilter !== "all") {
      const subList = (data.subProducts && data.subProducts[currentFilter]) ? data.subProducts[currentFilter] : [];
      const subLabel = subList.find((item) => item.id === currentSubFilter)?.label || "Sub Product";
      list.innerHTML = `
        <li class="breadcrumb-item"><a href="#home">Home</a></li>
        <li class="breadcrumb-item"><a href="#products" onclick="filterProducts('all')">Products</a></li>
        <li class="breadcrumb-item"><a href="#products" onclick="filterProducts('${currentFilter}')">${categoryLabel}</a></li>
        <li class="breadcrumb-item active" aria-current="page">${subLabel}</li>
      `;
      return;
    }

    list.innerHTML = `
      <li class="breadcrumb-item"><a href="#home">Home</a></li>
      <li class="breadcrumb-item"><a href="#products" onclick="filterProducts('all')">Products</a></li>
      ${categoryCrumb}
    `;
    return;
  }

  list.innerHTML = `
    <li class="breadcrumb-item"><a href="#home">Home</a></li>
    <li class="breadcrumb-item active" aria-current="page">${label}</li>
  `;
}

function setMeta(title, description) {
  if (title) {
    document.title = title;
  }

  const metaDescription = document.getElementById("metaDescription");
  if (metaDescription && description) {
    metaDescription.setAttribute("content", description);
  }
}

function applyGlobalMeta(data) {
  document.title = data.siteMeta.title;

  const metaDescription = document.getElementById("metaDescription");
  const metaKeywords = document.getElementById("metaKeywords");
  const metaOgTitle = document.getElementById("metaOgTitle");
  const metaOgDescription = document.getElementById("metaOgDescription");

  if (metaDescription) metaDescription.setAttribute("content", data.siteMeta.description);
  if (metaKeywords) metaKeywords.setAttribute("content", data.siteMeta.keywords);
  if (metaOgTitle) metaOgTitle.setAttribute("content", data.siteMeta.ogTitle);
  if (metaOgDescription) metaOgDescription.setAttribute("content", data.siteMeta.ogDescription);
}

function applyPageContent(data) {
  const slides = data.sections.heroSlides || [];
  slides.forEach((slide, index) => {
    const num = index + 1;
    const badge = document.getElementById(`heroBadge${num}`);
    const title = document.getElementById(`heroTitle${num}`);
    const desc = document.getElementById(`heroDesc${num}`);

    if (badge) badge.textContent = slide.badge;
    if (title) title.innerHTML = slide.title;
    if (desc) desc.textContent = slide.description;
  });

  const productsIntro = data.sections.productsIntro;
  document.getElementById("productsLabel").textContent = productsIntro.label;
  document.getElementById("productsTitle").textContent = productsIntro.title;
  document.getElementById("productsSubtitle").textContent = productsIntro.subtitle;

  const servicesIntro = data.sections.servicesIntro;
  document.getElementById("servicesLabel").textContent = servicesIntro.label;
  document.getElementById("servicesTitle").textContent = servicesIntro.title;
  document.getElementById("servicesSubtitle").textContent = servicesIntro.subtitle;

  const aboutIntro = data.sections.aboutIntro;
  document.getElementById("aboutLabel").textContent = aboutIntro.label;
  document.getElementById("aboutTitle").textContent = aboutIntro.title;
  document.getElementById("aboutParagraphOne").textContent = aboutIntro.paragraphOne;
  document.getElementById("aboutParagraphTwo").textContent = aboutIntro.paragraphTwo;
  document.getElementById("visionTitle").textContent = aboutIntro.visionTitle;
  document.getElementById("visionText").textContent = aboutIntro.visionText;
  document.getElementById("missionTitle").textContent = aboutIntro.missionTitle;
  document.getElementById("missionText").textContent = aboutIntro.missionText;

  const contactIntro = data.sections.contactIntro;
  document.getElementById("contactLabel").textContent = contactIntro.label;
  document.getElementById("contactTitle").textContent = contactIntro.title;
  document.getElementById("contactSubtitle").textContent = contactIntro.subtitle;
}

function cleanDigits(value) {
  return (value || "").replace(/[^\d]/g, "");
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatRichText(value) {
  const safe = escapeHtml(value || "");
  return safe
    .split(/\n{2,}/)
    .map((part) => `<p>${part.replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function extractMapEmbedSrc(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  if (raw.includes("<iframe")) {
    const match = raw.match(/src=["']([^"']+)["']/i);
    return match ? match[1] : "";
  }

  return raw;
}

function renderSocialLinks(containerId, links, variant) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const enabled = (links || []).filter((item) => item.enabled && (item.url || item.handle));
  if (!enabled.length) {
    container.innerHTML = "";
    return;
  }

  if (variant === "topbar") {
    container.innerHTML = enabled.map((item) => `
      <a href="${item.url || "#"}" class="topbar-social-link text-white-50" aria-label="${item.platform}" target="_blank" rel="noopener">
        <i class="bi bi-${item.icon}"></i>
        ${item.handle ? `<span class="topbar-handle">${item.handle}</span>` : ""}
      </a>
    `).join("");
    return;
  }

  container.innerHTML = enabled.map((item) => `
    <a href="${item.url || "#"}" class="social-btn" aria-label="${item.platform}" target="_blank" rel="noopener"><i class="bi bi-${item.icon}"></i></a>
  `).join("");
}

function applyGeneralSettings(data) {
  const settings = data.generalSettings;
  if (!settings) return;

  const phone = settings.phone || "";
  const email = settings.email || "";
  const whatsapp = settings.whatsapp || "";
  const location = settings.location || "";
  const mapEmbed = extractMapEmbedSrc(settings.mapEmbed);

  const telDigits = cleanDigits(phone);
  const waDigits = cleanDigits(whatsapp);

  const topPhoneLink = document.getElementById("topPhoneLink");
  const topEmailLink = document.getElementById("topEmailLink");
  const footerPhoneLink = document.getElementById("footerPhoneLink");
  const footerEmailLink = document.getElementById("footerEmailLink");
  const footerLocationText = document.getElementById("footerLocationText");
  const locationPhoneLink = document.getElementById("locationPhoneLink");
  const locationEmailLink = document.getElementById("locationEmailLink");
  const locationAddressText = document.getElementById("locationAddressText");
  const contactWhatsappCard = document.getElementById("contactWhatsappCard");
  const contactWhatsappText = document.getElementById("contactWhatsappText");
  const contactPhoneCard = document.getElementById("contactPhoneCard");
  const contactPhoneText = document.getElementById("contactPhoneText");
  const whatsappFab = document.getElementById("whatsappFab");
  const locationMapFrame = document.getElementById("locationMapFrame");

  if (topPhoneLink) {
    topPhoneLink.textContent = phone;
    topPhoneLink.href = telDigits ? `tel:+${telDigits}` : "tel:";
  }
  if (footerPhoneLink) {
    footerPhoneLink.textContent = phone;
    footerPhoneLink.href = telDigits ? `tel:+${telDigits}` : "tel:";
  }
  if (locationPhoneLink) {
    locationPhoneLink.textContent = phone;
    locationPhoneLink.href = telDigits ? `tel:+${telDigits}` : "tel:";
  }
  if (contactPhoneCard) {
    contactPhoneCard.href = telDigits ? `tel:+${telDigits}` : "tel:";
  }
  if (contactPhoneText) {
    contactPhoneText.textContent = phone;
  }

  if (topEmailLink) {
    topEmailLink.textContent = email;
    topEmailLink.href = email ? `mailto:${email}` : "mailto:";
  }
  if (footerEmailLink) {
    footerEmailLink.textContent = email;
    footerEmailLink.href = email ? `mailto:${email}` : "mailto:";
  }
  if (locationEmailLink) {
    locationEmailLink.textContent = email;
    locationEmailLink.href = email ? `mailto:${email}` : "mailto:";
  }

  if (footerLocationText) footerLocationText.textContent = location;
  if (locationAddressText) locationAddressText.innerHTML = `${location}<br>Nairobi, Kenya`;
  if (locationMapFrame && mapEmbed) {
    locationMapFrame.src = mapEmbed;
  }

  if (contactWhatsappCard) contactWhatsappCard.href = waDigits ? `https://wa.me/${waDigits}` : "#";
  if (whatsappFab) whatsappFab.href = waDigits ? `https://wa.me/${waDigits}` : "#";
  if (contactWhatsappText) contactWhatsappText.textContent = whatsapp;

  renderSocialLinks("topSocialLinks", settings.socialLinks, "topbar");
  renderSocialLinks("contactSocialLinks", settings.socialLinks, "cards");
  renderSocialLinks("footerSocialLinks", settings.socialLinks, "footer");
}

function applyServiceCharges(data) {
  const charges = data.serviceCharges || {};
  const mappings = [
    { key: "tv", id: "serviceChargeTv" },
    { key: "solar", id: "serviceChargeSolar" },
    { key: "electrical", id: "serviceChargeElectrical" }
  ];

  mappings.forEach(({ key, id }) => {
    const element = document.getElementById(id);
    const charge = charges[key];
    if (!element || !charge) return;
    element.textContent = charge.amount || "";
    element.classList.toggle("d-none", !charge.enabled || !charge.amount);
  });
}

function renderProductsMegaMenu() {
  const menu = document.getElementById("productsMegaMenu");
  if (!menu) return;

  const data = getData();
  const categories = [
    { id: "tv-mounts", label: data.categorySeo["tv-mounts"]?.title || "TV Wall Mounts", icon: "bi-tv" },
    { id: "guards", label: data.categorySeo.guards?.title || "Guards", icon: "bi-shield-check" },
    { id: "solar", label: data.categorySeo.solar?.title || "Solar Outdoor Lights", icon: "bi-sun" },
    { id: "cables", label: data.categorySeo.cables?.title || "Extension Cables", icon: "bi-plug" }
  ];

  menu.innerHTML = `
    ${categories.map((cat) => `
      <a href="#products" class="dropdown-item products-menu-item" data-mega-cat="${cat.id}">
        <i class="bi ${cat.icon} text-success"></i>
        <span>${cat.label}</span>
      </a>
    `).join("")}
  `;

  menu.querySelectorAll("[data-mega-cat]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const cat = link.getAttribute("data-mega-cat");
      filterProducts(cat);
      document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
    });
  });
}

function renderBlogs(data) {
  const grid = document.getElementById("blogGrid");
  if (!grid) return;

  const posts = Array.isArray(data.blogs) ? data.blogs : [];
  if (!posts.length) {
    grid.innerHTML = `
      <div class="col-12">
        <div class="empty-state">No blog posts yet.</div>
      </div>
    `;
    return;
  }

  const formatted = posts.map((post) => {
    const dateObj = post.date ? new Date(post.date) : null;
    const dateLabel = dateObj && !Number.isNaN(dateObj.valueOf())
      ? dateObj.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
      : "";

    return `
      <div class="col-md-6 col-lg-4">
        <div class="blog-card h-100">
          <div class="blog-img"><img src="${post.image || ""}" alt="${post.title || "Blog post"}" loading="lazy"></div>
          <div class="card-body p-3">
            <div class="blog-meta mb-2"><i class="bi bi-calendar3 me-1"></i>${dateLabel}${post.author ? ` &nbsp;·&nbsp; <i class="bi bi-person me-1"></i>${post.author}` : ""}</div>
            <h6 class="fw-bold">${post.title || ""}</h6>
            <p class="small text-secondary">${post.excerpt || ""}</p>
            <button type="button" class="btn btn-maze-outline btn-sm" onclick="openBlog(${post.id})">Read More <i class="bi bi-arrow-right ms-1"></i></button>
          </div>
        </div>
      </div>
    `;
  });

  grid.innerHTML = formatted.join("");
}

function openBlog(id) {
  const data = getData();
  const posts = Array.isArray(data.blogs) ? data.blogs : [];
  const post = posts.find((item) => item.id === id);
  if (!post) return;

  const dateObj = post.date ? new Date(post.date) : null;
  const dateLabel = dateObj && !Number.isNaN(dateObj.valueOf())
    ? dateObj.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
    : "";

  document.getElementById("blogModalTitle").textContent = post.title || "";
  document.getElementById("blogModalMeta").innerHTML = `<i class="bi bi-calendar3 me-1"></i>${dateLabel}${post.author ? ` &nbsp;·&nbsp; <i class="bi bi-person me-1"></i>${escapeHtml(post.author)}` : ""}`;
  document.getElementById("blogModalImage").src = post.image || "";
  document.getElementById("blogModalImage").alt = post.title || "Blog image";
  document.getElementById("blogModalContent").innerHTML = formatRichText(post.content || post.excerpt || "");

  const sourceWrap = document.getElementById("blogModalSourceWrap");
  const sourceLink = document.getElementById("blogModalSourceLink");
  if (post.link && post.link !== "#") {
    sourceLink.href = post.link;
    sourceWrap.classList.remove("d-none");
  } else {
    sourceLink.href = "#";
    sourceWrap.classList.add("d-none");
  }

  new bootstrap.Modal(document.getElementById("blogModal")).show();
}

function renderProductCategories() {
  const grid = document.getElementById("productsGrid");
  const data = getData();
  if (!grid) return;

  const categories = [
    { id: "tv-mounts", icon: "bi-tv" },
    { id: "guards", icon: "bi-shield-check" },
    { id: "solar", icon: "bi-sun" },
    { id: "cables", icon: "bi-plug" }
  ];

  grid.innerHTML = categories.map((category) => {
    const config = data.categorySeo[category.id] || {};
    const categoryProducts = products.filter((product) => product.cat === category.id);
    const previewImage = categoryProducts[0]?.imgs?.[0] || "";

    return `
      <div class="col-md-6 col-xl-3">
        <div class="product-category-card" onclick="filterProducts('${category.id}')">
          <div class="product-category-image">
            ${previewImage ? `<img src="${previewImage}" alt="${config.title || "Product category"}" loading="lazy">` : ""}
          </div>
          <div class="card-body">
            <span class="badge-cat mb-2 d-inline-block"><i class="bi ${category.icon} me-1"></i>${config.title || "Category"}</span>
            <div class="card-title">${config.title || "Category"}</div>
            <p class="card-text text-secondary small">${config.description || ""}</p>
            <button class="btn btn-maze w-100 btn-sm" onclick="event.stopPropagation();filterProducts('${category.id}')">View Products <i class="bi bi-arrow-right ms-1"></i></button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function renderSubProductBrowser(cat) {
  const grid = document.getElementById("productsGrid");
  const data = getData();
  if (!grid) return;

  const items = (data.subProducts && data.subProducts[cat]) ? data.subProducts[cat] : [];
  const categoryConfig = data.categorySeo[cat] || {};

  grid.innerHTML = `
    <div class="col-12">
      <div class="subproduct-browser">
        <div class="subproduct-browser-title">${categoryConfig.title || "Sub Products"}</div>
        <div class="subproduct-browser-list">
          ${items.map((item) => `
            <button type="button" class="subproduct-browser-link" onclick="filterSubCategory('${item.id}')">
              <i class="bi bi-caret-right-fill"></i>
              <span>${item.label}</span>
            </button>
          `).join("")}
        </div>
      </div>
    </div>
  `;
}

function getFiltered() {
  if (currentFilter === "all") return products;
  let filtered = products.filter((product) => product.cat === currentFilter);
  if (currentSubFilter !== "all") {
    filtered = filtered.filter((product) => product.subCat === currentSubFilter);
  }
  return filtered;
}

function renderSubCategories(cat) {
  const container = document.getElementById("subCatFilters");
  const panel = document.getElementById("subCatPanel");
  const gridWrap = document.getElementById("productsGridWrap");
  const title = document.getElementById("subCatTitle");
  if (!container) return;

  if (!cat || cat === "all" || currentSubFilter === "all") {
    if (panel) panel.classList.add("d-none");
    if (gridWrap) gridWrap.className = "col-12";
    container.innerHTML = "";
    return;
  }

  const data = getData();
  const items = (data.subProducts && data.subProducts[cat]) ? data.subProducts[cat] : [];
  const categoryProducts = products.filter((product) => product.cat === cat);

  if (panel) panel.classList.remove("d-none");
  if (gridWrap) gridWrap.className = "col-12 col-lg-9";
  if (title) {
    const categoryConfig = data.categorySeo[cat] || {};
    title.textContent = `${categoryConfig.title || "Sub Products"}`;
  }
  container.innerHTML = "";

  const allPill = document.createElement("span");
  allPill.className = `subcat-pill ${currentSubFilter === "all" ? "active" : ""}`;
  allPill.innerHTML = `<span>All Sub Products</span><span class="subcat-count">${categoryProducts.length}</span>`;
  allPill.addEventListener("click", () => filterSubCategory("all"));
  container.appendChild(allPill);

  items.forEach((item) => {
    const count = categoryProducts.filter((product) => product.subCat === item.id).length;
    const pill = document.createElement("span");
    pill.className = `subcat-pill ${currentSubFilter === item.id ? "active" : ""}`;
    pill.innerHTML = `<span>${item.label}</span><span class="subcat-count">${count}</span>`;
    pill.addEventListener("click", () => filterSubCategory(item.id));
    container.appendChild(pill);
  });
}

function filterSubCategory(subCatId) {
  currentSubFilter = subCatId || "all";
  updateProductsIntro(currentFilter);
  renderSubCategories(currentFilter);
  renderProducts(true);
  updateSiteBreadcrumb();

  if (currentFilter !== "all") {
    const data = getData();
    const categoryConfig = data.categorySeo[currentFilter] || data.categorySeo.all;
    setMeta(categoryConfig.metaTitle, categoryConfig.metaDescription);
  }
}

function renderProducts(reset) {
  const grid = document.getElementById("productsGrid");
  const loadMoreBtn = document.getElementById("loadMoreBtn");
  if (!grid) return;

  if (currentFilter === "all") {
    if (reset) {
      grid.innerHTML = "";
      displayedCount = 0;
    }
    renderProductCategories();
    if (loadMoreBtn) loadMoreBtn.style.display = "none";
    return;
  }

  if (currentSubFilter === "all") {
    if (reset) {
      grid.innerHTML = "";
      displayedCount = 0;
    }
    renderSubProductBrowser(currentFilter);
    if (loadMoreBtn) loadMoreBtn.style.display = "none";
    return;
  }

  const filtered = getFiltered();

  if (reset) {
    grid.innerHTML = "";
    displayedCount = 0;
  }

  const toShow = filtered.slice(displayedCount, displayedCount + perPage);
  toShow.forEach((product) => {
    const col = document.createElement("div");
    col.className = "col-sm-6 col-lg-3";
    col.innerHTML = `
      <div class="product-card h-100" onclick="openProduct(${product.id})" style="cursor:pointer">
        <div class="card-img-wrap"><img src="${product.imgs[0]}" alt="${product.name}" loading="lazy"></div>
        <div class="card-body">
          <span class="badge-cat mb-2 d-inline-block">${product.catLabel}</span>
          <div class="card-title">${product.name}</div>
          <p class="card-text">${product.shortDesc}</p>
          <button class="btn btn-maze w-100 btn-sm" onclick="event.stopPropagation();openProduct(${product.id})">View Details <i class="bi bi-arrow-right ms-1"></i></button>
        </div>
      </div>`;
    grid.appendChild(col);
  });

  displayedCount += toShow.length;
  if (loadMoreBtn) {
    loadMoreBtn.style.display = displayedCount >= filtered.length ? "none" : "";
  }
}

function applySectionSeoFromHash() {
  const data = getData();
  const sectionKey = (window.location.hash || "#home").replace("#", "");
  const seo = data.sectionSeo[sectionKey];

  if (seo) {
    setMeta(seo.title, seo.description);
    return;
  }

  setMeta(data.siteMeta.title, data.siteMeta.description);
}

function updateProductsIntro(cat) {
  const data = getData();
  const defaultIntro = data.sections.productsIntro;
  const categoryConfig = data.categorySeo[cat] || data.categorySeo.all;

  document.getElementById("productsLabel").textContent = defaultIntro.label;
  document.getElementById("productsTitle").textContent = categoryConfig.title || defaultIntro.title;
  document.getElementById("productsSubtitle").textContent = cat === "all"
    ? "Choose TV Wall Mounts, Guards, Solar Outdoor Lights, or Extension Cables to view the products inside."
    : (currentSubFilter === "all"
      ? "Select a sub product to view the items inside this category."
      : (categoryConfig.description || defaultIntro.subtitle));
}

function filterProducts(cat) {
  currentFilter = cat;
  currentSubFilter = "all";
  document.querySelectorAll(".cat-pill").forEach((el) => {
    const text = el.textContent.trim().toLowerCase();
    el.classList.toggle("active",
      (cat === "tv-mounts" && text.includes("tv")) ||
      (cat === "guards" && text.includes("guard")) ||
      (cat === "solar" && text.includes("solar")) ||
      (cat === "cables" && text.includes("extension"))
    );
  });

  updateProductsIntro(cat);
  renderSubCategories(cat);
  renderProducts(true);
  updateSiteBreadcrumb();

  const data = getData();
  const categoryConfig = data.categorySeo[cat] || data.categorySeo.all;
  setMeta(categoryConfig.metaTitle, categoryConfig.metaDescription);

  if (cat !== "all") {
    document.getElementById("products").scrollIntoView({ behavior: "smooth" });
  }
}

function loadMoreProducts() {
  renderProducts(false);
}

function goToContactForm(event) {
  if (event) event.preventDefault();

  const modalEl = document.getElementById("productModal");
  const scrollToForm = () => {
    const form = document.getElementById("contactForm");
    const firstField = document.getElementById("contactName");

    if (form) {
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    if (firstField) {
      window.setTimeout(() => {
        firstField.focus({ preventScroll: true });
      }, 450);
    }
  };

  if (modalEl && modalEl.classList.contains("show")) {
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    const handleHidden = () => {
      modalEl.removeEventListener("hidden.bs.modal", handleHidden);
      scrollToForm();
    };

    modalEl.addEventListener("hidden.bs.modal", handleHidden);

    if (modalInstance) {
      modalInstance.hide();
    } else {
      scrollToForm();
    }
  } else {
    scrollToForm();
  }

  return false;
}

function openProduct(id) {
  const product = products.find((item) => item.id === id);
  if (!product) return;

  document.getElementById("modalTitle").textContent = product.name;
  document.getElementById("modalDesc").textContent = product.desc;
  document.getElementById("modalCatBadge").textContent = product.catLabel;
  document.getElementById("modalBreadCat").textContent = product.catLabel;
  document.getElementById("modalMainImg").src = product.imgs[0];
  document.getElementById("modalMainImg").alt = product.name;

  const thumbs = document.getElementById("modalThumbs");
  thumbs.innerHTML = product.imgs.map((img, index) => `
    <img src="${img}" class="modal-gallery-thumb${index === 0 ? " active" : ""}" onclick="setMainImg(this,'${img}')" alt="${product.name} view ${index + 1}">
  `).join("");

  const tbody = document.querySelector("#modalSpecs tbody");
  tbody.innerHTML = product.specs.map((spec) => `<tr><td>${spec[0]}</td><td>${spec[1]}</td></tr>`).join("");

  const featuresList = document.getElementById("modalFeatures");
  featuresList.innerHTML = product.features.map((feature) => `<li>${feature}</li>`).join("");

  const related = document.getElementById("modalRelated");
  const relatedProducts = products.filter((item) => item.cat === product.cat && item.id !== product.id).slice(0, 3);
  related.innerHTML = relatedProducts.map((item) => `
    <div class="col-4">
      <div class="product-card" onclick="openProduct(${item.id})" style="cursor:pointer">
        <div class="card-img-wrap" style="height:100px"><img src="${item.imgs[0]}" alt="${item.name}" loading="lazy" style="width:100%;height:100%;object-fit:cover"></div>
        <div class="card-body p-2"><div style="font-size:.82rem;font-weight:600">${item.name}</div></div>
      </div>
    </div>
  `).join("");

  if (product.seoTitle || product.seoDescription) {
    setMeta(product.seoTitle || product.name, product.seoDescription || product.shortDesc);
  }

  new bootstrap.Modal(document.getElementById("productModal")).show();
}

function setMainImg(thumb, src) {
  document.getElementById("modalMainImg").src = src;
  document.querySelectorAll(".modal-gallery-thumb").forEach((item) => item.classList.remove("active"));
  thumb.classList.add("active");
}

function doSearch() {
  const query = document.getElementById("searchInput").value.trim().toLowerCase();
  if (!query) return;

  const match = searchData.find((product) =>
    product.name.toLowerCase().includes(query) ||
    product.catLabel.toLowerCase().includes(query)
  );

  if (match) {
    openProduct(match.id);
  }
}

function showToast(message) {
  document.getElementById("toastMsg").textContent = message;
  new bootstrap.Toast(document.getElementById("mainToast"), { delay: 4000 }).show();
}

function submitContact(event) {
  event.preventDefault();

  const inquiry = {
    id: Date.now(),
    name: document.getElementById("contactName").value.trim(),
    phone: document.getElementById("contactPhone").value.trim(),
    email: document.getElementById("contactEmail").value.trim(),
    subject: document.getElementById("contactSubject").value,
    message: document.getElementById("contactMessage").value.trim(),
    status: "New",
    createdAt: new Date().toISOString()
  };

  window.MazeContent.updateSiteData((data) => {
    data.inquiries.unshift(inquiry);
    return data;
  });

  document.getElementById("contactAlert").classList.remove("d-none");
  event.target.reset();
  showToast("Message saved to inquiries dashboard.");
}

function initSearch() {
  document.getElementById("searchInput").addEventListener("input", function onInput() {
    const query = this.value.trim().toLowerCase();
    const results = document.getElementById("searchResults");

    if (query.length < 2) {
      results.style.display = "none";
      return;
    }

    const matches = searchData.filter((product) =>
      product.name.toLowerCase().includes(query) ||
      product.catLabel.toLowerCase().includes(query) ||
      product.shortDesc.toLowerCase().includes(query)
    );

    if (!matches.length) {
      results.innerHTML = `<div class="p-3 text-secondary small">No products found for "${query}"</div>`;
      results.style.display = "block";
      return;
    }

    results.innerHTML = matches.slice(0, 6).map((product) => `
      <div class="search-result-item" onclick="openProduct(${product.id});document.getElementById('searchResults').style.display='none';document.getElementById('searchInput').value=''">
        <img src="${product.imgs[0]}" alt="${product.name}">
        <div><div style="font-weight:600;font-size:.9rem">${product.name}</div><div style="font-size:.78rem;color:#777">${product.catLabel}</div></div>
      </div>
    `).join("");
    results.style.display = "block";
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest("#searchInput") && !event.target.closest("#searchResults")) {
      document.getElementById("searchResults").style.display = "none";
    }
  });
}

function hydrateSite() {
  const data = getData();
  products = data.products;
  searchData = products.map((product) => ({ ...product }));
  applyGlobalMeta(data);
  applyGeneralSettings(data);
  applyServiceCharges(data);
  applyPageContent(data);
  renderProductsMegaMenu();
  renderBlogs(data);
  updateProductsIntro(currentFilter);
  renderSubCategories(currentFilter);
  renderProducts(true);
  applySectionSeoFromHash();
  updateSiteBreadcrumb();
}

function initHeroCarousel() {
  const heroCarousel = document.getElementById("heroCarousel");
  if (!heroCarousel || !window.bootstrap?.Carousel) return;

  const carousel = window.bootstrap.Carousel.getOrCreateInstance(heroCarousel, {
    interval: 5000,
    ride: "carousel",
    pause: false,
    wrap: true,
    touch: true
  });

  carousel.cycle();
}

function initDesktopDropdownHover() {
  if (!window.bootstrap?.Dropdown) return;

  document.querySelectorAll(".navbar .dropdown").forEach((dropdown) => {
    const toggle = dropdown.querySelector(".dropdown-toggle");
    if (!toggle) return;

    const instance = window.bootstrap.Dropdown.getOrCreateInstance(toggle);

    dropdown.addEventListener("mouseenter", () => {
      if (window.innerWidth >= 992) {
        instance.show();
      }
    });

    dropdown.addEventListener("mouseleave", () => {
      if (window.innerWidth >= 992) {
        instance.hide();
      }
    });
  });
}

window.addEventListener("scroll", () => {
  const btn = document.getElementById("backToTop");
  btn.classList.toggle("show", window.scrollY > 400);
});

window.addEventListener("hashchange", () => {
  if (currentFilter === "all") {
    applySectionSeoFromHash();
  }
  updateSiteBreadcrumb();
});

window.addEventListener("maze-data-updated", hydrateSite);

initSearch();
initHeroCarousel();
initDesktopDropdownHover();
hydrateSite();
