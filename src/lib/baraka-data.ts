export type Category = "Seragam" | "Buku" | "Atribut" | "Alat Tulis";

export const categories: { name: Category; icon: string }[] = [
  { name: "Seragam", icon: "👕" },
  { name: "Buku", icon: "📚" },
  { name: "Atribut", icon: "🎽" },
  { name: "Alat Tulis", icon: "✏️" },
];

export type Product = {
  id: string;
  name: string;
  category: Category;
  price: number;
  originalPrice?: number;
  stock: number;
  condition: string;
  plus: string[];
  minus: string[];
  curated: boolean;
  featured: boolean;
  seller: string;
  sold: number;
  photo?: string;
  specs?: Record<string, string>;
};

export const seedProducts: Product[] = [
  {
    id: "p1",
    name: "Seragam Putih Lengan Pendek Ukuran M",
    category: "Seragam",
    price: 25000,
    originalPrice: 85000,
    stock: 4,
    condition: "Sangat Baik (90%)",
    plus: ["Kain masih tebal & tidak menerawang", "Sudah dicuci & disetrika koperasi", "Semua kancing lengkap"],
    minus: ["Warna putih sedikit pudar di bagian kerah"],
    curated: true,
    featured: true,
    seller: "Alumni 2024 — Kelas XII IPA 2",
    sold: 12,
    specs: {
      "Jenis": "Seragam harian putih",
      "Ukuran": "M (lebar dada 50 cm)",
      "Bahan": "Katun oxford",
      "Warna": "Putih",
      "Kelas Asal": "XII IPA 2",
      "Tahun Pakai": "2023–2024",
      "Kelengkapan": "Kemeja + 1 badge nama lepasan",
      "Perawatan": "Dicuci & disetrika koperasi",
      "Garansi Tukar": "1x24 jam setelah pengambilan",
    },
  },
  {
    id: "p2",
    name: "Buku Matematika Kelas XI Kurikulum Merdeka",
    category: "Buku",
    price: 18000,
    originalPrice: 72000,
    stock: 7,
    condition: "Baik (80%)",
    plus: ["Isi lengkap, tidak ada halaman hilang", "Catatan rapi membantu belajar"],
    minus: ["Ada stabilo di bab 3-5", "Sudut cover sedikit terlipat"],
    curated: true,
    featured: true,
    seller: "Rafi — XII IPS 1",
    sold: 23,
    specs: {
      "Jenis": "Buku pelajaran",
      "Mata Pelajaran": "Matematika",
      "Kelas": "XI",
      "Kurikulum": "Merdeka",
      "Penerbit": "Erlangga",
      "Tahun Terbit": "2022",
      "Jumlah Halaman": "248 halaman",
      "Kelengkapan": "Isi lengkap, tanpa halaman lepas",
      "Garansi Tukar": "1x24 jam setelah pengambilan",
    },
  },
  {
    id: "p3",
    name: "Rok Abu Lipit Ukuran L",
    category: "Seragam",
    price: 30000,
    originalPrice: 95000,
    stock: 2,
    condition: "Sangat Baik (92%)",
    plus: ["Lipit masih rapi", "Karet pinggang kencang"],
    minus: ["Label ukuran sudah lepas"],
    curated: true,
    featured: false,
    seller: "Alumni 2025",
    sold: 5,
    specs: {
      "Jenis": "Rok seragam lipit",
      "Ukuran": "L (pinggang 72–78 cm)",
      "Bahan": "Poliester wool",
      "Warna": "Abu-abu",
      "Panjang": "75 cm",
      "Tahun Pakai": "2024–2025",
      "Kelengkapan": "Rok + karet pinggang",
      "Perawatan": "Dry clean koperasi",
      "Garansi Tukar": "1x24 jam setelah pengambilan",
    },
  },
  {
    id: "p4",
    name: "Topi Sekolah + Ikat Pinggang Logo Sekolah",
    category: "Atribut",
    price: 15000,
    originalPrice: 45000,
    stock: 9,
    condition: "Baik (85%)",
    plus: ["Logo bordir masih tajam", "Sudah disterilkan"],
    minus: ["Ada bekas lipatan pada topi"],
    curated: true,
    featured: true,
    seller: "Koperasi — Donasi Alumni",
    sold: 31,
    specs: {
      "Jenis": "Atribut sekolah",
      "Isi Paket": "1 topi + 1 ikat pinggang",
      "Ukuran Topi": "All size (tali setelan)",
      "Bahan": "Drill & kulit sintetis",
      "Warna": "Navy",
      "Kelengkapan": "Logo bordir sekolah",
      "Perawatan": "Disterilkan uap",
      "Garansi Tukar": "1x24 jam setelah pengambilan",
    },
  },
  {
    id: "p5",
    name: "Kotak Pensil + Set Penggaris Geometri",
    category: "Alat Tulis",
    price: 8000,
    stock: 14,
    condition: "Baik (80%)",
    plus: ["Set penggaris lengkap 4 pcs", "Zipper berfungsi normal"],
    minus: ["Ada coretan nama pemilik lama"],
    curated: true,
    featured: false,
    seller: "Nadia — XI IPA 3",
    sold: 18,
    specs: {
      "Jenis": "Alat tulis",
      "Isi Paket": "1 kotak pensil + 4 penggaris geometri",
      "Bahan": "Kanvas & plastik",
      "Ukuran": "21 x 9 cm",
      "Warna": "Biru navy",
      "Kelengkapan": "Zipper berfungsi normal",
      "Garansi Tukar": "1x24 jam setelah pengambilan",
    },
  },
  {
    id: "p6",
    name: "Buku Bahasa Inggris Work Book Kelas X",
    category: "Buku",
    price: 12000,
    originalPrice: 60000,
    stock: 6,
    condition: "Cukup (70%)",
    plus: ["Latihan sebagian masih kosong", "Harga sangat hemat"],
    minus: ["Beberapa halaman sudah diisi pensil", "Cover agak kusam"],
    curated: true,
    featured: false,
    seller: "Bima — XI IPS 2",
    sold: 9,
    specs: {
      "Jenis": "Buku latihan (workbook)",
      "Mata Pelajaran": "Bahasa Inggris",
      "Kelas": "X",
      "Kurikulum": "Merdeka",
      "Penerbit": "Yudhistira",
      "Tahun Terbit": "2021",
      "Jumlah Halaman": "160 halaman",
      "Kelengkapan": "Isi lengkap, sebagian terisi pensil",
      "Garansi Tukar": "1x24 jam setelah pengambilan",
    },
  },
  {
    id: "p7",
    name: "Dasi Sekolah Warna Navy",
    category: "Atribut",
    price: 7000,
    stock: 11,
    condition: "Sangat Baik (95%)",
    plus: ["Hampir seperti baru", "Karet elastis masih kuat"],
    minus: ["Tidak ada minus berarti"],
    curated: true,
    featured: true,
    seller: "Koperasi Sekolah",
    sold: 27,
    specs: {
      "Jenis": "Atribut sekolah",
      "Model": "Dasi karet siap pakai",
      "Ukuran": "All size",
      "Bahan": "Poliester",
      "Warna": "Navy",
      "Kelengkapan": "Dasi + karet elastis",
      "Perawatan": "Dicuci koperasi",
      "Garansi Tukar": "1x24 jam setelah pengambilan",
    },
  },
  {
    id: "p8",
    name: "Seragam Batik Sekolah Ukuran S",
    category: "Seragam",
    price: 35000,
    originalPrice: 110000,
    stock: 3,
    condition: "Baik (85%)",
    plus: ["Motif batik masih cerah", "Tidak ada jahitan lepas"],
    minus: ["Satu kancing bawah diganti (warna mirip)"],
    curated: true,
    featured: false,
    seller: "Alumni 2024",
    sold: 6,
    specs: {
      "Jenis": "Seragam batik sekolah",
      "Ukuran": "S (lebar dada 46 cm)",
      "Bahan": "Katun primis",
      "Warna": "Batik cokelat navy",
      "Tahun Pakai": "2023–2024",
      "Kelengkapan": "Kemeja batik lengan pendek",
      "Perawatan": "Dicuci & disetrika koperasi",
      "Garansi Tukar": "1x24 jam setelah pengambilan",
    },
  },
];

export const rupiah = (n: number) =>
  "Rp" + n.toLocaleString("id-ID", { maximumFractionDigits: 0 });

export const productSpecs = (p: Product): [string, string][] => {
  const base: Record<string, string> = {
    Kategori: p.category,
    Kondisi: p.condition,
    "Stok Tersedia": `${p.stock} unit`,
    Penjual: p.seller,
    Kurasi: p.curated ? "Lolos kurasi koperasi" : "Belum dikurasi",
    "Lokasi Ambil": "Koperasi Sekolah — Gedung B lt. 1",
  };
  return Object.entries({ ...base, ...(p.specs ?? {}) });
};
