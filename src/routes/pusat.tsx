import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Activity,
  BadgeCheck,
  Ban,
  Building2,
  CheckCircle2,
  ClipboardList,
  Headphones,
  LogOut,
  MessageCircle,
  ShieldAlert,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";
import { useTooku, roleLabel, type Order, type User } from "@/lib/tooku-store";
import { rupiah, schools, schoolById } from "@/lib/tooku-data";

export const Route = createFileRoute("/pusat")({
  head: () => ({
    meta: [
      { title: "Konsol Admin Pusat — TOOKU" },
      {
        name: "description",
        content:
          "Konsol Admin Pusat TOOKU: pantau seluruh aktivitas dan transaksi koperasi sekolah, setujui pendaftaran akun, dan layani pertanyaan pembeli.",
      },
      { property: "og:title", content: "Konsol Admin Pusat — TOOKU" },
      {
        property: "og:description",
        content: "Pemantauan transaksi lintas koperasi, persetujuan akun, dan call center TOOKU.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PusatPage,
});

type Tab = "monitor" | "transaksi" | "akun" | "callcenter" | "voucher" | "laporan";

const tabs: { id: Tab; label: string; icon: typeof Activity }[] = [
  { id: "monitor", label: "Pemantauan", icon: Activity },
  { id: "transaksi", label: "Transaksi", icon: ClipboardList },
  { id: "akun", label: "Persetujuan Akun", icon: UserCheck },
  { id: "callcenter", label: "Call Center", icon: Headphones },
  { id: "voucher", label: "Voucher Promo", icon: BadgeCheck },
  { id: "laporan", label: "Laporan Produk", icon: ShieldAlert },
];

function StatCard({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: string;
  icon: typeof Activity;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10">
        <Icon className="h-4.5 w-4.5 text-primary" />
      </span>
      <p className="mt-2.5 truncate text-xl font-extrabold text-primary">{value}</p>
      <p className="text-[11px] font-semibold text-foreground">{label}</p>
      {hint && <p className="mt-0.5 text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Monitor() {
  const { orders, products, users, reviews, pendingUsers } = useTooku();

  const revenue = orders.filter((o) => o.status === "Selesai").reduce((s, o) => s + o.total, 0);
  const gmv = orders.filter((o) => o.status !== "Dibatalkan").reduce((s, o) => s + o.total, 0);
  const perSchool = useMemo(
    () =>
      schools
        .map((sc) => {
          const items = products.filter((p) => p.schoolId === sc.id);
          const sold = items.reduce((s, p) => s + (p.sold ?? 0), 0);
          const rv = reviews.filter((r) => r.schoolId === sc.id);
          const rating = rv.length ? rv.reduce((s, r) => s + r.rating, 0) / rv.length : 0;
          return { sc, produk: items.length, sold, rating, ulasan: rv.length };
        })
        .sort((a, b) => b.sold - a.sold),
    [products, reviews],
  );
  const maxSold = Math.max(1, ...perSchool.map((r) => r.sold));

  const recent = [...orders].sort((a, b) => b.createdAt - a.createdAt).slice(0, 6);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total Transaksi" value={String(orders.length)} icon={ClipboardList} hint="seluruh koperasi" />
        <StatCard label="Nilai Transaksi (GMV)" value={rupiah(gmv)} icon={Wallet} hint={`Selesai: ${rupiah(revenue)}`} />
        <StatCard label="Koperasi Sekolah Aktif" value={String(schools.length)} icon={Building2} hint="se-Kab. Magetan" />
        <StatCard
          label="Akun Terdaftar"
          value={String(users.length)}
          icon={Users}
          hint={`${pendingUsers.length} menunggu persetujuan`}
        />
      </div>

      {pendingUsers.length > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-accent/50 bg-accent/10 p-4">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-accent-foreground" />
          <p className="text-xs">
            <span className="font-bold">{pendingUsers.length} pendaftaran akun baru</span> menunggu keputusan Admin
            Pusat. Buka tab <span className="font-semibold">Persetujuan Akun</span> untuk menyetujui atau menolak.
          </p>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-4">
        <h2 className="text-sm font-bold">Kinerja Koperasi Sekolah</h2>
        <p className="mt-0.5 text-[11px] text-muted-foreground">Barang terjual, jumlah produk, dan rating pelayanan.</p>
        <div className="mt-3 space-y-3">
          {perSchool.map((r) => (
            <div key={r.sc.id} className="space-y-1.5">
              <div className="flex items-baseline justify-between gap-3 text-xs">
                <Link to="/koperasi/$id" params={{ id: r.sc.id }} className="min-w-0 truncate font-semibold">
                  {r.sc.koperasi}
                </Link>
                <span className="shrink-0 text-[11px] text-muted-foreground">
                  {r.produk} produk · {r.sold} terjual · ⭐ {r.rating ? r.rating.toFixed(1) : "-"} ({r.ulasan})
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-accent" style={{ width: `${(r.sold / maxSold) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <h2 className="text-sm font-bold">Aktivitas Terbaru</h2>
        <div className="mt-3 space-y-2">
          {recent.map((o) => (
            <div key={o.id} className="flex items-center gap-3 rounded-xl border border-border p-3 text-xs">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10">
                <Activity className="h-4 w-4 text-primary" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">
                  {o.code} · {o.buyer}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {o.items.length} item · {o.status} · {o.paymentStatus}
                </p>
              </div>
              <span className="shrink-0 font-bold text-primary">{rupiah(o.total)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TransaksiRow({ order }: { order: Order }) {
  const { products } = useTooku();
  const asal = Array.from(
    new Set(
      order.items
        .map((i) => products.find((p) => p.id === i.productId)?.schoolId)
        .filter(Boolean)
        .map((id) => schoolById(id as string)?.koperasi ?? "-"),
    ),
  );

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
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
      <p className="mt-2 text-[11px] text-muted-foreground">Koperasi: {asal.join(", ") || "-"}</p>
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
        <span className="text-muted-foreground">
          {new Date(order.createdAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
        </span>
      </div>
      <p className="mt-2 text-sm font-bold text-primary">{rupiah(order.total)}</p>
    </div>
  );
}

function Transaksi() {
  const { orders } = useTooku();
  const [q, setQ] = useState("");
  const list = orders.filter(
    (o) =>
      o.code.toLowerCase().includes(q.trim().toLowerCase()) ||
      o.buyer.toLowerCase().includes(q.trim().toLowerCase()),
  );

  return (
    <div className="space-y-3">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Cari kode pesanan atau nama pembeli…"
        className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
      />
      <p className="text-[11px] text-muted-foreground">
        Admin Pusat memantau seluruh transaksi lintas koperasi (tanpa mengubah proses koperasi).
      </p>
      <div className="grid gap-3 lg:grid-cols-2">
        {list.length === 0 ? (
          <p className="text-sm text-muted-foreground">Transaksi tidak ditemukan.</p>
        ) : (
          list.map((o) => <TransaksiRow key={o.id} order={o} />)
        )}
      </div>
    </div>
  );
}

function AccountRow({ u }: { u: User }) {
  const { approveUser, rejectUser, orders, user } = useTooku();
  const tx = orders.filter((o) => o.userId === u.id);
  const total = tx.reduce((s, o) => s + o.total, 0);

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
          {u.name.slice(0, 2).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{u.name}</p>
          <p className="truncate text-[11px] text-muted-foreground">
            @{u.username} · {roleLabel[u.role]}
            {u.kelas ? ` · ${u.kelas}` : ""}
          </p>
          <p className="truncate text-[11px] text-muted-foreground">{u.email}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Daftar {new Date(u.registeredAt).toLocaleDateString("id-ID", { dateStyle: "medium" })} · {tx.length}{" "}
            transaksi · {rupiah(total)}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
            u.status === "aktif"
              ? "bg-primary/10 text-primary"
              : u.status === "menunggu"
                ? "bg-accent/20 text-accent-foreground"
                : "bg-destructive/10 text-destructive"
          }`}
        >
          {u.status === "aktif" ? "Aktif" : u.status === "menunggu" ? "Menunggu" : "Ditolak"}
        </span>
      </div>

      {u.status === "menunggu" && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => approveUser(u.id)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2.5 text-xs font-bold text-primary-foreground"
          >
            <CheckCircle2 className="h-4 w-4" /> Setujui
          </button>
          <button
            onClick={() => rejectUser(u.id, "Data belum sesuai verifikasi pusat")}
            className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2.5 text-xs font-semibold text-destructive"
          >
            <Ban className="h-4 w-4" /> Tolak
          </button>
        </div>
      )}
      {u.status === "ditolak" && u.note && (
        <p className="mt-2 text-[11px] text-destructive">Alasan: {u.note}</p>
      )}
      {u.status === "aktif" && u.id !== user?.id && (
        <button
          onClick={() => rejectUser(u.id, "Dinonaktifkan Admin Pusat")}
          className="mt-3 text-[11px] font-semibold text-destructive"
        >
          Nonaktifkan akun
        </button>
      )}
    </div>
  );
}

function Akun() {
  const { users, pendingUsers } = useTooku();
  const [filter, setFilter] = useState<"menunggu" | "aktif" | "ditolak" | "semua">("menunggu");
  const list = users.filter((u) => filter === "semua" || u.status === filter);

  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto">
        {(["menunggu", "aktif", "ditolak", "semua"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold capitalize ${
              filter === f ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"
            }`}
          >
            {f}
            {f === "menunggu" && pendingUsers.length > 0 ? ` (${pendingUsers.length})` : ""}
          </button>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground">
        Pendaftaran akun Pembeli maupun Admin Koperasi baru harus disetujui Admin Pusat sebelum bisa masuk.
      </p>
      <div className="grid gap-3 lg:grid-cols-2">
        {list.length === 0 ? (
          <p className="text-sm text-muted-foreground">Tidak ada akun pada filter ini.</p>
        ) : (
          list.map((u) => <AccountRow key={u.id} u={u} />)
        )}
      </div>
    </div>
  );
}

function CallCenter() {
  const { users } = useTooku();
  const buyers = users.filter((u) => u.role === "buyer" && u.status === "aktif");
  const koperasi = users.filter((u) => u.role === "admin" && u.status === "aktif");

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10">
            <Headphones className="h-5 w-5 text-primary" />
          </span>
          <div>
            <h2 className="text-sm font-bold">Call Center TOOKU</h2>
            <p className="text-[11px] text-muted-foreground">
              Jawab pertanyaan pembeli dan koperasi sekolah dari satu tempat.
            </p>
          </div>
        </div>
        <Link
          to="/chat"
          className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground"
        >
          <MessageCircle className="h-4 w-4" /> Buka Ruang Percakapan
        </Link>
        <div className="mt-3 grid grid-cols-2 gap-3 text-center">
          <div className="rounded-xl border border-border p-3">
            <p className="text-lg font-extrabold text-primary">{buyers.length}</p>
            <p className="text-[10px] text-muted-foreground">Pembeli aktif</p>
          </div>
          <div className="rounded-xl border border-border p-3">
            <p className="text-lg font-extrabold text-primary">{koperasi.length}</p>
            <p className="text-[10px] text-muted-foreground">Koperasi sekolah</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <h3 className="text-sm font-bold">Panduan Jawaban Cepat</h3>
        <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
          <li>• Batas pengambilan pesanan 1x24 jam sejak booking.</li>
          <li>• Pembayaran bisa online atau bayar di koperasi saat pengambilan.</li>
          <li>• Semua barang dikurasi koperasi sekolah asal (termasuk titipan alumni).</li>
          <li>• Keluhan pelayanan koperasi diteruskan ke admin koperasi terkait.</li>
        </ul>
      </div>
    </div>
  );
}

/** Kelola voucher promo yang berlaku di seluruh aplikasi. */
function VoucherAdmin() {
  const { vouchers, upsertVoucher } = useTooku();
  const [code, setCode] = useState("");
  const [kind, setKind] = useState<"nominal" | "percent" | "ongkir">("nominal");
  const [value, setValue] = useState(5000);
  const [minSpend, setMinSpend] = useState(0);
  const [desc, setDesc] = useState("");
  const [msg, setMsg] = useState("");

  return (
    <div className="space-y-4">
      <section className="space-y-3 rounded-2xl border border-border bg-card p-4">
        <h2 className="text-sm font-bold">Buat Voucher Baru</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Kode voucher (mis. TOOKU10)"
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm uppercase outline-none focus:border-primary"
          />
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as typeof kind)}
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="nominal">Potongan nominal (Rp)</option>
            <option value="percent">Potongan persen (%)</option>
            <option value="ongkir">Gratis ongkir</option>
          </select>
          {kind !== "ongkir" && (
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              placeholder={kind === "percent" ? "Persen (1–100)" : "Nominal (Rp)"}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          )}
          <input
            type="number"
            value={minSpend}
            onChange={(e) => setMinSpend(Number(e.target.value))}
            placeholder="Min. belanja (Rp, 0 = bebas)"
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <input
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Deskripsi singkat"
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary sm:col-span-2"
          />
        </div>
        {msg && <p className="text-[11px] font-semibold text-destructive">{msg}</p>}
        <button
          onClick={() => {
            if (!code.trim()) return setMsg("Kode voucher wajib diisi.");
            const res = upsertVoucher({
              code: code.trim().toUpperCase(),
              kind,
              value: kind === "ongkir" ? 1 : value,
              minSpend,
              desc: desc.trim() || "Voucher promo TOOKU",
              active: true,
            });
            if (res.ok) {
              setCode("");
              setDesc("");
              setMsg("");
            } else setMsg(res.error ?? "Gagal menyimpan voucher.");
          }}
          className="w-full rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground"
        >
          Simpan Voucher
        </button>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-bold">Daftar Voucher ({vouchers.length})</h2>
        {vouchers.map((v) => (
          <div key={v.code} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-extrabold tracking-wide">{v.code}</p>
              <p className="text-[11px] text-muted-foreground">
                {v.kind === "nominal"
                  ? `Potongan ${rupiah(v.value)}`
                  : v.kind === "percent"
                    ? `Potongan ${v.value}%`
                    : "Gratis ongkir"}
                {v.minSpend > 0 ? ` · min. belanja ${rupiah(v.minSpend)}` : ""}
              </p>
              <p className="text-[10px] text-muted-foreground">{v.desc}</p>
            </div>
            <button
              onClick={() => upsertVoucher({ ...v, active: !v.active })}
              className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-bold ${
                v.active ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
              }`}
            >
              {v.active ? "Aktif — matikan" : "Nonaktif — hidupkan"}
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}

/** Moderasi laporan produk dari pembeli. */
function Laporan() {
  const { reports, setReportStatus, removeProduct } = useTooku();
  const open = reports.filter((r) => r.status !== "selesai");
  const done = reports.filter((r) => r.status === "selesai");

  const Row = ({ r }: { r: (typeof reports)[number] }) => (
    <div className="space-y-2 rounded-2xl border border-border bg-card p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-xs font-bold">{r.productName}</p>
          <p className="text-[11px] text-muted-foreground">
            Dilaporkan oleh {r.reporter} · {new Date(r.at).toLocaleDateString("id-ID")}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
            r.status === "selesai" ? "bg-primary/10 text-primary" : "bg-accent/20 text-accent-foreground"
          }`}
        >
          {r.status}
        </span>
      </div>
      <p className="rounded-xl bg-secondary/60 p-2 text-[11px] leading-snug">{r.reason}</p>
      {r.status !== "selesai" && (
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setReportStatus(r.id, "diproses")}
            className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold text-secondary-foreground"
          >
            Tandai Diproses
          </button>
          <button
            onClick={() => setReportStatus(r.id, "selesai")}
            className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold text-primary-foreground"
          >
            Selesai — Barang Aman
          </button>
          <button
            onClick={() => {
              removeProduct(r.productId);
              setReportStatus(r.id, "selesai");
            }}
            className="rounded-full border border-destructive/30 px-2.5 py-1 text-[10px] font-bold text-destructive"
          >
            Hapus Produk
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <section className="space-y-2">
        <h2 className="text-sm font-bold">Perlu Ditindaklanjuti ({open.length})</h2>
        {open.length === 0 && (
          <p className="rounded-2xl border border-border bg-card p-4 text-xs text-muted-foreground">
            Tidak ada laporan produk yang menunggu tindakan.
          </p>
        )}
        {open.map((r) => (
          <Row key={r.id} r={r} />
        ))}
      </section>
      {done.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-bold">Riwayat Selesai ({done.length})</h2>
          {done.map((r) => (
            <Row key={r.id} r={r} />
          ))}
        </section>
      )}
    </div>
  );
}

function PusatPage() {
  const { user, isSuperAdmin, logout, pendingUsers } = useTooku();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("monitor");

  if (!isSuperAdmin) {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <ShieldAlert className="mx-auto h-10 w-10 text-primary" />
        <h1 className="mt-4 text-lg font-bold">Konsol Admin Pusat</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {user
            ? "Akunmu tidak memiliki akses Admin Pusat TOOKU."
            : "Masuk dengan akun Admin Pusat untuk membuka konsol pemantauan."}
        </p>
        <Link
          to="/auth"
          className="mt-5 inline-block rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground"
        >
          Masuk sebagai Admin Pusat
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
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-foreground/15">
            <BadgeCheck className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold">Konsol Admin Pusat TOOKU</p>
            <p className="truncate text-[11px] opacity-80">
              {user?.name} · @{user?.username}
            </p>
          </div>
          <button
            onClick={() => {
              logout();
              navigate({ to: "/auth" });
            }}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1.5 text-[11px] font-semibold"
          >
            <LogOut className="h-3.5 w-3.5" /> Keluar
          </button>
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
              {t.id === "akun" && pendingUsers.length > 0 && (
                <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
                  {pendingUsers.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        <main className="min-w-0 flex-1 pb-10">
          {tab === "monitor" && <Monitor />}
          {tab === "transaksi" && <Transaksi />}
          {tab === "akun" && <Akun />}
          {tab === "callcenter" && <CallCenter />}
          {tab === "voucher" && <VoucherAdmin />}
          {tab === "laporan" && <Laporan />}
        </main>
      </div>
    </div>
  );
}
