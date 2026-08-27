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
  SCHOOLS_SELLER,
  type KoperasiReview,
  type Product,
} from "./tooku-data";

export type Role = "buyer" | "admin" | "superadmin";
export type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  password: string;
  role: Role;
  kelas?: string;
};

export const roleLabel: Record<Role, string> = {
  buyer: "Pembeli",
  admin: "Admin Koperasi",
  superadmin: "Super Admin",
};

export type OrderItem = { productId: string; name: string; price: number; qty: number };
export type OrderStatus = "Booking" | "Diproses" | "Siap Diambil" | "Selesai" | "Dibatalkan";
export type PaymentMethod = "online" | "koperasi";
export type PaymentStatus = "Belum Dibayar" | "Menunggu Konfirmasi" | "Lunas";

export const statusFlow: OrderStatus[] = ["Booking", "Diproses", "Siap Diambil", "Selesai"];

export type Order = {
  id: string;
  code: string;
  userId: string;
  buyer: string;
  items: OrderItem[];
  total: number;
  createdAt: number;
  deadline: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentChannel?: string;
  paymentStatus: PaymentStatus;
  timeline: { status: OrderStatus; at: number }[];
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
  },
  {
    id: "u2",
    name: "Budi Santoso",
    username: "budisantoso",
    email: "budisantoso@sekolah.id",
    password: "magetanngangeni",
    role: "buyer",
    kelas: "XI IPS 2",
  },
  {
    id: "u3",
    name: "Koperasi SMAS PGRI 1 Maospati",
    username: "smaspgrimaospati",
    email: "smaspgrimaospati@koperasi.id",
    password: "magetanngangeni",
    role: "admin",
  },
  {
    id: "u4",
    name: "Pengelola Pusat TOOKU",
    username: "superadmin",
    email: "pusat@tooku.id",
    password: "tookupusat2026",
    role: "superadmin",
  },
];

const seedOrders: Order[] = [
  {
    id: "o1",
    code: "TKU-4821",
    userId: "u1",
    buyer: "Siti Aisyah — X IPA 1",
    items: [{ productId: "p2", name: "Buku Matematika Kelas XI Kurikulum Merdeka", price: 18000, qty: 1 }],
    total: 18000,
    createdAt: Date.now() - 1000 * 60 * 60 * 6,
    deadline: Date.now() + 1000 * 60 * 60 * 18,
    status: "Siap Diambil",
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
    items: [{ productId: "p7", name: "Dasi Sekolah Warna Navy", price: 7000, qty: 2 }],
    total: 14000,
    createdAt: Date.now() - 1000 * 60 * 60 * 40,
    deadline: Date.now() - 1000 * 60 * 60 * 16,
    status: "Selesai",
    paymentMethod: "koperasi",
    paymentStatus: "Lunas",
    timeline: [
      { status: "Booking", at: Date.now() - 1000 * 60 * 60 * 40 },
      { status: "Diproses", at: Date.now() - 1000 * 60 * 60 * 39 },
      { status: "Siap Diambil", at: Date.now() - 1000 * 60 * 60 * 38 },
      { status: "Selesai", at: Date.now() - 1000 * 60 * 60 * 20 },
    ],
  },
];

type CheckoutInput = { paymentMethod: PaymentMethod; paymentChannel?: string };

type Store = {
  products: Product[];
  cart: CartLine[];
  orders: Order[];
  myOrders: Order[];
  users: User[];
  user: User | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  login: (identifier: string, password: string) => { ok: boolean; error?: string; role?: Role };
  register: (input: Omit<User, "id">) => { ok: boolean; error?: string; role?: Role };
  deleteUser: (id: string) => void;
  logout: () => void;
  addToCart: (id: string, qty?: number) => void;
  removeFromCart: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clearCart: () => void;
  checkout: (input: CheckoutInput) => Order | null;
  setOrderStatus: (id: string, status: OrderStatus) => void;
  cancelOrder: (id: string) => void;
  markPaid: (id: string) => void;
  addProduct: (p: Omit<Product, "id" | "sold">) => void;
  reviews: KoperasiReview[];
  addReview: (input: { schoolId: string; rating: number; comment: string }) => { ok: boolean; error?: string };
  deleteProduct: (id: string) => void;
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
  list.map((p) => {
    const schoolId = resolveSchoolId(p.schoolId, p.seller);
    return { ...p, schoolId, seller: SCHOOLS_SELLER[schoolId] ?? p.seller };
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
        if (p.orders) setOrders(p.orders);
        if (p.users) setUsers(p.users);
        if (p.userId !== undefined) setUserId(p.userId);
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
      localStorage.setItem(KEY, JSON.stringify({ products, cart, orders, users, userId, reviews }));
    } catch {
      /* ignore */
    }
  }, [hydrated, products, cart, orders, users, userId, reviews]);

  const addToCart = useCallback((id: string, qty = 1) => {
    setCart((c) =>
      c.some((l) => l.productId === id)
        ? c.map((l) => (l.productId === id ? { ...l, qty: l.qty + qty } : l))
        : [...c, { productId: id, qty }],
    );
  }, []);

  const user = users.find((u) => u.id === userId) ?? null;

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
      myOrders: user ? orders.filter((o) => o.userId === user.id) : [],
      login: (identifier, password) => {
        const key = identifier.trim().toLowerCase();
        const found = users.find((u) => u.username.toLowerCase() === key || u.email.toLowerCase() === key);
        if (!found) return { ok: false, error: "Akun tidak ditemukan." };
        if (found.password !== password) return { ok: false, error: "Password salah." };
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
        const newUser: User = { ...input, id: "u" + Date.now(), username: uname, email: input.email.trim() };
        setUsers((us) => [...us, newUser]);
        setUserId(newUser.id);
        return { ok: true, role: newUser.role };
      },
      deleteUser: (id) => {
        if (user?.role !== "superadmin" || id === user.id) return;
        setUsers((us) => us.filter((u) => u.id !== id));
      },
      logout: () => setUserId(null),
      addToCart,
      removeFromCart: (id) => setCart((c) => c.filter((l) => l.productId !== id)),
      setQty: (id, qty) =>
        setCart((c) =>
          qty <= 0 ? c.filter((l) => l.productId !== id) : c.map((l) => (l.productId === id ? { ...l, qty } : l)),
        ),
      clearCart: () => setCart([]),
      checkout: ({ paymentMethod, paymentChannel }) => {
        if (!user || cart.length === 0) return null;
        const items: OrderItem[] = cart.flatMap((l) => {
          const p = products.find((x) => x.id === l.productId);
          if (!p) return [];
          return [{ productId: p.id, name: p.name, price: p.price, qty: Math.min(l.qty, p.stock) }];
        });
        if (items.length === 0) return null;
        const now = Date.now();
        const order: Order = {
          id: "o" + now,
          code: "TKU-" + Math.floor(1000 + Math.random() * 8999),
          userId: user.id,
          buyer: user.kelas ? `${user.name} — ${user.kelas}` : user.name,
          items,
          total:
            items.reduce((s, i) => s + i.price * i.qty, 0) + (paymentMethod === "online" ? 2500 : 0),
          createdAt: now,
          deadline: now + 1000 * 60 * 60 * 24,
          status: "Booking",
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
        setCart([]);
        return order;
      },
      setOrderStatus: (id, status) =>
        setOrders((os) =>
          os.map((o) =>
            o.id === id
              ? {
                  ...o,
                  status,
                  timeline: o.timeline.some((t) => t.status === status)
                    ? o.timeline
                    : [...o.timeline, { status, at: Date.now() }],
                  paymentStatus: status === "Selesai" ? "Lunas" : o.paymentStatus,
                  
                }
              : o,
          ) as Order[],
        ),
      cancelOrder: (id) => {
        const target = orders.find((o) => o.id === id);
        if (target && target.status !== "Selesai" && target.status !== "Dibatalkan") restoreStock(target.items);
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
          { ...p, schoolId: resolveSchoolId(p.schoolId, p.seller), id: "p" + Date.now(), sold: 0 },
          ...ps,
        ]),
      deleteProduct: (id) => setProducts((ps) => ps.filter((p) => p.id !== id)),
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
    }),
    [products, cart, orders, users, user, addToCart, reviews],
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
