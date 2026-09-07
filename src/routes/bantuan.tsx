import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { BottomNav } from "@/components/tooku/ui";

export const Route = createFileRoute("/bantuan")({
  head: () => ({
    meta: [
      { title: "Pusat Bantuan — TOOKU" },
      { name: "description", content: "Pertanyaan umum seputar pemesanan, pembayaran, pengambilan, dan pengiriman di TOOKU." },
      { property: "og:title", content: "Pusat Bantuan — TOOKU" },
      { property: "og:description", content: "Panduan singkat belanja barang sekolah layak pakai di koperasi." },
    ],
  }),
  component: BantuanPage,
});

const faqs = [
  {
    q: "Bagaimana cara memesan barang?",
    a: "Pilih barang, tekan Pesan Sekarang atau masukkan ke keranjang, lalu selesaikan pemesanan. Kamu akan menerima kode pengambilan yang berlaku 1x24 jam.",
  },
  {
    q: "Apa itu badge Lolos Kurasi Koperasi?",
    a: "Setiap barang diperiksa pengurus koperasi sekolah: kelayakan bahan, kebersihan, kelengkapan, dan kejujuran deskripsi minus. Baca tahapannya di halaman Standar Kurasi.",
  },
  {
    q: "Saya dari sekolah lain, harus datang ke koperasi penjual?",
    a: "Tidak wajib. Kamu bisa memilih pengambilan langsung (gratis) atau pengiriman ekspedisi dengan ongkir sesuai jarak wilayah.",
  },
  {
    q: "Apa saja cara pembayarannya?",
    a: "Bayar di koperasi saat pengambilan, atau pembayaran online. Pembayaran online masih menunggu konfirmasi pengurus sampai layanan pembayaran resmi diaktifkan.",
  },
  {
    q: "Kenapa harga barang bisa turun sendiri?",
    a: "Barang yang sudah 30 hari tayang turun 20%, 60 hari turun 50%, dan setelah 90 hari disalurkan sebagai donasi atau bahan daur ulang.",
  },
  {
    q: "Bagaimana cara memakai voucher dan poin?",
    a: "Di halaman keranjang, masukkan kode voucher dan centang pemakaian poin sebelum menyelesaikan pesanan. Poin didapat otomatis dari pesanan yang selesai.",
  },
  {
    q: "Barang tidak sesuai deskripsi, harus bagaimana?",
    a: "Tekan Laporkan barang di halaman detail. Laporan masuk ke Admin Pusat dan koperasi terkait untuk ditindaklanjuti.",
  },
];

function BantuanPage() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 flex items-center gap-3 bg-primary px-4 py-3 text-primary-foreground">
        <Link to="/profil" aria-label="Kembali">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-base font-bold">Pusat Bantuan</h1>
      </header>

      <main className="mx-auto max-w-2xl space-y-3 px-4 py-4">
        <div className="flex items-start gap-3 rounded-2xl bg-secondary/60 p-4">
          <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Belum menemukan jawabannya? Hubungi Admin Pusat lewat menu Chat — pengurus siap membantu di jam layanan
            koperasi.
          </p>
        </div>
        {faqs.map((f) => (
          <details key={f.q} className="rounded-2xl border border-border bg-card p-4">
            <summary className="cursor-pointer list-none text-sm font-semibold">{f.q}</summary>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{f.a}</p>
          </details>
        ))}
      </main>
      <BottomNav />
    </div>
  );
}
