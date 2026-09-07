/** Bagian Flash Sale di beranda dengan hitung mundur. */
import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import { useTooku } from "@/lib/tooku-store";
import { isSellable } from "@/lib/tooku-lifecycle";
import { ProductCard } from "@/components/tooku/ui";
import { HScroll } from "@/components/tooku/scroll-hint";

/** Sisa waktu, hanya dihitung setelah komponen terpasang di browser. */
export function useCountdownTo(endsAt: number) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setLeft(Math.max(0, endsAt - Date.now()));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [endsAt]);
  if (left === null) return null;
  const s = Math.floor(left / 1000);
  return {
    ms: left,
    jam: String(Math.floor(s / 3600)).padStart(2, "0"),
    menit: String(Math.floor((s % 3600) / 60)).padStart(2, "0"),
    detik: String(s % 60).padStart(2, "0"),
  };
}

function TimeBox({ v }: { v: string }) {
  return <span className="rounded-md bg-destructive px-1.5 py-0.5 text-[11px] font-bold text-destructive-foreground">{v}</span>;
}

export function FlashSaleSection() {
  const { flashSales, products } = useTooku();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => setNow(Date.now()), []);

  const sale = now === null ? null : flashSales.filter((f) => f.endsAt > now).sort((a, b) => a.endsAt - b.endsAt)[0];
  const countdown = useCountdownTo(sale?.endsAt ?? 0);
  if (!sale) return null;

  const items = products.filter((p) => sale.productIds.includes(p.id) && isSellable(p));
  if (items.length === 0) return null;

  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <Zap className="h-4 w-4 text-destructive" />
        <h2 className="text-sm font-bold">{sale.title}</h2>
        <span className="ml-auto flex items-center gap-1">
          {countdown ? (
            <>
              <TimeBox v={countdown.jam} />
              <span className="text-[11px] font-bold text-destructive">:</span>
              <TimeBox v={countdown.menit} />
              <span className="text-[11px] font-bold text-destructive">:</span>
              <TimeBox v={countdown.detik} />
            </>
          ) : (
            <span className="text-[10px] font-semibold text-muted-foreground">Berlangsung</span>
          )}
        </span>
      </div>
      <p className="mb-2 text-[11px] text-muted-foreground">
        Diskon tambahan {sale.discountPct}% selama waktu berjalan. Stok terbatas, satu barang satu pembeli.
      </p>
      <HScroll className="gap-3 pb-1">
        {items.map((p) => (
          <div key={p.id} className="w-36 shrink-0">
            <ProductCard product={p} />
          </div>
        ))}
      </HScroll>
    </section>
  );
}
