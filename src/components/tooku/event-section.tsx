/** Banner event tanggal cantik (9.9, 10.10, ...) beserta barang peserta koperasi. */
import { useEffect, useState } from "react";
import { CalendarHeart } from "lucide-react";
import { useTooku } from "@/lib/tooku-store";
import { isSellable } from "@/lib/tooku-lifecycle";
import { campaignPhase } from "@/lib/tooku-campaign";
import { ProductCard } from "@/components/tooku/ui";
import { HScroll } from "@/components/tooku/scroll-hint";
import { useCountdownTo } from "@/components/tooku/flash-sale";

function TimeBox({ v }: { v: string }) {
  return (
    <span className="min-w-[22px] rounded-[4px] bg-primary-foreground/20 px-1 py-0.5 text-center text-[12px] font-extrabold tabular-nums text-primary-foreground">
      {v}
    </span>
  );
}

export function EventSection() {
  const { campaigns, campaignJoins, products, koperasiList } = useTooku();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => setNow(Date.now()), []);
  if (now === null) return null;

  const running = campaigns
    .filter((c) => campaignPhase(c, now) === "berjalan")
    .sort((a, b) => a.endsAt - b.endsAt)[0];
  const soon = campaigns
    .filter((c) => campaignPhase(c, now) === "akan-datang")
    .sort((a, b) => a.startsAt - b.startsAt)[0];
  const campaign = running ?? soon;
  if (!campaign) return null;

  const joins = campaignJoins.filter((j) => j.campaignId === campaign.id);
  const ids = new Set(joins.flatMap((j) => j.productIds));
  const items = products.filter((p) => ids.has(p.id) && isSellable(p));
  const kopCount = new Set(joins.map((j) => j.schoolId)).size;

  return <EventCard campaign={campaign} running={!!running} items={items} kopCount={kopCount} total={koperasiList.length} />;
}

function EventCard({
  campaign,
  running,
  items,
  kopCount,
  total,
}: {
  campaign: { badge: string; name: string; tagline: string; startsAt: number; endsAt: number };
  running: boolean;
  items: ReturnType<typeof Object.values> extends never ? never : Parameters<typeof ProductCard>[0]["product"][];
  kopCount: number;
  total: number;
}) {
  const countdown = useCountdownTo(running ? campaign.endsAt : campaign.startsAt);

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="bg-gradient-to-r from-primary to-primary/80 px-3 py-2.5 text-primary-foreground">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent text-[12px] font-extrabold text-accent-foreground">
            {campaign.badge}
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1 truncate text-[13px] font-extrabold">
              <CalendarHeart className="h-3.5 w-3.5 shrink-0" /> {campaign.name}
            </p>
            <p className="truncate text-[10px] font-semibold opacity-90">{campaign.tagline}</p>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wide opacity-90">
            {running ? "Berakhir dalam" : "Dibuka dalam"}
          </span>
          <span className="flex items-center gap-0.5">
            {countdown ? (
              <>
                <TimeBox v={countdown.jam} />
                <span className="text-[11px] font-extrabold">:</span>
                <TimeBox v={countdown.menit} />
                <span className="text-[11px] font-extrabold">:</span>
                <TimeBox v={countdown.detik} />
              </>
            ) : (
              <span className="text-[10px] font-bold opacity-90">Menghitung…</span>
            )}
          </span>
          <span className="ml-auto shrink-0 rounded-full bg-primary-foreground/15 px-2 py-0.5 text-[10px] font-bold">
            {kopCount}/{total} koperasi ikut
          </span>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="px-3 py-3 text-[11px] font-semibold text-muted-foreground">
          Koperasi sekolah sedang mendaftarkan barang untuk event ini. Pantau terus halaman ini, ya!
        </p>
      ) : (
        <HScroll className="gap-2.5 px-3 pb-3 pt-2.5">
          {items.map((p) => (
            <div key={p.id} className="w-32 shrink-0">
              <ProductCard product={p} />
            </div>
          ))}
        </HScroll>
      )}
    </section>
  );
}
