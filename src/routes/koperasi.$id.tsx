import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, BadgeCheck, Clock, MapPin, MessageCircle, Phone, Store } from "lucide-react";
import { schoolById } from "@/lib/baraka-data";
import { useBaraka } from "@/lib/baraka-store";
import { ProductCard } from "@/components/baraka/ui";

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
  const { products } = useBaraka();
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
          <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-primary-foreground/15 px-2.5 py-1 text-[11px] font-semibold">
            <BadgeCheck className="h-3.5 w-3.5" /> Koperasi terverifikasi TOOKU
          </span>
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
