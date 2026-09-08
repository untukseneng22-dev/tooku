import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Bell, MessageCircle, ShieldCheck, Package, Tag, Clock } from "lucide-react";
import { useTooku } from "@/lib/tooku-store";

export const Route = createFileRoute("/notifikasi")({
  head: () => ({
    meta: [
      { title: "Notifikasi Pesanan & Promo — TOOKU" },
      {
        name: "description",
        content:
          "Pantau notifikasi status pesanan, promo terkurasi, dan pengingat batas ambil 1x24 jam di koperasi sekolah TOOKU.",
      },
      { property: "og:title", content: "Notifikasi Pesanan & Promo — TOOKU" },
      {
        property: "og:description",
        content: "Update status pesanan, promo koperasi, dan pengingat batas pengambilan barang.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NotifikasiPage,
});

type NotifKind = "pesanan" | "promo" | "sistem";
type Notif = {
  id: string;
  kind: NotifKind;
  title: string;
  body: string;
  time: string;
  read: boolean;
};

const seedNotifs: Notif[] = [
  {
    id: "n1",
    kind: "pesanan",
    title: "Pesanan siap diambil",
    body: "Kode TKU-8241 siap diambil di Koperasi Sekolah. Jangan lupa batas 1x24 jam.",
    time: "5 mnt lalu",
    read: false,
  },
  {
    id: "n2",
    kind: "promo",
    title: "Flash Koperasi hari ini",
    body: "Seragam & atribut layak pakai diskon hingga 70%. Stok terbatas!",
    time: "2 jam lalu",
    read: false,
  },
  {
    id: "n3",
    kind: "pesanan",
    title: "Pembayaran terkonfirmasi",
    body: "Pembayaran online kamu sudah lunas. Pesanan masuk tahap Diproses.",
    time: "Kemarin",
    read: true,
  },
  {
    id: "n4",
    kind: "sistem",
    title: "Barang baru lolos kurasi",
    body: "12 buku pelajaran kelas XI baru saja lolos kurasi koperasi.",
    time: "2 hari lalu",
    read: true,
  },
];

const NOTIF_KEY = "tooku.notifs.v1";

const kindMeta: Record<NotifKind, { label: string; icon: typeof Bell }> = {
  pesanan: { label: "Pesanan", icon: Package },
  promo: { label: "Promo", icon: Tag },
  sistem: { label: "Info", icon: ShieldCheck },
};

const fmtAgo = (at: number) => {
  const m = Math.max(0, Math.round((Date.now() - at) / 60000));
  if (m < 1) return "baru saja";
  if (m < 60) return `${m} mnt lalu`;
  if (m < 1440) return `${Math.floor(m / 60)} jam lalu`;
  return `${Math.floor(m / 1440)} hari lalu`;
};

function NotifikasiPage() {
  const { user, notifs: storeNotifs, markNotifRead, markAllNotifsRead } = useTooku();
  const [filter, setFilter] = useState<"semua" | NotifKind | "belum">("semua");

  // Gabung notifikasi nyata dari sistem (pesanan, promo) dengan info umum.
  const mine: (Notif & { realId?: string })[] = useMemo(() => {
    const real = storeNotifs
      .filter((n) => n.userId === null || n.userId === user?.id)
      .map((n) => ({
        id: n.id,
        realId: n.id,
        kind: n.kind,
        title: n.title,
        body: n.body,
        time: fmtAgo(n.at),
        read: n.read,
      }));
    return [...real, ...seedNotifs];
  }, [storeNotifs, user?.id]);

  const unread = mine.filter((n) => !n.read).length;
  const shown = useMemo(
    () => mine.filter((n) => (filter === "semua" ? true : filter === "belum" ? !n.read : n.kind === filter)),
    [mine, filter],
  );

  const filters: { key: typeof filter; label: string }[] = [
    { key: "semua", label: "Semua" },
    { key: "belum", label: `Belum dibaca${unread ? ` (${unread})` : ""}` },
    { key: "pesanan", label: "Pesanan" },
    { key: "promo", label: "Promo" },
    { key: "sistem", label: "Info" },
  ];

  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="bg-primary px-4 pb-4 pt-5 text-primary-foreground">
        <div className="mx-auto flex max-w-2xl items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-lg font-extrabold tracking-tight">Notifikasi</h1>
            <p className="text-[11px] opacity-80">
              {user ? `Hai ${user.name.split(" ")[0]}, ` : ""}update pesanan, promo, dan info koperasi
            </p>
          </div>
          <Link
            to="/chat"
            aria-label="Buka chat penjual"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-foreground/15"
          >
            <MessageCircle className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                filter === f.key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground">{shown.length} notifikasi</p>
          {unread > 0 && (
            <button onClick={() => markAllNotifsRead(user?.id ?? null)} className="text-[11px] font-bold text-primary">
              Tandai semua dibaca
            </button>
          )}
        </div>

        <div className="mt-3 space-y-2.5">
          {shown.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">Tidak ada notifikasi di filter ini.</p>
          ) : (
            shown.map((n) => {
              const Icon = kindMeta[n.kind].icon;
              return (
                <button
                  key={n.id}
                  onClick={() => n.realId && markNotifRead(n.realId)}
                  className={`flex w-full gap-3 rounded-2xl border p-3 text-left transition-colors ${
                    n.read ? "border-border bg-card" : "border-primary/30 bg-primary/5"
                  }`}
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-bold">{n.title}</span>
                      {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />}
                    </span>
                    <span className="mt-0.5 block text-[12px] leading-snug text-muted-foreground">{n.body}</span>
                    <span className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" /> {n.time} · {kindMeta[n.kind].label}
                    </span>
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
