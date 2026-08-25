import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, MessageCircle, Send, ShieldCheck, Package, Tag, Clock } from "lucide-react";
import { useBaraka } from "@/lib/baraka-store";

export const Route = createFileRoute("/notifikasi")({
  validateSearch: (search: Record<string, unknown>) => ({
    tab: search["tab"] === "chat" ? ("chat" as const) : undefined,
    penjual: typeof search["penjual"] === "string" ? (search["penjual"] as string) : undefined,
    produk: typeof search["produk"] === "string" ? (search["produk"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Notifikasi & Chat Koperasi — BARAKA" },
      {
        name: "description",
        content:
          "Pantau notifikasi pesanan, promo, dan pengingat batas ambil BARAKA, serta chat langsung dengan admin koperasi sekolah.",
      },
      { property: "og:title", content: "Notifikasi & Chat Koperasi — BARAKA" },
      {
        property: "og:description",
        content: "Update status pesanan, promo terkurasi, dan tanya jawab cepat dengan koperasi sekolah.",
      },
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
    body: "Kode BRK-8241 siap diambil di Koperasi Sekolah. Jangan lupa batas 1x24 jam.",
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

type ChatMsg = { id: string; from: "me" | "koperasi"; text: string; time: string };

const seedChat: ChatMsg[] = [
  { id: "c1", from: "koperasi", text: "Halo! Ada yang bisa koperasi bantu? 😊", time: "08:40" },
  { id: "c2", from: "me", text: "Seragam putih ukuran M masih ada?", time: "08:42" },
  {
    id: "c3",
    from: "koperasi",
    text: "Masih ada 3 pcs, kondisi Sangat Baik (90%). Bisa dibooking lewat aplikasi ya.",
    time: "08:43",
  },
];

const NOTIF_KEY = "baraka.notifs.v1";
const CHAT_KEY = "baraka.chat.v1";

const kindMeta: Record<NotifKind, { label: string; icon: typeof Bell }> = {
  pesanan: { label: "Pesanan", icon: Package },
  promo: { label: "Promo", icon: Tag },
  sistem: { label: "Info", icon: ShieldCheck },
};

function NotifikasiPage() {
  const { user } = useBaraka();
  const { tab: tabParam, penjual, produk } = Route.useSearch();
  const [tab, setTab] = useState<"notif" | "chat">(tabParam === "chat" ? "chat" : "notif");
  const [notifs, setNotifs] = useState<Notif[]>(seedNotifs);
  const [chat, setChat] = useState<ChatMsg[]>(seedChat);
  const [draft, setDraft] = useState(produk ? `Halo, saya mau tanya soal "${produk}". Apakah masih tersedia?` : "");
  const [filter, setFilter] = useState<"semua" | NotifKind | "belum">("semua");
  const [hydrated, setHydrated] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const n = localStorage.getItem(NOTIF_KEY);
      if (n) setNotifs(JSON.parse(n));
      const c = localStorage.getItem(CHAT_KEY);
      if (c) setChat(JSON.parse(c));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(NOTIF_KEY, JSON.stringify(notifs));
    localStorage.setItem(CHAT_KEY, JSON.stringify(chat));
  }, [hydrated, notifs, chat]);

  useEffect(() => {
    if (tab === "chat") endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [tab, chat]);

  const unread = notifs.filter((n) => !n.read).length;
  const shown = useMemo(
    () =>
      notifs.filter((n) => (filter === "semua" ? true : filter === "belum" ? !n.read : n.kind === filter)),
    [notifs, filter],
  );

  function send() {
    const text = draft.trim();
    if (!text) return;
    const time = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    const mine: ChatMsg = { id: `c${Date.now()}`, from: "me", text, time };
    setChat((prev) => [...prev, mine]);
    setDraft("");
    setTimeout(() => {
      setChat((prev) => [
        ...prev,
        {
          id: `c${Date.now() + 1}`,
          from: "koperasi",
          text: "Terima kasih! Pesan kamu sudah diterima admin koperasi, akan dibalas pada jam operasional (07.00–15.00).",
          time,
        },
      ]);
    }, 900);
  }

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
        <div className="mx-auto max-w-2xl">
          <h1 className="text-lg font-extrabold tracking-tight">Notifikasi & Chat</h1>
          <p className="text-[11px] opacity-80">
            {user ? `Hai ${user.name.split(" ")[0]}, ` : ""}update pesanan dan tanya jawab dengan koperasi
          </p>

          <div className="mt-4 grid grid-cols-2 gap-1 rounded-2xl bg-primary-foreground/15 p-1">
            <button
              onClick={() => setTab("notif")}
              className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all ${
                tab === "notif" ? "bg-card text-foreground shadow" : "text-primary-foreground/80"
              }`}
            >
              <Bell className="h-4 w-4" /> Notifikasi
              {unread > 0 && (
                <span className="grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[9px] font-bold text-accent-foreground">
                  {unread}
                </span>
              )}
            </button>
            <button
              onClick={() => setTab("chat")}
              className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all ${
                tab === "chat" ? "bg-card text-foreground shadow" : "text-primary-foreground/80"
              }`}
            >
              <MessageCircle className="h-4 w-4" /> Chat Koperasi
            </button>
          </div>
        </div>
      </header>

      {tab === "notif" ? (
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
              <button
                onClick={() => setNotifs((prev) => prev.map((n) => ({ ...n, read: true })))}
                className="text-[11px] font-bold text-primary"
              >
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
                    onClick={() => setNotifs((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))}
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
      ) : (
        <div className="mx-auto max-w-2xl px-4 py-4">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {(penjual ?? "Koperasi").slice(0, 2).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{penjual ?? "Admin Koperasi Sekolah"}</p>
              <p className="truncate text-[11px] text-muted-foreground">
                {produk ? `Tentang: ${produk}` : "Online · balas cepat 07.00–15.00"}
              </p>

            </div>
          </div>

          <div className="mt-3 space-y-2.5">
            {chat.map((m) => (
              <div key={m.id} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[78%] rounded-2xl px-3 py-2 text-[13px] leading-snug shadow-sm ${
                    m.from === "me"
                      ? "rounded-br-md bg-primary text-primary-foreground"
                      : "rounded-bl-md border border-border bg-card text-foreground"
                  }`}
                >
                  {m.text}
                  <span
                    className={`mt-1 block text-[10px] ${
                      m.from === "me" ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    {m.time}
                  </span>
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <div className="fixed inset-x-0 bottom-[68px] z-40 border-t border-border bg-card p-3">
            <div className="mx-auto flex max-w-2xl items-center gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Tulis pesan ke koperasi…"
                className="min-w-0 flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
              <button
                onClick={send}
                aria-label="Kirim pesan"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground active:scale-95"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
