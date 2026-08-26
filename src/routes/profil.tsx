import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ShieldCheck, Leaf, Wallet, ChevronRight, LayoutDashboard, LogOut, LogIn } from "lucide-react";
import { useBaraka } from "@/lib/baraka-store";
import { rupiah } from "@/lib/baraka-data";

export const Route = createFileRoute("/profil")({
  head: () => ({
    meta: [
      { title: "Profil Saya — BARAKA Koperasi Sekolah" },
      { name: "description", content: "Profil akun, dampak penghematan, dan akses mode Admin Koperasi BARAKA." },
      { property: "og:title", content: "Profil Saya — BARAKA Koperasi Sekolah" },
      { property: "og:description", content: "Kelola akun dan lihat dampak belanja barang layak pakai di sekolah." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, myOrders, logout, isAdmin } = useBaraka();
  const navigate = useNavigate();
  const done = myOrders.filter((o) => o.status === "Selesai");
  const saved = done.reduce((s, o) => s + o.total * 2.5, 0);
  const initials = (user?.name ?? "BA")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <header className="bg-primary px-4 pb-10 pt-6 text-primary-foreground">
          <h1 className="text-lg font-bold">Profil</h1>
          <p className="text-xs opacity-80">Masuk untuk memesan dan memantau pesanan</p>
        </header>
        <div className="mx-auto -mt-5 max-w-2xl px-4">
          <div className="rounded-2xl border border-border bg-card p-5 text-center">
            <LogIn className="mx-auto h-8 w-8 text-primary" />
            <p className="mt-3 text-sm text-muted-foreground">Belum masuk ke akun BARAKA.</p>
            <Link
              to="/auth"
              className="mt-4 inline-block rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground"
            >
              Masuk / Daftar
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-primary px-4 pb-8 pt-6 text-primary-foreground">
        <div className="flex items-center gap-3">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-accent text-lg font-extrabold text-accent-foreground">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-bold">{user.name}</p>
            <p className="truncate text-xs opacity-80">
              @{user.username} · {roleLabel[user.role]}
              {user.role === "buyer" && user.kelas ? ` · ${user.kelas}` : ""}
            </p>
            <p className="truncate text-[11px] opacity-70">{user.email}</p>
          </div>
        </div>
      </header>

      <div className="mx-auto -mt-5 max-w-2xl space-y-4 px-4">
        <div className="grid grid-cols-3 gap-2 rounded-2xl border border-border bg-card p-3 text-center">
          <div>
            <p className="text-lg font-extrabold text-primary">{myOrders.length}</p>
            <p className="text-[10px] text-muted-foreground">Pesanan</p>
          </div>
          <div>
            <p className="text-lg font-extrabold text-primary">{done.length}</p>
            <p className="text-[10px] text-muted-foreground">Selesai</p>
          </div>
          <div>
            <p className="truncate text-lg font-extrabold text-primary">{rupiah(saved)}</p>
            <p className="text-[10px] text-muted-foreground">Hemat</p>
          </div>
        </div>

        <div className="flex gap-3 rounded-2xl border border-accent/40 bg-accent/10 p-4">
          <Leaf className="mt-0.5 h-5 w-5 shrink-0 text-accent-foreground" />
          <p className="text-xs">
            Dengan membeli barang layak pakai, kamu ikut mengurangi limbah tekstil sekolah dan mendukung kas koperasi
            untuk beasiswa siswa.
          </p>
        </div>

        <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          <Link to="/pesanan" className="flex items-center gap-3 p-4 text-sm">
            <Wallet className="h-4 w-4 text-primary" /> Riwayat & Status Pesanan
            <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
          </Link>
          <div className="flex items-center gap-3 p-4 text-sm">
            <ShieldCheck className="h-4 w-4 text-primary" /> Standar Kurasi Koperasi
            <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
          </div>
          {isAdmin && (
            <Link to="/admin" className="flex items-center gap-3 bg-secondary/50 p-4 text-sm font-semibold">
              <LayoutDashboard className="h-4 w-4 text-primary" /> Dashboard Admin Koperasi
              <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
            </Link>
          )}
          <button
            onClick={() => {
              logout();
              navigate({ to: "/auth" });
            }}
            className="flex w-full items-center gap-3 p-4 text-left text-sm font-semibold text-destructive"
          >
            <LogOut className="h-4 w-4" /> Keluar
          </button>
        </div>
      </div>
    </div>
  );
}
