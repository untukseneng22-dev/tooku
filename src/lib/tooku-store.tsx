import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Context,
  type ReactNode,
} from "react";
import {
  seedProducts,
  seedReviews,
  resolveSchoolId,
  schools as seedSchools,
  SCHOOLS_SELLER,
  type KoperasiReview,
  type Product,
  type School,
  type SchoolLevel,
} from "./tooku-data";
import {
  defaultShippingConfig,
  seedShippingConfigs,

  shippingQuote,
  type Courier,
  type QuoteLine,
  type ShipZone,
  type ShippingConfig,
} from "./tooku-shipping";
import { applyLifecycle, bundleSuggestionPrice } from "./tooku-lifecycle";
import {
  pointsEarnedFor,
  seedFlashSales,
  seedVouchers,
  voucherDiscount,
  type FlashSale,
  type PointsEntry,
  type ProductReport,
  type ProductReview,
  type ReportStatus,
  type Voucher,
} from "./tooku-extras";


/** Field profil koperasi yang boleh diubah admin koperasi. */
export type SchoolPatch = {
  koperasi?: string;
  name?: string;
  level?: SchoolLevel;
  district?: string;
  pickup?: string;
  hours?: string;
  phone?: string;
  logo?: string;
};

export type Role = "buyer" | "admin" | "superadmin";
export type AccountStatus = "aktif" | "menunggu" | "ditolak";
export type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  password: string;
  role: Role;
  kelas?: string;
  avatar?: string;
  status: AccountStatus;
  registeredAt: number;
  note?: string;
};

export const roleLabel: Record<Role, string> = {
  buyer: "Pembeli",
  admin: "Admin Koperasi",
  superadmin: "Super Admin",
};

export type OrderItem = { productId: string; name: string; price: number; qty: number; schoolId?: string };
export type OrderStatus =
  | "Booking"
  | "Diproses"
  | "Siap Diambil"
  | "Dikirim"
  | "Diterima"
  | "Selesai"
  | "Dibatalkan";
/** Cara pembeli menerima barang: ambil sendiri di koperasi, atau dikirim ekspedisi. */
export type Fulfillment = "pickup" | "delivery";
export type PaymentMethod = "online" | "koperasi" | "cod";
export type PaymentStatus = "Belum Dibayar" | "Menunggu Konfirmasi" | "Lunas";

export const pickupFlow: OrderStatus[] = ["Booking", "Diproses", "Siap Diambil", "Selesai"];
export const deliveryFlow: OrderStatus[] = ["Booking", "Diproses", "Dikirim", "Diterima"];
/** Alias lama (alur ambil di koperasi). */
export const statusFlow = pickupFlow;
export const allStatuses: OrderStatus[] = [
  "Booking",
  "Diproses",
  "Siap Diambil",
  "Dikirim",
  "Diterima",
  "Selesai",
  "Dibatalkan",
];
export const flowFor = (o: { fulfillment?: Fulfillment }): OrderStatus[] =>
  o.fulfillment === "delivery" ? deliveryFlow : pickupFlow;
export const isFinalStatus = (s: OrderStatus) =>
  s === "Selesai" || s === "Diterima" || s === "Dibatalkan";

export type ShippingInfo = {
  recipient: string;
  phone: string;
  address: string;
  district: string;
  city: string;
  province: string;
  note?: string;
  courier: Courier;
  zone: ShipZone;
  /** Rincian ongkir per koperasi pengirim. */
  lines: QuoteLine[];
  extraFee: number;
  tracking?: string;
};

export type Order = {
  id: string;
  code: string;
  userId: string;
  buyer: string;
  items: OrderItem[];
  subtotal: number;
  serviceFee: number;
  shippingTotal: number;
  total: number;
  createdAt: number;
  deadline: number;
  status: OrderStatus;
  fulfillment: Fulfillment;
  shipping?: ShippingInfo;
  paymentMethod: PaymentMethod;
  paymentChannel?: string;
  paymentStatus: PaymentStatus;
  /** Kode voucher yang dipakai & potongannya. */
  voucherCode?: string;
  voucherCut?: number;
  /** Poin loyalitas yang dipakai & nilai potongannya. */
  pointsUsed?: number;
  pointsCut?: number;
  timeline: { status: OrderStatus; at: number }[];
};

/** Notifikasi dalam aplikasi (status pesanan, promo, info). */
export type AppNotif = {
  id: string;
  /** null = untuk semua pengguna. */
  userId: string | null;
  kind: "pesanan" | "promo" | "sistem";
  title: string;
  body: string;
  at: number;
  read: boolean;
};


type CartLine = { productId: string; qty: number };

const seedUsers: User[] = [
  {
    id: "u1",
    name: "Siti Aisyah",
    username: "sitiaisyah",
    email: "siti@sekolah.id",
    password: "123456",
    role: "buyer",
    kelas: "X IPA 1",
    status: "aktif",
    registeredAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
  },
  {
    id: "u2",
    name: "Budi Santoso",
    username: "budisantoso",
    email: "budisantoso@sekolah.id",
    password: "magetanngangeni",
    role: "buyer",
    kelas: "XI IPS 2",
    status: "aktif",
    registeredAt: Date.now() - 1000 * 60 * 60 * 24 * 20,
  },
  {
    id: "u3",
    name: "Koperasi SMAS PGRI 1 Maospati",
    username: "smaspgrimaospati",
    email: "smaspgrimaospati@koperasi.id",
    password: "magetanngangeni",
    role: "admin",
    status: "aktif",
    registeredAt: Date.now() - 1000 * 60 * 60 * 24 * 25,
  },
  {
    id: "u4",
    name: "Pengelola Pusat TOOKU",
    username: "superadmin",
    email: "pusat@tooku.id",
    password: "tookupusat2026",
    role: "superadmin",
    status: "aktif",
    registeredAt: Date.now() - 1000 * 60 * 60 * 24 * 60,
  },
  {
    id: "u5",
    name: "Koperasi SMKN 1 Magetan",
    username: "smkn1magetan",
    email: "smkn1magetan@koperasi.id",
    password: "magetan2026",
    role: "admin",
    status: "menunggu",
    registeredAt: Date.now() - 1000 * 60 * 60 * 5,
  },
  {
    id: "u6",
    name: "Dwi Lestari",
    username: "dwilestari",
    email: "dwi@sekolah.id",
    password: "dwi12345",
    role: "buyer",
    kelas: "IX B",
    status: "menunggu",
    registeredAt: Date.now() - 1000 * 60 * 60 * 2,
  },
];

const seedOrders: Order[] = [
  {
    id: "o1",
    code: "TKU-4821",
    userId: "u1",
    buyer: "Siti Aisyah — X IPA 1",
    items: [
      { productId: "p2", name: "Buku Matematika Kelas XI Kurikulum Merdeka", price: 18000, qty: 1, schoolId: "s1" },
    ],
    subtotal: 18000,
    serviceFee: 0,
    shippingTotal: 0,
    total: 18000,
    createdAt: Date.now() - 1000 * 60 * 60 * 6,
    deadline: Date.now() + 1000 * 60 * 60 * 18,
    status: "Siap Diambil",
    fulfillment: "pickup",
    paymentMethod: "koperasi",
    paymentStatus: "Belum Dibayar",
    timeline: [
      { status: "Booking", at: Date.now() - 1000 * 60 * 60 * 6 },
      { status: "Diproses", at: Date.now() - 1000 * 60 * 60 * 5 },
      { status: "Siap Diambil", at: Date.now() - 1000 * 60 * 60 * 4 },
    ],
  },
  {
    id: "o2",
    code: "TKU-3390",
    userId: "u1",
    buyer: "Siti Aisyah — X IPA 1",
    items: [{ productId: "p7", name: "Dasi Sekolah Warna Navy", price: 7000, qty: 2, schoolId: "s2" }],
    subtotal: 14000,
    serviceFee: 0,
    shippingTotal: 0,
    total: 14000,
    createdAt: Date.now() - 1000 * 60 * 60 * 40,
    deadline: Date.now() - 1000 * 60 * 60 * 16,
    status: "Selesai",
    fulfillment: "pickup",
    paymentMethod: "koperasi",
    paymentStatus: "Lunas",
    timeline: [
      { status: "Booking", at: Date.now() - 1000 * 60 * 60 * 40 },
      { status: "Diproses", at: Date.now() - 1000 * 60 * 60 * 39 },
      { status: "Siap Diambil", at: Date.now() - 1000 * 60 * 60 * 38 },
      { status: "Selesai", at: Date.now() - 1000 * 60 * 60 * 20 },
    ],
  },
  {
    id: "o3",
    code: "TKU-5107",
    userId: "u2",
    buyer: "Budi Santoso — XI IPS 2",
    items: [
      { productId: "p1", name: "Seragam Putih Abu Lengan Panjang", price: 45000, qty: 1, schoolId: "s3" },
    ],
    subtotal: 45000,
    serviceFee: 2500,
    shippingTotal: 10000,
    total: 57500,
    createdAt: Date.now() - 1000 * 60 * 60 * 20,
    deadline: Date.now() + 1000 * 60 * 60 * 28,
    status: "Dikirim",
    fulfillment: "delivery",
    shipping: {
      recipient: "Budi Santoso",
      phone: "0812-3456-7890",
      address: "Jl. Diponegoro No. 12, RT 02 RW 03",
      district: "Barat",
      city: "Kabupaten Magetan",
      province: "Jawa Timur",
      courier: "J&T Express",
      zone: "kabupaten",
      lines: [{ schoolId: "s3", koperasi: "Koperasi SMKN 1 Magetan", zone: "kabupaten", fee: 10000 }],
      extraFee: 0,
      tracking: "JT8829174455",
    },
    paymentMethod: "online",
    paymentChannel: "QRIS",
    paymentStatus: "Lunas",
    timeline: [
      { status: "Booking", at: Date.now() - 1000 * 60 * 60 * 20 },
      { status: "Diproses", at: Date.now() - 1000 * 60 * 60 * 18 },
      { status: "Dikirim", at: Date.now() - 1000 * 60 * 60 * 6 },
    ],
  },
];

type ShippingInput = {
  recipient: string;
  phone: string;
  address: string;
  district: string;
  city: string;
  province: string;
  note?: string;
  courier: Courier;
};

type CheckoutInput = {
  paymentMethod: PaymentMethod;
  paymentChannel?: string;
  fulfillment: Fulfillment;
  shipping?: ShippingInput;
  /** Kode voucher promo (opsional). */
  voucherCode?: string;
  /** Pakai seluruh poin loyalitas yang dimiliki. */
  usePoints?: boolean;
};


type Store = {
  products: Product[];
  cart: CartLine[];
  orders: Order[];
  myOrders: Order[];
  users: User[];
  user: User | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  hydrated: boolean;
  login: (
    identifier: string,
    password: string,
  ) => { ok: boolean; error?: string; role?: Role; pending?: boolean };
  register: (
    input: Omit<User, "id" | "status" | "registeredAt">,
  ) => { ok: boolean; error?: string; role?: Role; pending?: boolean };
  deleteUser: (id: string) => void;
  pendingUsers: User[];
  approveUser: (id: string) => void;
  rejectUser: (id: string, note?: string) => void;
  updateProfile: (input: { name: string; email: string; avatar?: string }) => { ok: boolean; error?: string };
  changePassword: (oldPassword: string, newPassword: string) => { ok: boolean; error?: string };
  logout: () => void;
  addToCart: (id: string, qty?: number) => void;
  removeFromCart: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clearCart: () => void;
  checkout: (input: CheckoutInput) => Order | null;
  setOrderStatus: (id: string, status: OrderStatus) => void;
  setTracking: (id: string, courier: Courier, tracking: string) => void;
  cancelOrder: (id: string) => void;
  markPaid: (id: string) => void;
  /** Pengaturan pengiriman & pembayaran per koperasi sekolah. */
  shippingConfigs: Record<string, ShippingConfig>;
  updateShippingConfig: (schoolId: string, patch: Partial<ShippingConfig>) => void;

  addProduct: (p: Omit<Product, "id" | "sold">) => void;
  updateProduct: (id: string, patch: Partial<Omit<Product, "id" | "sold">>) => void;
  reviews: KoperasiReview[];
  addReview: (input: { schoolId: string; rating: number; comment: string }) => { ok: boolean; error?: string };
  deleteProduct: (id: string) => void;
  /** ==== Siklus Hidup Barang (mitigasi penumpukan stok) ==== */
  /** Tandai barang sebagai donasi tersalurkan atau bahan daur ulang. */
  setLifecycle: (id: string, stage: "aktif" | "donasi" | "upcycle", note?: string) => void;
  /** Perpanjang masa tayang (reset hitungan hari & harga dasar). */
  relistProduct: (id: string) => void;
  /** Gabung barang lambat terjual dengan barang utama menjadi paket bundling. */
  createBundle: (input: { name: string; productIds: string[]; price?: number }) => { ok: boolean; error?: string };

  /** ==== Fitur marketplace umum ==== */
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  productReviews: ProductReview[];
  addProductReview: (input: {
    productId: string;
    orderId: string;
    rating: number;
    text: string;
  }) => { ok: boolean; error?: string };
  flashSales: FlashSale[];
  addFlashSale: (input: { title: string; productIds: string[]; discountPct: number; hours: number }) => {
    ok: boolean;
    error?: string;
  };
  removeFlashSale: (id: string) => void;
  vouchers: Voucher[];
  upsertVoucher: (v: Voucher) => { ok: boolean; error?: string };
  deleteVoucher: (code: string) => void;
  /** Saldo & riwayat poin loyalitas pengguna. */
  points: PointsEntry[];
  pointsBalance: (userId: string) => number;
  /** Notifikasi dalam aplikasi untuk pengguna saat ini + broadcast. */
  notifs: AppNotif[];
  markAllNotifsRead: () => void;
  markNotifRead: (id: string) => void;
  /** Laporan barang bermasalah dari pembeli. */
  /** Profil koperasi — nama, logo, jenjang, alamat; diedit admin koperasi sendiri. */
  koperasiList: School[];
  getSchool: (id: string) => School | undefined;
  updateSchool: (id: string, patch: SchoolPatch) => { ok: boolean; error?: string };
  reports: ProductReport[];
  addReport: (productId: string, reason: string) => { ok: boolean; error?: string };
  setReportStatus: (id: string, status: ReportStatus) => void;
  deleteReport: (id: string) => void;
};

type TookuContextRegistry = typeof globalThis & {
  __tookuStoreContext?: Context<Store | null>;
  __tookuActiveProviderCount?: number;
};

// Keep one context identity across route chunk loading and Vite hot updates.
// Without this, a stale route chunk can briefly read a different context
// instance from the one mounted by the root provider.
const contextRegistry = globalThis as TookuContextRegistry;
const StoreContext = contextRegistry.__tookuStoreContext ?? createContext<Store | null>(null);
contextRegistry.__tookuStoreContext = StoreContext;
const KEY = "tooku-state-v1";

/** Pastikan setiap produk tertaut ke koperasi sekolah yang benar-benar ada. */
const normalizeProducts = (list: Product[]): Product[] =>
  applyLifecycle(
    list.map((p) => {
      const schoolId = resolveSchoolId(p.schoolId, p.seller);
      return { ...p, schoolId, seller: SCHOOLS_SELLER[schoolId] ?? p.seller };
    }),
  );

/** Lengkapi pesanan lama (sebelum ada fitur pengiriman) agar tetap valid. */
const normalizeOrders = (list: Order[]): Order[] =>
  list.map((o) => {
    const subtotal = o.subtotal ?? o.items.reduce((s, i) => s + i.price * i.qty, 0);
    const shippingTotal = o.shippingTotal ?? 0;
    const serviceFee = o.serviceFee ?? Math.max(0, (o.total ?? subtotal) - subtotal - shippingTotal);
    return {
      ...o,
      fulfillment: o.fulfillment ?? (o.shipping ? "delivery" : "pickup"),
      subtotal,
      shippingTotal,
      serviceFee,
      total: o.total ?? subtotal + shippingTotal + serviceFee,
    };
  });


export function TookuProvider({ children }: { children: ReactNode }) {
  const parentStore = useContext(StoreContext);

  if (parentStore) {
    if (import.meta.env.DEV) {
      console.error(
        "[TOOKU] Duplicate TookuProvider blocked. Keep exactly one provider at the application root.",
      );
    }
    return children;
  }

  return <TookuStoreProvider>{children}</TookuStoreProvider>;
}

function TookuStoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => normalizeProducts(seedProducts));
  const [reviews, setReviews] = useState<KoperasiReview[]>(seedReviews);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [orders, setOrders] = useState<Order[]>(seedOrders);
  const [users, setUsers] = useState<User[]>(seedUsers);
  const [userId, setUserId] = useState<string | null>(null);
  const [shippingConfigs, setShippingConfigs] = useState<Record<string, ShippingConfig>>(() =>
    seedShippingConfigs(),
  );
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [productReviews, setProductReviews] = useState<ProductReview[]>([]);
  const [flashSales, setFlashSales] = useState<FlashSale[]>(seedFlashSales);
  const [vouchers, setVouchers] = useState<Voucher[]>(seedVouchers);
  const [points, setPoints] = useState<PointsEntry[]>([]);
  const [reports, setReports] = useState<ProductReport[]>([]);
  const [schoolEdits, setSchoolEdits] = useState<Record<string, SchoolPatch>>({});
  const [notifs, setNotifs] = useState<AppNotif[]>([]);

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (import.meta.env.DEV) {
      contextRegistry.__tookuActiveProviderCount = (contextRegistry.__tookuActiveProviderCount ?? 0) + 1;
      if (contextRegistry.__tookuActiveProviderCount > 1) {
        console.error(
          "[TOOKU] Multiple active TookuProvider instances detected during hot reload.",
        );
      }
    }

    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (p.products) setProducts(normalizeProducts(p.products));
        if (p.reviews) setReviews(p.reviews);
        if (p.cart) setCart(p.cart);
        if (p.orders) setOrders(normalizeOrders(p.orders));
        if (p.shippingConfigs)
          setShippingConfigs((prev) => ({ ...prev, ...(p.shippingConfigs as Record<string, ShippingConfig>) }));

        if (p.users)
          setUsers(
            (p.users as User[]).map((u) => ({
              ...u,
              status: u.status ?? "aktif",
              registeredAt: u.registeredAt ?? Date.now(),
            })),
          );
        if (p.userId !== undefined) setUserId(p.userId);
        if (p.wishlist) setWishlist(p.wishlist);
        if (p.productReviews) setProductReviews(p.productReviews);
        if (p.flashSales) setFlashSales(p.flashSales);
        if (p.vouchers) setVouchers(p.vouchers);
        if (p.points) setPoints(p.points);
        if (p.reports) setReports(p.reports);
        if (p.schoolEdits) setSchoolEdits(p.schoolEdits as Record<string, SchoolPatch>);
        if (p.notifs) setNotifs(p.notifs);
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);

    return () => {
      if (import.meta.env.DEV) {
        contextRegistry.__tookuActiveProviderCount = Math.max(
          0,
          (contextRegistry.__tookuActiveProviderCount ?? 1) - 1,
        );
      }
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify({
          products,
          cart,
          orders,
          users,
          userId,
          reviews,
          shippingConfigs,
          wishlist,
          productReviews,
          flashSales,
          vouchers,
          points,
          reports,
          notifs,
        }),
      );
    } catch {
      /* ignore */
    }
  }, [hydrated, products, cart, orders, users, userId, reviews, shippingConfigs, wishlist, productReviews, flashSales, vouchers, points, reports, notifs]);


  // Evaluasi ulang fase siklus hidup (diskon otomatis / donasi) tiap jam.
  useEffect(() => {
    const tick = () => setProducts((ps) => applyLifecycle(ps));
    tick();
    const t = setInterval(tick, 1000 * 60 * 60);
    return () => clearInterval(t);
  }, [hydrated]);

  const addToCart = useCallback((id: string, qty = 1) => {
    setCart((c) =>
      c.some((l) => l.productId === id)
        ? c.map((l) => (l.productId === id ? { ...l, qty: l.qty + qty } : l))
        : [...c, { productId: id, qty }],
    );
  }, []);

  const user = users.find((u) => u.id === userId) ?? null;

  /** Kirim notifikasi dalam aplikasi (userId null = semua pengguna). */
  const pushNotif = (target: string | null, kind: AppNotif["kind"], title: string, body: string) =>
    setNotifs((ns) => [
      { id: "n" + Date.now() + Math.floor(Math.random() * 999), userId: target, kind, title, body, at: Date.now(), read: false },
      ...ns,
    ].slice(0, 100));

  const restoreStock = (items: OrderItem[]) =>
    setProducts((ps) =>
      ps.map((p) => {
        const line = items.find((i) => i.productId === p.id);
        return line ? { ...p, stock: p.stock + line.qty } : p;
      }),
    );

  const value = useMemo<Store>(
    () => ({
      products,
      cart,
      orders,
      users,
      user,
      isAdmin: user?.role === "admin" || user?.role === "superadmin",
      isSuperAdmin: user?.role === "superadmin",
      hydrated,
      myOrders: user ? orders.filter((o) => o.userId === user.id) : [],
      login: (identifier, password) => {
        const key = identifier.trim().toLowerCase();
        const found = users.find((u) => u.username.toLowerCase() === key || u.email.toLowerCase() === key);
        if (!found) return { ok: false, error: "Akun tidak ditemukan." };
        if (found.password !== password) return { ok: false, error: "Password salah." };
        if (found.status === "menunggu")
          return { ok: false, error: "Akun masih menunggu persetujuan Admin Pusat TOOKU." };
        if (found.status === "ditolak")
          return { ok: false, error: "Pendaftaran akun ini ditolak Admin Pusat. Hubungi call center TOOKU." };
        setUserId(found.id);
        return { ok: true, role: found.role };
      },
      register: (input) => {
        const uname = input.username.trim().toLowerCase();
        if (!/^[a-z0-9._]{4,24}$/.test(uname))
          return { ok: false, error: "Username 4–24 karakter, huruf/angka/titik/underscore." };
        if (users.some((u) => u.username.toLowerCase() === uname))
          return { ok: false, error: "Username sudah dipakai." };
        if (users.some((u) => u.email.toLowerCase() === input.email.trim().toLowerCase()))
          return { ok: false, error: "Email sudah terdaftar." };
        const newUser: User = {
          ...input,
          id: "u" + Date.now(),
          username: uname,
          email: input.email.trim(),
          status: "menunggu",
          registeredAt: Date.now(),
        };
        setUsers((us) => [...us, newUser]);
        return { ok: true, role: newUser.role, pending: true };
      },
      pendingUsers: users.filter((u) => u.status === "menunggu"),
      approveUser: (id) => {
        if (user?.role !== "superadmin") return;
        setUsers((us) => us.map((u) => (u.id === id ? { ...u, status: "aktif" } : u)));
      },
      rejectUser: (id, note) => {
        if (user?.role !== "superadmin") return;
        setUsers((us) =>
          us.map((u) => (u.id === id ? { ...u, status: "ditolak", ...(note ? { note } : {}) } : u)),
        );
      },
      deleteUser: (id) => {
        if (user?.role !== "superadmin" || id === user.id) return;
        setUsers((us) => us.filter((u) => u.id !== id));
      },
      updateProfile: ({ name, email, avatar }) => {
        if (!user) return { ok: false, error: "Silakan masuk terlebih dahulu." };
        const nm = name.trim();
        const em = email.trim().toLowerCase();
        if (nm.length < 3) return { ok: false, error: "Nama minimal 3 karakter." };
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) return { ok: false, error: "Format email tidak valid." };
        if (users.some((u) => u.id !== user.id && u.email.toLowerCase() === em))
          return { ok: false, error: "Email sudah dipakai akun lain." };
        setUsers((us) =>
          us.map((u) => (u.id === user.id ? { ...u, name: nm, email: em, ...(avatar !== undefined ? { avatar } : {}) } : u)),
        );
        return { ok: true };
      },
      changePassword: (oldPassword, newPassword) => {
        if (!user) return { ok: false, error: "Silakan masuk terlebih dahulu." };
        if (user.password !== oldPassword) return { ok: false, error: "Kata sandi lama salah." };
        if (newPassword.length < 6) return { ok: false, error: "Kata sandi baru minimal 6 karakter." };
        if (newPassword === oldPassword) return { ok: false, error: "Kata sandi baru tidak boleh sama dengan yang lama." };
        setUsers((us) => us.map((u) => (u.id === user.id ? { ...u, password: newPassword } : u)));
        return { ok: true };
      },
      logout: () => setUserId(null),
      addToCart,
      removeFromCart: (id) => setCart((c) => c.filter((l) => l.productId !== id)),
      setQty: (id, qty) =>
        setCart((c) =>
          qty <= 0 ? c.filter((l) => l.productId !== id) : c.map((l) => (l.productId === id ? { ...l, qty } : l)),
        ),
      clearCart: () => setCart([]),
      checkout: ({ paymentMethod, paymentChannel, fulfillment, shipping, voucherCode, usePoints }) => {
        if (!user || cart.length === 0) return null;
        const items: OrderItem[] = cart.flatMap((l) => {
          const p = products.find((x) => x.id === l.productId);
          if (!p) return [];
          return [
            { productId: p.id, name: p.name, price: p.price, qty: Math.min(l.qty, p.stock), schoolId: p.schoolId },
          ];
        });
        if (items.length === 0) return null;
        if (fulfillment === "delivery" && !shipping) return null;

        const now = Date.now();
        const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
        const serviceFee = paymentMethod === "online" ? 2500 : 0;

        let shippingInfo: ShippingInfo | undefined;
        let shippingTotal = 0;
        if (fulfillment === "delivery" && shipping) {
          const quote = shippingQuote(
            shippingConfigs,
            items.map((i) => i.schoolId!).filter(Boolean),
            { district: shipping.district, city: shipping.city, province: shipping.province },
          );
          shippingTotal = quote.total;
          shippingInfo = {
            ...shipping,
            zone: quote.lines[0]?.zone ?? "kabupaten",
            lines: quote.lines,
            extraFee: quote.extraFee,
          };
        }

        // Voucher promo (opsional).
        let voucherCut = 0;
        let shippingCut = 0;
        let appliedVoucher: string | undefined;
        if (voucherCode) {
          const v = vouchers.find((x) => x.code.toUpperCase() === voucherCode.trim().toUpperCase());
          if (v) {
            const res = voucherDiscount(v, subtotal, shippingTotal);
            if (res.ok) {
              voucherCut = res.cutSubtotal;
              shippingCut = res.cutShipping;
              appliedVoucher = v.code.toUpperCase();
            }
          }
        }

        // Poin loyalitas (1 poin = potongan Rp1.000).
        const balance = points
          .filter((p) => p.userId === user.id)
          .reduce((s, p) => s + p.delta, 0);
        const maxPointsCut = subtotal - voucherCut;
        const pointsUsed = usePoints ? Math.min(balance, Math.floor(maxPointsCut / 1000)) : 0;
        const pointsCut = pointsUsed * 1000;

        const order: Order = {
          id: "o" + now,
          code: "TKU-" + Math.floor(1000 + Math.random() * 8999),
          userId: user.id,
          buyer: user.kelas ? `${user.name} — ${user.kelas}` : user.name,
          items,
          subtotal,
          serviceFee,
          shippingTotal: Math.max(0, shippingTotal - shippingCut),
          ...(appliedVoucher ? { voucherCode: appliedVoucher, voucherCut } : {}),
          ...(pointsUsed > 0 ? { pointsUsed, pointsCut } : {}),
          total: Math.max(0, subtotal - voucherCut - pointsCut) + serviceFee + Math.max(0, shippingTotal - shippingCut),
          createdAt: now,
          // Ambil sendiri: 1x24 jam. Kirim: koperasi punya 2x24 jam untuk serahkan ke kurir.
          deadline: now + 1000 * 60 * 60 * (fulfillment === "delivery" ? 48 : 24),
          status: "Booking",
          fulfillment,
          ...(shippingInfo ? { shipping: shippingInfo } : {}),
          paymentMethod,
          ...(paymentChannel ? { paymentChannel } : {}),
          paymentStatus: paymentMethod === "online" ? "Menunggu Konfirmasi" : "Belum Dibayar",
          timeline: [{ status: "Booking", at: now }],
        };
        setOrders((o) => [order, ...o]);
        setProducts((ps) =>
          ps.map((p) => {
            const line = items.find((i) => i.productId === p.id);
            return line ? { ...p, stock: Math.max(0, p.stock - line.qty) } : p;
          }),
        );
        if (pointsUsed > 0)
          setPoints((pt) => [
            { id: "pt" + now, userId: user.id, delta: -pointsUsed, reason: `Dipakai di pesanan ${order.code}`, at: now },
            ...pt,
          ]);
        pushNotif(user.id, "pesanan", "Pesanan berhasil dibuat", `Kode ${order.code} · total ${order.total.toLocaleString("id-ID")}. Pantau statusnya di Pesanan Saya.`);
        setCart([]);
        return order;
      },
      setOrderStatus: (id, status) => {
        const target = orders.find((o) => o.id === id);
        setOrders((os) =>
          os.map((o) =>
            o.id === id
              ? {
                  ...o,
                  status,
                  timeline: o.timeline.some((t) => t.status === status)
                    ? o.timeline
                    : [...o.timeline, { status, at: Date.now() }],
                  paymentStatus:
                    status === "Selesai" || status === "Diterima" ? "Lunas" : o.paymentStatus,
                }
              : o,
          ) as Order[],
        );
        if (!target || target.status === status) return;
        // Notifikasi perubahan status ke pembeli.
        pushNotif(
          target.userId,
          "pesanan",
          `Pesanan ${target.code}: ${status}`,
          status === "Siap Diambil"
            ? "Barangmu sudah bisa diambil di koperasi. Jangan lewatkan batas 1x24 jam."
            : status === "Dikirim"
              ? "Paketmu sudah diserahkan ke kurir. Cek nomor resi di detail pesanan."
              : status === "Selesai" || status === "Diterima"
                ? "Transaksi selesai. Terima kasih sudah belanja barang layak pakai!"
                : `Status pesananmu kini ${status}.`,
        );
        // Poin loyalitas diberikan sekali saat pesanan selesai/diterima.
        if ((status === "Selesai" || status === "Diterima") && target.status !== "Selesai" && target.status !== "Diterima") {
          const earned = pointsEarnedFor(target.total);
          if (earned > 0)
            setPoints((pt) => [
              { id: "pt" + Date.now(), userId: target.userId, delta: earned, reason: `Poin dari pesanan ${target.code}`, at: Date.now() },
              ...pt,
            ]);
        }
      },
      setTracking: (id, courier, tracking) =>
        setOrders((os) =>
          os.map((o) =>
            o.id === id && o.shipping
              ? { ...o, shipping: { ...o.shipping, courier, tracking: tracking.trim() } }
              : o,
          ),
        ),
      shippingConfigs,
      updateShippingConfig: (schoolId, patch) =>
        setShippingConfigs((cs) => ({
          ...cs,
          [schoolId]: { ...(cs[schoolId] ?? defaultShippingConfig), ...patch },
        })),
      cancelOrder: (id) => {
        const target = orders.find((o) => o.id === id);
        if (target && !isFinalStatus(target.status)) restoreStock(target.items);
        setOrders((os) =>
          os.map((o) =>
            o.id === id
              ? { ...o, status: "Dibatalkan", timeline: [...o.timeline, { status: "Dibatalkan", at: Date.now() }] }
              : o,
          ),
        );
      },
      markPaid: (id) => setOrders((os) => os.map((o) => (o.id === id ? { ...o, paymentStatus: "Lunas" } : o))),

      addProduct: (p) =>
        setProducts((ps) => [
          {
            ...p,
            schoolId: resolveSchoolId(p.schoolId, p.seller),
            id: "p" + Date.now(),
            sold: 0,
            listedAt: Date.now(),
            basePrice: p.price,
            lifecycle: "aktif",
            lifecycleStage: "aktif",
          },
          ...ps,
        ]),
      updateProduct: (id, patch) =>
        setProducts((ps) =>
          ps.map((p) =>
            p.id === id
              ? { ...p, ...patch, schoolId: resolveSchoolId(patch.schoolId ?? p.schoolId, patch.seller ?? p.seller) }
              : p,
          ),
        ),
      deleteProduct: (id) => setProducts((ps) => ps.filter((p) => p.id !== id)),
      setLifecycle: (id, stage, note) =>
        setProducts((ps) =>
          applyLifecycle(
            ps.map((p) =>
              p.id === id
                ? {
                    ...p,
                    lifecycle: stage,
                    ...(note ? { lifecycleNote: note } : {}),
                    ...(stage === "aktif" ? { listedAt: Date.now() } : {}),
                  }
                : p,
            ),
          ),
        ),
      relistProduct: (id) =>
        setProducts((ps) =>
          applyLifecycle(
            ps.map((p) =>
              p.id === id
                ? { ...p, lifecycle: "aktif", listedAt: Date.now(), basePrice: p.basePrice ?? p.price }
                : p,
            ),
          ),
        ),
      createBundle: ({ name, productIds, price }) => {
        if (productIds.length < 2) return { ok: false, error: "Pilih minimal 2 barang untuk dipaketkan." };
        const items = products.filter((p) => productIds.includes(p.id));
        if (items.length !== productIds.length) return { ok: false, error: "Ada barang yang tidak ditemukan." };
        const schoolIds = new Set(items.map((i) => i.schoolId));
        if (schoolIds.size > 1) return { ok: false, error: "Paket hanya boleh berisi barang dari satu koperasi." };
        const main = items[0]!;
        const bundlePrice = price && price > 0 ? price : bundleSuggestionPrice(items);
        const stock = Math.max(1, Math.min(...items.map((i) => i.stock)));
        const bundle: Product = {
          id: "p" + Date.now(),
          name: name.trim() || `Paket Hemat ${main.category}`,
          category: main.category,
          price: bundlePrice,
          basePrice: bundlePrice,
          originalPrice: items.reduce((s, i) => s + (i.basePrice ?? i.price), 0),
          stock,
          condition: main.condition,
          plus: ["Paket bundling koperasi — lebih hemat", ...items.map((i) => `Termasuk: ${i.name}`)],
          minus: items.flatMap((i) => i.minus).slice(0, 3),
          curated: true,
          featured: true,
          seller: main.seller,
          schoolId: main.schoolId,
          sold: 0,
          listedAt: Date.now(),
          lifecycle: "aktif",
          lifecycleStage: "aktif",
          bundleOf: productIds,
          ...(main.photo ? { photo: main.photo } : {}),
        };
        setProducts((ps) => [bundle, ...ps]);
        return { ok: true };
      },
      reviews,
      addReview: ({ schoolId, rating, comment }) => {
        if (!user) return { ok: false, error: "Masuk dulu untuk memberi ulasan." };
        if (rating < 1 || rating > 5) return { ok: false, error: "Pilih rating 1–5 bintang." };
        if (comment.trim().length < 5) return { ok: false, error: "Tulis ulasan minimal 5 karakter." };
        setReviews((rs) => [
          {
            id: "r" + Date.now(),
            schoolId: resolveSchoolId(schoolId),
            author: user.name,
            rating,
            comment: comment.trim(),
            date: new Date().toISOString().slice(0, 10),
          },
          ...rs,
        ]);
        return { ok: true };
      },
      wishlist,
      toggleWishlist: (productId) =>
        setWishlist((w) => (w.includes(productId) ? w.filter((x) => x !== productId) : [...w, productId])),
      productReviews,
      addProductReview: ({ productId, orderId, rating, text }) => {
        if (!user) return { ok: false, error: "Masuk dulu untuk memberi ulasan." };
        const order = orders.find((o) => o.id === orderId && o.userId === user.id);
        if (!order || (order.status !== "Selesai" && order.status !== "Diterima"))
          return { ok: false, error: "Ulasan hanya bisa diberikan untuk pesanan yang sudah selesai." };
        if (!order.items.some((i) => i.productId === productId))
          return { ok: false, error: "Barang ini tidak ada di pesanan tersebut." };
        if (productReviews.some((r) => r.orderId === orderId && r.productId === productId && r.userId === user.id))
          return { ok: false, error: "Kamu sudah mengulas barang ini untuk pesanan itu." };
        if (rating < 1 || rating > 5) return { ok: false, error: "Pilih rating 1–5 bintang." };
        if (text.trim().length < 5) return { ok: false, error: "Tulis ulasan minimal 5 karakter." };
        setProductReviews((rs) => [
          {
            id: "pr" + Date.now(),
            productId,
            orderId,
            userId: user.id,
            author: user.name,
            rating,
            text: text.trim(),
            createdAt: Date.now(),
          },
          ...rs,
        ]);
        return { ok: true };
      },
      flashSales,
      addFlashSale: ({ title, productIds, discountPct, hours }) => {
        if (user?.role !== "admin" && user?.role !== "superadmin")
          return { ok: false, error: "Hanya admin yang bisa membuat flash sale." };
        if (productIds.length === 0) return { ok: false, error: "Pilih minimal 1 barang." };
        if (discountPct < 1 || discountPct > 90) return { ok: false, error: "Diskon 1–90%." };
        const schoolId = user?.role === "admin" ? products.find((p) => p.seller === user.name)?.schoolId : undefined;
        setFlashSales((fs) => [
          {
            id: "fs" + Date.now(),
            title: title.trim() || "Flash Sale Koperasi",
            productIds,
            discountPct,
            endsAt: Date.now() + Math.max(1, hours) * 1000 * 60 * 60,
            ...(schoolId ? { schoolId } : {}),
            createdAt: Date.now(),
          },
          ...fs,
        ]);
        pushNotif(null, "promo", "Flash sale dimulai!", `${title.trim() || "Flash Sale Koperasi"} — diskon ${discountPct}% untuk ${productIds.length} barang pilihan.`);
        return { ok: true };
      },
      removeFlashSale: (id) => setFlashSales((fs) => fs.filter((f) => f.id !== id)),
      vouchers,
      upsertVoucher: (v) => {
        if (user?.role !== "superadmin") return { ok: false, error: "Hanya Admin Pusat yang mengelola voucher." };
        const code = v.code.trim().toUpperCase();
        if (!/^[A-Z0-9]{4,16}$/.test(code)) return { ok: false, error: "Kode 4–16 karakter huruf/angka." };
        setVouchers((vs) => {
          const next = { ...v, code };
          return vs.some((x) => x.code === code)
            ? vs.map((x) => (x.code === code ? next : x))
            : [next, ...vs];
        });
        return { ok: true };
      },
      deleteVoucher: (code) => {
        if (user?.role !== "superadmin") return;
        setVouchers((vs) => vs.filter((v) => v.code !== code));
      },
      points,
      pointsBalance: (uid) => points.filter((p) => p.userId === uid).reduce((s, p) => s + p.delta, 0),
      notifs: notifs.filter((n) => n.userId === null || (user && n.userId === user.id)),
      markAllNotifsRead: () =>
        setNotifs((ns) => ns.map((n) => (n.userId === null || (user && n.userId === user.id) ? { ...n, read: true } : n))),
      markNotifRead: (id) => setNotifs((ns) => ns.map((n) => (n.id === id ? { ...n, read: true } : n))),
      reports,
      addReport: (productId, reason) => {
        if (!user) return { ok: false, error: "Masuk dulu untuk melapor." };
        const p = products.find((x) => x.id === productId);
        if (!p) return { ok: false, error: "Barang tidak ditemukan." };
        if (reason.trim().length < 5) return { ok: false, error: "Jelaskan masalahnya minimal 5 karakter." };
        if (reports.some((r) => r.productId === productId && r.reporter === user.name && r.status !== "selesai"))
          return { ok: false, error: "Laporanmu untuk barang ini sedang diproses." };
        setReports((rs) => [
          {
            id: "rp" + Date.now(),
            productId,
            productName: p.name,
            reporter: user.name,
            reason: reason.trim(),
            at: Date.now(),
            status: "baru",
          },
          ...rs,
        ]);
        return { ok: true };
      },
      setReportStatus: (id, status) => {
        if (user?.role !== "superadmin") return;
        setReports((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
      },
    }),
    [products, cart, orders, users, user, addToCart, reviews, wishlist, productReviews, flashSales, vouchers, points, reports, notifs],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useTooku() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useTooku must be used inside TookuProvider");
  return ctx;
}

export function useCountdown(deadline: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const left = Math.max(0, deadline - now);
  const h = Math.floor(left / 3600000);
  const m = Math.floor((left % 3600000) / 60000);
  const s = Math.floor((left % 60000) / 1000);
  return {
    expired: left === 0,
    label: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`,
    percent: Math.max(0, Math.min(100, (left / (1000 * 60 * 60 * 24)) * 100)),
  };
}
