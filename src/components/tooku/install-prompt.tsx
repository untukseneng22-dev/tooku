import { useEffect, useState } from "react";
import { Download, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt(): Promise<void>;
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(standalone);

    const saved = window.localStorage.getItem("tooku-install-dismissed");
    if (saved === "1") setDismissed(true);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    const onAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
      window.localStorage.removeItem("tooku-install-dismissed");
    };

    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  const dismiss = () => {
    setDismissed(true);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("tooku-install-dismissed", "1");
    }
  };

  return { canInstall: !!deferredPrompt && !isInstalled && !dismissed, isInstalled, install, dismiss };
}

export function InstallAppCard() {
  const { canInstall, isInstalled, install, dismiss } = usePwaInstall();

  if (isInstalled) {
    return null;
  }

  if (!canInstall) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary">
          <Smartphone className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Tambahkan ke layar utama</p>
          <p className="text-xs text-muted-foreground">
            Buka menu browser &gt; "Tambahkan ke layar utama" untuk memasang TOOKU.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary to-primary/90 p-4 text-primary-foreground shadow-sm">
      <div className="relative z-10 flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/20">
          <Download className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold">Pasang aplikasi TOOKU</p>
          <p className="text-xs opacity-90">
            Akses lebih cepat, notifikasi pesanan, dan pengalaman layaknya aplikasi native.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={install}
              className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-primary shadow-sm active:scale-95"
            >
              Pasang sekarang
            </button>
            <button
              onClick={dismiss}
              className="rounded-lg px-3 py-2 text-xs font-semibold text-white/90 hover:bg-white/10"
            >
              Nanti
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
