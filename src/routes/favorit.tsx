import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Heart } from "lucide-react";
import { useTooku } from "@/lib/tooku-store";
import { ProductCard, BottomNav } from "@/components/tooku/ui";

export const Route = createFileRoute("/favorit")({
  head: () => ({
    meta: [
      { title: "Favorit Saya — TOOKU" },
      { name: "description", content: "Barang koperasi sekolah yang kamu simpan untuk dibeli nanti di TOOKU." },
      { property: "og:title", content: "Favorit Saya — TOOKU" },
      { property: "og:description", content: "Simpan barang layak pakai incaranmu dan pantau harganya." },
    ],
  }),
  component: FavoritPage,
});

function FavoritPage() {
  const { wishlist, products } = useTooku();
  const items = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 flex items-center gap-3 bg-primary px-4 py-3 text-primary-foreground">
        <Link to="/" aria-label="Kembali">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-base font-bold">Favorit Saya</h1>
        <span className="ml-auto text-xs opacity-80">{items.length} barang</span>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-4">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
            <Heart className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm font-semibold">Belum ada barang favorit</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Tekan ikon hati di kartu barang untuk menyimpannya di sini.
            </p>
            <Link
              to="/"
              className="mt-4 inline-block rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
            >
              Mulai jelajahi
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
