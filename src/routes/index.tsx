import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Zap, LayoutDashboard, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useBaraka } from "@/lib/baraka-store";
import { categories, type Category } from "@/lib/baraka-data";
import { ProductCard } from "@/components/baraka/ui";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BARAKA — Marketplace Barang Sekolah Bekas Koperasi" },
      {
        name: "description",
        content:
          "BARAKA (Barang Apik Koperasi Akademik): beli seragam, buku, atribut, dan alat tulis bekas layak pakai yang lolos kurasi koperasi sekolah.",
      },
      { property: "og:title", content: "BARAKA — Marketplace Barang Sekolah Bekas Koperasi" },
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

  const filtered = products.filter(
    (p) =>
      (cat === "Semua" || p.category === cat) &&
      (p.name.toLowerCase().includes(query.toLowerCase()) || p.category.toLowerCase().includes(query.toLowerCase())),
  );
  const featured = products.filter((p) => p.featured).slice(0, 6);

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-primary px-4 pb-6 pt-5 text-primary-foreground">
        <div className="mx-auto max-w-2xl">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div className="min-w-0">
              <p className="truncate text-lg font-extrabold tracking-tight">BARAKA</p>
              <p className="truncate text-[11px] opacity-80">Barang Apik Koperasi Akademik</p>
            </div>
            <Link
              to="/admin"
              className="shrink-0 rounded-full bg-primary-foreground/15 px-3 py-1.5 text-[11px] font-semibold"
            >
              <span className="inline-flex items-center gap-1">
                <LayoutDashboard className="h-3.5 w-3.5" /> Admin
              </span>
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
          <h2 className="mb-3 text-sm font-bold">{cat === "Semua" ? "Semua Barang Terkurasi" : cat}</h2>
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
