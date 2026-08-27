import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { reportLovableError } from "@/lib/lovable-error-reporting";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class TookuErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    reportLovableError(error, {
      boundary: "tooku_context_error_boundary",
      componentStack: info.componentStack,
    });
  }

  private retry = () => {
    this.setState({ error: null });
  };

  override render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const isProviderError = error.message.includes("useTooku") && error.message.includes("TookuProvider");

    return (
      <main className="grid min-h-screen place-items-center bg-background px-5 py-10" role="alert">
        <section className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-card-foreground">
            {isProviderError ? "Koneksi aplikasi belum siap" : "TOOKU gagal memuat halaman"}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {isProviderError
              ? "Konteks data TOOKU tidak tersedia. Muat ulang halaman untuk menyambungkan aplikasi kembali."
              : "Terjadi kendala saat menampilkan halaman. Silakan coba lagi atau kembali ke Beranda."}
          </p>
          {import.meta.env.DEV && (
            <code className="mt-4 block rounded-lg bg-muted p-3 text-left text-xs text-muted-foreground">
              {error.message}
            </code>
          )}
          <div className="mt-5 grid grid-cols-2 gap-2">
            <Button type="button" variant="outline" onClick={this.retry}>
              <RefreshCw className="h-4 w-4" />
              Coba Lagi
            </Button>
            <Button type="button" onClick={() => window.location.assign("/")}>
              <Home className="h-4 w-4" />
              Ke Beranda
            </Button>
          </div>
        </section>
      </main>
    );
  }
}