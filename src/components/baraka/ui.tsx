import { Link, useRouterState } from "@tanstack/react-router";
import { Home, ClipboardList, User, ShoppingBag, BadgeCheck } from "lucide-react";
import { useBaraka } from "@/lib/baraka-store";
import type { Product } from "@/lib/baraka-data";
import { rupiah } from "@/lib/baraka-data";

const catEmoji: Record<string, string> = {
  Seragam: "👕",
  Buku: "📚",
  Atribut: "🎽",
  "Alat Tulis": "✏️",
};

export function ProductThumb({ product, className = "" }: { product: Product; className?: string }) {
  if (product.photo) {
    return <img src={product.photo} alt={product.name} className={`h-full w-full object-cover ${className}`} />;
  }
  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-secondary to-muted ${className}`}
    >
      <span className="text-4xl">{catEmoji[product.category] ?? "🎒"}</span>
    </div>
  );
}

export function CuratedBadge({ small = false }: { small?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-accent/15 font-semibold text-accent-foreground ${
        small ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
      }`}
    >
      <BadgeCheck className={small ? "h-3 w-3" : "h-3.5 w-3.5"} />
      Lolos Kurasi Koperasi
    </span>
  );
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to="/produk/$id"
      params={{ id: product.id }}
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden">
        <ProductThumb product={product} />
        {product.curated && (
          <span className="absolute left-2 top-2 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-accent-foreground">
            Terkurasi
          </span>
        )}
      </div>
      <div className="space-y-1 p-2.5">
        <p className="line-clamp-2 min-h-[2.4rem] text-xs leading-snug text-card-foreground">{product.name}</p>
        <p className="text-sm font-bold text-primary">{rupiah(product.price)}</p>
        {product.originalPrice && (
          <p className="text-[10px] text-muted-foreground line-through">{rupiah(product.originalPrice)}</p>
        )}
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span className="truncate">{product.condition}</span>
          <span className="shrink-0">{product.sold} terjual</span>
        </div>
      </div>
    </Link>
  );
}

const navItems = [
  { to: "/", label: "Beranda", icon: Home },
  { to: "/pesanan", label: "Pesanan", icon: ClipboardList },
  { to: "/profil", label: "Profil", icon: User },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { cart } = useBaraka();
  if (pathname.startsWith("/admin") || pathname.startsWith("/auth") || pathname.startsWith("/produk") || pathname.startsWith("/keranjang"))
    return null;
  const cartCount = cart.reduce((s, l) => s + l.qty, 0);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur">
      <div className="mx-auto grid max-w-lg grid-cols-4">
        {navItems.map((item) => {
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
        <Link
          to="/keranjang"
          className={`relative flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium ${
            pathname.startsWith("/keranjang") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <ShoppingBag className="h-5 w-5" />
          {cartCount > 0 && (
            <span className="absolute right-4 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[9px] font-bold text-accent-foreground">
              {cartCount}
            </span>
          )}
          Keranjang
        </Link>
      </div>
    </nav>
  );
}
