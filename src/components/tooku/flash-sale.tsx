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
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
        <h2 className="flex shrink-0 items-center gap-1 text-[13px] font-extrabold uppercase tracking-wide text-sale">
          <Zap className="h-4 w-4 fill-current" /> Flash Sale
        </h2>
        <span className="flex shrink-0 items-center gap-0.5">
          {countdown ? (
            <>
              <TimeBox v={countdown.jam} />
              <span className="text-[11px] font-extrabold text-foreground">:</span>
              <TimeBox v={countdown.menit} />
              <span className="text-[11px] font-extrabold text-foreground">:</span>
              <TimeBox v={countdown.detik} />
            </>
          ) : (
            <span className="text-[10px] font-bold text-muted-foreground">Sedang berjalan</span>
          )}
        </span>
        <span className="ml-auto shrink-0 text-[11px] font-bold text-sale">Lihat Semua →</span>
      </div>
      <p className="px-3 pt-2 text-[10px] font-semibold text-muted-foreground">
        {sale.title} · diskon ekstra {sale.discountPct}%
      </p>
      <HScroll className="gap-2.5 px-3 pb-3 pt-2">
        {items.map((p) => {
          const total = p.sold + p.stock;
          const pct = total > 0 ? Math.min(96, Math.round((p.sold / total) * 100)) : 0;
          return (
            <div key={p.id} className="w-32 shrink-0">
              <ProductCard product={p} />
              <div className="mt-1.5">
                <div className="h-2.5 overflow-hidden rounded-full bg-sale-soft">
                  <div className="h-full rounded-full bg-sale" style={{ width: `${Math.max(12, pct)}%` }} />
                </div>
                <p className="mt-0.5 text-center text-[9px] font-bold text-sale">
                  {p.stock <= 2 ? "Segera habis" : `Terjual ${pct}%`}
                </p>
              </div>
            </div>
          );
        })}
      </HScroll>
    </section>
  );
}
