import { Link, useRouterState } from "@tanstack/react-router";
import { Home, ClipboardList, User, ShoppingBag, BadgeCheck, Bell, Store, Star } from "lucide-react";
import { useBaraka } from "@/lib/baraka-store";
import type { Product } from "@/lib/baraka-data";
import { rupiah, schoolById } from "@/lib/baraka-data";

export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`Rating ${value.toFixed(1)} dari 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={i <= Math.round(value) ? "fill-accent text-accent" : "text-muted-foreground/40"}
        />
      ))}
    </span>
  );
}

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

/** Badge "Koperasi Asal" — menunjukkan koperasi sekolah yang memverifikasi & menangani pesanan. */
export function KoperasiBadge({ schoolId, small = false }: { schoolId?: string; small?: boolean }) {
  const school = schoolId ? schoolById(schoolId) : undefined;
  if (!school) return null;
  const inner = (
    <>
      <Store className={small ? "h-3 w-3 shrink-0" : "h-3.5 w-3.5 shrink-0"} />
      <span className="truncate">
        {small ? school.koperasi : `Koperasi Asal · ${school.koperasi}`}
      </span>
    </>
  );
  const cls = `inline-flex max-w-full items-center gap-1 rounded-full border border-primary/25 bg-primary/10 font-semibold text-primary ${
    small ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
  }`;
  if (small) return <span className={cls}>{inner}</span>;
  return (
    <Link to="/koperasi/$id" params={{ id: school.id }} className={cls}>
      {inner}
    </Link>
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
        <KoperasiBadge schoolId={product.schoolId} small />

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
  { to: "/keranjang", label: "Keranjang", icon: ShoppingBag },
  { to: "/notifikasi", label: "Notifikasi", icon: Bell },
  { to: "/profil", label: "Profil", icon: User },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { cart } = useBaraka();
  if (pathname.startsWith("/admin") || pathname.startsWith("/auth")) return null;

  const cartCount = cart.reduce((s, l) => s + l.qty, 0);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
      <div className="mx-auto grid max-w-lg grid-cols-5 px-2 pb-2 pt-1.5">
        {navItems.map((item) => {
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          const showBadge = item.to === "/keranjang" && cartCount > 0;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`group relative flex flex-col items-center gap-1 rounded-2xl py-2 text-[10px] font-semibold transition-all duration-200 ${
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span
                className={`relative grid h-9 w-12 place-items-center rounded-2xl transition-all duration-200 ${
                  active ? "bg-primary/10 -translate-y-0.5" : "group-active:scale-95"
                }`}
              >
                <item.icon className={`h-5 w-5 ${active ? "stroke-[2.4]" : ""}`} />
                {showBadge && (
                  <span className="absolute -right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[9px] font-bold text-accent-foreground shadow">
                    {cartCount}
                  </span>
                )}
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
