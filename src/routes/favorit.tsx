import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { ArrowLeft, Heart } from "lucide-react";
import { useTooku } from "@/lib/tooku-store";
import { ProductCard, BottomNav, EmptyState } from "@/components/tooku/ui";

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
  const { wishlist, products, user } = useTooku();
  const items = products.filter((p) => wishlist.includes(p.id));

  if (!user) return <Navigate to="/auth" replace />;

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
          <EmptyState
            icon={Heart}
            title="Belum ada barang favorit"
            desc="Tekan ikon hati di kartu barang untuk menyimpannya di sini."
            cta={{ to: "/", label: "Mulai jelajahi" }}
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {items.map((p, i) => (
              <div key={p.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
