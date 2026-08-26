import { useEffect, useState } from "react";
import logoAsset from "@/assets/tooku-logo.png.asset.json";

const SPLASH_MS = 1600;

export function SplashScreen() {
  const [mounted, setMounted] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setMounted(true);
    const t = setTimeout(() => setHidden(true), SPLASH_MS);
    return () => clearTimeout(t);
  }, []);

  if (!mounted || hidden) return null;

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[100] grid place-items-center bg-primary animate-out fade-out duration-500 fill-mode-forwards"
      style={{ animationDelay: `${SPLASH_MS - 500}ms` }}
    >
      <div className="flex flex-col items-center gap-5">
        <img
          src={logoAsset.url}
          alt="Logo TOOKU"
          className="h-28 w-28 rounded-3xl shadow-2xl animate-in zoom-in-75 fade-in duration-700"
        />
        <p className="text-xs font-semibold tracking-[0.3em] text-primary-foreground/80 animate-in fade-in duration-1000">
          MARKETPLACE KOPERASI
        </p>
      </div>
    </div>
  );
}
