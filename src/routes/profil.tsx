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

          <AccountSettings />

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

        <AccountSettings />

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

function AvatarBox({ user, initials, tone }: { user: User; initials: string; tone: "light" | "accent" }) {
  const cls =
    tone === "accent"
      ? "bg-accent text-accent-foreground"
      : "bg-primary-foreground/15 text-primary-foreground";
  if (user.avatar) {
    return (
      <img
        src={user.avatar}
        alt={`Foto profil ${user.name}`}
        className="h-14 w-14 shrink-0 rounded-2xl border border-primary-foreground/30 object-cover"
      />
    );
  }
  return (
    <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-lg font-extrabold ${cls}`}>
      {initials}
    </div>
  );
}

function AccountSettings() {
  const { user, updateProfile, changePassword } = useTooku();
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [avatar, setAvatar] = useState(user?.avatar);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pwOld, setPwOld] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [compressing, setCompressing] = useState(false);

  if (!user) return null;

  const pickPhoto = async (file: File) => {
    setCompressing(true);
    try {
      const result = await compressImage(file);
      setAvatar(result.dataUrl);
    } catch {
      setMsg({ ok: false, text: "Foto gagal diproses. Coba gambar lain." });
    } finally {
      setCompressing(false);
    }
  };

  const saveProfile = () => {
    const res = updateProfile({ name, email, avatar });
    setMsg({ ok: res.ok, text: res.ok ? "Profil berhasil diperbarui." : (res.error ?? "Gagal menyimpan.") });
    if (res.ok) setPwMsg(null);
  };

  const savePassword = () => {
    if (pwNew !== pwConfirm) {
      setPwMsg({ ok: false, text: "Konfirmasi kata sandi baru tidak sama." });
      return;
    }
    const res = changePassword(pwOld, pwNew);
    setPwMsg({ ok: res.ok, text: res.ok ? "Kata sandi berhasil diganti." : (res.error ?? "Gagal mengganti kata sandi.") });
    if (res.ok) {
      setPwOld("");
      setPwNew("");
      setPwConfirm("");
    }
  };

  const feedback = (m: { ok: boolean; text: string }) => (
    <div
      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium ${
        m.ok ? "bg-accent/15 text-accent-foreground" : "bg-destructive/10 text-destructive"
      }`}
    >
      {m.ok ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> : <AlertCircle className="h-3.5 w-3.5 shrink-0" />}
      {m.text}
    </div>
  );

  const input =
    "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 p-4 text-left text-sm font-semibold"
        aria-expanded={open}
      >
        <Pencil className="h-4 w-4 text-primary" /> Pengaturan Akun
        <span className="ml-auto text-[11px] font-normal text-muted-foreground">Foto, nama, email, kata sandi</span>
        <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`} />
      </button>

      {open && (
        <div className="space-y-5 border-t border-border p-4">
          {/* Foto profil */}
          <div className="flex items-center gap-4">
            <div className="relative">
              {avatar ? (
                <img src={avatar} alt="Foto profil" className="h-16 w-16 rounded-2xl object-cover" />
              ) : (
                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-secondary text-lg font-extrabold text-primary">
                  {user.name
                    .split(" ")
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </div>
              )}
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1.5 -right-1.5 grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground shadow-md"
                aria-label="Ganti foto profil"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void pickPhoto(f);
                  e.target.value = "";
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {compressing
                ? "Mengompres foto…"
                : "Ketuk ikon kamera untuk ganti foto. Foto otomatis dikompres agar ringan."}
            </p>
          </div>

          {/* Nama & email */}
          <div className="space-y-3">
            <label className="block space-y-1">
              <span className="text-xs font-semibold">Nama Lengkap</span>
              <input className={input} value={name} onChange={(e) => setName(e.target.value)} maxLength={60} />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-semibold">Email</span>
              <input
                className={input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={100}
              />
            </label>
            {msg && feedback(msg)}
            <button
              onClick={saveProfile}
              disabled={compressing}
              className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50"
            >
              Simpan Profil
            </button>
          </div>

          {/* Kata sandi */}
          <div className="space-y-3 border-t border-border pt-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold">
              <KeyRound className="h-3.5 w-3.5 text-primary" /> Ganti Kata Sandi
            </p>
            <input
              className={input}
              type="password"
              placeholder="Kata sandi lama"
              value={pwOld}
              onChange={(e) => setPwOld(e.target.value)}
            />
            <input
              className={input}
              type="password"
              placeholder="Kata sandi baru (min. 6 karakter)"
              value={pwNew}
              onChange={(e) => setPwNew(e.target.value)}
            />
            <input
              className={input}
              type="password"
              placeholder="Ulangi kata sandi baru"
              value={pwConfirm}
              onChange={(e) => setPwConfirm(e.target.value)}
            />
            {pwMsg && feedback(pwMsg)}
            <button
              onClick={savePassword}
              disabled={!pwOld || !pwNew}
              className="w-full rounded-xl bg-secondary py-2.5 text-sm font-bold text-primary disabled:opacity-50"
            >
              Ganti Kata Sandi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
