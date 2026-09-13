import { useRef, useState } from "react";
import { Camera, KeyRound, CheckCircle2, AlertCircle, Pencil, ChevronRight, X, Settings } from "lucide-react";
import { useTooku, type User } from "@/lib/tooku-store";
import { compressImage } from "@/lib/image-compress";

export function AvatarBox({ user, initials, tone }: { user: User; initials: string; tone: "light" | "accent" }) {
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

export function AccountSettingsForm() {
  const { user, updateProfile, changePassword } = useTooku();
  const fileRef = useRef<HTMLInputElement>(null);
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
    const res = updateProfile({ name, email, ...(avatar !== undefined ? { avatar } : {}) });
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
    <div className="space-y-5">
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
          {compressing ? "Mengompres foto…" : "Ketuk ikon kamera untuk ganti foto. Foto otomatis dikompres agar ringan."}
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
          <input className={input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={100} />
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
  );
}

export function AccountSettings() {
  const [open, setOpen] = useState(false);
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
        <div className="border-t border-border p-4">
          <AccountSettingsForm />
        </div>
      )}
    </div>
  );
}

export function AccountSettingsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label="Pengaturan Akun">
      <div className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-card shadow-xl sm:rounded-3xl">
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <Settings className="h-4 w-4 text-primary" />
          <p className="text-sm font-bold">Pengaturan Akun</p>
          <span className="ml-2 hidden text-[11px] text-muted-foreground sm:inline">Foto, nama, email, kata sandi</span>
          <button
            onClick={onClose}
            aria-label="Tutup pengaturan"
            className="ml-auto grid h-8 w-8 place-items-center rounded-full bg-secondary text-muted-foreground transition hover:bg-secondary/70"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto p-5">
          <AccountSettingsForm />
        </div>
      </div>
    </div>
  );
}
