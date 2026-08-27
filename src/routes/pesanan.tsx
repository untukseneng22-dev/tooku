import { createFileRoute, Link } from "@tanstack/react-router";
import { Ticket, MapPin, Check, Clock, Wallet, Store, XCircle, Truck, Copy } from "lucide-react";
import { useTooku, useCountdown, flowFor, isFinalStatus, type Order } from "@/lib/tooku-store";
import { rupiah, schoolById } from "@/lib/tooku-data";
import { zoneEta, zoneLabel } from "@/lib/tooku-shipping";


export const Route = createFileRoute("/pesanan")({
  head: () => ({
    meta: [
      { title: "Pesanan Saya — TOOKU" },
      {
        name: "description",
        content: "Timeline pesanan: Booking, Diproses, Siap Diambil, Selesai — lengkap dengan kode pengambilan.",
      },
      { property: "og:title", content: "Pesanan Saya — TOOKU" },
      { property: "og:description", content: "Pantau status, pembayaran, dan batas waktu pengambilan pesananmu." },
    ],
  }),
  component: OrdersPage,
});

function Timeline({ order }: { order: Order }) {
  const flow = flowFor(order);
  const currentIndex = flow.indexOf(order.status);
  if (order.status === "Dibatalkan") {
    return (
      <p className="flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-xs font-semibold text-destructive">
        <XCircle className="h-4 w-4" /> Pesanan dibatalkan — stok dikembalikan ke koperasi.
      </p>
    );
  }
  return (
    <ol className="space-y-0">
      {flow.map((s, i) => {
        const reached = i <= currentIndex;
        const at = order.timeline.find((t) => t.status === s)?.at;
        return (
          <li key={s} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${
                  reached ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                }`}
              >
                {reached ? <Check className="h-3.5 w-3.5" /> : <span className="text-[10px]">{i + 1}</span>}
              </span>
              {i < flow.length - 1 && (
                <span className={`h-6 w-0.5 ${i < currentIndex ? "bg-primary" : "bg-border"}`} />
              )}
            </div>

            <div className="pb-1">
              <p className={`text-xs font-semibold ${reached ? "text-foreground" : "text-muted-foreground"}`}>{s}</p>
              {at && (
                <p className="text-[10px] text-muted-foreground">
                  {new Date(at).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function OrderCard({ order }: { order: Order }) {
  const { expired, label, percent } = useCountdown(order.deadline);
  const active = order.status !== "Selesai" && order.status !== "Dibatalkan";

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-sm font-bold">
            <Ticket className="h-4 w-4 shrink-0 text-accent-foreground" /> {order.code}
          </p>
          <p className="truncate text-[11px] text-muted-foreground">{order.buyer}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
            order.status === "Selesai"
              ? "bg-primary/10 text-primary"
              : order.status === "Dibatalkan"
                ? "bg-destructive/10 text-destructive"
                : "bg-accent/20 text-accent-foreground"
          }`}
        >
          {order.status}
        </span>
      </div>

      <Timeline order={order} />

      <div className="space-y-1 rounded-xl bg-secondary/50 p-3">
        {order.items.map((i) => (
          <div key={i.productId} className="flex justify-between gap-2 text-xs">
            <span className="min-w-0 truncate text-muted-foreground">
              {i.qty}x {i.name}
            </span>
            <span className="shrink-0 font-semibold">{rupiah(i.price * i.qty)}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-[11px]">
        <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 font-medium">
          {order.paymentMethod === "online" ? (
            <>
              <Wallet className="h-3 w-3" /> Online · {order.paymentChannel}
            </>
          ) : (
            <>
              <Store className="h-3 w-3" /> Bayar di Koperasi
            </>
          )}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 font-semibold ${
            order.paymentStatus === "Lunas" ? "bg-primary/10 text-primary" : "bg-accent/20 text-accent-foreground"
          }`}
        >
          {order.paymentStatus}
        </span>
      </div>

      {active && (
        <div className="space-y-1.5 rounded-xl bg-secondary/60 p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" /> Batas ambil (1x24 jam)
            </span>
            <span className="font-bold tabular-nums text-primary">{expired ? "Waktu habis" : label}</span>
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
  const { myOrders, user } = useTooku();
  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="border-b border-border bg-primary px-4 py-5 text-primary-foreground">
        <h1 className="text-lg font-bold">Pesanan Saya</h1>
        <p className="text-xs opacity-80">Booking · Diproses · Siap Diambil · Selesai</p>
      </header>
      <div className="mx-auto max-w-2xl space-y-3 p-4">
        {!user ? (
          <div className="py-16 text-center">
            <p className="text-sm text-muted-foreground">Masuk untuk melihat pesananmu.</p>
            <Link
              to="/auth"
              className="mt-4 inline-block rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground"
            >
              Masuk / Daftar
            </Link>
          </div>
        ) : myOrders.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-muted-foreground">Belum ada pesanan.</p>
            <Link to="/" className="mt-3 inline-block font-semibold text-primary">
              Mulai belanja
            </Link>
          </div>
        ) : (
          myOrders.map((o) => <OrderCard key={o.id} order={o} />)
        )}
      </div>
    </div>
  );
}
