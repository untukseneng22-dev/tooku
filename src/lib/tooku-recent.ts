/**
 * Riwayat "Terakhir Dilihat" dan riwayat pencarian.
 * Disimpan di localStorage, dibaca hanya setelah hidrasi agar
 * tampilan server dan klien tidak berbeda.
 */
import { useEffect, useState } from "react";

const VIEW_KEY = "tooku.recentViews.v1";
const SEARCH_KEY = "tooku.recentSearch.v1";

function read(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    const arr = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function write(key: string, list: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(list.slice(0, 12)));
  } catch {
    /* ignore */
  }
}

/** Catat produk yang baru saja dibuka pembeli. */
export function recordView(productId: string) {
  const next = [productId, ...read(VIEW_KEY).filter((x) => x !== productId)];
  write(VIEW_KEY, next);
}

/** Daftar id produk terakhir dilihat (kosong sampai hidrasi selesai). */
export function useRecentlyViewed() {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => setIds(read(VIEW_KEY)), []);
  return ids;
}

/** Riwayat kata kunci pencarian pembeli. */
export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>([]);
  useEffect(() => setHistory(read(SEARCH_KEY)), []);

  const push = (term: string) => {
    const t = term.trim();
    if (t.length < 2) return;
    setHistory((h) => {
      const next = [t, ...h.filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, 8);
      write(SEARCH_KEY, next);
      return next;
    });
  };
  const clear = () => {
    setHistory([]);
    write(SEARCH_KEY, []);
  };
  return { history, push, clear };
}
