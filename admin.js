const STORAGE_KEY = "mrallin_products";
const BUCKET_NAME = "product-images";

let products = [];
let editingId = null;
let selectedImageFile = null;

const categoryList = [
  "VGA",
  "Processor",
  "Motherboard",
  "RAM",
  "SSD",
  "HDD",
  "PSU",
  "Casing",
  "Monitor",
  "Aksesoris",
  "Paket PC"
];

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

function showLogin() {
  const login = document.querySelector("#adminLogin");
  const dashboard = document.querySelector("#adminDashboard");

  if (login) login.style.display = "";
  if (dashboard) dashboard.style.display = "none";
}

function showDashboard() {
  const login = document.querySelector("#adminLogin");
  const dashboard = document.querySelector("#adminDashboard");

  if (login) login.style.display = "none";
  if (dashboard) dashboard.style.display = "";
}

function showMessage(message, type = "success") {
  const box = document.querySelector("#adminMessage");

  if (!box) {
    alert(message);
    return;
  }

  box.textContent = message;
  box.className = `admin-message ${type}`;
  box.style.display = "block";

  setTimeout(() => {
    box.style.display = "none";
  }, 4000);
}

async function checkAdmin() {
  const {
    data: { user },
    error
  } = await supabaseClient.auth.getUser();

  if (error || !user) {
    showLogin();
    return false;
  }

  const { data: admin, error: adminError } =
    await supabaseClient
      .from("admins")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

  if (adminError || !admin) {
    await supabaseClient.auth.signOut();

    showLogin();

    showMessage(
      "Akun ini bukan admin.",
      "error"
    );

    return false;
  }

  showDashboard();

  return true;
}

async function loginAdmin() {
  const email =
    document.querySelector("#adminEmail")?.value.trim();

  const password =
    document.querySelector("#adminPassword")?.value;

  if (!email || !password) {
    showMessage(
      "Email dan password wajib diisi.",
      "error"
    );
    return;
  }

  const button =
    document.querySelector("#loginButton");

  if (button) {
    button.disabled = true;
    button.textContent = "Login...";
  }

  const { data, error } =
    await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

  if (button) {
    button.disabled = false;
    button.textContent = "Login";
  }

  if (error) {
    showMessage(
      "Login gagal: " + error.message,
      "error"
    );
    return;
  }

  const isAdmin = await checkAdmin();

  if (!isAdmin && data?.user) {
    await supabaseClient.auth.signOut();
  }
}

async function logoutAdmin() {
  await supabaseClient.auth.signOut();

  editingId = null;
  selectedImageFile = null;

  showLogin();
}

async function loadProducts() {
  const { data, error } =
    await supabaseClient
      .from("products")
      .select("*")
      .order("created_at", {
        ascending: false
      });

  if (error) {
    console.error(error);

    showMessage(
      "Gagal mengambil produk: " + error.message,
      "error"
    );

    return;
  }

  products = Array.isArray(data)
    ? data
    : [];

  renderStats();
  renderProductList();
}

function renderStats() {
  const totalProducts = products.length;

  const activeProducts =
    products.filter(product => product.is_active).length;

  const totalStock =
    products.reduce(
      (sum, product) =>
        sum + (Number(product.stock) || 0),
      0
    );

  const statProducts =
    document.querySelector("#statProducts");

  const statStock =
    document.querySelector("#statStock");

  const statActive =
    document.querySelector("#statActive");

  if (statProducts) {
    statProducts.textContent = totalProducts;
  }

  if (statStock) {
    statStock.textContent = totalStock;
  }

  if (statActive) {
    statActive.textContent = activeProducts;
  }
}

function renderProductList() {
  const container =
    document.querySelector("#adminProductList");

  if (!container) return;

  if (!products.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📦</div>
        <h3>Belum ada produk</h3>
        <p>Tambahkan produk pertama kamu.</p>
      </div>
    `;

    return;
  }

  container.innerHTML = products
    .map(product => {
      const stock =
        Number(product.stock) || 0;

      const image = product.image_url
        ? `
          <img
            src="${escapeHTML(product.image_url)}"
            alt="${escapeHTML(product.name)}"
            class="admin-product-image"
          >
        `
        : `
          <div class="admin-product-placeholder">
            ${escapeHTML(product.icon || "▣")}
          </div>
        `;

      return `
        <div class="admin-product-item">

          <div class="admin-product-thumb">
            ${image}
          </div>

          <div class="admin-product-info">

            <div class="admin-product-category">
              ${escapeHTML(product.category)}
            </div>

            <h3>
              ${escapeHTML(product.name)}
            </h3>

            <div class="admin-product-price">
              ${formatRupiah(product.price)}
            </div>

            <div class="admin-product-stock">
              Stok: <strong>${stock}</strong>
            </div>

          </div>

          <div class="admin-product-actions">

            <button
              class="btn-edit"
              data-edit-id="${product.id}"
            >
              Edit
            </button>

            <button
              class="btn-delete"
              data-delete-id="${product.id}"
            >
              Hapus
            </button>

          </div>

        </div>
      `;
    })
    .join("");

  container
    .querySelectorAll("[data-edit-id]")
    .forEach(button => {
      button.addEventListener("click", () => {
        editProduct(button.dataset.editId);
      });
    });

  container
    .querySelectorAll("[data-delete-id]")
    .forEach(button => {
      button.addEventListener("click", () => {
        deleteProduct(button.dataset.deleteId);
      });
    });
}

function fillCategories() {
  const select =
    document.querySelector("#productCategory");

  if (!select) return;

  select.innerHTML = categoryList
    .map(category => `
      <option value="${escapeHTML(category)}">
        ${escapeHTML(category)}
      </option>
    `)
    .join("");
}

function resetForm() {
  editingId = null;
  selectedImageFile = null;

  const form =
    document.querySelector("#productForm");

  if (form) form.reset();

  const idInput =
    document.querySelector("#productId");

  if (idInput) {
    idInput.value = "";
  }

  const title =
    document.querySelector("#formTitle");

  if (title) {
    title.textContent = "Tambah Produk";
  }

  const submit =
    document.querySelector("#saveProductButton");

  if (submit) {
    submit.textContent = "Tambah Produk";
  }

  const imageInput =
    document.querySelector("#productImage");

  if (imageInput) {
    imageInput.value = "";
  }

  const preview =
    document.querySelector("#imagePreview");

  if (preview) {
    preview.innerHTML = `
      <div class="image-preview-empty">
        📷<br>
        Belum ada foto
      </div>
    `;
  }

  const removeImage =
    document.querySelector("#removeImageButton");

  if (removeImage) {
    removeImage.style.display = "none";
  }
}

function editProduct(id) {
  const product =
    products.find(item => String(item.id) === String(id));

  if (!product) return;

  editingId = product.id;
  selectedImageFile = null;

  const name =
    document.querySelector("#productName");

  const category =
    document.querySelector("#productCategory");

  const price =
    document.querySelector("#productPrice");

  const stock =
    document.querySelector("#productStock");

  const specs =
    document.querySelector("#productSpecs");

  if (name) name.value = product.name || "";
  if (category) category.value = product.category || "";
  if (price) price.value = product.price || 0;
  if (stock) stock.value = product.stock || 0;

  if (specs) {
    specs.value = Array.isArray(product.specs)
      ? product.specs.join("\n")
      : "";
  }

  const title =
    document.querySelector("#formTitle");

  if (title) {
    title.textContent = "Edit Produk";
  }

  const submit =
    document.querySelector("#saveProductButton");

  if (submit) {
    submit.textContent = "Simpan Perubahan";
  }

  const preview =
    document.querySelector("#imagePreview");

  if (preview) {
    preview.innerHTML = product.image_url
      ? `
        <img
          src="${escapeHTML(product.image_url)}"
          alt="Preview"
        >
      `
      : `
        <div class="image-preview-empty">
          📷<br>
          Belum ada foto
        </div>
      `;
  }

  const removeImage =
    document.querySelector("#removeImageButton");

  if (removeImage) {
    removeImage.style.display =
      product.image_url
        ? "inline-flex"
        : "none";
  }

  document
    .querySelector("#productForm")
    ?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
}

function handleImagePreview(event) {
  const file =
    event.target.files?.[0];

  if (!file) {
    selectedImageFile = null;
    return;
  }

  if (!file.type.startsWith("image/")) {
    showMessage(
      "File harus berupa gambar.",
      "error"
    );

    event.target.value = "";

    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    showMessage(
      "Ukuran foto maksimal 5 MB.",
      "error"
    );

    event.target.value = "";

    return;
  }

  selectedImageFile = file;

  const reader =
    new FileReader();

  reader.onload = () => {
    const preview =
      document.querySelector("#imagePreview");

    if (preview) {
      preview.innerHTML = `
        <img
          src="${reader.result}"
          alt="Preview foto"
        >
      `;
    }
  };

  reader.readAsDataURL(file);
}

async function uploadImage(file) {
  const extension =
    file.name.split(".").pop()?.toLowerCase() ||
    "jpg";

  const fileName =
    `${crypto.randomUUID()}.${extension}`;

  const filePath =
    `products/${fileName}`;

  const { error } =
    await supabaseClient.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false
      });

  if (error) {
    throw error;
  }

  const {
    data: publicData
  } = supabaseClient.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return {
    path: filePath,
    url: publicData.publicUrl
  };
}

async function deleteImage(path) {
  if (!path) return;

  const { error } =
    await supabaseClient.storage
      .from(BUCKET_NAME)
      .remove([path]);

  if (error) {
    console.warn(
      "Gagal menghapus foto:",
      error
    );
  }
}

async function saveProduct(event) {
  event.preventDefault();

  const name =
    document.querySelector("#productName")
      ?.value.trim();

  const category =
    document.querySelector("#productCategory")
      ?.value;

  const price =
    Number(
      document.querySelector("#productPrice")
        ?.value
    );

  const stock =
    Number(
      document.querySelector("#productStock")
        ?.value
    );

  const specsText =
    document.querySelector("#productSpecs")
      ?.value || "";

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

  const specs =
    specsText
      .split("\n")
      .map(item => item.trim())
      .filter(Boolean);

  const button =
    document.querySelector("#saveProductButton");

  if (button) {
    button.disabled = true;
    button.textContent =
      editingId
        ? "Menyimpan..."
        : "Menambahkan...";
  }

  try {
    let imageUrl = null;
    let imagePath = null;

    const oldProduct =
      editingId
        ? products.find(
            item =>
              String(item.id) ===
              String(editingId)
          )
        : null;

    if (selectedImageFile) {
      const uploaded =
        await uploadImage(
          selectedImageFile
        );

      imageUrl = uploaded.url;
      imagePath = uploaded.path;
    }

    if (editingId) {
      const updateData = {
        name,
        category,
        price,
        stock,
        specs,
        updated_at:
          new Date().toISOString()
      };

      if (selectedImageFile) {
        updateData.image_url =
          imageUrl;

        updateData.image_path =
          imagePath;
      }

      const { error } =
        await supabaseClient
          .from("products")
          .update(updateData)
          .eq("id", editingId);

      if (error) {
        if (imagePath) {
          await deleteImage(imagePath);
        }

        throw error;
      }

      if (
        selectedImageFile &&
        oldProduct?.image_path
      ) {
        await deleteImage(
          oldProduct.image_path
        );
      }

      showMessage(
        "Produk berhasil diperbarui."
      );

    } else {
      const insertData = {
        name,
        category,
        price,
        stock,
        specs,
        icon: "▣",
        is_active: true
      };

      if (selectedImageFile) {
        insertData.image_url =
          imageUrl;

        insertData.image_path =
          imagePath;
      }

      const { error } =
        await supabaseClient
          .from("products")
          .insert(insertData);

      if (error) {
        if (imagePath) {
          await deleteImage(imagePath);
        }

        throw error;
      }

      showMessage(
        "Produk berhasil ditambahkan."
      );
    }

    resetForm();

    await loadProducts();

  } catch (error) {
    console.error(error);

    showMessage(
      "Gagal menyimpan produk: " +
        error.message,
      "error"
    );

  } finally {
    if (button) {
      button.disabled = false;

      button.textContent =
        editingId
          ? "Simpan Perubahan"
          : "Tambah Produk";
    }
  }
}

async function removeCurrentImage() {
  if (!editingId) return;

  const product =
    products.find(
      item =>
        String(item.id) ===
        String(editingId)
    );

  if (!product) return;

  if (!product.image_path) {
    showMessage(
      "Produk ini belum mempunyai foto.",
      "error"
    );
    return;
  }

  const confirmed =
    confirm(
      "Hapus foto produk ini?"
    );

  if (!confirmed) return;

  await deleteImage(
    product.image_path
  );

  const { error } =
    await supabaseClient
      .from("products")
      .update({
        image_url: null,
        image_path: null,
        updated_at:
          new Date().toISOString()
      })
      .eq("id", product.id);

  if (error) {
    showMessage(
      "Gagal menghapus foto: " +
        error.message,
      "error"
    );
    return;
  }

  showMessage(
    "Foto berhasil dihapus."
  );

  await loadProducts();

  editProduct(product.id);
}

async function deleteProduct(id) {
  const product =
    products.find(
      item =>
        String(item.id) ===
        String(id)
    );

  if (!product) return;

  const confirmed =
    confirm(
      `Hapus produk "${product.name}"?`
    );

  if (!confirmed) return;

  try {
    if (product.image_path) {
      await deleteImage(
        product.image_path
      );
    }

    const { error } =
      await supabaseClient
        .from("products")
        .delete()
        .eq("id", product.id);

    if (error) {
      throw error;
    }

    if (
      editingId &&
      String(editingId) ===
        String(product.id)
    ) {
      resetForm();
    }

    showMessage(
      "Produk berhasil dihapus."
    );

    await loadProducts();

  } catch (error) {
    console.error(error);

    showMessage(
      "Gagal menghapus produk: " +
        error.message,
      "error"
    );
  }
}

function setupEvents() {
  const loginForm =
    document.querySelector("#adminLoginForm");

  if (loginForm) {
    loginForm.addEventListener(
      "submit",
      event => {
        event.preventDefault();
        loginAdmin();
      }
    );
  }

  const logout =
    document.querySelector("#logoutButton");

  if (logout) {
    logout.addEventListener(
      "click",
      logoutAdmin
    );
  }

  const form =
    document.querySelector("#productForm");

  if (form) {
    form.addEventListener(
      "submit",
      saveProduct
    );
  }

  const imageInput =
    document.querySelector("#productImage");

  if (imageInput) {
    imageInput.addEventListener(
      "change",
      handleImagePreview
    );
  }

  const removeImage =
    document.querySelector("#removeImageButton");

  if (removeImage) {
    removeImage.addEventListener(
      "click",
      removeCurrentImage
    );
  }

  const cancel =
    document.querySelector("#cancelEditButton");

  if (cancel) {
    cancel.addEventListener(
      "click",
      resetForm
    );
  }
}

async function startAdmin() {
  setupEvents();
  fillCategories();

  const isAdmin =
    await checkAdmin();

  if (isAdmin) {
    await loadProducts();
  }
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    startAdmin
  );
} else {
  startAdmin();
}
