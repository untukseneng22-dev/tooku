import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, BadgeCheck, Clock, MapPin, MessageCircle, Phone, Star, Store } from "lucide-react";
import { ratingSummary, schoolById } from "@/lib/baraka-data";
import { useBaraka } from "@/lib/baraka-store";
import { ProductCard, Stars } from "@/components/baraka/ui";

export const Route = createFileRoute("/koperasi/$id")({
  head: () => ({
    meta: [
      { title: "Profil Koperasi Sekolah — TOOKU" },
      {
        name: "description",
        content:
          "Profil koperasi sekolah TOOKU: nama koperasi, sekolah dan jenjang, alamat pengambilan barang, serta jam layanan koperasi.",
      },
      { property: "og:title", content: "Profil Koperasi Sekolah — TOOKU" },
      {
        property: "og:description",
        content: "Lihat alamat pengambilan dan jam layanan koperasi sekolah yang menangani pesananmu.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: KoperasiProfile,
});

function KoperasiProfile() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { products, reviews, addReview, user } = useBaraka();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const school = schoolById(id);

  if (!school) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Koperasi tidak ditemukan.</p>
        <Link to="/koperasi" className="mt-4 inline-block font-semibold text-primary">
          Lihat daftar koperasi
        </Link>
      </div>
    );
  }

  const items = products.filter((p) => p.schoolId === school.id);
  const sold = items.reduce((s, p) => s + p.sold, 0);
  const summary = ratingSummary(reviews, school.id);

  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-card/95 px-4 py-3 backdrop-blur">
        <button onClick={() => navigate({ to: "/koperasi" })} aria-label="Kembali" className="text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="truncate text-sm font-semibold">Profil Koperasi</h1>
      </header>

      <div className="mx-auto max-w-2xl">
        <section className="bg-primary px-4 pb-8 pt-5 text-primary-foreground">
          <div className="flex items-center gap-3">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-accent text-accent-foreground">
              <Store className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-base font-bold">{school.koperasi}</h2>
              <p className="truncate text-xs opacity-85">
                {school.name} · {school.level}
              </p>
              <p className="truncate text-[11px] opacity-70">Kecamatan {school.district}, Kab. Magetan</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-foreground/15 px-2.5 py-1 text-[11px] font-semibold">
              <BadgeCheck className="h-3.5 w-3.5" /> Koperasi terverifikasi TOOKU
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold text-accent-foreground">
              <Star className="h-3.5 w-3.5 fill-current" /> {summary.avgLabel} · {summary.count} ulasan
            </span>
          </div>
        </section>

        <div className="mx-auto -mt-5 space-y-4 px-4">
          <div className="grid grid-cols-3 gap-2 rounded-2xl border border-border bg-card p-3 text-center">
            <div>
              <p className="text-lg font-extrabold text-primary">{items.length}</p>
              <p className="text-[10px] text-muted-foreground">Barang</p>
            </div>
            <div>
              <p className="text-lg font-extrabold text-primary">{sold}</p>
              <p className="text-[10px] text-muted-foreground">Terjual</p>
            </div>
            <div>
              <p className="text-lg font-extrabold text-primary">{school.level}</p>
              <p className="text-[10px] text-muted-foreground">Jenjang</p>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
            <h3 className="text-sm font-bold">Tempat & Jam Pengambilan</h3>
            <p className="flex gap-2 text-xs text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                {school.pickup}
                <br />
                {school.name}, Kec. {school.district}, Kab. Magetan
              </span>
            </p>
            <p className="flex gap-2 text-xs text-muted-foreground">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {school.hours}
            </p>
            <p className="flex gap-2 text-xs text-muted-foreground">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {school.phone}
            </p>
            <p className="rounded-xl bg-secondary/60 p-3 text-xs">
              Bawa <strong>kode pengambilan</strong> dari halaman Pesanan. Kode berlaku <strong>1x24 jam</strong> dan
              pembayaran tunai dapat dilakukan di koperasi.
            </p>
            <Link
              to="/chat"
              search={{ penjual: school.koperasi, produk: "" }}
              className="flex items-center justify-center gap-2 rounded-xl border border-primary py-2.5 text-xs font-bold text-primary"
            >
              <MessageCircle className="h-4 w-4" /> Chat Koperasi
            </Link>
          </div>

          <section className="space-y-3 rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">Rating & Ulasan Pelayanan</h3>
              <span className="text-[11px] text-muted-foreground">{summary.count} ulasan</span>
            </div>
            <div className="flex items-center gap-4 rounded-2xl bg-secondary/60 p-3">
              <div className="text-center">
                <p className="text-2xl font-extrabold text-primary">{summary.avgLabel}</p>
                <Stars value={summary.avg} size={13} />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                {[5, 4, 3, 2, 1].map((star) => {
                  const n = summary.list.filter((r) => r.rating === star).length;
                  const pct = summary.count ? (n / summary.count) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span className="w-3 shrink-0">{star}</span>
                      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                        <span className="block h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                      </span>
                      <span className="w-4 shrink-0 text-right">{n}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              {summary.list.length === 0 && (
                <p className="text-xs text-muted-foreground">Belum ada ulasan untuk koperasi ini.</p>
              )}
              {summary.list.map((r) => (
                <div key={r.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs font-bold">{r.author}</p>
                    <p className="shrink-0 text-[10px] text-muted-foreground">{r.date}</p>
                  </div>
                  <Stars value={r.rating} size={12} />
                  <p className="mt-1 text-xs text-muted-foreground">{r.comment}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2 rounded-2xl border border-border p-3">
              <p className="text-xs font-bold">Beri penilaian pelayanan koperasi</p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button key={i} onClick={() => setRating(i)} aria-label={`Beri ${i} bintang`}>
                    <Star
                      className={`h-6 w-6 ${i <= rating ? "fill-accent text-accent" : "text-muted-foreground/40"}`}
                    />
                  </button>
                ))}
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Ceritakan pengalaman pengambilan barang & pelayanan koperasi…"
                className="w-full rounded-xl border border-border bg-background p-3 text-xs outline-none focus:border-primary"
              />
              {msg && <p className="text-[11px] font-semibold text-primary">{msg}</p>}
              <button
                onClick={() => {
                  const res = addReview({ schoolId: school.id, rating, comment });
                  setMsg(res.ok ? "Terima kasih, ulasanmu sudah tayang." : (res.error ?? "Gagal mengirim ulasan."));
                  if (res.ok) setComment("");
                }}
                className="w-full rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground"
              >
                {user ? "Kirim Ulasan" : "Masuk untuk Mengulas"}
              </button>
            </div>
          </section>

          {items.length > 0 && (
            <section className="pb-4">
              <h3 className="mb-3 text-sm font-bold">Barang dari Koperasi Ini</h3>
              <div className="grid grid-cols-2 gap-3">
                {items.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
