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
  return (
    <span className="min-w-[22px] rounded-[4px] bg-foreground px-1 py-0.5 text-center text-[12px] font-extrabold tabular-nums text-background">
      {v}
    </span>
  );
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
      <div className="mb-3 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-accent via-accent to-chart-5 px-3.5 py-2.5 shadow-sm">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary/90 text-accent">
          <Zap className="h-4 w-4 fill-current" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-extrabold text-accent-foreground">{sale.title}</h2>
          <p className="text-[10px] font-semibold text-accent-foreground/80">
            Diskon ekstra {sale.discountPct}% · stok terbatas
          </p>
        </div>
        <span className="flex shrink-0 items-center gap-1">
          {countdown ? (
            <>
              <TimeBox v={countdown.jam} />
              <span className="text-xs font-extrabold text-accent-foreground">:</span>
              <TimeBox v={countdown.menit} />
              <span className="text-xs font-extrabold text-accent-foreground">:</span>
              <TimeBox v={countdown.detik} />
            </>
          ) : (
            <span className="text-[10px] font-bold text-accent-foreground">Berlangsung</span>
          )}
        </span>
      </div>
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
