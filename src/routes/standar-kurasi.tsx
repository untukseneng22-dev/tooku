import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck, Check, X, Camera, Tag } from "lucide-react";

export const Route = createFileRoute("/standar-kurasi")({
  head: () => ({
    meta: [
      { title: "Standar Kurasi Koperasi — TOOKU" },
      {
        name: "description",
        content:
          "Aturan kurasi TOOKU: syarat barang sekolah bekas layak jual, kondisi minimal, pengecekan kebersihan, dan barang yang ditolak koperasi.",
      },
      { property: "og:title", content: "Standar Kurasi Koperasi — TOOKU" },
      {
        property: "og:description",
        content: "Setiap barang wajib lolos 5 tahap kurasi koperasi sekolah sebelum tayang di TOOKU.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StandarKurasi,
});

const steps = [
  {
    icon: Check,
    title: "1. Verifikasi asal barang",
    desc: "Barang diserahkan siswa/alumni ke koperasi sekolah dan dicatat identitas penitipnya.",
  },
  {
    icon: ShieldCheck,
    title: "2. Cek kelayakan fisik",
    desc: "Tidak ada sobek besar, jahitan lepas, atau kancing/zipper rusak. Kondisi minimal 70% layak pakai.",
  },
  {
    icon: Camera,
    title: "3. Cuci, setrika, foto asli",
    desc: "Barang dibersihkan dulu; foto yang diunggah wajib foto barang asli, bukan gambar internet.",
  },
  {
    icon: Tag,
    title: "4. Minus ditulis terbuka",
    desc: "Setiap cacat kecil (noda tipis, warna memudar, tulisan nama) wajib dicantumkan di detail produk.",
  },
  {
    icon: Check,
    title: "5. Harga wajar & badge kurasi",
    desc: "Harga maksimal ±50% harga baru. Lolos semua tahap → produk mendapat badge Lolos Kurasi Koperasi.",
  },
];

const rejected = [
  "Seragam berjamur, bau, atau sobek besar",
  "Buku dengan halaman hilang / sobek banyak",
  "Sepatu sol lepas atau alas tipis licin",
  "Barang bukan perlengkapan sekolah",
  "Foto produk bukan barang asli",
];

function StandarKurasi() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-card/95 px-4 py-3 backdrop-blur">
        <button onClick={() => navigate({ to: "/profil" })} aria-label="Kembali" className="text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="truncate text-sm font-semibold">Standar Kurasi Koperasi</h1>
      </header>

      <div className="mx-auto max-w-2xl space-y-4 px-4 py-4">
        <div className="flex gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p className="text-xs">
            Badge <b>Lolos Kurasi Koperasi</b> berarti barang sudah diperiksa langsung oleh admin koperasi sekolah
            sebelum ditayangkan. Berikut standarnya.
          </p>
        </div>

        <div className="space-y-2">
          {steps.map((s) => (
            <div key={s.title} className="flex gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold">{s.title}</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="mb-2 text-sm font-bold text-destructive">Barang yang ditolak</p>
          <ul className="space-y-1.5">
            {rejected.map((r) => (
              <li key={r} className="flex gap-2 text-[11px]">
                <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-[11px] text-muted-foreground">
          Menemukan barang yang tidak sesuai standar? Hubungi Call Center TOOKU lewat menu Chat, tim Admin Pusat akan
          menindak koperasi terkait.
        </p>
      </div>
    </div>
  );
}
