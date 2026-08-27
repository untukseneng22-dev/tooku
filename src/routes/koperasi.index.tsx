import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ChevronRight, Clock, MapPin, Store } from "lucide-react";
import { schools } from "@/lib/baraka-data";

export const Route = createFileRoute("/koperasi/")({
  head: () => ({
    meta: [
      { title: "Daftar Koperasi Sekolah — TOOKU" },
      {
        name: "description",
        content:
          "Daftar koperasi sekolah penjual di TOOKU se-Kabupaten Magetan: alamat pengambilan barang dan jam layanan tiap koperasi.",
      },
      { property: "og:title", content: "Daftar Koperasi Sekolah — TOOKU" },
      {
        property: "og:description",
        content: "Lihat koperasi sekolah SD/SMP/SMA/SMK di Magetan, lokasi pengambilan, dan jam layanannya.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: KoperasiList,
});

function KoperasiList() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-card/95 px-4 py-3 backdrop-blur">
        <button onClick={() => navigate({ to: "/" })} aria-label="Kembali" className="text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="truncate text-sm font-semibold">Koperasi Sekolah</h1>
      </header>

      <div className="mx-auto max-w-2xl space-y-3 px-4 py-4">
        <p className="text-xs text-muted-foreground">
          Semua barang di TOOKU dijual dan diverifikasi oleh koperasi sekolah. Pilih koperasi untuk melihat lokasi
          pengambilan dan jam layanan.
        </p>
        {schools.map((s) => (
          <Link
            key={s.id}
            to="/koperasi/$id"
            params={{ id: s.id }}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Store className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{s.koperasi}</p>
              <p className="truncate text-[11px] text-muted-foreground">
                {s.level} · {s.name} · Kec. {s.district}
              </p>
              <p className="mt-1 flex items-center gap-1 truncate text-[11px] text-muted-foreground">
                <MapPin className="h-3 w-3 shrink-0" /> {s.pickup}
              </p>
              <p className="flex items-center gap-1 truncate text-[11px] text-muted-foreground">
                <Clock className="h-3 w-3 shrink-0" /> {s.hours}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  );
}
