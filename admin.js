/* =========================================
   MR ALL IN - ADMIN
========================================= */

const STORAGE_KEY = "mrallin_products";

const ADMIN_PASSWORD = "mrallin2026";

const LOGIN_KEY = "mrallin_admin_login";


/* =========================================
   ELEMENT
========================================= */

const loginSection =
  document.getElementById("loginSection");

const adminPanel =
  document.getElementById("adminPanel");

const loginForm =
  document.getElementById("loginForm");

const passwordInput =
  document.getElementById("adminPassword");

const loginError =
  document.getElementById("loginError");

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

const formTitle =
  document.getElementById("formTitle");

const cancelEdit =
  document.getElementById("cancelEdit");

const productList =
  document.getElementById("adminProductList");

const totalProducts =
  document.getElementById("totalProducts");

const availableProducts =
  document.getElementById("availableProducts");

const totalStock =
  document.getElementById("totalStock");


/* =========================================
   DATA
========================================= */

function getProducts() {

  try {

    const saved =
      localStorage.getItem(STORAGE_KEY);

    if (saved) {

      const data =
        JSON.parse(saved);

      if (
        Array.isArray(data) &&
        data.length > 0
      ) {
        return data;
      }
    }

  } catch (error) {

    console.error(
      "Gagal membaca produk:",
      error
    );

  }

  return DEFAULT_PRODUCTS.map(
    product => ({
      ...product,
      specs: Array.isArray(product.specs)
        ? [...product.specs]
        : []
    })
  );
}


function saveProducts(products) {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(products)
  );

}


/* =========================================
   FORMAT
========================================= */

function formatRupiah(value) {

  return new Intl.NumberFormat(
    "id-ID",
    {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }
  ).format(Number(value) || 0);

}


/* =========================================
   LOGIN
========================================= */

function showAdmin() {

  loginSection.style.display =
    "none";

  adminPanel.style.display =
    "block";

  renderCategories();
  renderProducts();
  updateStats();

}


function showLogin() {

  loginSection.style.display =
    "block";

  adminPanel.style.display =
    "none";

}


function checkLogin() {

  if (
    sessionStorage.getItem(
      LOGIN_KEY
    ) === "true"
  ) {

    showAdmin();

  } else {

    showLogin();

  }

}


/* =========================================
   LOGIN FORM
========================================= */

loginForm.addEventListener(
  "submit",
  event => {

    event.preventDefault();

    const password =
      passwordInput.value;

    if (
      password ===
      ADMIN_PASSWORD
    ) {

      sessionStorage.setItem(
        LOGIN_KEY,
        "true"
      );

      passwordInput.value = "";

      loginError.style.display =
        "none";

      showAdmin();

    } else {

      loginError.textContent =
        "Password admin salah.";

      loginError.style.display =
        "block";

      passwordInput.value = "";

      passwordInput.focus();

    }

  }
);


/* =========================================
   LOGOUT
========================================= */

logoutButton.addEventListener(
  "click",
  () => {

    sessionStorage.removeItem(
      LOGIN_KEY
    );

    showLogin();

  }
);


/* =========================================
   CATEGORY
========================================= */

function renderCategories() {

  productCategory.innerHTML = `
    <option value="">
      Pilih kategori
    </option>
  `;

  PRODUCT_CATEGORIES.forEach(
    category => {

      const option =
        document.createElement(
          "option"
        );

      option.value = category;
      option.textContent = category;

      productCategory.appendChild(
        option
      );

    }
  );

}


/* =========================================
   RESET FORM
========================================= */

function resetForm() {

  productForm.reset();

  productId.value = "";

  formTitle.textContent =
    "Tambah Produk";

  cancelEdit.style.display =
    "none";

}


/* =========================================
   TAMBAH / EDIT
========================================= */

productForm.addEventListener(
  "submit",
  event => {

    event.preventDefault();

    const name =
      productName.value.trim();

    const category =
      productCategory.value;

    const price =
      Number(productPrice.value);

    const stock =
      Number(productStock.value);

    const specs =
      productSpecs.value
        .split("\n")
        .map(item => item.trim())
        .filter(Boolean);

    const icon =
      productIcon.value.trim() ||
      "▣";


    if (!name) {

      alert(
        "Masukkan nama produk."
      );

      return;

    }


    if (!category) {

      alert(
        "Pilih kategori produk."
      );

      return;

    }


    if (
      !Number.isFinite(price) ||
      price < 0
    ) {

      alert(
        "Harga tidak valid."
      );

      return;

    }


    if (
      !Number.isFinite(stock) ||
      stock < 0
    ) {

      alert(
        "Stok tidak valid."
      );

      return;

    }


    const products =
      getProducts();


    if (productId.value) {

      const id =
        Number(productId.value);

      const index =
        products.findIndex(
          product =>
            Number(product.id) === id
        );


      if (index !== -1) {

        products[index] = {
          ...products[index],

          category,
          name,
          price,
          stock,
          specs,
          icon
        };

      }

    } else {

      const ids =
        products
          .map(product =>
            Number(product.id)
          )
          .filter(Number.isFinite);

      const newId =
        ids.length > 0
          ? Math.max(...ids) + 1
          : 1;


      products.push({

        id: newId,
        category,
        name,
        price,
        stock,
        specs,
        icon

      });

    }


    saveProducts(products);

    resetForm();

    renderProducts();
    updateStats();

    alert(
      "Produk berhasil disimpan."
    );

  }
);


/* =========================================
   RENDER PRODUCT
========================================= */

function renderProducts() {

  const products =
    getProducts();


  if (products.length === 0) {

    productList.innerHTML = `
      <div class="admin-empty">
        Belum ada produk.
      </div>
    `;

    return;

  }


  productList.innerHTML =
    products.map(product => {

      const stock =
        Number(product.stock) || 0;

      return `
        <div class="admin-product-item">

          <div class="admin-product-main">

            <strong>
              ${product.name}
            </strong>

            <span>
              ${product.category}
            </span>

            <div class="admin-product-price">
              ${formatRupiah(product.price)}
            </div>

            <span class="admin-product-stock">
              Stok: ${stock}
            </span>

          </div>

          <div class="admin-product-actions">

            <button
              type="button"
              data-edit="${product.id}"
            >
              Edit
            </button>

            <button
              type="button"
              class="delete-button"
              data-delete="${product.id}"
            >
              Hapus
            </button>

          </div>

        </div>
      `;

    }).join("");

}


/* =========================================
   EDIT / DELETE CLICK
========================================= */

productList.addEventListener(
  "click",
  event => {

    const editButton =
      event.target.closest(
        "[data-edit]"
      );

    const deleteButton =
      event.target.closest(
        "[data-delete]"
      );


    if (editButton) {

      editProduct(
        Number(
          editButton.dataset.edit
        )
      );

    }


    if (deleteButton) {

      deleteProduct(
        Number(
          deleteButton.dataset.delete
        )
      );

    }

  }
);


/* =========================================
   EDIT PRODUCT
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
    return;
  }


  productId.value =
    product.id;

  productName.value =
    product.name || "";

  productCategory.value =
    product.category || "";

  productPrice.value =
    product.price || 0;

  productStock.value =
    product.stock || 0;

  productSpecs.value =
    Array.isArray(product.specs)
      ? product.specs.join("\n")
      : "";

  productIcon.value =
    product.icon || "▣";


  formTitle.textContent =
    "Edit Produk";

  cancelEdit.style.display =
    "block";


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


/* =========================================
   DELETE PRODUCT
========================================= */

function deleteProduct(id) {

  const products =
    getProducts();

  const product =
    products.find(
      item =>
        Number(item.id) === id
    );


  if (!product) {
    return;
  }


  const confirmed =
    confirm(
      `Hapus produk "${product.name}"?`
    );


  if (!confirmed) {
    return;
  }


  const filtered =
    products.filter(
      item =>
        Number(item.id) !== id
    );


  saveProducts(filtered);

  renderProducts();
  updateStats();

}


/* =========================================
   CANCEL EDIT
========================================= */

cancelEdit.addEventListener(
  "click",
  resetForm
);


/* =========================================
   STATISTIK
========================================= */

function updateStats() {

  const products =
    getProducts();

  const available =
    products.filter(
      product =>
        Number(product.stock) > 0
    ).length;

  const stock =
    products.reduce(
      (total, product) =>
        total +
        (Number(product.stock) || 0),
      0
    );


  totalProducts.textContent =
    products.length;

  availableProducts.textContent =
    available;

  totalStock.textContent =
    stock;

}


/* =========================================
   START
========================================= */

checkLogin();
