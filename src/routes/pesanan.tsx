import { createFileRoute, Link } from "@tanstack/react-router";
import { Ticket, MapPin } from "lucide-react";
import { useBaraka, useCountdown, type Order } from "@/lib/baraka-store";
import { rupiah } from "@/lib/baraka-data";

export const Route = createFileRoute("/pesanan")({
  head: () => ({
    meta: [
      { title: "Pesanan Saya — BARAKA" },
      { name: "description", content: "Pantau status booking, kode pengambilan, dan sisa waktu 1x24 jam pesananmu." },
      { property: "og:title", content: "Pesanan Saya — BARAKA" },
      { property: "og:description", content: "Status pesanan dan countdown batas pengambilan di koperasi sekolah." },
    ],
  }),
  component: OrdersPage,
});

function OrderCard({ order }: { order: Order }) {
  const { expired, label, percent } = useCountdown(order.deadline);
  const waiting = order.status === "Menunggu Pengambilan";
  const statusLabel = waiting && expired ? "Kedaluwarsa" : order.status;
  const tone =
    statusLabel === "Selesai"
      ? "bg-primary/10 text-primary"
      : statusLabel === "Menunggu Pengambilan"
        ? "bg-accent/20 text-accent-foreground"
        : "bg-destructive/10 text-destructive";

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-sm font-bold">
            <Ticket className="h-4 w-4 shrink-0 text-accent-foreground" /> {order.code}
          </p>
          <p className="truncate text-[11px] text-muted-foreground">{order.buyer}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${tone}`}>{statusLabel}</span>
      </div>

      <div className="space-y-1">
        {order.items.map((i) => (
          <p key={i.productId} className="text-xs text-muted-foreground">
            {i.qty}x {i.name}
          </p>
        ))}
      </div>

      {waiting && !expired && (
        <div className="space-y-1.5 rounded-xl bg-secondary/60 p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Sisa waktu pengambilan</span>
            <span className="font-bold tabular-nums text-primary">{label}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-border">
            <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${percent}%` }} />
          </div>
        </div>
      )}

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <MapPin className="h-3.5 w-3.5 shrink-0" /> Koperasi Sekolah — Gedung B lantai 1
      </p>
      <p className="text-sm font-bold text-primary">Total {rupiah(order.total)}</p>
    </div>
  );
}

function OrdersPage() {
  const { orders } = useBaraka();
  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="border-b border-border bg-primary px-4 py-5 text-primary-foreground">
        <h1 className="text-lg font-bold">Pesanan Saya</h1>
        <p className="text-xs opacity-80">Ambil pesanan di koperasi sebelum waktu habis</p>
      </header>
      <div className="mx-auto max-w-2xl space-y-3 p-4">
        {orders.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-muted-foreground">Belum ada pesanan.</p>
            <Link to="/" className="mt-3 inline-block font-semibold text-primary">
              Mulai belanja
            </Link>
          </div>
        ) : (
          orders.map((o) => <OrderCard key={o.id} order={o} />)
        )}
      </div>
    </div>
  );
}
