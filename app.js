/* =========================================
   MR ALL IN - CUSTOMER WEBSITE
========================================= */

const WHATSAPP_NUMBER = "6281330053178";

let activeCategory = "Semua";
let searchKeyword = "";


/* =========================================
   AMBIL DATA PRODUK
========================================= */

function getProducts() {
  try {
    const savedProducts = localStorage.getItem("mrallin_products");

    if (savedProducts) {
      return JSON.parse(savedProducts);
    }
  } catch (error) {
    console.error("Gagal membaca produk:", error);
  }

  return DEFAULT_PRODUCTS;
}


/* =========================================
   FORMAT RUPIAH
========================================= */

function formatRupiah(number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(number);
}


/* =========================================
   WHATSAPP
========================================= */

function createWhatsAppLink(product) {

  const message =
`Halo MR ALL IN 👋

Saya tertarik dengan:

*${product.name}*
Harga: ${formatRupiah(product.price)}

Apakah stok barang ini masih tersedia?

Saya ingin tanya detail kondisi barang dan opsi COD / ambil langsung di Gubeng, Surabaya.`;

  return (
    "https://wa.me/" +
    WHATSAPP_NUMBER +
    "?text=" +
    encodeURIComponent(message)
  );
}


/* =========================================
   WHATSAPP UMUM
========================================= */

const generalMessage =
  "Halo MR ALL IN 👋 Saya mau tanya produk komputer yang tersedia.";

const generalWhatsApp =
  "https://wa.me/" +
  WHATSAPP_NUMBER +
  "?text=" +
  encodeURIComponent(generalMessage);

document.getElementById("whatsappTop").href =
  generalWhatsApp;

document.getElementById("whatsappFloat").href =
  generalWhatsApp;


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

  const categories = [
    "Semua",
    ...PRODUCT_CATEGORIES
  ];

  navigation.innerHTML =
    categories.map(category => {

      return `
        <a
          href="#products"
          data-category="${category}"
        >
          ${category === "Semua" ? "⌂ Beranda" : category}
        </a>
      `;

    }).join("");

}


/* =========================================
   CATEGORY BOX
========================================= */

function renderCategories() {

  const container =
    document.getElementById("categories");

  container.innerHTML =
    PRODUCT_CATEGORIES.map(category => {

      return `
        <button
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
      `;

    }).join("");

}


/* =========================================
   FILTER BUTTON
========================================= */

function renderFilters() {

  const filters =
    document.getElementById("filters");

  const categories = [
    "Semua",
    ...PRODUCT_CATEGORIES
  ];

  filters.innerHTML =
    categories.map(category => {

      return `
        <button
          data-category="${category}"
          class="${
            activeCategory === category
              ? "active"
              : ""
          }"
        >
          ${category}
        </button>
      `;

    }).join("");

}


/* =========================================
   PRODUCT CARD
========================================= */

function createProductCard(product) {

  const isReady =
    Number(product.stock) > 0;

  const specifications =
    product.specs
      .map(spec => `<li>○ ${spec}</li>`)
      .join("");


  let buyButton;

  if (isReady) {

    buyButton = `
      <a
        class="buy-button"
        href="${createWhatsAppLink(product)}"
        target="_blank"
        rel="noopener"
      >
        ☘ Tanya via WhatsApp
      </a>
    `;

  } else {

    buyButton = `
      <span class="buy-button disabled">
        Stok Habis
      </span>
    `;

  }


  return `

    <article class="product-card">

      <div class="product-image">

        <div class="product-icon">
          ${product.icon || "▣"}
        </div>

        <span
          class="stock ${
            isReady ? "" : "empty"
          }"
        >
          ${
            isReady
              ? "Stok: " + product.stock
              : "Habis"
          }
        </span>

      </div>


      <div class="product-body">

        <h3>
          ${product.name}
        </h3>


        <ul class="product-specs">
          ${specifications}
        </ul>


        <span class="product-price">
          ${formatRupiah(product.price)}
        </span>


        ${buyButton}

      </div>

    </article>

  `;

}


/* =========================================
   TAMPILKAN PRODUK
========================================= */

function renderProducts() {

  const products =
    getProducts();

  const filteredProducts =
    products.filter(product => {

      const categoryMatch =
        activeCategory === "Semua" ||
        product.category === activeCategory;


      const searchableText = `
        ${product.name}
        ${product.category}
        ${product.specs.join(" ")}
      `.toLowerCase();


      const searchMatch =
        searchableText.includes(
          searchKeyword.toLowerCase()
        );


      return (
        categoryMatch &&
        searchMatch
      );

    });


  const grid =
    document.getElementById("productGrid");


  document.getElementById(
    "productCount"
  ).textContent =
    filteredProducts.length +
    " produk";


  if (filteredProducts.length === 0) {

    grid.innerHTML = `
      <div style="
        grid-column: 1 / -1;
        text-align: center;
        padding: 50px 20px;
        color: #8299a8;
      ">
        Produk tidak ditemukan.
      </div>
    `;

    return;

  }


  grid.innerHTML =
    filteredProducts
      .map(createProductCard)
      .join("");

}


/* =========================================
   CATEGORY CLICK
========================================= */

document.addEventListener(
  "click",
  function(event) {

    const button =
      event.target.closest(
        "[data-category]"
      );


    if (!button) {
      return;
    }


    event.preventDefault();


    activeCategory =
      button.dataset.category;


    renderFilters();
    renderProducts();


    document
      .getElementById("products")
      .scrollIntoView({
        behavior: "smooth"
      });

  }
);


/* =========================================
   SEARCH
========================================= */

const searchInput =
  document.getElementById(
    "searchInput"
  );


searchInput.addEventListener(
  "input",
  function() {

    searchKeyword =
      searchInput.value.trim();

    renderProducts();

  }
);


/* =========================================
   UPDATE ANTAR TAB
========================================= */

window.addEventListener(
  "storage",
  function(event) {

    if (
      event.key ===
      "mrallin_products"
    ) {

      renderProducts();

    }

  }
);


/* =========================================
   START WEBSITE
========================================= */

renderNavigation();
renderCategories();
renderFilters();
renderProducts();
