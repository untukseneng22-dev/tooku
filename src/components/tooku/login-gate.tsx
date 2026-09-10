/** Layar ajakan masuk untuk menu yang hanya untuk akun terdaftar. */
import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";

export function LoginGate({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="bg-primary px-4 pb-4 pt-5 text-primary-foreground">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-lg font-extrabold tracking-tight">{title}</h1>
          <p className="text-[11px] opacity-80">Khusus akun terdaftar TOOKU</p>
        </div>
      </header>
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="rounded-2xl border border-border bg-card p-6 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Lock className="h-6 w-6" />
          </span>
          <p className="mt-4 text-sm font-bold">Masuk dulu untuk memakai fitur ini</p>
          <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{desc}</p>
          <div className="mt-5 flex flex-col gap-2">
            <Link
              to="/auth"
              className="rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground active:scale-95"
            >
              Masuk / Daftar
            </Link>
            <Link to="/" className="rounded-full border border-border px-4 py-2.5 text-sm font-semibold">
              Kembali belanja
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
