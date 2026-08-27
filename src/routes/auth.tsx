import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, User as UserIcon, ArrowLeft } from "lucide-react";
import { useTooku, type Role } from "@/lib/tooku-store";
import logoAsset from "@/assets/tooku-logo.png.asset.json";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Masuk atau Daftar — TOOKU Koperasi Sekolah" },
      {
        name: "description",
        content: "Masuk sebagai Pembeli atau Admin Koperasi untuk memesan dan mengelola barang sekolah layak pakai.",
      },
      { property: "og:title", content: "Masuk atau Daftar — TOOKU" },
      { property: "og:description", content: "Autentikasi berperan: Pembeli dan Admin Koperasi TOOKU." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { login, register } = useTooku();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [role, setRole] = useState<Role>("buyer");
  const [form, setForm] = useState({ name: "", kelas: "", username: "", email: "", password: "" });
  const [error, setError] = useState("");

  const field = "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res =
      mode === "login"
        ? login(form.username, form.password)
        : register({
            name: form.name.trim().slice(0, 60),
            username: form.username.trim().slice(0, 24),
            email: form.email.trim().slice(0, 120),
            password: form.password,
            role,
            ...(role === "buyer" && form.kelas ? { kelas: form.kelas.trim().slice(0, 30) } : {}),
          });
    if (!res.ok) {
      setError(res.error ?? "Gagal masuk.");
      return;
    }
    navigate({ to: res.role === "buyer" ? "/" : "/admin" });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary px-4 pb-10 pt-6 text-primary-foreground">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs opacity-80">
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Link>
        <div className="mt-4 flex items-center gap-3">
          <img src={logoAsset.url} alt="Logo TOOKU" className="h-12 w-12 rounded-2xl shadow-sm" />
          <p className="text-xs opacity-80">Marketplace Koperasi Sekolah</p>
        </div>
      </header>

      <div className="mx-auto -mt-6 max-w-md px-4 pb-16">
        <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
          <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-secondary p-1">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setError("");
                }}
                className={`rounded-lg py-2 text-xs font-bold ${
                  mode === m ? "bg-card text-primary shadow-sm" : "text-muted-foreground"
                }`}
              >
                {m === "login" ? "Masuk" : "Daftar"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === "register" && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { r: "buyer" as Role, label: "Pembeli", icon: UserIcon },
                      { r: "admin" as Role, label: "Admin Koperasi", icon: ShieldCheck },
                    ] as const
                  ).map((o) => (
                    <button
                      type="button"
                      key={o.r}
                      onClick={() => setRole(o.r)}
                      className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-left text-xs font-semibold ${
                        role === o.r ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"
                      }`}
                    >
                      <o.icon className="h-4 w-4" />
                      {o.label}
                    </button>
                  ))}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold" htmlFor="nm">
                    Nama Lengkap
                  </label>
                  <input
                    id="nm"
                    required
                    maxLength={60}
                    className={field}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                {role === "buyer" && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold" htmlFor="kl">
                      Kelas
                    </label>
                    <input
                      id="kl"
                      maxLength={30}
                      placeholder="X IPA 1"
                      className={field}
                      value={form.kelas}
                      onChange={(e) => setForm({ ...form, kelas: e.target.value })}
                    />
                  </div>
                )}
              </>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold" htmlFor="un">
                {mode === "login" ? "Username atau Email" : "Username"}
              </label>
              <input
                id="un"
                required
                maxLength={mode === "login" ? 120 : 24}
                autoCapitalize="none"
                placeholder={mode === "login" ? "budisantoso" : "huruf kecil, tanpa spasi"}
                className={field}
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>
            {mode === "register" && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold" htmlFor="em">
                  Email
                </label>
                <input
                  id="em"
                  type="email"
                  required
                  maxLength={120}
                  className={field}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold" htmlFor="pw">
                Password
              </label>
              <input
                id="pw"
                type="password"
                required
                minLength={6}
                maxLength={64}
                className={field}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            {error && <p className="text-xs font-semibold text-destructive">{error}</p>}

            <button type="submit" className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground">
              {mode === "login" ? "Masuk" : "Daftar & Masuk"}
            </button>
          </form>

          <div className="mt-4 space-y-1 rounded-xl bg-secondary/60 p-3 text-[11px] text-muted-foreground">
            <p className="font-semibold text-foreground">Akun tersedia (username / sandi)</p>
            <p>Pembeli: budisantoso / magetanngangeni</p>
            <p>Admin Koperasi: smaspgrimaospati / magetanngangeni</p>
            <p>Super Admin: superadmin / tookupusat2026</p>
          </div>
        </div>
      </div>
    </div>
  );
}
