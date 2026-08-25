import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type ChangeEvent } from "react";
import {
  ArrowLeft,
  LayoutDashboard,
  ClipboardList,
  Boxes,
  PlusCircle,
  CheckCircle2,
  XCircle,
  Trash2,
  Package,
  Wallet,
  Clock,
} from "lucide-react";
import { useBaraka, useCountdown, type Order } from "@/lib/baraka-store";
import { categories, rupiah, type Category } from "@/lib/baraka-data";
import { ProductThumb } from "@/components/baraka/ui";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Koperasi — Dashboard BARAKA" },
      {
        name: "description",
        content: "Dashboard koperasi sekolah: statistik penjualan, validasi pesanan, dan manajemen produk BARAKA.",
      },
      { property: "og:title", content: "Admin Koperasi — Dashboard BARAKA" },
      { property: "og:description", content: "Kelola pesanan, stok, dan kurasi barang koperasi sekolah." },
    ],
  }),
  component: AdminPage;
});

type Tab = "dashboard" | "orders" | "products" | "new";

const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "orders", label: "Pesanan", icon: ClipboardList },
  { id: "products", label: "Produk", icon: Boxes },
  { id: "new", label: "Tambah Produk", icon: PlusCircle },
];

function AdminPage() {
  const [tab, setTab] = useState<Tab>("dashboard");

  return (
    <div className="min-h-screen bg-secondary/40">
      <header className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4">
          <Link to="/" aria-label="Kembali ke aplikasi siswa">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">Admin Koperasi BARAKA</p>
            <p className="truncate text-[11px] opacity-80">Koperasi Sekolah — Gedung B</p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl gap-6 px-4 py-5 lg:flex">
        <nav className="mb-4 flex gap-2 overflow-x-auto lg:mb-0 lg:w-56 lg:shrink-0 lg:flex-col lg:overflow-visible">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold ${
                tab === t.id ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"
              }`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </nav>

        <main className="min-w-0 flex-1">
          {tab === "dashboard" && <Dashboard />}
          {tab === "orders" && <OrdersAdmin />}
          {tab === "products" && <ProductsAdmin />}
          {tab === "new" && <NewProduct onDone={() => setTab("products")} />}
        </main>
      </div>
    </div>
  );
}

function Dashboard() {
  const { orders, products } = useBaraka();
  const waiting = orders.filter((o) => o.status === "Menunggu Pengambilan");
  const done = orders.filter((o) => o.status === "Selesai");
  const revenue = done.reduce((s, o) => s + o.total, 0);
  const stock = products.reduce((s, p) => s + p.stock, 0);

  const stats = [
    { label: "Pesanan Menunggu", value: String(waiting.length), icon: Clock },
    { label: "Pesanan Selesai", value: String(done.length), icon: CheckCircle2 },
    { label: "Pendapatan Koperasi", value: rupiah(revenue), icon: Wallet },
    { label: "Total Stok Barang", value: String(stock), icon: Package },
  ];

  const perCat = categories.map((c) => ({
    name: c.name,
    count: products.filter((p) => p.category === c.name).length,
  }));
  const max = Math.max(1, ...perCat.map((c) => c.count));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-4">
            <s.icon className="h-5 w-5 text-primary" />
            <p className="mt-2 truncate text-lg font-extrabold text-primary">{s.value}</p>
            <p className="text-[11px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <h2 className="text-sm font-bold">Sebaran Stok per Kategori</h2>
        <div className="mt-3 space-y-2.5">
          {perCat.map((c) => (
            <div key={c.name} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>{c.name}</span>
                <span className="font-semibold">{c.count} produk</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-accent" style={{ width: `${(c.count / max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <h2 className="text-sm font-bold">Perlu Tindakan</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {waiting.length} pesanan menunggu validasi pengambilan di koperasi.
        </p>
      </div>
    </div>
  );
}

function AdminOrderRow({ order }: { order: Order }) {
  const { completeOrder, cancelOrder } = useBaraka();
  const { label, expired } = useCountdown(order.deadline);
  const waiting = order.status === "Menunggu Pengambilan";

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold">{order.code}</p>
          <p className="truncate text-[11px] text-muted-foreground">{order.buyer}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
            order.status === "Selesai"
              ? "bg-primary/10 text-primary"
              : waiting
                ? "bg-accent/20 text-accent-foreground"
                : "bg-destructive/10 text-destructive"
          }`}
        >
          {waiting && expired ? "Kedaluwarsa" : order.status}
        </span>
      </div>
      <div className="mt-2 space-y-0.5">
        {order.items.map((i) => (
          <p key={i.productId} className="text-xs text-muted-foreground">
            {i.qty}x {i.name}
          </p>
        ))}
      </div>
      <p className="mt-2 text-sm font-bold text-primary">{rupiah(order.total)}</p>
      {waiting && (
        <>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Sisa waktu: <span className="font-semibold tabular-nums">{expired ? "00:00:00" : label}</span>
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => completeOrder(order.id)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground"
            >
              <CheckCircle2 className="h-4 w-4" /> Validasi & Selesaikan
            </button>
            <button
              onClick={() => cancelOrder(order.id)}
              className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2.5 text-xs font-semibold text-destructive"
            >
              <XCircle className="h-4 w-4" /> Batalkan
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function OrdersAdmin() {
  const { orders } = useBaraka();
  const [filter, setFilter] = useState<"Semua" | Order["status"]>("Semua");
  const list = orders.filter((o) => filter === "Semua" || o.status === filter);

  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto">
        {(["Semua", "Menunggu Pengambilan", "Selesai", "Dibatalkan"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold ${
              filter === f ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {list.length === 0 ? (
          <p className="text-sm text-muted-foreground">Tidak ada pesanan.</p>
        ) : (
          list.map((o) => <AdminOrderRow key={o.id} order={o} />)
        )}
      </div>
    </div>
  );
}

function ProductsAdmin() {
  const { products, deleteProduct } = useBaraka();
  return (
    <div className="space-y-3">
      {products.map((p) => (
        <div key={p.id} className="flex gap-3 rounded-2xl border border-border bg-card p-3">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl">
            <ProductThumb product={p} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-xs font-semibold">{p.name}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {p.category} · {p.condition} · stok {p.stock}
            </p>
            <p className="text-sm font-bold text-primary">{rupiah(p.price)}</p>
          </div>
          <button
            onClick={() => deleteProduct(p.id)}
            aria-label="Hapus produk"
            className="self-start text-muted-foreground"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

function NewProduct({ onDone }: { onDone: () => void }) {
  const { addProduct } = useBaraka();
  const [form, setForm] = useState({
    name: "",
    category: "Seragam" as Category,
    price: "",
    stock: "1",
    condition: "Baik (85%)",
    plus: "",
    minus: "",
    photo: "" as string,
  });

  const onPhoto = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, photo: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  const field = "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        addProduct({
          name: form.name,
          category: form.category,
          price: Number(form.price) || 0,
          stock: Number(form.stock) || 0,
          condition: form.condition,
          plus: form.plus.split("\n").filter(Boolean),
          minus: form.minus.split("\n").filter(Boolean),
          curated: true,
          featured: false,
          seller: "Koperasi Sekolah",
          ...(form.photo ? { photo: form.photo } : {}),
        });
        onDone();
      }}
      className="space-y-4 rounded-2xl border border-border bg-card p-4 lg:max-w-2xl"
    >
      <h2 className="text-sm font-bold">Tambah Produk Terkurasi</h2>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold">Foto Barang</label>
        <div className="flex items-center gap-3">
          <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl border border-dashed border-border bg-secondary">
            {form.photo ? (
              <img src={form.photo} alt="Pratinjau" className="h-full w-full object-cover" />
            ) : (
              <span className="text-xl">📷</span>
            )}
          </div>
          <input type="file" accept="image/*" onChange={onPhoto} className="text-xs" />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold" htmlFor="nm">
          Nama Barang
        </label>
        <input
          id="nm"
          required
          className={field}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Seragam Putih Lengan Panjang M"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold" htmlFor="ct">
            Kategori
          </label>
          <select
            id="ct"
            className={field}
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
          >
            {categories.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold" htmlFor="cd">
            Kondisi
          </label>
          <input
            id="cd"
            className={field}
            value={form.condition}
            onChange={(e) => setForm({ ...form, condition: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold" htmlFor="pr">
            Harga (Rp)
          </label>
          <input
            id="pr"
            required
            type="number"
            min="0"
            className={field}
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold" htmlFor="st">
            Stok
          </label>
          <input
            id="st"
            type="number"
            min="0"
            className={field}
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold" htmlFor="pl">
          Kelebihan (satu per baris)
        </label>
        <textarea
          id="pl"
          rows={3}
          className={field}
          value={form.plus}
          onChange={(e) => setForm({ ...form, plus: e.target.value })}
          placeholder={"Kain masih tebal\nKancing lengkap"}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold" htmlFor="mn">
          Minus / Catatan Kondisi (satu per baris)
        </label>
        <textarea
          id="mn"
          rows={3}
          className={field}
          value={form.minus}
          onChange={(e) => setForm({ ...form, minus: e.target.value })}
          placeholder={"Kerah sedikit pudar"}
        />
      </div>

      <button type="submit" className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground">
        Simpan & Tandai Lolos Kurasi
      </button>
    </form>
  );
}
