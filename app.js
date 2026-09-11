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
      const products = JSON.parse(savedProducts);

      // Gunakan data tersimpan hanya jika valid
      // dan memiliki minimal 1 produk.
      if (Array.isArray(products) && products.length > 0) {
        return products;
      }
    }
  } catch (error) {
    console.error("Gagal membaca produk:", error);
  }

  // Jika belum ada data atau data kosong,
  // gunakan produk bawaan dari products.js.
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
   WHATSAPP PRODUK
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

const whatsapp
