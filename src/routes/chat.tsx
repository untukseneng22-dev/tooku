import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, MessageCircle, Search, Send, Store } from "lucide-react";
import { schools } from "@/lib/tooku-data";
import { useTooku } from "@/lib/tooku-store";

export const Route = createFileRoute("/chat")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { penjual?: string | undefined; produk?: string | undefined } => ({
    penjual: typeof search["penjual"] === "string" ? search["penjual"] : undefined,
    produk: typeof search["produk"] === "string" ? search["produk"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Chat Penjual & Koperasi — TOOKU" },
      {
        name: "description",
        content:
          "Chat langsung dengan para penjual barang sekolah bekas dan admin koperasi TOOKU untuk tanya stok, ukuran, dan kondisi barang.",
      },
      { property: "og:title", content: "Chat Penjual & Koperasi — TOOKU" },
      {
        property: "og:description",
        content: "Tanya stok, ukuran, dan kondisi barang langsung ke penjual atau admin koperasi sekolah.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ChatPage,
});

type ChatMsg = { id: string; from: "me" | "them"; text: string; time: string };
type Threads = Record<string, ChatMsg[]>;

const KOPERASI = "Admin Koperasi Sekolah";
const CHAT_KEY = "tooku.chats.v1";

const seedThreads: Threads = {
  [KOPERASI]: [
    { id: "k1", from: "them", text: "Halo! Ada yang bisa koperasi bantu? 😊", time: "08:40" },
    { id: "k2", from: "me", text: "Kalau pesan hari ini, batas ambilnya kapan?", time: "08:42" },
    {
      id: "k3",
      from: "them",
      text: "Batas ambil 1x24 jam sejak booking ya, tunjukkan kode pengambilan di meja koperasi.",
      time: "08:43",
    },
  ],
  "Alumni 2024 — Kelas XII IPA 2": [
    { id: "s1", from: "them", text: "Seragam putih ukuran M masih ada 4 pcs kak 🙌", time: "07:55" },
  ],
  "Rafi — XII IPS 1": [
    { id: "s2", from: "me", text: "Buku Matematika kelas XI masih ada?", time: "Kemarin" },
    { id: "s3", from: "them", text: "Masih ada, kondisi baik 80%. Boleh dibooking lewat aplikasi.", time: "Kemarin" },
  ],
};

function autoReply(name: string, asAdmin: boolean) {
  if (asAdmin) return `Terima kasih infonya! Saya (${name}) akan ambil barangnya di koperasi sesuai kode pengambilan 🙏`;
  return name === KOPERASI
    ? "Pesan kamu diterima admin koperasi, akan dibalas pada jam operasional (07.00–15.00)."
    : "Siap kak! Barangnya masih tersedia. Silakan booking lewat aplikasi, pengambilan di koperasi sekolah ya 🙏";
}

function ChatPage() {
  const { user, users, isAdmin, products } = useTooku();
  const { penjual, produk } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [threads, setThreads] = useState<Threads>(seedThreads);
  const [hydrated, setHydrated] = useState(false);
  const [q, setQ] = useState("");
  const [draft, setDraft] = useState(produk ? `Halo, saya mau tanya soal "${produk}". Apakah masih tersedia?` : "");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CHAT_KEY);
      if (raw) setThreads({ ...seedThreads, ...(JSON.parse(raw) as Threads) });
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(CHAT_KEY, JSON.stringify(threads));
  }, [hydrated, threads]);

  useEffect(() => {
    if (penjual) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [penjual, threads]);

  // Pembeli bisa chat langsung ke admin koperasi & para penjual (seller) barang;
  // admin koperasi melihat semua percakapan dari pembeli.
  const contacts = useMemo(() => {
    // Penjual di TOOKU hanya koperasi sekolah (lintas sekolah se-Kab. Magetan).
    const sellerNames = Array.from(new Set([...schools.map((sc) => sc.koperasi), ...products.map((p) => p.seller)]));
    const list = isAdmin
      ? Array.from(
          new Set([
            ...users.filter((u) => u.role === "buyer").map((u) => u.name),
            ...Object.keys(threads).filter((k) => k !== KOPERASI && !sellerNames.includes(k)),
          ]),
        )
      : Array.from(new Set([KOPERASI, ...sellerNames, ...Object.keys(threads)]));
    return list.filter((s) => s.toLowerCase().includes(q.trim().toLowerCase()));
  }, [isAdmin, users, threads, q, products]);

  const active = penjual ?? null;
  const messages = (active && threads[active]) || [];

  function send() {
    const text = draft.trim();
    if (!text || !active) return;
    const time = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    setThreads((prev) => ({
      ...prev,
      [active]: [...(prev[active] ?? []), { id: `m${Date.now()}`, from: "me", text, time }],
    }));
    setDraft("");
    setTimeout(() => {
      setThreads((prev) => ({
        ...prev,
        [active]: [...(prev[active] ?? []), { id: `m${Date.now() + 1}`, from: "them", text: autoReply(active, isAdmin), time }],
      }));
    }, 900);
  }

  if (!active) {
    return (
      <div className="min-h-screen bg-background pb-28">
        <header className="bg-primary px-4 pb-4 pt-5 text-primary-foreground">
          <div className="mx-auto max-w-2xl">
            <h1 className="text-lg font-extrabold tracking-tight">Chat</h1>
            <p className="text-[11px] opacity-80">
              {user ? `Hai ${user.name.split(" ")[0]}, ` : ""}
              {isAdmin ? "balas pertanyaan para pembeli" : "tanya langsung ke penjual & admin koperasi"}
            </p>
            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-card px-3 py-2.5">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={isAdmin ? "Cari pembeli…" : "Cari penjual atau koperasi…"}
                className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>

          </div>
        </header>

        <div className="mx-auto max-w-2xl px-4 py-4">
          <div className="space-y-2.5">
            {contacts.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">{isAdmin ? "Pembeli tidak ditemukan." : "Penjual tidak ditemukan."}</p>
            ) : (
              contacts.map((s: string) => {
                const msgs = threads[s] ?? [];
                const last = msgs[msgs.length - 1];
                return (
                  <button
                    key={s}
                    onClick={() => navigate({ search: { penjual: s } })}
                    className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left transition-colors active:bg-secondary"
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {s.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-bold">{s}</span>
                        {last && <span className="shrink-0 text-[10px] text-muted-foreground">{last.time}</span>}
                      </span>
                      <span className="mt-0.5 block truncate text-[12px] text-muted-foreground">
                        {last
                          ? last.text
                          : isAdmin
                            ? "Mulai percakapan dengan pembeli"
                            : "Tanya stok, ukuran, atau kondisi barang"}
                      </span>
                    </span>
                  </button>
                );
              })
            )}
          </div>
          <p className="mt-4 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <MessageCircle className="h-3.5 w-3.5" /> Semua transaksi tetap lewat koperasi agar aman.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-36">
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-primary px-3 py-3 text-primary-foreground">
        <button
          onClick={() => navigate({ search: {} })}
          aria-label="Kembali ke daftar chat"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-foreground/15"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-foreground/20 text-[11px] font-bold">
          {active.slice(0, 2).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{active}</p>
          <p className="truncate text-[11px] opacity-80">
            {produk ? `Tentang: ${produk}` : "Online · balas cepat 07.00–15.00"}
          </p>
        </div>
        <Store className="h-4 w-4 shrink-0 opacity-80" />
      </header>

      <div className="mx-auto max-w-2xl space-y-2.5 px-4 py-4">
        {messages.length === 0 && (
          <p className="py-8 text-center text-[12px] text-muted-foreground">
            Belum ada pesan. {isAdmin ? "Sapa pembelinya dulu yuk!" : "Sapa admin koperasinya dulu yuk!"}
          </p>
        )}
        {messages.map((m) => (
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
            placeholder="Tulis pesan…"
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
  );
}
