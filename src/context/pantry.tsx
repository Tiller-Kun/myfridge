import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";

import { supabase } from "@/lib/supabase";

export type PantryItem = { id: string; name: string };

type PantryStatus = "loading" | "ready" | "error";

type PantryValue = {
  items: readonly PantryItem[];
  /** "loading" until the first request settles; "error" if the latest failed. */
  status: PantryStatus;
  /** True once a request has succeeded, so earlier data can still be shown after a later failure. */
  hasLoaded: boolean;
  reload: () => void;
  hasItem: (name: string) => boolean;
  /** True while an add or remove request is in flight. */
  busy: boolean;
  /** Message for the latest failed add/remove; null when there is none. */
  actionError: string | null;
  clearActionError: () => void;
  /** Inserts the names that aren't already saved. Resolves true on success. */
  addItems: (names: readonly string[]) => Promise<boolean>;
  /** Deletes the row with this id. Resolves true on success. */
  removeItem: (id: string) => Promise<boolean>;
};

const PantryContext = createContext<PantryValue | null>(null);

// Loaded from Supabase at startup and held in memory above the tabs, so it
// survives tab switches. Add/remove update it only after Supabase confirms.
export function PantryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<readonly PantryItem[]>([]);
  const [status, setStatus] = useState<PantryStatus>("loading");
  const [hasLoaded, setHasLoaded] = useState(false);

  const load = useCallback(async () => {
    setStatus("loading");
    const { data, error } = await supabase
      .from("pantry_items")
      .select("id, ingredient_name");
    if (error) {
      // Keep whatever was loaded before.
      setStatus("error");
      return;
    }
    setItems(
      data.map((row) => ({ id: String(row.id), name: row.ingredient_name })),
    );
    setHasLoaded(true);
    setStatus("ready");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  // A ref guards against a second tap landing before `busy` re-renders.
  const inFlight = useRef(false);

  const clearActionError = useCallback(() => setActionError(null), []);

  const runAction = useCallback(
    async (failureMessage: string, action: () => Promise<boolean>) => {
      if (inFlight.current) return false;
      inFlight.current = true;
      setBusy(true);
      setActionError(null);
      try {
        const ok = await action();
        if (!ok) setActionError(failureMessage);
        return ok;
      } catch {
        setActionError(failureMessage);
        return false;
      } finally {
        inFlight.current = false;
        setBusy(false);
      }
    },
    [],
  );

  const addItems = useCallback(
    (names: readonly string[]) =>
      runAction(
        "Couldn’t save your ingredients. Please try again.",
        async () => {
          const fresh = [...new Set(names)].filter(
            (name) => !items.some((item) => item.name === name),
          );
          if (fresh.length === 0) return true;
          const { data, error } = await supabase
            .from("pantry_items")
            .insert(fresh.map((ingredient_name) => ({ ingredient_name })))
            .select("id, ingredient_name");
          if (error || !data) return false;
          const saved = data.map((row) => ({
            id: String(row.id),
            name: row.ingredient_name as string,
          }));
          setItems((prev) => [...prev, ...saved]);
          return true;
        },
      ),
    [items, runAction],
  );

  const removeItem = useCallback(
    (id: string) =>
      runAction(
        "Couldn’t remove that ingredient. Please try again.",
        async () => {
          // Selecting the deleted row lets us confirm something was removed.
          const { data, error } = await supabase
            .from("pantry_items")
            .delete()
            .eq("id", id)
            .select("id");
          if (error || !data || data.length === 0) return false;
          setItems((prev) => prev.filter((item) => item.id !== id));
          return true;
        },
      ),
    [runAction],
  );

  const value = useMemo(
    () => ({
      items,
      status,
      hasLoaded,
      reload: load,
      hasItem: (name: string) => items.some((item) => item.name === name),
      busy,
      actionError,
      clearActionError,
      addItems,
      removeItem,
    }),
    [
      items,
      status,
      hasLoaded,
      load,
      busy,
      actionError,
      clearActionError,
      addItems,
      removeItem,
    ],
  );

  return (
    <PantryContext.Provider value={value}>{children}</PantryContext.Provider>
  );
}

export function usePantry() {
  const ctx = useContext(PantryContext);
  if (!ctx) throw new Error("usePantry must be used inside PantryProvider");
  return ctx;
}
