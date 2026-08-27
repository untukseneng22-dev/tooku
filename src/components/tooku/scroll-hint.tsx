import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronRight, ChevronLeft, ChevronDown } from "lucide-react";

/** Horizontal scroller with edge fades + arrow hints so users know they can swipe. */
export function HScroll({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState({ left: false, right: false });

  const update = () => {
    const el = ref.current;
    if (!el) return;
    setState({
      left: el.scrollLeft > 8,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 8,
    });
  };

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const nudge = (dir: 1 | -1) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div ref={ref} onScroll={update} className={`no-scrollbar flex overflow-x-auto ${className}`}>
        {children}
      </div>

      {state.left && (
        <>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background to-transparent" />
          <button
            aria-label="Geser ke kiri"
            onClick={() => nudge(-1)}
            className="absolute left-0 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full border border-border bg-card/90 shadow-sm backdrop-blur"
          >
            <ChevronLeft className="h-4 w-4 text-primary" />
          </button>
        </>
      )}
      {state.right && (
        <>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent" />
          <button
            aria-label="Geser ke kanan"
            onClick={() => nudge(1)}
            className="absolute right-0 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full border border-border bg-card/90 shadow-sm backdrop-blur"
          >
            <ChevronRight className="h-4 w-4 text-primary" />
          </button>
        </>
      )}
    </div>
  );
}

/** Floating hint that appears while the page still has content below. */
export function ScrollDownHint({ label = "Geser ke bawah" }: { label?: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const update = () => {
      const doc = document.documentElement;
      const remaining = doc.scrollHeight - window.scrollY - window.innerHeight;
      setShow(doc.scrollHeight > window.innerHeight + 80 && remaining > 120);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const t = setInterval(update, 800);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      clearInterval(t);
    };
  }, []);

  if (!show) return null;

  return (
    <button
      onClick={() => window.scrollBy({ top: window.innerHeight * 0.8, behavior: "smooth" })}
      className="fixed bottom-24 left-1/2 z-30 flex -translate-x-1/2 animate-bounce items-center gap-1 rounded-full border border-border bg-card/95 px-3 py-1.5 text-[10px] font-bold text-primary shadow-lg backdrop-blur"
    >
      {label} <ChevronDown className="h-3.5 w-3.5" />
    </button>
  );
}
