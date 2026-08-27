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
  ShieldCheck,
  BanknoteIcon,
  Pencil,
  ShoppingBag,
} from "lucide-react";
import { useTooku, useCountdown, statusFlow, type Order, type OrderStatus } from "@/lib/tooku-store";
import { categories, rupiah, schools, type Category } from "@/lib/tooku-data";
import { ProductThumb } from "@/components/tooku/ui";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Koperasi — Dashboard TOOKU" },
      {
        name: "description",
        content: "Dashboard koperasi sekolah: statistik penjualan, proses status pesanan, dan manajemen produk TOOKU.",
      },
      { property: "og:title", content: "Admin Koperasi — Dashboard TOOKU" },
      { property: "og:description", content: "Kelola pesanan, status, stok, dan kurasi barang koperasi sekolah." },
    ],
  }),
  component: AdminPage,
});

type Tab = "dashboard" | "orders" | "products" | "new";

const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "orders", label: "Pesanan", icon: ClipboardList },
  { id: "products", label: "Produk", icon: Boxes },
  { id: "new", label: "Tambah Produk", icon: PlusCircle },
];

function AdminPage() {
  const { user, isAdmin, isSuperAdmin } = useTooku();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [editId, setEditId] = useState<string | null>(null);

  // Admin Pusat punya konsol tersendiri.
  if (isSuperAdmin) {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <ShieldCheck className="mx-auto h-10 w-10 text-primary" />
        <h1 className="mt-4 text-lg font-bold">Kamu masuk sebagai Admin Pusat</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Dashboard ini milik koperasi sekolah. Gunakan Konsol Admin Pusat untuk memantau seluruh koperasi.
        </p>
        <Link
          to="/pusat"
          className="mt-5 inline-block rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground"
        >
          Buka Konsol Admin Pusat
        </Link>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <ShieldCheck className="mx-auto h-10 w-10 text-primary" />
        <h1 className="mt-4 text-lg font-bold">Area Admin Koperasi</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {user
            ? "Akunmu terdaftar sebagai Pembeli. Masuk dengan akun Admin Koperasi untuk mengelola pesanan."
            : "Masuk sebagai Admin Koperasi untuk membuka dashboard."}
        </p>
        <Link
          to="/auth"
          className="mt-5 inline-block rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground"
        >
          Masuk sebagai Admin
        </Link>
        <Link to="/" className="mt-3 block text-sm font-semibold text-primary">
          Kembali ke beranda
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/40">
      <header className="bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-6xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-4">
          <Link to="/" aria-label="Kembali ke aplikasi siswa">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">
              Admin Koperasi TOOKU
            </p>
            <p className="truncate text-[11px] opacity-80">
              {user?.name} · @{user?.username}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1.5 text-[11px] font-semibold"
            >
              <ShoppingBag className="h-3.5 w-3.5" /> Belanja
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl gap-6 px-4 py-5 lg:flex">
        <nav className="mb-4 flex gap-2 overflow-x-auto lg:mb-0 lg:w-56 lg:shrink-0 lg:flex-col lg:overflow-visible">
          {tabs
            .map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  if (t.id !== "new") setEditId(null);
                  setTab(t.id);
                }}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold ${
                  tab === t.id ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"
                }`}
              >
                <t.icon className="h-4 w-4" /> {t.id === "new" && editId ? "Edit Produk" : t.label}
              </button>
            ))}
        </nav>

        <main className="min-w-0 flex-1">
          {tab === "dashboard" && <Dashboard />}
          {tab === "orders" && <OrdersAdmin />}
          {tab === "products" && (
            <ProductsAdmin
              onEdit={(id) => {
                setEditId(id);
                setTab("new");
              }}
            />
          )}
          {tab === "new" && (
            <NewProduct
              editId={editId}
              onDone={() => {
                setEditId(null);
                setTab("products");
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}

function Dashboard() {
  const { orders, products } = useTooku();
  const active = orders.filter((o) => o.status !== "Selesai" && o.status !== "Dibatalkan");
  const done = orders.filter((o) => o.status === "Selesai");
  const revenue = done.reduce((s, o) => s + o.total, 0);
  const stock = products.reduce((s, p) => s + p.stock, 0);

  const stats = [
    { label: "Pesanan Aktif", value: String(active.length), icon: Clock },
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
        <h2 className="text-sm font-bold">Sebaran Produk per Kategori</h2>
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
          {orders.filter((o) => o.status === "Booking").length} pesanan baru menunggu diproses ·{" "}
          {orders.filter((o) => o.paymentStatus === "Menunggu Konfirmasi").length} pembayaran online menunggu
          konfirmasi.
        </p>
      </div>
    </div>
  );
}

function AdminOrderRow({ order }: { order: Order }) {
  const { setOrderStatus, cancelOrder, markPaid } = useTooku();
  const { label, expired } = useCountdown(order.deadline);
  const activeFlow = order.status !== "Selesai" && order.status !== "Dibatalkan";
  const nextStatus: OrderStatus | undefined = statusFlow[statusFlow.indexOf(order.status) + 1];

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
              : order.status === "Dibatalkan"
                ? "bg-destructive/10 text-destructive"
                : "bg-accent/20 text-accent-foreground"
          }`}
        >
          {order.status}
        </span>
      </div>

      <div className="mt-2 space-y-0.5">
        {order.items.map((i) => (
          <p key={i.productId} className="text-xs text-muted-foreground">
            {i.qty}x {i.name}
          </p>
        ))}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
        <span className="rounded-full bg-secondary px-2 py-0.5 font-medium">
          {order.paymentMethod === "online" ? `Online · ${order.paymentChannel ?? "-"}` : "Bayar di Koperasi"}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 font-semibold ${
            order.paymentStatus === "Lunas" ? "bg-primary/10 text-primary" : "bg-accent/20 text-accent-foreground"
          }`}
        >
          {order.paymentStatus}
        </span>
      </div>

      <p className="mt-2 text-sm font-bold text-primary">{rupiah(order.total)}</p>
      {activeFlow && (
        <p className="mt-1 text-[11px] text-muted-foreground">
          Batas pengambilan: <span className="font-semibold tabular-nums">{expired ? "habis" : label}</span>
        </p>
      )}

      {activeFlow && (
        <div className="mt-3 flex flex-wrap gap-2">
          {nextStatus && (
            <button
              onClick={() => setOrderStatus(order.id, nextStatus)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2.5 text-xs font-bold text-primary-foreground"
            >
              <CheckCircle2 className="h-4 w-4" /> Tandai {nextStatus}
            </button>
          )}
          {order.paymentStatus !== "Lunas" && (
            <button
              onClick={() => markPaid(order.id)}
              className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2.5 text-xs font-semibold text-primary"
            >
              <BanknoteIcon className="h-4 w-4" /> Konfirmasi Bayar
            </button>
          )}
          <button
            onClick={() => cancelOrder(order.id)}
            className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2.5 text-xs font-semibold text-destructive"
          >
            <XCircle className="h-4 w-4" /> Batalkan
          </button>
        </div>
      )}
    </div>
  );
}

function OrdersAdmin() {
  const { orders } = useTooku();
  const [filter, setFilter] = useState<"Semua" | OrderStatus>("Semua");
  const list = orders.filter((o) => filter === "Semua" || o.status === filter);

  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto">
        {(["Semua", ...statusFlow, "Dibatalkan"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as "Semua" | OrderStatus)}
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

function ProductsAdmin({ onEdit }: { onEdit: (id: string) => void }) {
  const { products, deleteProduct } = useTooku();
  return (
    <div className="grid gap-3 lg:grid-cols-2">
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
          <div className="flex shrink-0 flex-col items-center gap-2 self-start">
            <button
              onClick={() => onEdit(p.id)}
              aria-label={`Edit ${p.name}`}
              className="rounded-lg bg-secondary p-1.5 text-primary"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={() => deleteProduct(p.id)}
              aria-label={`Hapus ${p.name}`}
              className="rounded-lg bg-secondary p-1.5 text-muted-foreground"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function NewProduct({ editId, onDone }: { editId?: string | null; onDone: () => void }) {
  const { addProduct, updateProduct, products, user } = useTooku();
  const editing = editId ? products.find((p) => p.id === editId) : undefined;
  const mySchoolId = schoolIdForAccount({ username: user?.username, name: user?.name });
  const schoolId = editing?.schoolId ?? mySchoolId;
  const mySchool = schools.find((s) => s.id === schoolId)!;
  const [form, setForm] = useState(() =>
    editing
      ? {
          name: editing.name,
          category: editing.category,
          price: String(editing.price),
          stock: String(editing.stock),
          condition: editing.condition,
          plus: editing.plus.join("\n"),
          minus: editing.minus.join("\n"),
          photo: editing.photo ?? "",
        }
      : {
          name: "",
          category: "Seragam" as Category,
          price: "",
          stock: "1",
          condition: "Baik (85%)",
          plus: "",
          minus: "",
          photo: "",
        },
  );
  const [specs, setSpecs] = useState<Record<string, string>>(() => ({ ...(editing?.specs ?? {}) }));

  const [photoInfo, setPhotoInfo] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);

  const onPhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCompressing(true);
    setPhotoInfo(null);
    try {
      const { compressImage } = await import("@/lib/image-compress");
      const res = await compressImage(file);
      setForm((f) => ({ ...f, photo: res.dataUrl }));
      setPhotoInfo(
        `Terkompresi ${res.originalKb} KB → ${res.compressedKb} KB · ${res.width}×${res.height}px`,
      );
    } catch {
      setPhotoInfo("Gagal memproses gambar, coba foto lain.");
    } finally {
      setCompressing(false);
    }
  };


  const field = "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm";
  const template = specTemplates[form.category];
  const extraSpecs = Object.keys(specs).filter((k) => !template.some((t) => t.key === k));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const cleanSpecs = Object.fromEntries(
          Object.entries(specs)
            .map(([k, v]) => [k, v.trim()])
            .filter(([, v]) => v),
        ) as Record<string, string>;
        const payload = {
          name: form.name.trim().slice(0, 120),
          category: form.category,
          price: Math.max(0, Number(form.price) || 0),
          stock: Math.max(0, Number(form.stock) || 0),
          condition: form.condition.trim().slice(0, 40),
          plus: form.plus.split("\n").filter(Boolean).slice(0, 6),
          minus: form.minus.split("\n").filter(Boolean).slice(0, 6),
          curated: true,
          featured: false,
          seller: mySchool.koperasi,
          schoolId: mySchool.id,
          specs: cleanSpecs,
          ...(form.photo ? { photo: form.photo } : {}),
        };
        if (editing) updateProduct(editing.id, payload);
        else addProduct(payload);
        onDone();
      }}
      className="space-y-4 rounded-2xl border border-border bg-card p-4 lg:max-w-2xl"
    >
      <h2 className="text-sm font-bold">{editing ? "Edit Produk" : "Tambah Produk Terkurasi"}</h2>
      {editing && (
        <p className="rounded-xl bg-secondary px-3 py-2 text-[11px] text-muted-foreground">
          Kamu sedang memperbaiki data produk <span className="font-semibold">{editing.name}</span>. Perubahan langsung
          tampil di katalog pembeli.
        </p>
      )}
      <p className="rounded-xl bg-primary/5 px-3 py-2 text-[11px] text-muted-foreground">
        Produk otomatis terdaftar sebagai barang <span className="font-semibold">{mySchool.koperasi}</span>.
      </p>


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
          <div className="min-w-0 space-y-1">
            <input type="file" accept="image/*" onChange={onPhoto} className="text-xs" />
            <p className="text-[11px] text-muted-foreground">
              {compressing
                ? "Mengompres gambar…"
                : (photoInfo ?? "Foto otomatis dikompres (maks ±160 KB, 1000px) agar aplikasi tetap ringan.")}
            </p>
          </div>
        </div>
      </div>


      <div className="space-y-1.5">
        <label className="text-xs font-semibold" htmlFor="nm">
          Nama Barang
        </label>
        <input
          id="nm"
          required
          maxLength={120}
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
            maxLength={40}
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
        {editing ? "Simpan Perubahan" : "Simpan & Tandai Lolos Kurasi"}
      </button>
    </form>
  );
}
