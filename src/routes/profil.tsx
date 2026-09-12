import { useRef, useState } from "react";
import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import {
  ShieldCheck, Leaf, Wallet, ChevronRight, LayoutDashboard, LogOut, Store, Heart, Star,
  HelpCircle, Camera, KeyRound, CheckCircle2, AlertCircle, Pencil,
} from "lucide-react";
import { useTooku, roleLabel, type User } from "@/lib/tooku-store";
import { rupiah } from "@/lib/tooku-data";
import { compressImage } from "@/lib/image-compress";
import { InstallAppCard } from "@/components/tooku/install-prompt";

export const Route = createFileRoute("/profil")({
  head: () => ({
    meta: [
      { title: "Profil Saya — TOOKU Koperasi Sekolah" },
      { name: "description", content: "Profil akun, dampak penghematan, dan akses mode Admin Koperasi TOOKU." },
      { property: "og:title", content: "Profil Saya — TOOKU Koperasi Sekolah" },
      { property: "og:description", content: "Kelola akun dan lihat dampak belanja barang layak pakai di sekolah." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, myOrders, logout, isAdmin, isSuperAdmin, pendingUsers, orders, users, wishlist, pointsBalance } = useTooku();
  const navigate = useNavigate();
  const done = myOrders.filter((o) => o.status === "Selesai");
  const saved = done.reduce((s, o) => s + o.total * 2.5, 0);
  const initials = (user?.name ?? "TK")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (!user) return <Navigate to="/auth" replace />;

  if (isSuperAdmin) {
    return (
      <div className="min-h-screen bg-secondary/40">
        <header className="bg-primary px-4 pb-10 pt-6 text-primary-foreground">
          <div className="mx-auto flex max-w-2xl items-center gap-3">
            <AvatarBox user={user} initials={initials} tone="light" />
            <div className="min-w-0">
              <p className="truncate text-base font-bold">{user.name}</p>
              <p className="truncate text-xs opacity-80">@{user.username} · Admin Pusat TOOKU</p>
              <p className="truncate text-[11px] opacity-70">{user.email}</p>
            </div>
          </div>
        </header>

        <div className="mx-auto -mt-6 max-w-2xl space-y-4 px-4 pb-16">
          <div className="grid grid-cols-3 gap-2 rounded-2xl border border-border bg-card p-3 text-center">
            <div>
              <p className="text-lg font-extrabold text-primary">{orders.length}</p>
              <p className="text-[10px] text-muted-foreground">Transaksi</p>
            </div>
            <div>
              <p className="text-lg font-extrabold text-primary">{users.length}</p>
              <p className="text-[10px] text-muted-foreground">Akun</p>
            </div>
            <div>
              <p className="text-lg font-extrabold text-primary">{pendingUsers.length}</p>
              <p className="text-[10px] text-muted-foreground">Menunggu</p>
            </div>
          </div>

          <InstallAppCard />

          <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            <Link to="/pusat" className="flex items-center gap-3 bg-secondary/50 p-4 text-sm font-semibold">
              <LayoutDashboard className="h-4 w-4 text-primary" /> Konsol Admin Pusat
              <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
            </Link>
            <Link to="/chat" className="flex items-center gap-3 p-4 text-sm">
              <ShieldCheck className="h-4 w-4 text-primary" /> Call Center Pembeli & Koperasi
              <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
            </Link>
            <Link to="/koperasi" className="flex items-center gap-3 p-4 text-sm">
              <Store className="h-4 w-4 text-primary" /> Direktori Koperasi Sekolah
              <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
            </Link>
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

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-primary px-4 pb-8 pt-6 text-primary-foreground">
        <div className="flex items-center gap-3">
          <AvatarBox user={user} initials={initials} tone="accent" />
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

        <InstallAppCard />

        <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          <Link to="/pesanan" className="flex items-center gap-3 p-4 text-sm">
            <Wallet className="h-4 w-4 text-primary" /> Riwayat & Status Pesanan
            <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
          </Link>
          <Link to="/favorit" className="flex items-center gap-3 p-4 text-sm">
            <Heart className="h-4 w-4 text-primary" /> Favorit Saya
            <span className="ml-auto rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold">
              {wishlist.length}
            </span>
          </Link>
          <div className="flex items-center gap-3 p-4 text-sm">
            <Star className="h-4 w-4 text-accent" /> Poin TOOKU
            <span className="ml-auto rounded-full bg-accent/20 px-2.5 py-0.5 text-[11px] font-extrabold text-accent-foreground">
              {pointsBalance(user.id)} poin
            </span>
          </div>
          <Link to="/koperasi" className="flex items-center gap-3 p-4 text-sm">
            <Store className="h-4 w-4 text-primary" /> Daftar Koperasi Sekolah
            <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
          </Link>
          <Link to="/standar-kurasi" className="flex items-center gap-3 p-4 text-sm">
            <ShieldCheck className="h-4 w-4 text-primary" /> Standar Kurasi Koperasi
            <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
          </Link>
          <Link to="/bantuan" className="flex items-center gap-3 p-4 text-sm">
            <HelpCircle className="h-4 w-4 text-primary" /> Pusat Bantuan
            <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
          </Link>
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
