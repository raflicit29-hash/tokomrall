/* =========================================
   MR ALL IN - CUSTOMER WEBSITE
========================================= */

const WHATSAPP_NUMBER = "6281330053178";
const STORAGE_KEY = "mrallin_products";

let activeCategory = "Semua";
let searchKeyword = "";


/* =========================================
   AMBIL PRODUK
========================================= */

function getProducts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const data = JSON.parse(saved);

      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (error) {
    console.error("Gagal membaca produk:", error);
  }

  return DEFAULT_PRODUCTS;
}


/* =========================================
   FORMAT RUPIAH
========================================= */

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(Number(value) || 0);
}


/* =========================================
   WHATSAPP
========================================= */

function whatsappLink(message) {
  return (
    "https://wa.me/" +
    WHATSAPP_NUMBER +
    "?text=" +
    encodeURIComponent(message)
  );
}


function productWhatsApp(product) {
  const message =
`Halo MR ALL IN 👋

Saya tertarik dengan:

*${product.name}*
Harga: ${formatRupiah(product.price)}

Apakah stok barang ini masih tersedia?

Saya ingin tanya detail kondisi barang dan opsi COD / ambil langsung di Gubeng, Surabaya.`;

  return whatsappLink(message);
}


function generalWhatsApp() {
  return whatsappLink(
    "Halo MR ALL IN 👋 Saya mau tanya produk komputer yang tersedia."
  );
}


/* =========================================
   WHATSAPP BUTTON
========================================= */

function setupWhatsApp() {
  const ids = [
    "whatsappTop",
    "whatsappHero",
    "whatsappFloat"
  ];

  ids.forEach(id => {
    const element = document.getElementById(id);

    if (element) {
      element.href = generalWhatsApp();
    }
  });
}


/* =========================================
   ICON KATEGORI
========================================= */

const CATEGORY_ICONS = {
  VGA: "▰",
  Processor: "◉",
  Motherboard: "▦",
  RAM: "▥",
  SSD: "▤",
  HDD: "◍",
  PSU: "◒",
  Casing: "▤",
  Monitor: "▣",
  Aksesoris: "⌨",
  "Paket PC": "▣"
};


/* =========================================
   NAVIGATION
========================================= */

function renderNavigation() {
  const navigation =
    document.getElementById("navigation");

  if (!navigation) return;

  const categories = [
    "Semua",
    ...PRODUCT_CATEGORIES
  ];

  navigation.innerHTML =
    categories.map(category => `
      <a
        href="#products"
        data-category="${category}"
      >
        ${
          category === "Semua"
            ? "⌂ Beranda"
            : category
        }
      </a>
    `).join("");
}


/* =========================================
   CATEGORY BOX
========================================= */

function renderCategories() {
  const container =
    document.getElementById("categories");

  if (!container) return;

  container.innerHTML =
    PRODUCT_CATEGORIES.map(category => `
      <button
        type="button"
        class="category"
        data-category="${category}"
      >
        <div class="category-icon">
          ${CATEGORY_ICONS[category] || "•"}
        </div>

        <div class="category-name">
          ${category}
        </div>
      </button>
    `).join("");
}


/* =========================================
   FILTER
========================================= */

function renderFilters() {
  const filters =
    document.getElementById("filters");

  if (!filters) return;

  const categories = [
    "Semua",
    ...PRODUCT_CATEGORIES
  ];

  filters.innerHTML =
    categories.map(category => `
      <button
        type="button"
        data-category="${category}"
        class="${
          activeCategory === category
            ? "active"
            : ""
        }"
      >
        ${category}
      </button>
    `).join("");
}


/* =========================================
   PRODUCT CARD
========================================= */

function createProductCard(product) {
  const stock =
    Number(product.stock) || 0;

  const isReady = stock > 0;

  const specs =
    Array.isArray(product.specs)
      ? product.specs
      : [];

  const specificationHTML =
    specs.map(spec => `
      <li>○ ${spec}</li>
    `).join("");

  const buttonHTML = isReady
    ? `
      <a
        class="buy-button"
        href="${productWhatsApp(product)}"
        target="_blank"
        rel="noopener noreferrer"
      >
        ☘ Tanya via WhatsApp
      </a>
    `
    : `
      <span class="buy-button disabled">
        Stok Habis
      </span>
    `;

  return `
    <article class="product-card">

      <div class="product-image">

        <div class="product-icon">
          ${product.icon || "▣"}
        </div>

        <span class="stock ${
          isReady ? "" : "empty"
        }">
          ${
            isReady
              ? `Stok: ${stock}`
              : "Habis"
          }
        </span>

      </div>

      <div class="product-body">

        <h3>
          ${product.name || "Produk"}
        </h3>

        <ul class="product-specs">
          ${specificationHTML}
        </ul>

        <span class="product-price">
          ${formatRupiah(product.price)}
        </span>

        ${buttonHTML}

      </div>

    </article>
  `;
}


/* =========================================
   TAMPILKAN PRODUK
========================================= */

function renderProducts() {
  const grid =
    document.getElementById("productGrid");

  const count =
    document.getElementById("productCount");

  if (!grid) return;

  const products = getProducts();

  const keyword =
    searchKeyword.toLowerCase();

  const filtered =
    products.filter(product => {

      const categoryMatch =
        activeCategory === "Semua" ||
        product.category === activeCategory;

      const specs =
        Array.isArray(product.specs)
          ? product.specs
          : [];

      const text = [
        product.name || "",
        product.category || "",
        ...specs
      ]
        .join(" ")
        .toLowerCase();

      const searchMatch =
        text.includes(keyword);

      return (
        categoryMatch &&
        searchMatch
      );
    });


  if (count) {
    count.textContent =
      `${filtered.length} produk`;
  }


  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="
        grid-column: 1 / -1;
        text-align: center;
        padding: 60px 20px;
        color: #8299a8;
      ">
        Produk tidak ditemukan.
      </div>
    `;

    return;
  }


  grid.innerHTML =
    filtered
      .map(createProductCard)
      .join("");
}


/* =========================================
   CATEGORY CLICK
========================================= */

document.addEventListener(
  "click",
  event => {

    const target =
      event.target.closest(
        "[data-category]"
      );

    if (!target) return;

    event.preventDefault();

    activeCategory =
      target.dataset.category;

    renderFilters();
    renderProducts();

    const section =
      document.getElementById("products");

    if (section) {
      section.scrollIntoView({
        behavior: "smooth"
      });
    }
  }
);


/* =========================================
   SEARCH
========================================= */

function setupSearch() {
  const input =
    document.getElementById(
      "searchInput"
    );

  if (!input) return;

  input.addEventListener(
    "input",
    () => {
      searchKeyword =
        input.value.trim();

      renderProducts();
    }
  );
}


/* =========================================
   UPDATE DATA ANTAR TAB
========================================= */

window.addEventListener(
  "storage",
  event => {

    if (
      event.key === STORAGE_KEY
    ) {
      renderProducts();
    }
  }
);


/* =========================================
   MULAI WEBSITE
========================================= */

function startWebsite() {
  setupWhatsApp();
  renderNavigation();
  renderCategories();
  renderFilters();
  setupSearch();
  renderProducts();
}


if (
  document.readyState === "loading"
) {
  document.addEventListener(
    "DOMContentLoaded",
    startWebsite
  );
} else {
  startWebsite();
}
