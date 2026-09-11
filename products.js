const DEFAULT_PRODUCTS = [

  {
    id: 1,
    category: "VGA",
    name: "ASUS Dual RTX 3060 12GB",
    price: 3450000,
    stock: 2,
    specs: [
      "12GB GDDR6",
      "192-bit",
      "Ray Tracing • DLSS"
    ],
    icon: "▰"
  },

  {
    id: 2,
    category: "Processor",
    name: "AMD Ryzen 5 5600",
    price: 1450000,
    stock: 3,
    specs: [
      "6 Core • 12 Thread",
      "3.5 – 4.4 GHz",
      "Socket AM4"
    ],
    icon: "◉"
  },

  {
    id: 3,
    category: "SSD",
    name: "Samsung 970 EVO Plus 1TB",
    price: 1350000,
    stock: 5,
    specs: [
      "NVMe M.2",
      "Read 3.500 MB/s",
      "Write 3.300 MB/s"
    ],
    icon: "▤"
  },

  {
    id: 4,
    category: "Motherboard",
    name: "MSI B550M PRO-VDH WIFI",
    price: 1750000,
    stock: 1,
    specs: [
      "Socket AM4",
      "4× DDR4",
      "WiFi + Bluetooth"
    ],
    icon: "▦"
  },

  {
    id: 5,
    category: "Monitor",
    name: "AOC 24G2SE 24” 165Hz",
    price: 1850000,
    stock: 3,
    specs: [
      "IPS Panel",
      "Full HD 1920×1080",
      "1ms • 165Hz"
    ],
    icon: "▣"
  },

  {
    id: 6,
    category: "RAM",
    name: "Kingston Fury Beast 16GB DDR4",
    price: 650000,
    stock: 4,
    specs: [
      "16GB (2×8GB)",
      "3200MHz",
      "Desktop DDR4"
    ],
    icon: "▥"
  },

  {
    id: 7,
    category: "PSU",
    name: "Cooler Master MWE 650 Bronze",
    price: 950000,
    stock: 2,
    specs: [
      "650 Watt",
      "80+ Bronze",
      "Proteksi lengkap"
    ],
    icon: "▰"
  },

  {
    id: 8,
    category: "Casing",
    name: "Montech Air 100 ARGB",
    price: 850000,
    stock: 2,
    specs: [
      "mATX",
      "Tempered Glass",
      "ARGB Fan"
    ],
    icon: "▤"
  },

  {
    id: 9,
    category: "HDD",
    name: "WD Blue 1TB SATA",
    price: 720000,
    stock: 2,
    specs: [
      "1TB",
      "SATA 6Gb/s",
      "3.5 inch"
    ],
    icon: "◍"
  },

  {
    id: 10,
    category: "Aksesoris",
    name: "Mechanical Gaming Keyboard",
    price: 350000,
    stock: 7,
    specs: [
      "RGB Backlight",
      "USB",
      "Hot-swap"
    ],
    icon: "⌨"
  },

  {
    id: 11,
    category: "Paket PC",
    name: "Paket Gaming Ryzen 5 + RTX",
    price: 8990000,
    stock: 1,
    specs: [
      "Ryzen 5",
      "RTX Series",
      "Siap Gaming"
    ],
    icon: "▣"
  },

  {
    id: 12,
    category: "VGA",
    name: "GeForce GTX 1660 Super 6GB",
    price: 2200000,
    stock: 1,
    specs: [
      "6GB GDDR6",
      "192-bit",
      "Gaming 1080p"
    ],
    icon: "▰"
  }

];


/*
==================================================
KATEGORI TOKO
==================================================
*/

const PRODUCT_CATEGORIES = [

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
