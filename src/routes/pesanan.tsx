import { createFileRoute, Link } from "@tanstack/react-router";
import { Ticket, MapPin, Check, Clock, Wallet, Store, XCircle, Truck, Copy, Star } from "lucide-react";
import { useState } from "react";
import { useTooku, useCountdown, flowFor, isFinalStatus, type Order } from "@/lib/tooku-store";
import { rupiah, schoolById } from "@/lib/tooku-data";
import { zoneEta, zoneLabel } from "@/lib/tooku-shipping";

/** Form ulasan bintang untuk satu barang dalam pesanan selesai. */
function ReviewBox({ order, productId, name }: { order: Order; productId: string; name: string }) {
  const { addProductReview, productReviews, user } = useTooku();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [msg, setMsg] = useState("");
  const existing = productReviews.find(
    (r) => r.orderId === order.id && r.productId === productId && r.userId === user?.id,
  );

  if (existing)
    return (
      <p className="flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">
        <Star className="h-3 w-3 fill-accent text-accent" /> Sudah kamu ulas ({existing.rating}/5)
      </p>
    );
  if (!open)
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg border border-primary px-2 py-1 text-[10px] font-bold text-primary"
      >
        Beri Ulasan
      </button>
    );
  return (
    <div className="w-full space-y-2 rounded-xl border border-border bg-card p-2.5">
      <p className="text-[11px] font-bold">Ulasan untuk {name}</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => setRating(n)} aria-label={`${n} bintang`}>
            <Star
              className={`h-5 w-5 ${n <= rating ? "fill-accent text-accent" : "text-border"}`}
            />
          </button>
        ))}
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        placeholder="Ceritakan kondisi barang dan pelayanan koperasi…"
        className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-[11px] outline-none focus:border-primary"
      />
      {msg && <p className="text-[10px] font-semibold text-destructive">{msg}</p>}
      <div className="flex gap-2">
        <button
          onClick={() => setOpen(false)}
          className="flex-1 rounded-lg border border-border py-1.5 text-[10px] font-semibold"
        >
          Batal
        </button>
        <button
          onClick={() => {
            const res = addProductReview({ productId, orderId: order.id, rating, text });
            if (res.ok) setOpen(false);
            else setMsg(res.error ?? "Gagal mengirim ulasan.");
          }}
          className="flex-1 rounded-lg bg-primary py-1.5 text-[10px] font-bold text-primary-foreground"
        >
          Kirim
        </button>
      </div>
    </div>
  );
}


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
  const active = !isFinalStatus(order.status);
  const delivery = order.fulfillment === "delivery";


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
          <div key={i.productId} className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-xs">
            <span className="min-w-0 truncate text-muted-foreground">
              {i.qty}x {i.name}
            </span>
            <span className="shrink-0 font-semibold">{rupiah(i.price * i.qty)}</span>
            {(order.status === "Selesai" || order.status === "Diterima") && (
              <div className="w-full">
                <ReviewBox order={order} productId={i.productId} name={i.name} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-[11px]">
        <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 font-medium">
          {order.paymentMethod === "online" ? (
            <>
              <Wallet className="h-3 w-3" /> Online · {order.paymentChannel}
            </>
          ) : order.paymentMethod === "cod" ? (
            <>
              <Truck className="h-3 w-3" /> COD saat paket diterima
            </>
          ) : (
            <>
              <Store className="h-3 w-3" /> Bayar di Koperasi
            </>
          )}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 font-semibold text-primary">
          {delivery ? (
            <>
              <Truck className="h-3 w-3" /> Dikirim ekspedisi
            </>
          ) : (
            <>
              <Store className="h-3 w-3" /> Ambil di koperasi
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
              <Clock className="h-3.5 w-3.5" />{" "}
              {delivery ? "Batas proses koperasi (2x24 jam)" : "Batas ambil (1x24 jam)"}
            </span>
            <span className="font-bold tabular-nums text-primary">{expired ? "Waktu habis" : label}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-border">
            <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${percent}%` }} />
          </div>
        </div>
      )}

      {delivery && order.shipping ? (
        <div className="space-y-1.5 rounded-xl border border-border p-3 text-[11px]">
          <p className="flex items-center gap-1.5 font-bold">
            <Truck className="h-3.5 w-3.5 shrink-0 text-primary" /> Pengiriman {order.shipping.courier}
          </p>
          <p className="text-muted-foreground">
            {order.shipping.recipient} · {order.shipping.phone}
          </p>
          <p className="text-muted-foreground">
            {order.shipping.address}, Kec. {order.shipping.district}, {order.shipping.city},{" "}
            {order.shipping.province}
          </p>
          <p className="text-muted-foreground">
            Zona {zoneLabel[order.shipping.zone]} · estimasi tiba {zoneEta[order.shipping.zone]} · ongkir{" "}
            {rupiah(order.shippingTotal)}
          </p>
          {order.shipping.note && <p className="text-muted-foreground">Catatan: {order.shipping.note}</p>}
          {order.shipping.tracking ? (
            <button
              onClick={() => navigator.clipboard?.writeText(order.shipping!.tracking!)}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 font-bold text-primary"
            >
              <Copy className="h-3 w-3" /> Resi {order.shipping.tracking}
            </button>
          ) : (
            <p className="text-muted-foreground">Nomor resi akan muncul setelah koperasi menyerahkan paket ke kurir.</p>
          )}
        </div>
      ) : (
        <p className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {(() => {
            const s = schoolById(order.items[0]?.schoolId ?? "");
            return s ? `${s.koperasi} — ${s.pickup} · ${s.hours}` : "Koperasi Sekolah";
          })()}
        </p>
      )}

      <div className="space-y-0.5 text-[11px] text-muted-foreground">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{rupiah(order.subtotal)}</span>
        </div>
        {order.shippingTotal > 0 && (
          <div className="flex justify-between">
            <span>Ongkir</span>
            <span>{rupiah(order.shippingTotal)}</span>
          </div>
        )}
        {order.serviceFee > 0 && (
          <div className="flex justify-between">
            <span>Biaya layanan</span>
            <span>{rupiah(order.serviceFee)}</span>
          </div>
        )}
        {order.voucherCode && order.voucherCut ? (
          <div className="flex justify-between text-primary">
            <span>Voucher {order.voucherCode}</span>
            <span>−{rupiah(order.voucherCut)}</span>
          </div>
        ) : null}
        {order.pointsUsed && order.pointsCut ? (
          <div className="flex justify-between text-primary">
            <span>Poin dipakai ({order.pointsUsed})</span>
            <span>−{rupiah(order.pointsCut)}</span>
          </div>
        ) : null}
      </div>
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
