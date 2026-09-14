import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
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
  Truck,
  Recycle,
  Gift,
  Scissors,
  TrendingDown,
  RotateCcw,
  Layers,
  Settings,
  Star,
} from "lucide-react";
import {
  useTooku,
  useCountdown,
  statusFlow,
  deliveryFlow,
  flowFor,
  isFinalStatus,
  type Order,
  type OrderStatus,
} from "@/lib/tooku-store";
import { couriers, payOptionLabel, zoneLabel, zones, type PayOption } from "@/lib/tooku-shipping";
import {
  DONATION_DAY,
  MARKDOWN_1_DAY,
  MARKDOWN_2_DAY,
  bundleSuggestionPrice,
  daysListed,
  lifecyclePrice,
  stageMeta,
  stageOf,
  type LifecycleStage,
} from "@/lib/tooku-lifecycle";

import {
  categories,
  rupiah,
  schools,
  schoolById,
  schoolIdForAccount,
  specTemplates,
  ratingSummary,
  type Category,
} from "@/lib/tooku-data";
import { AccountSettingsSheet } from "@/components/tooku/account-settings";
import { ProductThumb } from "@/components/tooku/ui";
import logoAsset from "@/assets/tooku-logo.png.asset.json";
import { LogOut } from "lucide-react";

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

type Tab = "dashboard" | "orders" | "products" | "new" | "promo" | "shipping" | "lifecycle";

const tabs: { id: Tab; label: string; short: string; icon: typeof LayoutDashboard; tone: string }[] = [
  { id: "dashboard", label: "Dashboard", short: "Beranda", icon: LayoutDashboard, tone: "bg-primary/10 text-primary" },
  { id: "orders", label: "Pesanan Masuk", short: "Pesanan", icon: ClipboardList, tone: "bg-accent/25 text-accent-foreground" },
  { id: "products", label: "Produk Saya", short: "Produk", icon: Boxes, tone: "bg-primary/10 text-primary" },
  { id: "new", label: "Tambah Produk", short: "Tambah", icon: PlusCircle, tone: "bg-accent/25 text-accent-foreground" },
  { id: "promo", label: "Flash Sale", short: "Flash Sale", icon: ShoppingBag, tone: "bg-destructive/10 text-destructive" },
  { id: "shipping", label: "Pengiriman & Pembayaran", short: "Kirim & Bayar", icon: Truck, tone: "bg-primary/10 text-primary" },
  { id: "lifecycle", label: "Siklus Barang", short: "Siklus", icon: Recycle, tone: "bg-accent/25 text-accent-foreground" },
];


function AdminPage() {
  const { user, isAdmin, isSuperAdmin, logout } = useTooku();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [editId, setEditId] = useState<string | null>(null);
  const mySchoolId = schoolIdForAccount({ username: user?.username, name: user?.name });
  const mySchool = schoolById(mySchoolId);
  const handleLogout = () => {
    logout();
    navigate({ to: "/", replace: true });
  };

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
      <header className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-4">
          <Link to="/" aria-label="Kembali ke aplikasi siswa" className="shrink-0">
            <img
              src={logoAsset.url}
              alt="Logo TOOKU"
              className="h-11 w-11 rounded-xl bg-white object-contain p-1 shadow-sm"
            />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-bold sm:text-base">
                {mySchool?.koperasi ?? "Admin Koperasi TOOKU"}
              </p>
              {mySchool && (
                <span className="hidden shrink-0 rounded-full bg-accent px-2 py-0.5 text-[9px] font-bold text-accent-foreground sm:inline-block">
                  {mySchool.level}
                </span>
              )}
            </div>
            <p className="truncate text-[11px] opacity-80">
              {mySchool ? `${mySchool.name} · ${mySchool.district}` : "Dashboard Koperasi"} — {user?.name} · @{user?.username}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1.5 text-[11px] font-semibold transition hover:bg-primary-foreground/25"
            >
              <ShoppingBag className="h-3.5 w-3.5" /> Belanja
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground px-3 py-1.5 text-[11px] font-bold text-primary shadow-sm transition hover:bg-accent hover:text-accent-foreground"
            >
              <LogOut className="h-3.5 w-3.5" /> Keluar
            </button>
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
          {tab === "promo" && <PromoAdmin />}
          {tab === "shipping" && <ShippingAdmin />}
          {tab === "lifecycle" && <LifecycleAdmin />}

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
  const { setOrderStatus, cancelOrder, markPaid, setTracking } = useTooku();
  const { label, expired } = useCountdown(order.deadline);
  const activeFlow = !isFinalStatus(order.status);
  const flow = flowFor(order);
  const nextStatus: OrderStatus | undefined = flow[flow.indexOf(order.status) + 1];
  const delivery = order.fulfillment === "delivery";
  const [resi, setResi] = useState(order.shipping?.tracking ?? "");


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
          {order.paymentMethod === "online"
            ? `Online · ${order.paymentChannel ?? "-"}`
            : order.paymentMethod === "cod"
              ? "COD (bayar ke kurir)"
              : "Bayar di Koperasi"}
        </span>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 font-semibold text-primary">
          {delivery ? `Kirim · ${order.shipping?.courier ?? "-"}` : "Ambil di koperasi"}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 font-semibold ${
            order.paymentStatus === "Lunas" ? "bg-primary/10 text-primary" : "bg-accent/20 text-accent-foreground"
          }`}
        >
          {order.paymentStatus}
        </span>
      </div>

      {delivery && order.shipping && (
        <div className="mt-2 space-y-1 rounded-xl border border-border p-3 text-[11px]">
          <p className="font-bold">Alamat Kirim</p>
          <p className="text-muted-foreground">
            {order.shipping.recipient} · {order.shipping.phone}
          </p>
          <p className="text-muted-foreground">
            {order.shipping.address}, Kec. {order.shipping.district}, {order.shipping.city}, {order.shipping.province}
          </p>
          <p className="text-muted-foreground">
            Zona {zoneLabel[order.shipping.zone]} · ongkir {rupiah(order.shippingTotal)}
          </p>
          {order.shipping.note && <p className="text-muted-foreground">Catatan: {order.shipping.note}</p>}
          {activeFlow && (
            <div className="flex gap-2 pt-1">
              <input
                value={resi}
                onChange={(e) => setResi(e.target.value)}
                placeholder="Nomor resi kurir"
                className="min-w-0 flex-1 rounded-lg border border-border bg-background px-2.5 py-2 text-[11px]"
              />
              <button
                onClick={() => setTracking(order.id, order.shipping!.courier, resi)}
                disabled={!resi.trim()}
                className="rounded-lg bg-primary px-3 py-2 text-[11px] font-bold text-primary-foreground disabled:opacity-40"
              >
                Simpan Resi
              </button>
            </div>
          )}
        </div>
      )}

      <p className="mt-2 text-sm font-bold text-primary">{rupiah(order.total)}</p>
      {activeFlow && (
        <p className="mt-1 text-[11px] text-muted-foreground">
          {delivery ? "Batas proses & serah ke kurir" : "Batas pengambilan"}:{" "}
          <span className="font-semibold tabular-nums">{expired ? "habis" : label}</span>
        </p>
      )}

      {activeFlow && (
        <div className="mt-3 flex flex-wrap gap-2">
          {nextStatus && (
            <button
              onClick={() => setOrderStatus(order.id, nextStatus)}
              disabled={delivery && nextStatus === "Dikirim" && !resi.trim()}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2.5 text-xs font-bold text-primary-foreground disabled:opacity-40"
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
        {(
          ["Semua", ...statusFlow, ...deliveryFlow.filter((s) => !statusFlow.includes(s)), "Dibatalkan"] as const
        ).map((f) => (
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

      <div className="space-y-2 rounded-xl border border-border bg-secondary/40 p-3">
        <div>
          <p className="text-xs font-bold">Detail Spesifikasi — {form.category}</p>
          <p className="text-[11px] text-muted-foreground">
            Isi sedetail mungkin (ukuran, bahan, kelas, dll). Kosongkan yang tidak relevan; hanya yang terisi yang
            tampil di halaman produk.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {template.map((t) => (
            <div key={t.key} className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground">{t.key}</label>
              <input
                className={field}
                placeholder={t.placeholder}
                value={specs[t.key] ?? ""}
                onChange={(e) => setSpecs((s) => ({ ...s, [t.key]: e.target.value }))}
              />
            </div>
          ))}
        </div>
        {extraSpecs.length > 0 && (
          <div className="grid gap-2 sm:grid-cols-2">
            {extraSpecs.map((k) => (
              <div key={k} className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">{k}</label>
                <input
                  className={field}
                  value={specs[k] ?? ""}
                  onChange={(e) => setSpecs((s) => ({ ...s, [k]: e.target.value }))}
                />
              </div>
            ))}
          </div>
        )}
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

/** Pengaturan pengiriman & metode pembayaran milik koperasi ini. */
function ShippingAdmin() {
  const { user, shippingConfigs, updateShippingConfig } = useTooku();
  const schoolId = schoolIdForAccount({ username: user?.username, name: user?.name });
  const school = schools.find((s) => s.id === schoolId)!;
  const cfg = shippingConfigs[schoolId];
  if (!cfg) return <p className="text-sm text-muted-foreground">Konfigurasi koperasi belum tersedia.</p>;

  const togglePay = (p: PayOption) =>
    updateShippingConfig(schoolId, {
      payments: cfg.payments.includes(p) ? cfg.payments.filter((x) => x !== p) : [...cfg.payments, p],
    });
  const toggleCourier = (c: (typeof couriers)[number]) =>
    updateShippingConfig(schoolId, {
      couriers: cfg.couriers.includes(c) ? cfg.couriers.filter((x) => x !== c) : [...cfg.couriers, c],
    });

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-border bg-card p-4">
        <h2 className="text-sm font-bold">Layanan Pengiriman — {school.koperasi}</h2>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Pembeli dari sekolah/kecamatan lain bisa memilih dikirim via ekspedisi. Bila dimatikan, pembeli hanya dapat
          mengambil sendiri di koperasi ({school.pickup}, {school.hours}).
        </p>
        <label className="mt-3 flex items-center gap-3 rounded-xl border border-border p-3 text-xs font-semibold">
          <input
            type="checkbox"
            checked={cfg.enabled}
            onChange={(e) => updateShippingConfig(schoolId, { enabled: e.target.checked })}
            className="h-4 w-4"
          />
          Aktifkan pengiriman via ekspedisi
        </label>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4">
        <h2 className="text-sm font-bold">Tarif Ongkir per Zona</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {zones.map((z) => (
            <label key={z} className="block text-[11px] font-semibold text-muted-foreground">
              {zoneLabel[z]}
              <input
                type="number"
                min={0}
                step={500}
                value={cfg.rates[z]}
                onChange={(e) =>
                  updateShippingConfig(schoolId, {
                    rates: { ...cfg.rates, [z]: Math.max(0, Number(e.target.value) || 0) },
                  })
                }
                className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 text-xs font-normal text-foreground"
              />
            </label>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Ongkir zona “satu kecamatan” bisa diisi 0 bila koperasi mengantar sendiri.
        </p>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4">
        <h2 className="text-sm font-bold">Kurir yang Dilayani</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {couriers.map((c) => (
            <button
              key={c}
              onClick={() => toggleCourier(c)}
              className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                cfg.couriers.includes(c) ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4">
        <h2 className="text-sm font-bold">Metode Pembayaran yang Diterima</h2>
        <div className="mt-3 space-y-2">
          {(["online", "koperasi", "cod"] as PayOption[]).map((p) => (
            <label key={p} className="flex items-center gap-3 rounded-xl border border-border p-3 text-xs font-semibold">
              <input type="checkbox" checked={cfg.payments.includes(p)} onChange={() => togglePay(p)} className="h-4 w-4" />
              {payOptionLabel[p]}
            </label>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          COD hanya berlaku untuk pesanan yang dikirim kurir. Bila COD dimatikan, pembeli luar sekolah wajib bayar
          online lebih dulu.
        </p>
      </section>
    </div>
  );
}

/**
 * Fase 1–4 Siklus Hidup Barang: pantau umur tayang, diskon otomatis,
 * buat paket bundling, salurkan donasi, dan tandai bahan daur ulang.
 */
function LifecycleAdmin() {
  const { user, products, setLifecycle, relistProduct, createBundle } = useTooku();
  const schoolId = schoolIdForAccount({ username: user?.username, name: user?.name });
  const mine = products.filter((p) => p.schoolId === schoolId);
  const [filter, setFilter] = useState<LifecycleStage | "semua">("semua");
  const [picked, setPicked] = useState<string[]>([]);
  const [bundleName, setBundleName] = useState("");
  const [bundlePrice, setBundlePrice] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const counts = mine.reduce<Record<string, number>>((acc, p) => {
    const s = stageOf(p);
    acc[s] = (acc[s] ?? 0) + 1;
    return acc;
  }, {});
  const list = mine
    .filter((p) => filter === "semua" || stageOf(p) === filter)
    .sort((a, b) => daysListed(b) - daysListed(a));
  const pickedItems = mine.filter((p) => picked.includes(p.id));
  const suggested = pickedItems.length >= 2 ? bundleSuggestionPrice(pickedItems) : 0;

  const togglePick = (id: string) =>
    setPicked((ps) => (ps.includes(id) ? ps.filter((x) => x !== id) : [...ps, id]));

  const submitBundle = () => {
    const res = createBundle({
      name: bundleName,
      productIds: picked,
      ...(bundlePrice ? { price: Number(bundlePrice) } : {}),
    });
    setMsg(res.ok ? "Paket bundling berhasil dibuat dan langsung tayang." : (res.error ?? "Gagal membuat paket."));
    if (res.ok) {
      setPicked([]);
      setBundleName("");
      setBundlePrice("");
    }
  };

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-border bg-card p-4">
        <h2 className="flex items-center gap-2 text-sm font-bold">
          <Recycle className="h-4 w-4 text-primary" /> Siklus Hidup Barang
        </h2>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
          Empat fase mitigasi penumpukan stok: diskon otomatis {MARKDOWN_1_DAY} hari (−20%) dan {MARKDOWN_2_DAY} hari
          (−50%), paket bundling barang lambat terjual, donasi otomatis setelah {DONATION_DAY} hari tayang, serta daur
          ulang kreatif untuk kain yang tidak layak jual.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {(["aktif", "cuci-gudang", "obral-akhir", "donasi", "upcycle"] as LifecycleStage[]).map((st) => (
            <button
              key={st}
              onClick={() => setFilter(filter === st ? "semua" : st)}
              className={`rounded-xl border p-2.5 text-left ${
                filter === st ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <p className="text-lg font-extrabold tabular-nums">{counts[st] ?? 0}</p>
              <p className="text-[10px] font-semibold text-muted-foreground">{stageMeta[st].short}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4">
        <h2 className="flex items-center gap-2 text-sm font-bold">
          <Layers className="h-4 w-4 text-primary" /> Fase 2 — Buat Paket Bundling
        </h2>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Centang barang di daftar bawah (minimal 2, satu koperasi), lalu beri nama paket. Cocok untuk menggabungkan
          dasi/topi/sabuk yang menumpuk dengan seragam utama.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <input
            value={bundleName}
            onChange={(e) => setBundleName(e.target.value)}
            placeholder="Paket Seragam + Dasi + Topi"
            className="rounded-xl border border-border bg-background p-2.5 text-xs"
          />
          <input
            value={bundlePrice}
            onChange={(e) => setBundlePrice(e.target.value.replace(/\D/g, ""))}
            placeholder={suggested ? `Harga paket (saran ${rupiah(suggested)})` : "Harga paket"}
            className="rounded-xl border border-border bg-background p-2.5 text-xs"
          />
        </div>
        <div className="mt-2 flex items-center gap-2">
          <button
            onClick={submitBundle}
            disabled={picked.length < 2}
            className="rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground disabled:opacity-50"
          >
            Buat Paket ({picked.length} barang)
          </button>
          {picked.length > 0 && (
            <button onClick={() => setPicked([])} className="text-xs font-semibold text-muted-foreground">
              Kosongkan pilihan
            </button>
          )}
        </div>
        {msg && <p className="mt-2 text-[11px] font-semibold text-primary">{msg}</p>}
      </section>

      <section className="space-y-3">
        {list.length === 0 && <p className="text-sm text-muted-foreground">Belum ada barang pada fase ini.</p>}
        {list.map((p) => {
          const life = lifecyclePrice(p);
          const meta = stageMeta[life.stage];
          const donationLeft = Math.max(0, DONATION_DAY - life.days);
          return (
            <article key={p.id} className="rounded-2xl border border-border bg-card p-3">
              <div className="flex gap-3">
                <label className="flex shrink-0 items-start">
                  <input
                    type="checkbox"
                    checked={picked.includes(p.id)}
                    onChange={() => togglePick(p.id)}
                    className="mt-1 h-4 w-4"
                  />
                </label>
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                  <ProductThumb product={p} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-xs font-bold">{p.name}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Tayang {life.days} hari · stok {p.stock} · {p.sold} terjual
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${meta.tone}`}>{meta.label}</span>
                    <span className="text-[11px] font-bold text-primary">{rupiah(life.price)}</span>
                    {life.discount > 0 && (
                      <span className="text-[10px] text-muted-foreground line-through">{rupiah(life.base)}</span>
                    )}
                  </div>
                  <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
                    {life.stage === "donasi" || life.stage === "upcycle"
                      ? meta.desc
                      : `Otomatis diikhlaskan untuk donasi dalam ${donationLeft} hari lagi bila belum terjual.`}
                  </p>
                  {p.lifecycleNote && (
                    <p className="mt-1 text-[10px] font-semibold text-primary">Catatan: {p.lifecycleNote}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <button
                      onClick={() =>
                        setLifecycle(
                          p.id,
                          "donasi",
                          "Disalurkan sebagai donasi sosial (panti asuhan / siswa jalur afirmasi).",
                        )
                      }
                      className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold text-primary-foreground"
                    >
                      <Gift className="h-3 w-3" /> Salurkan Donasi
                    </button>
                    <button
                      onClick={() =>
                        setLifecycle(p.id, "upcycle", "Diserahkan ke guru Prakarya sebagai bahan praktik siswa.")
                      }
                      className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold text-secondary-foreground"
                    >
                      <Scissors className="h-3 w-3" /> Daur Ulang Kreatif
                    </button>
                    <button
                      onClick={() => relistProduct(p.id)}
                      className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[10px] font-bold text-muted-foreground"
                    >
                      <RotateCcw className="h-3 w-3" /> Tayangkan Ulang
                    </button>
                    {life.discount > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-destructive/30 px-2.5 py-1 text-[10px] font-bold text-destructive">
                        <TrendingDown className="h-3 w-3" /> Auto −{life.discount}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}

/** Kelola flash sale koperasi: pilih barang, potongan, dan durasi. */
function PromoAdmin() {
  const { user, products, flashSales, addFlashSale, removeFlashSale } = useTooku();
  const mySchoolId = schoolIdForAccount({ username: user?.username, name: user?.name });
  const mine = products.filter((p) => p.schoolId === mySchoolId && p.stock > 0);
  const [title, setTitle] = useState("Flash Sale Koperasi");
  const [pct, setPct] = useState(15);
  const [hours, setHours] = useState(12);
  const [picked, setPicked] = useState<string[]>([]);
  const [msg, setMsg] = useState("");

  const active = flashSales.filter((f) => f.schoolId === mySchoolId && f.endsAt > Date.now());

  const toggle = (id: string) =>
    setPicked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <div className="space-y-4">
      <section className="space-y-3 rounded-2xl border border-border bg-card p-4">
        <h2 className="text-sm font-bold">Buat Flash Sale</h2>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nama promo"
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs text-muted-foreground">
            Potongan (%)
            <input
              type="number"
              min={1}
              max={90}
              value={pct}
              onChange={(e) => setPct(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="text-xs text-muted-foreground">
            Durasi (jam)
            <input
              type="number"
              min={1}
              max={72}
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </label>
        </div>
        <p className="text-[11px] font-semibold text-muted-foreground">Pilih barang yang ikut:</p>
        <div className="grid gap-1.5">
          {mine.length === 0 && <p className="text-xs text-muted-foreground">Belum ada barang aktif dengan stok.</p>}
          {mine.map((p) => (
            <label
              key={p.id}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs ${
                picked.includes(p.id) ? "border-primary bg-primary/5 font-semibold" : "border-border"
              }`}
            >
              <input type="checkbox" checked={picked.includes(p.id)} onChange={() => toggle(p.id)} className="h-4 w-4" />
              <span className="min-w-0 flex-1 truncate">{p.name}</span>
              <span className="shrink-0 text-muted-foreground">{rupiah(p.price)}</span>
            </label>
          ))}
        </div>
        {msg && <p className="text-[11px] font-semibold text-destructive">{msg}</p>}
        <button
          onClick={() => {
            const res = addFlashSale({ title, productIds: picked, discountPct: pct, hours });
            if (res.ok) {
              setPicked([]);
              setMsg("");
            } else setMsg(res.error ?? "Gagal membuat flash sale.");
          }}
          className="w-full rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground"
        >
          Jalankan Flash Sale ({picked.length} barang)
        </button>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-bold">Flash Sale Aktif ({active.length})</h2>
        {active.length === 0 && <p className="text-xs text-muted-foreground">Belum ada flash sale yang berjalan.</p>}
        {active.map((f) => (
          <div key={f.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold">{f.title}</p>
              <p className="text-[11px] text-muted-foreground">
                −{f.discountPct}% · {f.productIds.length} barang · berakhir{" "}
                {new Date(f.endsAt).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            <button
              onClick={() => removeFlashSale(f.id)}
              className="inline-flex items-center gap-1 rounded-full border border-destructive/30 px-2.5 py-1 text-[10px] font-bold text-destructive"
            >
              <Trash2 className="h-3 w-3" /> Hentikan
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}
