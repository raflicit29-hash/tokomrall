const BUCKET_NAME = "product-images";

let currentUser = null;
let currentProducts = [];
let editingProductId = null;
let currentImagePath = null;
let selectedImageFile = null;


// ===============================
// ELEMENTS
// ===============================

const adminLogin = document.getElementById("adminLogin");
const adminLoginForm = document.getElementById("adminLoginForm");
const adminEmail = document.getElementById("adminEmail");
const loginButton = document.getElementById("loginButton");

const forgotPasswordLink =
  document.getElementById("forgotPasswordLink");

const adminDashboard =
  document.getElementById("adminDashboard");

const logoutButton =
  document.getElementById("logoutButton");

const dashboardMessage =
  document.getElementById("dashboardMessage");

const statProducts =
  document.getElementById("statProducts");

const statStock =
  document.getElementById("statStock");

const statActive =
  document.getElementById("statActive");

const productForm =
  document.getElementById("productForm");

const productId =
  document.getElementById("productId");

const productImage =
  document.getElementById("productImage");

const imagePreview =
  document.getElementById("imagePreview");

const removeImageButton =
  document.getElementById("removeImageButton");

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

const saveProductButton =
  document.getElementById("saveProductButton");

const cancelEditButton =
  document.getElementById("cancelEditButton");

const adminProductList =
  document.getElementById("adminProductList");

const formTitle =
  document.getElementById("formTitle");


// ===============================
// MESSAGE
// ===============================

function showMessage(message, type = "info") {

  const element =
    adminDashboard.style.display !== "none"
      ? dashboardMessage
      : document.getElementById("adminMessage");

  if (!element) return;

  element.textContent = message;
  element.style.display = "block";

  element.classList.remove(
    "success",
    "error",
    "info"
  );

  element.classList.add(type);

  setTimeout(() => {
    element.style.display = "none";
  }, 5000);
}


// ===============================
// FORMAT RUPIAH
// ===============================

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(value || 0);
}


// ===============================
// CHECK ADMIN
// ===============================

async function checkAdmin(userId) {

  const { data, error } = await supabaseClient
    .from("admins")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Admin check error:", error);
    return false;
  }

  return !!data;
}


// ===============================
// SHOW LOGIN
// ===============================

function showLogin() {

  adminLogin.style.display = "";
  adminDashboard.style.display = "none";

  currentUser = null;
}


// ===============================
// SHOW DASHBOARD
// ===============================

function showDashboard() {

  adminLogin.style.display = "none";
  adminDashboard.style.display = "";

}


// ===============================
// LOAD SESSION
// ===============================

async function loadSession() {

  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  if (!session) {
    showLogin();
    return;
  }

  const isAdmin =
    await checkAdmin(session.user.id);

  if (!isAdmin) {

    await supabaseClient.auth.signOut();

    showLogin();

    showMessage(
      "Akun ini bukan admin.",
      "error"
    );

    return;
  }

  currentUser = session.user;

  showDashboard();

  await loadProducts();
  populateCategories();
}
// ===============================
// MAGIC LINK LOGIN
// ===============================

adminLoginForm.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();

    const email =
      adminEmail.value.trim();

    if (!email) {
      showMessage(
        "Masukkan email admin terlebih dahulu.",
        "error"
      );
      return;
    }

    loginButton.disabled = true;
    loginButton.textContent =
      "Mengirim link...";

    const redirectUrl =
      window.location.origin +
      window.location.pathname;

    const { error } =
    await supabaseClient.auth.signInWithOtp({
        email,
        options: {
            emailRedirectTo: redirectUrl,
            shouldCreateUser: false
        }
    });

    if (error) {

      console.error(
        "Magic Link error:",
        error
      );

      showMessage(
        "Gagal mengirim Magic Link: " +
        error.message,
        "error"
      );

    } else {

      showMessage(
        "Magic Link sudah dikirim. Cek Inbox/Spam email kamu, lalu klik link tersebut.",
        "success"
      );
    }

    loginButton.disabled = false;
    loginButton.textContent =
      "📧 Kirim Link Login";
  }
);

// ===============================
// LOGOUT
// ===============================

logoutButton.addEventListener(
  "click",
  async () => {

    await supabaseClient.auth.signOut();

    showLogin();

    window.location.reload();
  }
);


// ===============================
// CATEGORIES
// ===============================

function populateCategories() {

  if (!productCategory) return;

  productCategory.innerHTML = "";

  const categories =
    Array.isArray(PRODUCT_CATEGORIES)
      ? PRODUCT_CATEGORIES
      : [];

  categories.forEach(category => {

    const option =
      document.createElement("option");

    option.value = category;
    option.textContent = category;

    productCategory.appendChild(option);
  });
}


// ===============================
// LOAD PRODUCTS
// ===============================

async function loadProducts() {

  if (!adminProductList) return;

  adminProductList.innerHTML = `
    <div class="loading-state">
      <div class="loading-spinner"></div>
      <p>Memuat produk...</p>
    </div>
  `;

  const { data, error } =
    await supabaseClient
      .from("products")
      .select("*")
      .order("created_at", {
        ascending: false
      });

  if (error) {

    console.error(
      "Load products error:",
      error
    );

    adminProductList.innerHTML = `
      <div class="loading-state">
        <p>Gagal memuat produk.</p>
      </div>
    `;

    showMessage(
      "Gagal memuat produk: " +
      error.message,
      "error"
    );

    return;
  }

  currentProducts =
    Array.isArray(data)
      ? data
      : [];

  updateStats();
  renderAdminProducts();
}


// ===============================
// STATS
// ===============================

function updateStats() {

  const totalProducts =
    currentProducts.length;

  const totalStock =
    currentProducts.reduce(
      (total, product) =>
        total + Number(product.stock || 0),
      0
    );

  const activeProducts =
    currentProducts.filter(
      product => product.is_active !== false
    ).length;

  statProducts.textContent =
    totalProducts;

  statStock.textContent =
    totalStock;

  statActive.textContent =
    activeProducts;
}


// ===============================
// RENDER ADMIN PRODUCTS
// ===============================

function renderAdminProducts() {

  if (!currentProducts.length) {

    adminProductList.innerHTML = `
      <div class="loading-state">
        <p>Belum ada produk.</p>
      </div>
    `;

    return;
  }

  adminProductList.innerHTML =
    currentProducts.map(product => {

      const specs =
        Array.isArray(product.specs)
          ? product.specs
          : [];

      const imageHtml =
        product.image_url
          ? `
            <img
              src="${escapeHtml(product.image_url)}"
              alt="${escapeHtml(product.name)}"
            >
          `
          : `
            <div class="admin-product-icon">
              ${escapeHtml(product.icon || "▣")}
            </div>
          `;

      return `
        <article class="admin-product-card">

          <div class="admin-product-image">
            ${imageHtml}
          </div>

          <div class="admin-product-info">

            <div class="admin-product-category">
              ${escapeHtml(product.category || "")}
            </div>

            <h3>
              ${escapeHtml(product.name || "")}
            </h3>

            <div class="admin-product-price">
              ${formatRupiah(product.price)}
            </div>

            <div class="admin-product-stock">
              Stok: ${Number(product.stock || 0)}
            </div>

            ${
              specs.length
                ? `
                  <ul class="admin-product-specs">
                    ${specs.map(spec => `
                      <li>
                        ${escapeHtml(spec)}
                      </li>
                    `).join("")}
                  </ul>
                `
                : ""
            }

          </div>

          <div class="admin-product-actions">

            <button
              type="button"
              class="btn-secondary"
              onclick="editProduct(${product.id})"
            >
              ✏️ Edit
            </button>

            <button
              type="button"
              class="btn-danger"
              onclick="deleteProduct(${product.id})"
            >
              🗑️ Hapus
            </button>

          </div>

        </article>
      `;
    }).join("");
}


// ===============================
// ESCAPE HTML
// ===============================

function escapeHtml(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


// ===============================
// IMAGE PREVIEW
// ===============================

productImage.addEventListener(
  "change",
  () => {

    const file =
      productImage.files?.[0];

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {

      showMessage(
        "Ukuran foto maksimal 5 MB.",
        "error"
      );

      productImage.value = "";
      return;
    }

    if (!file.type.startsWith("image/")) {

      showMessage(
        "File harus berupa gambar.",
        "error"
      );

      productImage.value = "";
      return;
    }

    selectedImageFile = file;

    const reader =
      new FileReader();

    reader.onload = event => {

      imagePreview.innerHTML = `
        <img
          src="${event.target.result}"
          alt="Preview"
        >
      `;

      removeImageButton.style.display =
        "inline-flex";
    };

    reader.readAsDataURL(file);
  }
);


// ===============================
// REMOVE IMAGE
// ===============================

removeImageButton.addEventListener(
  "click",
  () => {

    selectedImageFile = null;
    currentImagePath = null;

    productImage.value = "";

    imagePreview.innerHTML = `
      <div class="image-preview-empty">
        📷<br>
        Belum ada foto
      </div>
    `;

    removeImageButton.style.display =
      "none";
  }
);


// ===============================
// UPLOAD IMAGE
// ===============================

async function uploadProductImage(
  file,
  productDatabaseId
) {

  if (!file) return null;

  const extension =
    file.name
      .split(".")
      .pop()
      .toLowerCase();

  const filePath =
    `${productDatabaseId}-${Date.now()}.${extension}`;

  const { error: uploadError } =
    await supabaseClient.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type
      });

  if (uploadError) {
    throw uploadError;
  }

  const {
    data: publicData
  } =
    supabaseClient.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

  return {
    path: filePath,
    url: publicData.publicUrl
  };
}


// ===============================
// DELETE STORAGE IMAGE
// ===============================

async function deleteStorageImage(path) {

  if (!path) return;

  const { error } =
    await supabaseClient.storage
      .from(BUCKET_NAME)
      .remove([path]);

  if (error) {
    console.warn(
      "Gagal menghapus foto storage:",
      error
    );
  }
}


// ===============================
// ADD / EDIT PRODUCT
// ===============================

productForm.addEventListener(
  "submit",
  async event => {

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

    if (!name) {
      showMessage(
        "Nama produk wajib diisi.",
        "error"
      );
      return;
    }

    if (!category) {
      showMessage(
        "Kategori wajib dipilih.",
        "error"
      );
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      showMessage(
        "Harga tidak valid.",
        "error"
      );
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      showMessage(
        "Stok tidak valid.",
        "error"
      );
      return;
    }

    saveProductButton.disabled = true;
    saveProductButton.textContent =
      editingProductId
        ? "Menyimpan..."
        : "Menambahkan...";

    try {

      if (editingProductId) {

        await updateExistingProduct({
          name,
          category,
          price,
          stock,
          specs
        });

      } else {

        await createNewProduct({
          name,
          category,
          price,
          stock,
          specs
        });

      }

      resetProductForm();

      await loadProducts();

      showMessage(
        editingProductId
          ? "Produk berhasil diperbarui."
          : "Produk berhasil ditambahkan.",
        "success"
      );

    } catch (error) {

      console.error(
        "Save product error:",
        error
      );

      showMessage(
        "Gagal menyimpan produk: " +
        error.message,
        "error"
      );

    } finally {

      saveProductButton.disabled = false;

      saveProductButton.textContent =
        "Tambah Produk";
    }
  }
);


// ===============================
// CREATE PRODUCT
// ===============================

async function createNewProduct(data) {

  const { data: inserted, error } =
    await supabaseClient
      .from("products")
      .insert({
        category: data.category,
        name: data.name,
        price: data.price,
        stock: data.stock,
        specs: data.specs,
        icon: "▣",
        is_active: true
      })
      .select()
      .single();

  if (error) {
    throw error;
  }

  if (selectedImageFile) {

    const uploaded =
      await uploadProductImage(
        selectedImageFile,
        inserted.id
      );

    const { error: updateError } =
      await supabaseClient
        .from("products")
        .update({
          image_url: uploaded.url,
          image_path: uploaded.path
        })
        .eq("id", inserted.id);

    if (updateError) {

      await deleteStorageImage(
        uploaded.path
      );

      throw updateError;
    }
  }
}


// ===============================
// UPDATE PRODUCT
// ===============================

async function updateExistingProduct(data) {

  const product =
    currentProducts.find(
      item =>
        Number(item.id) ===
        Number(editingProductId)
    );

  if (!product) {
    throw new Error("Produk tidak ditemukan.");
  }

  const { error } =
    await supabaseClient
      .from("products")
      .update({
        category: data.category,
        name: data.name,
        price: data.price,
        stock: data.stock,
        specs: data.specs,
        updated_at: new Date().toISOString()
      })
      .eq("id", editingProductId);

  if (error) {
    throw error;
  }

  if (selectedImageFile) {

    const uploaded =
      await uploadProductImage(
        selectedImageFile,
        editingProductId
      );

    const { error: imageUpdateError } =
      await supabaseClient
        .from("products")
        .update({
          image_url: uploaded.url,
          image_path: uploaded.path,
          updated_at: new Date().toISOString()
        })
        .eq("id", editingProductId);

    if (imageUpdateError) {

      await deleteStorageImage(
        uploaded.path
      );

      throw imageUpdateError;
    }

    if (product.image_path) {
      await deleteStorageImage(
        product.image_path
      );
    }
  }
}


// ===============================
// EDIT PRODUCT
// ===============================

window.editProduct = function(id) {

  const product =
    currentProducts.find(
      item =>
        Number(item.id) === Number(id)
    );

  if (!product) {
    showMessage(
      "Produk tidak ditemukan.",
      "error"
    );
    return;
  }

  editingProductId = product.id;

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

  currentImagePath =
    product.image_path || null;

  selectedImageFile = null;

  productImage.value = "";

  if (product.image_url) {

    imagePreview.innerHTML = `
      <img
        src="${escapeHtml(product.image_url)}"
        alt="${escapeHtml(product.name)}"
      >
    `;

    removeImageButton.style.display =
      "inline-flex";

  } else {

    imagePreview.innerHTML = `
      <div class="image-preview-empty">
        📷<br>
        Belum ada foto
      </div>
    `;

    removeImageButton.style.display =
      "none";
  }

  formTitle.textContent =
    "Edit Produk";

  saveProductButton.textContent =
    "Simpan Perubahan";

  cancelEditButton.textContent =
    "Batal Edit";

  productForm.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
};


// ===============================
// DELETE PRODUCT
// ===============================

window.deleteProduct = async function(id) {

  const product =
    currentProducts.find(
      item =>
        Number(item.id) === Number(id)
    );

  if (!product) {
    showMessage(
      "Produk tidak ditemukan.",
      "error"
    );
    return;
  }

  const confirmed =
    confirm(
      `Hapus produk "${product.name}"?`
    );

  if (!confirmed) return;

  try {

    if (product.image_path) {
      await deleteStorageImage(
        product.image_path
      );
    }

    const { error } =
      await supabaseClient
        .from("products")
        .delete()
        .eq("id", id);

    if (error) {
      throw error;
    }

    await loadProducts();

    showMessage(
      "Produk berhasil dihapus.",
      "success"
    );

  } catch (error) {

    console.error(
      "Delete product error:",
      error
    );

    showMessage(
      "Gagal menghapus produk: " +
      error.message,
      "error"
    );
  }
};


// ===============================
// RESET FORM
// ===============================

function resetProductForm() {

  editingProductId = null;
  currentImagePath = null;
  selectedImageFile = null;

  productId.value = "";

  productName.value = "";

  if (productCategory.options.length) {
    productCategory.selectedIndex = 0;
  }

  productPrice.value = "";

  productStock.value = "";

  productSpecs.value = "";

  productImage.value = "";

  imagePreview.innerHTML = `
    <div class="image-preview-empty">
      📷<br>
      Belum ada foto
    </div>
  `;

  removeImageButton.style.display =
    "none";

  formTitle.textContent =
    "Tambah Produk";

  saveProductButton.textContent =
    "Tambah Produk";

  cancelEditButton.textContent =
    "Reset";
}


cancelEditButton.addEventListener(
  "click",
  () => {
    resetProductForm();
  }
);


// ===============================
// AUTH STATE
// ===============================

supabaseClient.auth.onAuthStateChange(
  async (event, session) => {

    if (event === "SIGNED_OUT") {
      showLogin();
      return;
    }

    if (
      event === "SIGNED_IN" ||
      event === "INITIAL_SESSION"
    ) {

      if (!session) {
        showLogin();
        return;
      }

      const isAdmin =
        await checkAdmin(session.user.id);

      if (!isAdmin) {

        await supabaseClient.auth.signOut();

        showLogin();

        showMessage(
          "Akun ini bukan admin.",
          "error"
        );

        return;
      }

      currentUser =
        session.user;

      showDashboard();

      populateCategories();

      await loadProducts();
    }
  }
);


// ===============================
// START
// ===============================

loadSession();
