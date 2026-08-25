import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { seedProducts, type Product } from "./baraka-data";

export type OrderItem = { productId: string; name: string; price: number; qty: number };
export type OrderStatus = "Menunggu Pengambilan" | "Selesai" | "Dibatalkan";
export type Order = {
  id: string;
  code: string;
  items: OrderItem[];
  total: number;
  createdAt: number;
  deadline: number;
  status: OrderStatus;
  buyer: string;
};

type CartLine = { productId: string; qty: number };

type Store = {
  products: Product[];
  cart: CartLine[];
  orders: Order[];
  addToCart: (id: string, qty?: number) => void;
  removeFromCart: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clearCart: () => void;
  checkout: (buyer: string) => Order;
  completeOrder: (id: string) => void;
  cancelOrder: (id: string) => void;
  addProduct: (p: Omit<Product, "id" | "sold">) => void;
  deleteProduct: (id: string) => void;
};

const seedOrders: Order[] = [
  {
    id: "o1",
    code: "BRK-4821",
    items: [{ productId: "p2", name: "Buku Matematika Kelas XI Kurikulum Merdeka", price: 18000, qty: 1 }],
    total: 18000,
    createdAt: Date.now() - 1000 * 60 * 60 * 6,
    deadline: Date.now() + 1000 * 60 * 60 * 18,
    status: "Menunggu Pengambilan",
    buyer: "Siti Aisyah — X IPA 1",
  },
  {
    id: "o2",
    code: "BRK-3390",
    items: [{ productId: "p7", name: "Dasi Sekolah Warna Navy", price: 7000, qty: 2 }],
    total: 14000,
    createdAt: Date.now() - 1000 * 60 * 60 * 40,
    deadline: Date.now() - 1000 * 60 * 60 * 16,
    status: "Selesai",
    buyer: "Dimas Pratama — XI IPS 2",
  },
];

const StoreContext = createContext<Store | null>(null);
const KEY = "baraka-state-v1";

export function BarakaProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(seedProducts);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [orders, setOrders] = useState<Order[]>(seedOrders);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (p.products) setProducts(p.products);
        if (p.cart) setCart(p.cart);
        if (p.orders) setOrders(p.orders);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ products, cart, orders }));
    } catch {
      /* ignore */
    }
  }, [products, cart, orders]);

  const addToCart = useCallback((id: string, qty = 1) => {
    setCart((c) =>
      c.some((l) => l.productId === id)
        ? c.map((l) => (l.productId === id ? { ...l, qty: l.qty + qty } : l))
        : [...c, { productId: id, qty }],
    );
  }, []);

  const value = useMemo<Store>(
    () => ({
      products,
      cart,
      orders,
      addToCart,
      removeFromCart: (id) => setCart((c) => c.filter((l) => l.productId !== id)),
      setQty: (id, qty) =>
        setCart((c) =>
          qty <= 0 ? c.filter((l) => l.productId !== id) : c.map((l) => (l.productId === id ? { ...l, qty } : l)),
        ),
      clearCart: () => setCart([]),
      checkout: (buyer) => {
        const items: OrderItem[] = cart.map((l) => {
          const p = products.find((x) => x.id === l.productId)!;
          return { productId: p.id, name: p.name, price: p.price, qty: l.qty };
        });
        const order: Order = {
          id: "o" + Date.now(),
          code: "BRK-" + Math.floor(1000 + Math.random() * 8999),
          items,
          total: items.reduce((s, i) => s + i.price * i.qty, 0),
          createdAt: Date.now(),
          deadline: Date.now() + 1000 * 60 * 60 * 24,
          status: "Menunggu Pengambilan",
          buyer,
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
      completeOrder: (id) =>
        setOrders((o) => o.map((x) => (x.id === id ? { ...x, status: "Selesai" as OrderStatus } : x))),
      cancelOrder: (id) => {
        setOrders((o) => {
          const target = o.find((x) => x.id === id);
          if (target && target.status === "Menunggu Pengambilan") {
            setProducts((ps) =>
              ps.map((p) => {
                const line = target.items.find((i) => i.productId === p.id);
                return line ? { ...p, stock: p.stock + line.qty } : p;
              }),
            );
          }
          return o.map((x) => (x.id === id ? { ...x, status: "Dibatalkan" as OrderStatus } : x));
        });
      },
      addProduct: (p) => setProducts((ps) => [{ ...p, id: "p" + Date.now(), sold: 0 }, ...ps]),
      deleteProduct: (id) => setProducts((ps) => ps.filter((p) => p.id !== id)),
    }),
    [products, cart, orders, addToCart],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useBaraka() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useBaraka must be used inside BarakaProvider");
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
