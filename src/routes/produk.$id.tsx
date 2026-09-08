import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  BadgeCheck,
  MapPin,
  Clock,
  Check,
  X,
  Store,
  MessageCircle,
  Heart,
  Share2,
  Flag,
  Star,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTooku } from "@/lib/tooku-store";
import { rupiah, productSpecs, schoolById, ratingSummary } from "@/lib/tooku-data";
import { lifecyclePrice, stageMeta, DONATION_DAY } from "@/lib/tooku-lifecycle";
import { recordView } from "@/lib/tooku-recent";
import {
  ProductThumb,
  CuratedBadge,
  ProductCard,
  KoperasiBadge,
  Stars,
} from "@/components/tooku/ui";
import { activeFlashFor, flashPrice } from "@/lib/tooku-extras";

export const Route = createFileRoute("/produk/$id")({
  head: () => ({
    meta: [
      { title: "Detail Barang — TOOKU Koperasi Sekolah" },
      {
        name: "description",
        content:
          "Lihat kondisi, harga, dan informasi pengambilan barang sekolah bekas layak pakai yang sudah lolos kurasi koperasi.",
      },
      { property: "og:title", content: "Detail Barang — TOOKU Koperasi Sekolah" },
      {
        property: "og:description",
        content: "Barang sekolah bekas terkurasi koperasi: kondisi transparan, harga hemat, ambil di koperasi.",
      },
    ],
  }),
  component: ProductDetail,
});

function ProductDetail() {
  const { id } = Route.useParams();
  const { products, addToCart, reviews, wishlist, toggleWishlist, productReviews, addReport, flashSales } =
    useTooku();
  const navigate = useNavigate();
  const product = products.find((p) => p.id === id);
  const [active, setActive] = useState(0);
  const [shared, setShared] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [reportText, setReportText] = useState("");
  const [reportMsg, setReportMsg] = useState("");

  // Catat barang ke daftar "terakhir dilihat".
  useEffect(() => {
    if (product) recordView(product.id);
  }, [product?.id]);

  const loved = product ? wishlist.includes(product.id) : false;
  const itemReviews = productReviews.filter((r) => r.productId === id);
  const itemRating =
    itemReviews.length > 0 ? itemReviews.reduce((s, r) => s + r.rating, 0) / itemReviews.length : null;

  const share = async () => {
    if (!product) return;
    const url = `${window.location.origin}/produk/${product.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, text: `${product.name} — ${rupiah(product.price)} di TOOKU`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShared("Tautan barang disalin!");
    } catch {
      setShared("Tautan gagal disalin. Salin dari kolom alamat browser, ya.");
    }
    setTimeout(() => setShared(""), 2500);
  };


  if (!product) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Barang tidak ditemukan.</p>
        <Link to="/" className="mt-4 inline-block font-semibold text-primary">
          Kembali ke beranda
        </Link>
      </div>
    );
  }

  const life = lifecyclePrice(product);
  const sale = activeFlashFor(flashSales, product.id);
  const flash = flashPrice(product.price, sale);
  const bundleItems = (product.bundleOf ?? [])
    .map((bid) => products.find((x) => x.id === bid))
    .filter(Boolean) as typeof products;
  const rating = product ? ratingSummary(reviews, product.schoolId) : null;
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <div className="min-h-screen bg-background pb-40">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-card/95 px-4 py-3 backdrop-blur">
        <button onClick={() => navigate({ to: "/" })} aria-label="Kembali" className="text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="truncate text-sm font-semibold">Detail Barang</h1>
        <button
          onClick={() => toggleWishlist(product.id)}
          aria-label={loved ? "Hapus dari favorit" : "Simpan ke favorit"}
          className="ml-auto text-foreground"
        >
          <Heart className={`h-5 w-5 ${loved ? "fill-destructive text-destructive" : ""}`} />
        </button>
        <button onClick={share} aria-label="Bagikan barang" className="text-foreground">
          <Share2 className="h-5 w-5" />
        </button>
      </header>
      {shared && (
        <p className="bg-primary px-4 py-2 text-center text-xs font-semibold text-primary-foreground">{shared}</p>
      )}

      <div className="mx-auto max-w-2xl">
        <div className="aspect-square w-full overflow-hidden bg-muted">
          <ProductThumb product={product} />
        </div>
        <div className="flex gap-2 px-4 py-3">
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`h-16 w-16 overflow-hidden rounded-xl border-2 ${
                active === i ? "border-accent" : "border-border"
              }`}
            >
              <ProductThumb product={product} />
            </button>
          ))}
        </div>

        <section className="space-y-3 border-b border-border px-4 pb-5">
          <div className="flex flex-wrap items-center gap-2">
            <KoperasiBadge schoolId={product.schoolId} />
            {product.curated && <CuratedBadge />}
          </div>
          <h2 className="text-lg font-bold leading-snug">{product.name}</h2>
          <div className="flex items-end gap-2">
            <p className="text-2xl font-extrabold text-primary">{rupiah(flash.price)}</p>
            {flash.discount > 0 ? (
              <p className="pb-1 text-sm text-muted-foreground line-through">{rupiah(product.price)}</p>
            ) : (
              product.originalPrice && (
                <p className="pb-1 text-sm text-muted-foreground line-through">{rupiah(product.originalPrice)}</p>
              )
            )}
          </div>
          {flash.discount > 0 && (
            <p className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1 text-[11px] font-bold text-destructive">
              <Zap className="h-3 w-3" /> Flash Sale {sale?.title} · hemat {rupiah(product.price - flash.price)}
            </p>
          )}
          {itemRating !== null && (
            <p className="flex items-center gap-1.5 text-xs font-semibold">
              <Star className="h-4 w-4 fill-accent text-accent" /> {itemRating.toFixed(1)}
              <span className="font-normal text-muted-foreground">· {itemReviews.length} ulasan pembeli</span>
            </p>
          )}
          {life.discount > 0 && (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-3">
              <p className="text-xs font-bold text-destructive">
                {stageMeta[life.stage].label} · potongan otomatis {life.discount}%
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                Sudah {life.days} hari tayang di TOOKU (harga asli {rupiah(life.base)}). Bila belum terjual sampai{" "}
                {DONATION_DAY} hari, barang ini diikhlaskan penitip untuk disalurkan sebagai donasi sosial oleh
                koperasi.
              </p>
            </div>
          )}
          {bundleItems.length > 0 && (
            <div className="rounded-2xl border border-primary/25 bg-primary/5 p-3">
              <p className="text-xs font-bold text-primary">Paket Bundling Koperasi</p>
              <ul className="mt-1 space-y-0.5 text-[11px] text-muted-foreground">
                {bundleItems.map((b) => (
                  <li key={b.id}>• {b.name}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-secondary px-2.5 py-1 font-medium">{product.category}</span>
            <span className="rounded-full bg-secondary px-2.5 py-1 font-medium">Kondisi: {product.condition}</span>
            <span className="rounded-full bg-secondary px-2.5 py-1 font-medium">Stok: {product.stock}</span>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
              <Store className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <Link
                to="/koperasi/$id"
                params={{ id: product.schoolId }}
                className="block truncate text-xs font-bold text-primary"
              >
                {product.seller}
              </Link>
              <p className="truncate text-[11px] text-muted-foreground">
                {schoolById(product.schoolId)
                  ? `${schoolById(product.schoolId)!.level} · Kec. ${schoolById(product.schoolId)!.district}`
                  : "Koperasi sekolah terverifikasi"}
                {product.contributor ? ` · titipan ${product.contributor}` : ""}
              </p>
              {rating && (
                <p className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold">
                  <Stars value={rating.avg} size={11} /> {rating.avgLabel}
                  <span className="font-normal text-muted-foreground">({rating.count} ulasan)</span>
                </p>
              )}
            </div>
            <Link
              to="/chat"
              search={{ penjual: product.seller, produk: product.name }}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-primary px-3 py-1.5 text-[11px] font-bold text-primary"
            >
              <MessageCircle className="h-3.5 w-3.5" /> Chat
            </Link>
          </div>
        </section>

        <section className="space-y-3 border-b border-border px-4 py-5">
          <h3 className="text-sm font-bold">Spesifikasi Barang</h3>
          <div className="overflow-hidden rounded-2xl border border-border">
            {productSpecs(product).map(([k, v], i) => (
              <div
                key={k}
                className={`flex gap-3 px-3 py-2.5 text-xs ${i % 2 === 0 ? "bg-card" : "bg-secondary/50"}`}
              >
                <span className="w-32 shrink-0 text-muted-foreground">{k}</span>
                <span className="min-w-0 flex-1 font-semibold">{v}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl border border-border p-2.5">
              <p className="text-sm font-extrabold text-primary">{product.sold}</p>
              <p className="text-[10px] text-muted-foreground">Terjual</p>
            </div>
            <div className="rounded-2xl border border-border p-2.5">
              <p className="text-sm font-extrabold text-primary">{product.stock}</p>
              <p className="text-[10px] text-muted-foreground">Stok</p>
            </div>
            <div className="rounded-2xl border border-border p-2.5">
              <p className="text-sm font-extrabold text-primary">
                {product.originalPrice
                  ? `-${Math.round((1 - product.price / product.originalPrice) * 100)}%`
                  : "Hemat"}
              </p>
              <p className="text-[10px] text-muted-foreground">Dari harga baru</p>
            </div>
          </div>
        </section>

        <section className="space-y-4 border-b border-border px-4 py-5">
          <h3 className="text-sm font-bold">Kondisi Transparan</h3>
          <div className="space-y-2 rounded-2xl bg-secondary/60 p-3">
            {product.plus.map((t) => (
              <p key={t} className="flex gap-2 text-xs">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {t}
              </p>
            ))}
            {product.minus.map((t) => (
              <p key={t} className="flex gap-2 text-xs">
                <X className="mt-0.5 h-4 w-4 shrink-0 text-destructive" /> {t}
              </p>
            ))}
          </div>
          <div className="flex gap-2 rounded-2xl border border-accent/40 bg-accent/10 p-3">
            <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent-foreground" />
            <p className="text-xs">
              Barang sudah <strong>diperiksa, dibersihkan, dan diverifikasi</strong> oleh tim kurasi Koperasi Sekolah
              sebelum dijual.
            </p>
          </div>
        </section>

        <section className="space-y-2 border-b border-border px-4 py-5">
          <h3 className="text-sm font-bold">Informasi Pengambilan</h3>
          <p className="flex gap-2 text-xs text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> Koperasi Sekolah — Gedung B lantai 1, samping ruang OSIS
          </p>
          <p className="flex gap-2 text-xs text-muted-foreground">
            <Clock className="mt-0.5 h-4 w-4 shrink-0" /> Senin–Jumat, 07.00–15.00. Bayar tunai saat pengambilan.
          </p>
          <p className="text-xs text-muted-foreground">
            Setelah memesan kamu mendapat <strong>kode pengambilan</strong> yang berlaku <strong>1x24 jam</strong>.
          </p>
        </section>

        {/* Ulasan pembeli */}
        <section className="space-y-3 border-b border-border px-4 py-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold">Ulasan Pembeli</h3>
            {itemRating !== null && (
              <span className="flex items-center gap-1 text-xs font-bold">
                <Star className="h-3.5 w-3.5 fill-accent text-accent" /> {itemRating.toFixed(1)}
                <span className="font-normal text-muted-foreground">/ 5</span>
              </span>
            )}
          </div>
          {itemReviews.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
              Belum ada ulasan. Ulasan bisa diberikan setelah pesananmu selesai.
            </p>
          ) : (
            <ul className="space-y-2">
              {itemReviews.slice(0, 5).map((r) => (
                <li key={r.id} className="rounded-2xl border border-border bg-card p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs font-bold">{r.author}</p>
                    <Stars value={r.rating} size={11} />
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{r.text}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Laporkan barang */}
        <section className="border-b border-border px-4 py-5">
          {!reportOpen ? (
            <button
              onClick={() => setReportOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-xs font-semibold text-muted-foreground"
            >
              <Flag className="h-3.5 w-3.5" /> Laporkan barang ini
            </button>
          ) : (
            <div className="space-y-2 rounded-2xl border border-border p-3">
              <p className="text-xs font-bold">Ada masalah dengan barang ini?</p>
              <textarea
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                rows={3}
                placeholder="Contoh: foto tidak sesuai kondisi asli, ukuran salah…"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
              />
              {reportMsg && <p className="text-[11px] font-semibold text-primary">{reportMsg}</p>}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setReportOpen(false);
                    setReportText("");
                  }}
                  className="flex-1 rounded-xl border border-border py-2 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    const res = addReport(product.id, reportText);
                    setReportMsg(res.ok ? "Laporan terkirim ke Admin Pusat. Terima kasih!" : (res.error ?? "Gagal mengirim."));
                    if (res.ok) {
                      setReportText("");
                      setTimeout(() => setReportOpen(false), 1500);
                    }
                  }}
                  className="flex-1 rounded-xl bg-primary py-2 text-xs font-bold text-primary-foreground"
                >
                  Kirim Laporan
                </button>
              </div>
            </div>
          )}
        </section>

        {related.length > 0 && (
          <section className="px-4 py-5">
            <h3 className="mb-3 text-sm font-bold">Barang Serupa</h3>
            <div className="grid grid-cols-2 gap-3">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-[68px] z-40 border-t border-border bg-card p-3">
        <div className="mx-auto flex max-w-2xl gap-2">
          <Link
            to="/chat"
            search={{ penjual: product.seller, produk: product.name }}
            aria-label="Chat penjual"
            className="grid shrink-0 place-items-center rounded-xl border border-primary px-3 text-primary"
          >
            <MessageCircle className="h-5 w-5" />
          </Link>
          <button
            onClick={() => addToCart(product.id)}
            disabled={product.stock === 0}
            className="rounded-xl border border-primary px-4 py-3 text-sm font-semibold text-primary disabled:opacity-40"
          >
            + Keranjang
          </button>
          <button
            onClick={() => {
              addToCart(product.id);
              navigate({ to: "/keranjang" });
            }}
            disabled={product.stock === 0}
            className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-40"
          >
            {product.stock === 0 ? "Stok Habis" : "Pesan Sekarang"}
          </button>
        </div>
      </div>
    </div>
  );
}
