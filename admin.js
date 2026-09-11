/* =========================================
   MR ALL IN — ADMIN PANEL
========================================= */

const STORAGE_KEY = "mrallin_products";

/*
   PASSWORD DEMO
   Nanti versi produksi kita ganti dengan
   authentication database.
*/

const ADMIN_PASSWORD = "mrallin2026";


/* =========================================
   ELEMENT
========================================= */

const loginSection =
  document.getElementById("adminLogin");

const adminPanel =
  document.getElementById("adminPanel");

const passwordInput =
  document.getElementById("adminPassword");

const loginButton =
  document.getElementById("loginButton");

const logoutButton =
  document.getElementById("logoutButton");

const productForm =
  document.getElementById("productForm");

const productId =
  document.getElementById("productId");

const productName =
  document.getElementById("productName");

const productCategory =
  document.getElementById("productCategory");

const productPrice =
  document.getElementById("productPrice");

const productStock =
  document.getElementById("productStock");

const productSpecs =
  document.getElementById("productSpecs");

const productIcon =
  document.getElementById("productIcon");

const newProductButton =
  document.getElementById("newProductButton");

const adminProductList =
  document.getElementById("adminProductList");

const adminStats =
  document.getElementById("adminStats");

const adminProductCount =
  document.getElementById("adminProductCount");


/* =========================================
   DATA PRODUK
========================================= */

function getProducts() {

  try {

    const saved =
      localStorage.getItem(STORAGE_KEY);

    if (saved) {

      return JSON.parse(saved);

    }

  } catch (error) {

    console.error(
      "Gagal membaca database lokal:",
      error
    );

  }

  return DEFAULT_PRODUCTS.map(
    product => ({ ...product })
  );

}


/* =========================================
   SIMPAN PRODUK
========================================= */

function saveProducts(products) {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(products)
  );

}


/* =========================================
   FORMAT RUPIAH
========================================= */

function formatPrice(number) {

  return new Intl.NumberFormat(
    "id-ID",
    {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }
  ).format(number);

}


/* =========================================
   ISI KATEGORI
========================================= */

function loadCategories() {

  productCategory.innerHTML = `
    <option value="">
      Pilih kategori
    </option>
  `;

  PRODUCT_CATEGORIES.forEach(
    category => {

      const option =
        document.createElement("option");

      option.value = category;
      option.textContent = category;

      productCategory.appendChild(
        option
      );

    }
  );

}


/* =========================================
   LOGIN
========================================= */

function login() {

  const password =
    passwordInput.value;

  if (
    password === ADMIN_PASSWORD
  ) {

    sessionStorage.setItem(
      "mrallin_admin",
      "true"
    );

    showAdmin();

  } else {

    alert(
      "Password admin salah."
    );

    passwordInput.value = "";

    passwordInput.focus();

  }

}


/* =========================================
   TAMPILKAN ADMIN
========================================= */

function showAdmin() {

  loginSection.hidden = true;

  adminPanel.hidden = false;

  loadCategories();

  renderAdmin();

}


/* =========================================
   CEK SESSION
========================================= */

function checkLogin() {

  const loggedIn =
    sessionStorage.getItem(
      "mrallin_admin"
    );

  if (loggedIn === "true") {

    showAdmin();

  }

}


/* =========================================
   LOGOUT
========================================= */

function logout() {

  sessionStorage.removeItem(
    "mrallin_admin"
  );

  location.reload();

}


/* =========================================
   RENDER STATISTIK
========================================= */

function renderStats(products) {

  const totalProducts =
    products.length;

  const readyProducts =
    products.filter(
      product =>
        Number(product.stock) > 0
    ).length;

  const emptyProducts =
    products.filter(
      product =>
        Number(product.stock) <= 0
    ).length;

  const totalStock =
    products.reduce(
      (total, product) =>
        total +
        Number(product.stock || 0),
      0
    );


  adminStats.innerHTML = `

    <div>
      <b>${totalProducts}</b>
      <small>Jenis Produk</small>
    </div>

    <div>
      <b>${totalStock}</b>
      <small>Total Stok</small>
    </div>

    <div>
      <b>${readyProducts}</b>
      <small>Produk Ready</small>
    </div>

    <div>
      <b>${emptyProducts}</b>
      <small>Produk Habis</small>
    </div>

  `;

}


/* =========================================
   RENDER LIST PRODUK
========================================= */

function renderAdmin() {

  const products =
    getProducts();


  renderStats(products);


  adminProductCount.textContent =
    products.length +
    " produk";


  if (products.length === 0) {

    adminProductList.innerHTML = `

      <div class="empty-admin">

        Belum ada produk.

      </div>

    `;

    return;

  }


  adminProductList.innerHTML =
    products.map(
      product => {

        const ready =
          Number(product.stock) > 0;


        return `

          <div
            class="admin-product"
            data-id="${product.id}"
          >

            <div class="admin-product-icon">
              ${product.icon || "▣"}
            </div>


            <div class="admin-product-info">

              <b>
                ${escapeHTML(product.name)}
              </b>

              <small>
                ${escapeHTML(product.category)}
              </small>

              <small>
                ${formatPrice(product.price)}
                •
                ${ready
                  ? "Stok " + product.stock
                  : "HABIS"}
              </small>

            </div>


            <div class="admin-actions">

              <button
                class="edit-product"
                data-id="${product.id}"
              >
                ✏️ Edit
              </button>


              <button
                class="delete-product"
                data-id="${product.id}"
              >
                🗑️ Hapus
              </button>

            </div>

          </div>

        `;

      }
    ).join("");


  bindProductActions();

}


/* =========================================
   AMANKAN TEXT HTML
========================================= */

function escapeHTML(text) {

  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* =========================================
   BUTTON EDIT / DELETE
========================================= */

function bindProductActions() {

  document
    .querySelectorAll(".edit-product")
    .forEach(button => {

      button.addEventListener(
        "click",
        function() {

          editProduct(
            Number(this.dataset.id)
          );

        }
      );

    });


  document
    .querySelectorAll(".delete-product")
    .forEach(button => {

      button.addEventListener(
        "click",
        function() {

          deleteProduct(
            Number(this.dataset.id)
          );

        }
      );

    });

}


/* =========================================
   EDIT PRODUK
========================================= */

function editProduct(id) {

  const products =
    getProducts();


  const product =
    products.find(
      item =>
        Number(item.id) === id
    );


  if (!product) {

    alert(
      "Produk tidak ditemukan."
    );

    return;

  }


  productId.value =
    product.id;

  productName.value =
    product.name;

  productCategory.value =
    product.category;

  productPrice.value =
    product.price;

  productStock.value =
    product.stock;

  productSpecs.value =
    product.specs.join(" | ");

  productIcon.value =
    product.icon || "▣";


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


/* =========================================
   H
