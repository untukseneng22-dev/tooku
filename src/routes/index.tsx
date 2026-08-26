import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Zap, ShieldCheck, SlidersHorizontal, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useBaraka } from "@/lib/baraka-store";
import { categories, type Category } from "@/lib/baraka-data";
import { ProductCard } from "@/components/baraka/ui";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TOOKU — Marketplace Barang Sekolah Bekas Koperasi" },
      {
        name: "description",
        content:
          "TOOKU (Marketplace Koperasi Sekolah): beli seragam, buku, atribut, dan alat tulis bekas layak pakai yang lolos kurasi koperasi sekolah.",
      },
      { property: "og:title", content: "TOOKU — Marketplace Barang Sekolah Bekas Koperasi" },
      {
        property: "og:description",
        content: "Barang sekolah layak pakai, harga hemat, terkurasi koperasi. Booking online, ambil di koperasi.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { products } = useBaraka();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<Category | "Semua">("Semua");
  const [showFilter, setShowFilter] = useState(false);
  const [maxPrice, setMaxPrice] = useState(50000);
  const [minCondition, setMinCondition] = useState(0);
  const [sort, setSort] = useState<"populer" | "termurah" | "termahal" | "kondisi">("populer");

  const conditionPct = (c: string) => Number(c.match(/(\d+)%/)?.[1] ?? 0);

  const filtered = products
    .filter(
      (p) =>
        (cat === "Semua" || p.category === cat) &&
        p.price <= maxPrice &&
        conditionPct(p.condition) >= minCondition &&
        (p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase())),
    )
    .sort((a, b) =>
      sort === "termurah"
        ? a.price - b.price
        : sort === "termahal"
          ? b.price - a.price
          : sort === "kondisi"
            ? conditionPct(b.condition) - conditionPct(a.condition)
            : b.sold - a.sold,
    );
  const activeFilters = (maxPrice < 50000 ? 1 : 0) + (minCondition > 0 ? 1 : 0) + (sort !== "populer" ? 1 : 0);
  const featured = products.filter((p) => p.featured).slice(0, 6);

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-primary px-4 pb-6 pt-5 text-primary-foreground">
        <div className="mx-auto max-w-2xl">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <img
                src={logoAsset.url}
                alt="Logo TOOKU"
                className="h-10 w-10 shrink-0 rounded-2xl shadow-sm"
              />
              <p className="truncate text-[11px] opacity-80">Marketplace Koperasi Sekolah</p>
            </div>
            <Link
              to="/chat"
              aria-label="Chat penjual"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-foreground/15"
            >
              <MessageCircle className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-card px-3 py-2.5">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari seragam, buku, atribut…"
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl space-y-6 px-4">
        {/* Banner impact */}
        <div className="-mt-4 overflow-hidden rounded-3xl bg-gradient-to-br from-accent to-accent/70 p-4 text-accent-foreground shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wide opacity-80">Promo Awal Semester</p>
          <p className="mt-1 text-base font-extrabold leading-snug">Hemat hingga 70% untuk seragam & buku layak pakai</p>
          <p className="mt-1.5 flex items-center gap-1 text-[11px]">
            <ShieldCheck className="h-3.5 w-3.5" /> 1.248 barang terselamatkan · Rp18,4 jt dihemat siswa
          </p>
        </div>

        {/* Kategori */}
        <section>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {(["Semua", ...categories.map((c) => c.name)] as const).map((name) => {
              const icon = categories.find((c) => c.name === name)?.icon ?? "🛍️";
              const active = cat === name;
              return (
                <button
                  key={name}
                  onClick={() => setCat(name as Category | "Semua")}
                  className={`flex w-20 shrink-0 flex-col items-center gap-1.5 rounded-2xl border px-2 py-3 text-[10px] font-semibold ${
                    active ? "border-primary bg-primary/5 text-primary" : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  <span className="text-xl">{icon}</span>
                  <span className="truncate">{name}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Unggulan */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4 text-accent-foreground" />
            <h2 className="text-sm font-bold">Flash Unggulan Koperasi</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {featured.map((p) => (
              <div key={p.id} className="w-36 shrink-0">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>

        {/* Grid */}
        <section>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="truncate text-sm font-bold">{cat === "Semua" ? "Semua Barang Terkurasi" : cat}</h2>
            <button
              onClick={() => setShowFilter((v) => !v)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold transition-colors ${
                showFilter || activeFilters > 0
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground"
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" /> Filter
              {activeFilters > 0 && (
                <span className="grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[9px] text-accent-foreground">
                  {activeFilters}
                </span>
              )}
            </button>
          </div>

          {showFilter && (
            <div className="mb-4 space-y-4 rounded-2xl border border-border bg-card p-4">
              <div>
                <div className="flex items-center justify-between text-[11px] font-semibold">
                  <span>Harga maksimum</span>
                  <span className="text-primary">Rp{maxPrice.toLocaleString("id-ID")}</span>
                </div>
                <input
                  type="range"
                  min={5000}
                  max={50000}
                  step={1000}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="mt-2 w-full accent-primary"
                />
              </div>

              <div>
                <p className="text-[11px] font-semibold">Kondisi minimum</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[0, 70, 80, 90].map((v) => (
                    <button
                      key={v}
                      onClick={() => setMinCondition(v)}
                      className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold ${
                        minCondition === v
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      {v === 0 ? "Semua" : `${v}%+`}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[11px] font-semibold">Urutkan</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(
                    [
                      ["populer", "Terpopuler"],
                      ["termurah", "Harga termurah"],
                      ["termahal", "Harga tertinggi"],
                      ["kondisi", "Kondisi terbaik"],
                    ] as const
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setSort(key)}
                      className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold ${
                        sort === key
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  setMaxPrice(50000);
                  setMinCondition(0);
                  setSort("populer");
                }}
                className="w-full rounded-xl border border-border py-2 text-[11px] font-bold text-muted-foreground"
              >
                Reset filter
              </button>
            </div>
          )}
          {filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Barang tidak ditemukan.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
