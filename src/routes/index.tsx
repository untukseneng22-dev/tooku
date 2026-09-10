import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Search,
  Zap,
  ShieldCheck,
  SlidersHorizontal,
  MessageCircle,
  ShoppingCart,
  Store,
  TrendingUp,
  Clock,
  X as XIcon,
} from "lucide-react";
import { useRef, useState } from "react";
import { useTooku } from "@/lib/tooku-store";
import { isSellable, isClearance, lifecyclePrice } from "@/lib/tooku-lifecycle";
import { categories, schools, schoolById, type Category, type SchoolLevel } from "@/lib/tooku-data";
import { ProductCard } from "@/components/tooku/ui";
import { PromoCarousel } from "@/components/tooku/promo-carousel";
import { FlashSaleSection } from "@/components/tooku/flash-sale";
import { useRecentlyViewed, useSearchHistory } from "@/lib/tooku-recent";
import { HScroll, ScrollDownHint } from "@/components/tooku/scroll-hint";

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
  const { products: allProducts, cart, user } = useTooku();
  // Barang yang sudah masuk fase donasi / daur ulang tidak lagi dijual.
  const products = allProducts.filter((p) => isSellable(p));
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<Category | "Semua">("Semua");
  const [showFilter, setShowFilter] = useState(false);
  const [maxPrice, setMaxPrice] = useState(50000);
  const [minCondition, setMinCondition] = useState(0);
  const [sort, setSort] = useState<"populer" | "termurah" | "termahal" | "kondisi">("populer");
  const [focused, setFocused] = useState(false);
  const [level, setLevel] = useState<SchoolLevel | "Semua">("Semua");
  const [schoolId, setSchoolId] = useState<string | "Semua">("Semua");
  const { history: recent, push: pushRecent, clear: clearRecent } = useSearchHistory();
  const recentViewIds = useRecentlyViewed();
  const recentlyViewed = recentViewIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .slice(0, 8);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Bagian cuci gudang bergantung pada tanggal berjalan: render hanya di browser.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);


  const cartCount = cart.reduce((n, l) => n + l.qty, 0);
  const popular = ["seragam putih", "rok abu", "dasi navy", "buku kelas XI", "kotak pensil", "topi sekolah"];
  const suggestions = query.trim()
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.category.toLowerCase().includes(query.toLowerCase()),
        )
        .slice(0, 6)
    : [];
  const koperasiHits = query.trim()
    ? schools
        .filter((s) =>
          [s.koperasi, s.name, s.district, s.level].join(" ").toLowerCase().includes(query.toLowerCase()),
        )
        .slice(0, 4)
    : [];

  const submitSearch = (q: string) => {
    const t = q.trim();
    setQuery(t);
    setFocused(false);
    if (t) pushRecent(t);
  };

  const conditionPct = (c: string) => Number(c.match(/(\d+)%/)?.[1] ?? 0);

  const filtered = products
    .filter(
      (p) =>
        (cat === "Semua" || p.category === cat) &&
        (schoolId === "Semua" || p.schoolId === schoolId) &&
        (level === "Semua" || schoolById(p.schoolId)?.level === level) &&
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
  const activeFilters =
    (maxPrice < 50000 ? 1 : 0) +
    (minCondition > 0 ? 1 : 0) +
    (sort !== "populer" ? 1 : 0) +
    (level !== "Semua" ? 1 : 0) +
    (schoolId !== "Semua" ? 1 : 0);
  const visibleSchools = schools.filter((sc) => level === "Semua" || sc.level === level);
  const featured = products.filter((p) => p.featured).slice(0, 6);
  const clearance = products
    .filter((p) => isClearance(p))
    .sort((a, b) => lifecyclePrice(b).discount - lifecyclePrice(a).discount)
    .slice(0, 8);

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 bg-primary relative px-3 pb-3 pt-3 text-primary-foreground shadow-sm">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center gap-2">
            <div className="relative flex min-w-0 flex-1 items-center gap-2 rounded-lg bg-card px-2.5 py-2">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => {
                  if (blurTimer.current) clearTimeout(blurTimer.current);
                  setFocused(true);
                }}
                onBlur={() => {
                  blurTimer.current = setTimeout(() => setFocused(false), 150);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitSearch(query);
                }}
                placeholder="Cari seragam, buku, atribut…"
                className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  aria-label="Hapus pencarian"
                  className="shrink-0 text-muted-foreground"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              )}
            </div>

            <Link
              to="/keranjang"
              aria-label="Keranjang"
              className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-foreground/15"
            >
              <ShoppingCart className="h-[18px] w-[18px]" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[9px] font-bold text-accent-foreground">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link
              to={user ? "/chat" : "/auth"}
              aria-label={user ? "Chat penjual" : "Masuk untuk chat penjual"}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-foreground/15"
            >
              <MessageCircle className="h-[18px] w-[18px]" />
            </Link>

          </div>

          {focused && (
            <div className="absolute inset-x-3 top-[calc(100%-6px)] z-50 max-h-[60vh] overflow-y-auto rounded-b-2xl border border-border bg-card p-3 text-foreground shadow-lg">
              {suggestions.length > 0 || koperasiHits.length > 0 ? (
                <div className="space-y-3">
                  {koperasiHits.length > 0 && (
                    <div className="space-y-1">
                      <p className="px-1 pb-1 text-[11px] font-bold text-muted-foreground">Akun koperasi</p>
                      {koperasiHits.map((s) => (
                        <Link
                          key={s.id}
                          to="/koperasi/$id"
                          params={{ id: s.id }}
                          onMouseDown={() => setFocused(false)}
                          className="flex w-full items-center gap-2 rounded-lg px-1 py-2 text-left hover:bg-secondary"
                        >
                          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                            <Store className="h-3.5 w-3.5" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-xs font-semibold">{s.koperasi}</span>
                            <span className="block truncate text-[10px] text-muted-foreground">
                              {s.level} · Kec. {s.district}
                            </span>
                          </span>
                          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-primary" />
                        </Link>
                      ))}
                    </div>
                  )}
                  {suggestions.length > 0 && (
                    <div className="space-y-1">
                      <p className="px-1 pb-1 text-[11px] font-bold text-muted-foreground">Saran barang</p>
                      {suggestions.map((p) => (
                        <button
                          key={p.id}
                          onMouseDown={() => submitSearch(p.name)}
                          className="flex w-full items-center gap-2 rounded-lg px-1 py-2 text-left hover:bg-secondary"
                        >
                          <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          <span className="min-w-0 flex-1 truncate text-xs">{p.name}</span>
                          <span className="shrink-0 text-[10px] text-muted-foreground">{p.category}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {recent.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between px-1 pb-1">
                        <p className="text-[11px] font-bold text-muted-foreground">Pencarian terakhir</p>
                        <button
                          onMouseDown={clearRecent}
                          className="text-[11px] font-semibold text-primary"
                        >
                          Hapus
                        </button>
                      </div>
                      {recent.map((r) => (
                        <button
                          key={r}
                          onMouseDown={() => submitSearch(r)}
                          className="flex w-full items-center gap-2 rounded-lg px-1 py-2 text-left hover:bg-secondary"
                        >
                          <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          <span className="min-w-0 flex-1 truncate text-xs">{r}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  <div>
                    <p className="flex items-center gap-1.5 px-1 pb-2 text-[11px] font-bold text-muted-foreground">
                      <TrendingUp className="h-3.5 w-3.5" /> Paling dicari siswa
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {popular.map((k) => (
                        <button
                          key={k}
                          onMouseDown={() => submitSearch(k)}
                          className="rounded-full border border-border px-3 py-1.5 text-[11px] font-semibold text-muted-foreground"
                        >
                          {k}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-2xl space-y-6 px-4">
        {/* Promo carousel */}
        <PromoCarousel />

        {/* Kategori */}
        <section>
          <HScroll className="gap-3 pb-1">
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
          </HScroll>
        </section>

        {/* Koperasi sekolah penjual (lintas sekolah se-Kab. Magetan) */}
        <section>
          <div className="mb-2 flex items-center gap-2">
            <Store className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold">Koperasi Sekolah se-Magetan</h2>
            <span className="ml-auto text-[10px] font-semibold text-muted-foreground">Geser →</span>
          </div>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {(["Semua", "SD", "SMP", "SMA", "SMK"] as const).map((lv) => (
              <button
                key={lv}
                onClick={() => {
                  setLevel(lv as SchoolLevel | "Semua");
                  setSchoolId("Semua");
                }}
                className={`rounded-full border px-3 py-1 text-[11px] font-bold ${
                  level === lv ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground"
                }`}
              >
                {lv}
              </button>
            ))}
          </div>
          <HScroll className="gap-2.5 pb-1">
            {visibleSchools.map((sc) => {
              const active = schoolId === sc.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => setSchoolId(active ? "Semua" : sc.id)}
                  className={`w-40 shrink-0 rounded-2xl border p-3 text-left ${
                    active ? "border-primary bg-primary/5" : "border-border bg-card"
                  }`}
                >
                  <span className="inline-flex rounded-full bg-accent/20 px-2 py-0.5 text-[9px] font-bold text-accent-foreground">
                    {sc.level}
                  </span>
                  <p className="mt-1.5 line-clamp-2 text-[11px] font-bold leading-snug">{sc.name}</p>
                  <p className="mt-0.5 truncate text-[10px] text-muted-foreground">Kec. {sc.district}</p>
                </button>
              );
            })}
          </HScroll>
          {schoolId !== "Semua" && (
            <p className="mt-2 text-[11px] text-muted-foreground">
              Menampilkan barang dari {schoolById(schoolId)?.koperasi}.{" "}
              <button onClick={() => setSchoolId("Semua")} className="font-bold text-primary">
                Lihat semua sekolah
              </button>
            </p>
          )}
        </section>

        {/* Flash sale berjalan */}
        <FlashSaleSection />

        {/* Cuci Gudang — diskon otomatis barang lama tayang */}
        {clearance.length > 0 && (
          <section>
            <div className="mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-destructive" />
              <h2 className="text-sm font-bold">Cuci Gudang Koperasi</h2>
              <span className="ml-auto text-[10px] font-semibold text-muted-foreground">Diskon otomatis</span>
            </div>
            <p className="mb-2 text-[11px] leading-relaxed text-muted-foreground">
              Barang pilihan koperasi dengan harga cuci gudang. Jumlahnya terbatas dan bisa ditarik untuk donasi sosial
              kapan saja — buruan sebelum diambil orang lain.
            </p>

            <HScroll className="gap-3 pb-1">
              {clearance.map((p) => (
                <div key={p.id} className="w-36 shrink-0">
                  <ProductCard product={p} />
                </div>
              ))}
            </HScroll>
          </section>
        )}

        {/* Unggulan */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4 text-accent-foreground" />
            <h2 className="text-sm font-bold">Flash Unggulan Koperasi</h2>
            <span className="ml-auto text-[10px] font-semibold text-muted-foreground">Geser →</span>
          </div>
          <HScroll className="gap-3 pb-1">
            {featured.map((p) => (
              <div key={p.id} className="w-36 shrink-0">
                <ProductCard product={p} />
              </div>
            ))}
          </HScroll>
        </section>

        {/* Terakhir dilihat */}
        {recentlyViewed.length > 0 && (
          <section>
            <div className="mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold">Terakhir Kamu Lihat</h2>
              <Link to="/favorit" className="ml-auto text-[11px] font-semibold text-primary">
                Favorit →
              </Link>
            </div>
            <HScroll className="gap-3 pb-1">
              {recentlyViewed.map((p) => (
                <div key={p.id} className="w-36 shrink-0">
                  <ProductCard product={p} />
                </div>
              ))}
            </HScroll>
          </section>
        )}

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
                  setLevel("Semua");
                  setSchoolId("Semua");
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
      <ScrollDownHint label="Masih ada di bawah" />
    </div>
  );
}
