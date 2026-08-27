import { useEffect, useRef, useState } from "react";
import { ShieldCheck, Sparkles, Truck, Tag } from "lucide-react";

type Promo = {
  id: string;
  tag: string;
  title: string;
  note: string;
  icon: typeof Tag;
  className: string;
};

const promos: Promo[] = [
  {
    id: "semester",
    tag: "Promo Awal Semester",
    title: "Hemat hingga 70% untuk seragam & buku layak pakai",
    note: "1.248 barang terselamatkan · Rp18,4 jt dihemat siswa",
    icon: ShieldCheck,
    className: "from-primary to-primary/70 text-primary-foreground",
  },
  {
    id: "bundling",
    tag: "Bundling Hemat",
    title: "Paket 3 buku pelajaran mulai Rp25.000",
    note: "Semua sudah lolos kurasi koperasi sekolah",
    icon: Tag,
    className: "from-accent to-accent/70 text-accent-foreground",
  },
  {
    id: "ambil",
    tag: "Gratis Ongkir Internal",
    title: "Ambil pesanan langsung di koperasi tanpa biaya",
    note: "Kode pengambilan berlaku 1x24 jam",
    icon: Truck,
    className: "from-primary/90 via-primary/70 to-accent/70 text-primary-foreground",
  },
  {
    id: "baru",
    tag: "Baru Masuk",
    title: "Atribut & alat tulis kondisi 90% masuk tiap Senin",
    note: "Pantau notifikasi biar nggak kehabisan",
    icon: Sparkles,
    className: "from-secondary to-secondary/60 text-secondary-foreground",
  },
];

export function PromoCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const paused = useRef(false);

  const goTo = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const idx = ((i % promos.length) + promos.length) % promos.length;
    el.scrollTo({ left: idx * el.clientWidth, behavior: "smooth" });
  };

  useEffect(() => {
    const t = setInterval(() => {
      if (!paused.current) goTo(active + 1);
    }, 4500);
    return () => clearInterval(t);
  }, [active]);

  return (
    <div
      className="mt-4"
      onPointerDown={() => (paused.current = true)}
      onPointerUp={() => (paused.current = false)}
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
    >
      <div
        ref={trackRef}
        onScroll={(e) => {
          const el = e.currentTarget;
          setActive(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)));
        }}
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto scroll-smooth"
      >
        {promos.map((p) => (
          <div key={p.id} className="w-full shrink-0 snap-center pr-3 last:pr-0">
            <div
              className={`relative h-full overflow-hidden rounded-3xl bg-gradient-to-br p-4 shadow-sm ${p.className}`}
            >
              <p className="text-[11px] font-bold uppercase tracking-wide opacity-80">{p.tag}</p>
              <p className="mt-1 pr-10 text-base font-extrabold leading-snug">{p.title}</p>
              <p className="mt-1.5 flex items-center gap-1 text-[11px] opacity-90">
                <p.icon className="h-3.5 w-3.5 shrink-0" /> {p.note}
              </p>
              <p.icon className="pointer-events-none absolute -bottom-4 -right-3 h-24 w-24 opacity-10" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-2.5 flex items-center justify-center gap-1.5">
        {promos.map((p, i) => (
          <button
            key={p.id}
            aria-label={`Promo ${i + 1}`}
            onClick={() => goTo(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === active ? "w-5 bg-primary" : "w-1.5 bg-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
