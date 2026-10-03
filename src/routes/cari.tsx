import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Search, Store, X as XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useTooku } from "@/lib/tooku-store";
import { isSellable } from "@/lib/tooku-lifecycle";
import { schools } from "@/lib/tooku-data";
import { ProductCard, EmptyState } from "@/components/tooku/ui";
import { useSearchHistory } from "@/lib/tooku-recent";

type Sort = "populer" | "termurah" | "termahal" | "terbaru";

export const Route = createFileRoute("/cari")({
  validateSearch: (s: Record<string, unknown>) => ({
    q: typeof s.q === "string" ? s.q : "",
  }),
  head: () => ({
    meta: [
      { title: "Hasil Pencarian — TOOKU" },
      { name: "description", content: "Cari seragam, buku, dan perlengkapan sekolah bekas dari koperasi sekolah." },
      { property: "og:title", content: "Hasil Pencarian — TOOKU" },
      { property: "og:description", content: "Temukan barang sekolah layak pakai di koperasi terdekat." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const navigate = useNavigate();
  const { products: all } = useTooku();
  const { push } = useSearchHistory();
  const [input, setInput] = useState(q);
  const [sort, setSort] = useState<Sort>("populer");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => setInput(q), [q]);

  const term = q.trim().toLowerCase();
  const products = mounted ? all.filter((p) => isSellable(p)) : all;
  const results = term
    ? products
        .filter((p) =>
          [p.name, p.category, p.seller, ...Object.values(p.specs ?? {})].join(" ").toLowerCase().includes(term),
        )
        .sort((a, b) =>
          sort === "termurah"
            ? a.price - b.price
            : sort === "termahal"
              ? b.price - a.price
              : sort === "terbaru"
                ? (b.listedAt ?? 0) - (a.listedAt ?? 0)
                : b.sold - a.sold,
        )
    : [];
  const shops = term
    ? schools.filter((s) => [s.koperasi, s.name, s.district, s.level].join(" ").toLowerCase().includes(term))
    : [];

  const submit = () => {
    const t = input.trim();
    if (!t) return;
    push(t);
    void navigate({ to: "/cari", search: { q: t } });
  };

  const sorts: { k: Sort; l: string }[] = [
    { k: "populer", l: "Terlaris" },
    { k: "terbaru", l: "Terbaru" },
    { k: "termurah", l: "Termurah" },
    { k: "termahal", l: "Termahal" },
  ];

  return (
    <main className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-30 flex items-center gap-2 bg-primary px-3 py-2.5">
        <Link to="/" aria-label="Kembali" className="text-primary-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex flex-1 items-center gap-2 rounded-lg bg-background px-3 py-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Cari barang sekolah…"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            aria-label="Kata kunci pencarian"
          />
          {input && (
            <button onClick={() => setInput("")} aria-label="Hapus kata kunci" className="text-muted-foreground">
              <XIcon className="h-4 w-4" />
            </button>
          )}
        </div>
        <button
          onClick={submit}
          aria-label="Cari"
          className="grid h-9 w-9 place-items-center rounded-lg bg-accent text-accent-foreground"
        >
          <Search className="h-4 w-4" />
        </button>
      </header>

      <div className="sticky top-[52px] z-20 flex border-b border-border bg-card">
        {sorts.map((s) => (
          <button
            key={s.k}
            onClick={() => setSort(s.k)}
            className={`flex-1 py-2.5 text-xs font-semibold ${
              sort === s.k ? "border-b-2 border-primary text-primary" : "text-muted-foreground"
            }`}
          >
            {s.l}
          </button>
        ))}
      </div>

      <div className="mx-auto max-w-5xl space-y-4 px-3 py-3">
        <p className="text-xs text-muted-foreground">
          {term ? (
            <>
              {results.length} hasil untuk <span className="font-semibold text-foreground">"{q}"</span>
            </>
          ) : (
            "Ketik kata kunci untuk mulai mencari."
          )}
        </p>

        {shops.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-xs font-bold">Koperasi terkait</h2>
            {shops.slice(0, 3).map((s) => (
              <Link
                key={s.id}
                to="/koperasi/$id"
                params={{ id: s.id }}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
              >
                <Store className="h-5 w-5 text-primary" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{s.koperasi}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {s.level} · {s.district}
                  </p>
                </div>
              </Link>
            ))}
          </section>
        )}

        {term && results.length === 0 ? (
          <EmptyState
            icon={Search}
            title="Barang tidak ditemukan"
            desc="Coba kata kunci lain, misalnya “seragam”, “buku”, atau “dasi”."
            cta={{ to: "/", label: "Kembali ke Beranda" }}
          />
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {results.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
