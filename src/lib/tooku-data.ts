export type Category = "Seragam" | "Buku" | "Atribut" | "Alat Tulis";

export const categories: { name: Category; icon: string }[] = [
  { name: "Seragam", icon: "👕" },
  { name: "Buku", icon: "📚" },
  { name: "Atribut", icon: "🎽" },
  { name: "Alat Tulis", icon: "✏️" },
];

/** Jenjang sekolah di Kabupaten Magetan. */
export type SchoolLevel = "SD" | "SMP" | "SMA" | "SMK";

export type School = {
  id: string;
  name: string;
  level: SchoolLevel;
  koperasi: string;
  district: string;
  pickup: string;
  hours: string;
  phone: string;
  /** Logo koperasi (data URL hasil kompresi) — bisa diunggah admin koperasi. */
  logo?: string;
};

/**
 * Penjual di TOOKU HANYA koperasi sekolah. Barang alumni/siswa tetap
 * dititipkan dan dijual lewat koperasi sekolahnya masing-masing,
 * sehingga marketplace ini lintas sekolah se-Kabupaten Magetan.
 */
export const schools: School[] = [
  {
    id: "s1",
    name: "SMA PGRI 1 Maospati",
    level: "SMA",
    koperasi: "Koperasi SMA PGRI 1 Maospati",
    district: "Maospati",
    pickup: "Koperasi Sekolah — Gedung B lt. 1",
    hours: "Senin–Jumat 07.00–15.00 · Sabtu 07.00–11.00",
    phone: "0851-1000-1234",
  },
  {
    id: "s2",
    name: "SMA Negeri 1 Magetan",
    level: "SMA",
    koperasi: "Koperasi SMAN 1 Magetan",
    district: "Magetan",
    pickup: "Koperasi Siswa — samping perpustakaan",
    hours: "Senin–Jumat 07.00–15.30",
    phone: "0851-2000-1234",
  },
  {
    id: "s3",
    name: "SMK Negeri 1 Magetan",
    level: "SMK",
    koperasi: "Koperasi SMKN 1 Magetan",
    district: "Magetan",
    pickup: "Business Center SMKN 1 — lobi depan",
    hours: "Senin–Jumat 07.00–16.00 · Sabtu 08.00–12.00",
    phone: "0851-3000-1234",
  },
  {
    id: "s4",
    name: "SMK Negeri 2 Magetan",
    level: "SMK",
    koperasi: "Koperasi SMKN 2 Magetan",
    district: "Magetan",
    pickup: "Koperasi Sekolah — dekat ruang praktik",
    hours: "Senin–Jumat 07.00–15.00",
    phone: "0851-4000-1234",
  },
  {
    id: "s5",
    name: "SMP Negeri 1 Magetan",
    level: "SMP",
    koperasi: "Koperasi SMPN 1 Magetan",
    district: "Magetan",
    pickup: "Koperasi Siswa — lantai 1 gedung utama",
    hours: "Senin–Jumat 07.00–14.00",
    phone: "0851-5000-1234",
  },
  {
    id: "s6",
    name: "SMP Negeri 1 Barat",
    level: "SMP",
    koperasi: "Koperasi SMPN 1 Barat",
    district: "Barat",
    pickup: "Koperasi Sekolah — depan ruang guru",
    hours: "Senin–Jumat 07.00–14.00 · Sabtu 07.00–10.00",
    phone: "0851-6000-1234",
  },
  {
    id: "s7",
    name: "SD Negeri Kraton 1 Maospati",
    level: "SD",
    koperasi: "Koperasi SDN Kraton 1 Maospati",
    district: "Maospati",
    pickup: "Koperasi Sekolah — ruang UKS sebelah",
    hours: "Senin–Jumat 07.00–12.00",
    phone: "0851-7000-1234",
  },
  {
    id: "s8",
    name: "SD Negeri Sukowidi Kawedanan",
    level: "SD",
    koperasi: "Koperasi SDN Sukowidi",
    district: "Kawedanan",
    pickup: "Koperasi Sekolah — aula kecil",
    hours: "Senin–Jumat 07.00–12.00",
    phone: "0851-8000-1234",
  },
];

export const schoolById = (id: string) => schools.find((s) => s.id === id);

/** Nama penjual (koperasi) per sekolah — dipakai sebagai field seller produk. */
export const SCHOOLS_SELLER: Record<string, string> = Object.fromEntries(
  schools.map((s) => [s.id, s.koperasi]),
);

/**
 * Menentukan schoolId yang valid untuk sebuah produk. Dipakai untuk menormalkan
 * data lama (tersimpan sebelum model koperasi lintas sekolah) agar tautan profil
 * koperasi tidak pernah mengarah ke id yang tidak ada.
 */
export const resolveSchoolId = (schoolId?: string, seller?: string): string => {
  if (schoolId && schoolById(schoolId)) return schoolId;
  if (seller) {
    const byKoperasi = schools.find((s) => s.koperasi === seller || s.name === seller);
    if (byKoperasi) return byKoperasi.id;
  }
  return schools[0]!.id;
};

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * Menentukan koperasi milik sebuah akun admin. Karena penjual hanya koperasi,
 * produk yang diunggah otomatis melekat ke koperasi akun tersebut.
 */
export const schoolIdForAccount = (opts: {
  schoolId?: string | undefined;
  username?: string | undefined;
  name?: string | undefined;
}): string => {
  if (opts.schoolId && schoolById(opts.schoolId)) return opts.schoolId;
  const keys = [opts.username, opts.name].filter(Boolean).map((v) => slug(v!));
  for (const k of keys) {
    const hit = schools.find((s) => {
      const a = slug(s.name);
      const b = slug(s.koperasi);
      return k === a || k === b || k.includes(a) || a.includes(k) || b.includes(k) || k.includes(b);
    });
    if (hit) return hit.id;
  }
  return schools[0]!.id;
};

/** Field spesifikasi yang wajib/disarankan diisi admin per kategori barang. */
export const specTemplates: Record<Category, { key: string; placeholder: string }[]> = {
  Seragam: [
    { key: "Ukuran", placeholder: "M / L / No. 16" },
    { key: "Jenis Kelamin", placeholder: "Putra / Putri / Unisex" },
    { key: "Bahan", placeholder: "Katun drill" },
    { key: "Model Lengan", placeholder: "Lengan panjang" },
    { key: "Warna", placeholder: "Putih" },
    { key: "Lingkar Dada", placeholder: "48 cm" },
    { key: "Panjang Badan", placeholder: "68 cm" },
  ],
  Buku: [
    { key: "Mata Pelajaran", placeholder: "Matematika" },
    { key: "Kelas", placeholder: "Kelas XI" },
    { key: "Penerbit", placeholder: "Erlangga" },
    { key: "Kurikulum / Tahun", placeholder: "Kurikulum Merdeka 2022" },
    { key: "Jumlah Halaman", placeholder: "248 halaman" },
    { key: "Kelengkapan", placeholder: "Tanpa coretan, cover utuh" },
  ],
  Atribut: [
    { key: "Jenis Atribut", placeholder: "Topi / Dasi / Badge" },
    { key: "Ukuran", placeholder: "All size" },
    { key: "Bahan", placeholder: "Kain drill" },
    { key: "Warna", placeholder: "Navy" },
    { key: "Kelengkapan", placeholder: "Logo bordir lengkap" },
  ],
  "Alat Tulis": [
    { key: "Jenis", placeholder: "Kotak pensil / Penggaris set" },
    { key: "Merek", placeholder: "Joyko" },
    { key: "Warna", placeholder: "Biru" },
    { key: "Isi / Kelengkapan", placeholder: "1 set 4 pcs" },
    { key: "Ukuran", placeholder: "20 × 8 cm" },
  ],
};

/** Ulasan pembeli terhadap pelayanan koperasi sekolah. */
export type KoperasiReview = {
  id: string;
  schoolId: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
};

export const seedReviews: KoperasiReview[] = [
  { id: "r1", schoolId: "s1", author: "Budi Santoso", rating: 5, comment: "Barang sesuai deskripsi, petugas koperasi ramah dan pengambilan cepat.", date: "2026-08-12" },
  { id: "r2", schoolId: "s1", author: "Nadia P.", rating: 4, comment: "Seragam bersih dan rapi, hanya saja jam layanan Sabtu agak singkat.", date: "2026-08-18" },
  { id: "r3", schoolId: "s2", author: "Rizky A.", rating: 5, comment: "Kurasi jujur, minus barang benar-benar ditulis apa adanya.", date: "2026-08-09" },
  { id: "r4", schoolId: "s2", author: "Sinta W.", rating: 4, comment: "Pelayanan baik, antrean pengambilan tertib.", date: "2026-08-20" },
  { id: "r5", schoolId: "s3", author: "Dimas F.", rating: 5, comment: "Business Center-nya profesional, ada nota pengambilan.", date: "2026-08-15" },
  { id: "r6", schoolId: "s4", author: "Ayu L.", rating: 4, comment: "Harga hemat, respons chat cukup cepat.", date: "2026-08-11" },
  { id: "r7", schoolId: "s5", author: "Fajar N.", rating: 5, comment: "Buku paket masih bagus, dibungkus rapi.", date: "2026-08-07" },
  { id: "r8", schoolId: "s6", author: "Hana R.", rating: 4, comment: "Petugas membantu mencari ukuran yang pas.", date: "2026-08-19" },
  { id: "r9", schoolId: "s7", author: "Wali Murid Kelas 4", rating: 5, comment: "Cocok untuk anak SD, atribut lengkap dan murah.", date: "2026-08-05" },
  { id: "r10", schoolId: "s8", author: "Tri M.", rating: 4, comment: "Jam layanan hanya sampai siang, tapi pelayanan memuaskan.", date: "2026-08-21" },
];

export const ratingSummary = (reviews: KoperasiReview[], schoolId: string) => {
  const list = reviews.filter((r) => r.schoolId === schoolId);
  const avg = list.length ? list.reduce((s, r) => s + r.rating, 0) / list.length : 0;
  return { list, count: list.length, avg, avgLabel: list.length ? avg.toFixed(1) : "Baru" };
};


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
  schoolId: string;
  contributor?: string;
  sold: number;
  photo?: string;
  specs?: Record<string, string>;
  /** ==== Siklus Hidup Barang (anti dead-stock) ==== */
  /** Waktu barang mulai tayang di TOOKU. */
  listedAt?: number;
  /** Harga dasar sebelum diskon otomatis cuci gudang. */
  basePrice?: number;
  /** Status manual: donasi tersalurkan / masuk daur ulang. */
  lifecycle?: "aktif" | "donasi" | "upcycle";
  /** Fase hasil perhitungan sistem (diisi otomatis). */
  lifecycleStage?: "aktif" | "cuci-gudang" | "obral-akhir" | "donasi" | "upcycle";
  /** Catatan penyaluran donasi / proyek daur ulang. */
  lifecycleNote?: string;
  /** Isi paket bundling (id produk yang digabung). */
  bundleOf?: string[];
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
    seller: SCHOOLS_SELLER["s1"]!,
    schoolId: "s1",
    contributor: "Alumni 2024 — Kelas XII IPA 2",
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
    seller: SCHOOLS_SELLER["s2"]!,
    schoolId: "s2",
    contributor: "Rafi — XII IPS 1",
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
    seller: SCHOOLS_SELLER["s3"]!,
    schoolId: "s3",
    contributor: "Alumni 2025",
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
    seller: SCHOOLS_SELLER["s4"]!,
    schoolId: "s4",
    contributor: "Koperasi — Donasi Alumni",
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
    seller: SCHOOLS_SELLER["s5"]!,
    schoolId: "s5",
    contributor: "Nadia — XI IPA 3",
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
    seller: SCHOOLS_SELLER["s6"]!,
    schoolId: "s6",
    contributor: "Bima — XI IPS 2",
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
    seller: SCHOOLS_SELLER["s7"]!,
    schoolId: "s7",
    contributor: "Koperasi Sekolah",
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
    seller: SCHOOLS_SELLER["s8"]!,
    schoolId: "s8",
    contributor: "Alumni 2024",
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

/**
 * Umur tayang contoh (hari) agar demo Siklus Hidup Barang terlihat:
 * >30 hari masuk Cuci Gudang (−20%), >60 hari Obral Akhir (−50%),
 * >90 hari otomatis diikhlaskan untuk donasi sosial.
 */
const seedListedDays: Record<string, number> = { p3: 34, p4: 44, p5: 67, p7: 73, p8: 96 };
for (const p of seedProducts) {
  const days = seedListedDays[p.id] ?? 5;
  p.listedAt = Date.now() - days * 1000 * 60 * 60 * 24;
  p.basePrice = p.price;
}



export const rupiah = (n: number) =>
  "Rp" + n.toLocaleString("id-ID", { maximumFractionDigits: 0 });

export const productSpecs = (p: Product): [string, string][] => {
  const school = schoolById(p.schoolId);
  const base: Record<string, string> = {
    Kategori: p.category,
    Kondisi: p.condition,
    "Stok Tersedia": `${p.stock} unit`,
    "Penjual (Koperasi)": p.seller,
    "Sekolah Asal": school ? `${school.name} (${school.level})` : "-",
    Kecamatan: school?.district ?? "-",
    ...(p.contributor ? { "Barang Titipan": p.contributor } : {}),
    Kurasi: p.curated ? "Lolos kurasi koperasi" : "Belum dikurasi",
    "Lokasi Ambil": school?.pickup ?? "Koperasi Sekolah",
  };
  return Object.entries({ ...base, ...(p.specs ?? {}) });
};
