const WHATSAPP_NUMBER = "6281330053178";

let products = [];

const FALLBACK_PRODUCTS = Array.isArray(DEFAULT_PRODUCTS)
  ? DEFAULT_PRODUCTS
  : [];

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(Number(value) || 0);
}

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getWhatsAppLink(product) {
  const message =
    `Halo MR ALL IN, saya mau pesan:%0A%0A` +
    `Produk: ${encodeURIComponent(product.name)}%0A` +
    `Harga: ${encodeURIComponent(formatRupiah(product.price))}%0A` +
    `Stok: ${encodeURIComponent(product.stock)}%0A%0A` +
    `Apakah masih tersedia?`;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
}

function categoryIcon(category) {
  const icons = {
    VGA: "▰",
    Processor: "◉",
    Motherboard: "▦",
    RAM: "▥",
    SSD: "▤",
    HDD: "◍",
    PSU: "▰",
    Casing: "▤",
    Monitor: "▣",
    Aksesoris: "⌨",
    "Paket PC": "▣"
  };

  return icons[category] || "▣";
}

function renderCategories() {
  const container = document.querySelector("#categoryList");

  if (!container) return;

  const categories = [
    "Semua",
    ...new Set(products.map(product => product.category).filter(Boolean))
  ];

  container.innerHTML = categories
    .map((category, index) => `
      <button
        class="category-btn ${index === 0 ? "active" : ""}"
        data-category="${escapeHTML(category)}"
      >
        ${escapeHTML(category)}
      </button>
    `)
    .join("");

  container.querySelectorAll(".category-btn").forEach(button => {
    button.addEventListener("click", () => {
      container.querySelectorAll(".category-btn").forEach(item => {
        item.classList.remove("active");
      });

      button.classList.add("active");

      const category = button.dataset.category;
      renderProducts(category === "Semua" ? "" : category);
    });
  });
}

function renderProducts(category = "", keyword = "") {
  const container = document.querySelector("#productGrid");

  if (!container) return;

  let filtered = [...products];

  if (category) {
    filtered = filtered.filter(
      product => product.category === category
    );
  }

  if (keyword) {
    const search = keyword.toLowerCase();

    filtered = filtered.filter(product => {
      const name = String(product.name || "").toLowerCase();
      const cat = String(product.category || "").toLowerCase();
      const specs = Array.isArray(product.specs)
        ? product.specs.join(" ").toLowerCase()
        : "";

      return (
        name.includes(search) ||
        cat.includes(search) ||
        specs.includes(search)
      );
    });
  }

  if (!filtered.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔎</div>
        <h3>Produk tidak ditemukan</h3>
        <p>Coba kata kunci atau kategori lainnya.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered
    .map(product => {
      const stock = Number(product.stock) || 0;
      const specs = Array.isArray(product.specs)
        ? product.specs
        : [];

      const image = product.image_url
        ? `
          <img
            class="product-image"
            src="${escapeHTML(product.image_url)}"
            alt="${escapeHTML(product.name)}"
            loading="lazy"
          >
        `
        : `
          <div class="product-placeholder">
            ${escapeHTML(product.icon || categoryIcon(product.category))}
          </div>
        `;

      const stockClass =
        stock <= 0
          ? "out"
          : stock <= 2
            ? "low"
            : "ready";

      const stockText =
        stock <= 0
          ? "Habis"
          : `Stok ${stock}`;

      return `
        <article class="product-card">
          <div class="product-media">
            ${image}
            <span class="stock-badge ${stockClass}">
              ${stockText}
            </span>
          </div>

          <div class="product-content">
            <div class="product-category">
              ${escapeHTML(product.category || "Lainnya")}
            </div>

            <h3>${escapeHTML(product.name)}</h3>

            <div class="product-specs">
              ${specs
                .map(spec => `<span>${escapeHTML(spec)}</span>`)
                .join("")}
            </div>

            <div class="product-bottom">
              <div class="product-price">
                ${formatRupiah(product.price)}
              </div>

              ${
                stock > 0
                  ? `
                    <a
                      class="btn-order"
                      href="${getWhatsAppLink(product)}"
                      target="_blank"
                      rel="noopener"
                    >
                      WhatsApp
                    </a>
                  `
                  : `
                    <button class="btn-order disabled" disabled>
                      Habis
                    </button>
                  `
              }
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

async function loadProducts() {
  const container = document.querySelector("#productGrid");

  if (container) {
    container.innerHTML = `
      <div class="loading-state">
        <div class="loading-spinner"></div>
        <p>Memuat produk...</p>
      </div>
    `;
  }

  try {
    const { data, error } = await supabaseClient
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", {
        ascending: false
      });

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    products = Array.isArray(data) && data.length
      ? data
      : FALLBACK_PRODUCTS;

  } catch (error) {
    console.error("Gagal mengambil produk:", error);

    products = FALLBACK_PRODUCTS;

    if (container) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">⚠️</div>
          <h3>Database belum tersedia</h3>
          <p>Menampilkan produk sementara.</p>
        </div>
      `;
    }
  }

  renderCategories();
  renderProducts();
}

function setupSearch() {
  const searchInput =
    document.querySelector("#searchInput");

  if (!searchInput) return;

  searchInput.addEventListener("input", event => {
    const keyword = event.target.value.trim();

    const activeCategory =
      document.querySelector(
        "#categoryList .category-btn.active"
      );

    const category =
      activeCategory &&
      activeCategory.dataset.category !== "Semua"
        ? activeCategory.dataset.category
        : "";

    renderProducts(category, keyword);
  });
}

function setupNavigation() {
  document.querySelectorAll("[data-scroll]").forEach(link => {
    link.addEventListener("click", event => {
      const target = link.dataset.scroll;

      const element = document.querySelector(target);

      if (!element) return;

      event.preventDefault();

      element.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  });
}

function setupRealtime() {
  if (!supabaseClient) return;

  supabaseClient
    .channel("products-live")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "products"
      },
      () => {
        loadProducts();
      }
    )
    .subscribe();
}

async function startWebsite() {
  setupNavigation();
  setupSearch();

  await loadProducts();

  setupRealtime();
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    startWebsite
  );
} else {
  startWebsite();
}
