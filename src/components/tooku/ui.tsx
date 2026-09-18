import { Link, useRouterState } from "@tanstack/react-router";
import { Home, ClipboardList, User, ShoppingBag, BadgeCheck, Bell, Store, Star, Heart, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useTooku } from "@/lib/tooku-store";
import type { Product } from "@/lib/tooku-data";
import { lifecyclePrice, stageMeta } from "@/lib/tooku-lifecycle";
import { activeFlashFor, flashPrice } from "@/lib/tooku-extras";
import { rupiah, schoolById } from "@/lib/tooku-data";

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

/** Empty state ramah dengan ikon besar dan ajakan bertindak. */
export function EmptyState({
  icon: Icon,
  title,
  desc,
  cta,
}: {
  icon: typeof Heart;
  title: string;
  desc: string;
  cta?: { to: string; label: string };
}) {
  return (
    <div className="animate-fade-up rounded-2xl border border-dashed border-border bg-card p-8 text-center">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-primary/10 text-primary">
        <Icon className="h-7 w-7" />
      </span>
      <p className="mt-4 text-sm font-bold">{title}</p>
      <p className="mx-auto mt-1 max-w-xs text-[12px] leading-relaxed text-muted-foreground">{desc}</p>
      {cta && (
        <Link
          to={cta.to}
          className="mt-5 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-transform active:scale-95"
        >
          {cta.label}
        </Link>
      )}
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


/** Rating rata-rata produk dari ulasan pembeli. */
export function useProductRating(productId: string) {
  const { productReviews } = useTooku();
  const list = productReviews.filter((r) => r.productId === productId);
  if (list.length === 0) return null;
  const avg = list.reduce((s, r) => s + r.rating, 0) / list.length;
  return { avg, count: list.length, label: avg.toFixed(1) };
}

/** Harga yang benar-benar dibayar pembeli (siklus hidup + flash sale). */
export function useEffectivePrice(product: Product) {
  const { flashSales } = useTooku();
  const sale = activeFlashFor(flashSales, product.id);
  const flash = flashPrice(product.price, sale);
  return { price: flash.price, flashDiscount: flash.discount, sale };
}

export function ProductCard({ product }: { product: Product }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const lifecycle = lifecyclePrice(product);
  const isClearance = mounted && lifecycle.discount > 0;
  const { wishlist, toggleWishlist } = useTooku();
  const { price: effectivePrice, flashDiscount } = useEffectivePrice(product);
  const rating = useProductRating(product.id);
  const loved = wishlist.includes(product.id);
  const school = product.schoolId ? schoolById(product.schoolId) : undefined;
  const price = mounted ? effectivePrice : product.price;
  const strike =
    mounted && (flashDiscount > 0 || isClearance) ? product.originalPrice ?? product.price : product.originalPrice;
  const cut = mounted ? (flashDiscount > 0 ? flashDiscount : lifecycle.discount) : 0;

  return (
    <div className="group/card relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/10 active:scale-[0.98]">
      <button
        onClick={(e) => {
          e.preventDefault();
          toggleWishlist(product.id);
        }}
        aria-label={loved ? "Hapus dari favorit" : "Simpan ke favorit"}
        className="absolute left-1.5 top-1.5 z-20 grid h-7 w-7 place-items-center rounded-full bg-card/85 shadow-sm backdrop-blur transition-transform active:scale-90"
      >
        <Heart
          className={`h-4 w-4 transition-all ${loved ? "animate-heart-pop fill-destructive text-destructive" : "text-muted-foreground"}`}
        />
      </button>
      <Link to="/produk/$id" params={{ id: product.id }} className="flex min-w-0 flex-1 flex-col">
        <div className="relative aspect-square overflow-hidden bg-secondary">
          <ProductThumb product={product} />
          {cut > 0 && (
            <span className="absolute right-0 top-0 flex w-9 flex-col items-center rounded-bl-lg bg-sale py-0.5 text-[10px] font-extrabold leading-tight text-sale-foreground">
              <span>{cut}%</span>
              <span className="text-[8px] font-bold">OFF</span>
            </span>
          )}
          {product.curated && (
            <span className="absolute left-1.5 top-10 inline-flex items-center gap-0.5 rounded bg-primary px-1.5 py-0.5 text-[9px] font-bold text-primary-foreground">
              <BadgeCheck className="h-2.5 w-2.5" /> Terkurasi
            </span>
          )}
          {flashDiscount > 0 && mounted ? (
            <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-sale/95 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-sale-foreground">
              <Zap className="h-2.5 w-2.5 fill-current" /> Flash Sale
            </span>
          ) : isClearance ? (
            <span
              className={`absolute inset-x-0 bottom-0 py-0.5 text-center text-[9px] font-extrabold uppercase tracking-wide ${stageMeta[lifecycle.stage].tone}`}
            >
              {stageMeta[lifecycle.stage].short}
            </span>
          ) : null}
          {product.bundleOf && product.bundleOf.length > 1 && (
            <span className="absolute bottom-5 left-1.5 rounded bg-primary px-1.5 py-0.5 text-[9px] font-bold text-primary-foreground">
              Paket
            </span>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1 p-2">
          <p className="line-clamp-2 min-h-[2.2rem] text-[11px] leading-snug text-card-foreground">{product.name}</p>

          <div className="flex flex-wrap items-baseline gap-1">
            <p className="text-[15px] font-extrabold leading-none text-sale">{rupiah(price)}</p>
            {strike && strike > price && (
              <p className="text-[10px] text-muted-foreground line-through">{rupiah(strike)}</p>
            )}
          </div>

          <div className="flex items-center gap-1">
            <span className="rounded-sm bg-sale-soft px-1 py-[1px] text-[9px] font-bold text-sale">
              {product.condition}
            </span>
            {product.stock <= 2 && (
              <span className="rounded-sm bg-secondary px-1 py-[1px] text-[9px] font-bold text-primary">
                Sisa {product.stock}
              </span>
            )}
          </div>

          <div className="mt-auto flex items-center gap-1 pt-0.5 text-[9px] text-muted-foreground">
            {rating ? (
              <span className="flex shrink-0 items-center gap-0.5 font-bold text-foreground">
                <Star className="h-2.5 w-2.5 fill-accent text-accent" /> {rating.label}
              </span>
            ) : (
              <span className="flex shrink-0 items-center gap-0.5 font-bold text-primary">
                <BadgeCheck className="h-2.5 w-2.5" /> Baru
              </span>
            )}
            <span className="shrink-0">·</span>
            <span className="shrink-0">{product.sold} terjual</span>
          </div>
          {school && (
            <p className="flex min-w-0 items-center gap-1 text-[9px] font-semibold text-muted-foreground">
              <Store className="h-2.5 w-2.5 shrink-0 text-primary" />
              <span className="truncate">{school.district}</span>
            </p>
          )}
        </div>
      </Link>
    </div>
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
  const { cart, isSuperAdmin, user } = useTooku();
  // Admin Pusat memakai konsol sendiri, bukan navigasi pembeli.
  if (isSuperAdmin) return null;
  if (pathname.startsWith("/admin") || pathname.startsWith("/pusat") || pathname.startsWith("/auth")) return null;

  const cartCount = cart.reduce((s, l) => s + l.qty, 0);


  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
      <div className="mx-auto grid max-w-lg grid-cols-5 px-2 pb-2 pt-1.5">
        {navItems.map((item) => {
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          const showBadge = item.to === "/keranjang" && cartCount > 0;
          // Semua menu akun hanya untuk yang sudah login: arahkan ke halaman masuk.
          const target = item.to !== "/" && !user ? "/auth" : item.to;
          return (
            <Link
              key={item.to}
              to={target}

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
                  <span
                    key={cartCount}
                    className="animate-badge-pulse absolute -right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[9px] font-bold text-accent-foreground shadow"
                  >
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
