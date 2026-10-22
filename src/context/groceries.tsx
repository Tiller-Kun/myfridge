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

import { usePantry } from "@/context/pantry";
import { supabase } from "@/lib/supabase";

export type GroceryItem = { id: string; name: string; checked: boolean };

type GroceryStatus = "loading" | "ready" | "error";

type GroceriesValue = {
  items: readonly GroceryItem[];
  status: GroceryStatus;
  hasLoaded: boolean;
  reload: () => void;
  /** True while a checkbox save or delete is in flight. */
  busy: boolean;
  actionError: string | null;
  clearActionError: () => void;
  /** Saves the checkbox state for one item. Resolves true on success. */
  setChecked: (id: string, checked: boolean) => Promise<boolean>;
  /** Deletes one item by id. Resolves true on success. */
  removeItem: (id: string) => Promise<boolean>;
  /**
   * Adds the names that aren't already on the list. Resolves with the rows
   * that were newly inserted (empty if nothing was new), or null on failure.
   */
  addMissing: (names: readonly string[]) => Promise<GroceryItem[] | null>;
  /**
   * Saves every checked item to the pantry, then removes those items from the
   * grocery list. Resolves with how many were moved, or null on failure.
   */
  moveCheckedToPantry: () => Promise<number | null>;
};

const GroceriesContext = createContext<GroceriesValue | null>(null);

// Mirrors the Pantry provider: loaded from Supabase at startup, held above the
// tabs, and changed locally only after Supabase confirms each write.
export function GroceriesProvider({ children }: { children: ReactNode }) {
  const { saveNames } = usePantry();
  const [items, setItems] = useState<readonly GroceryItem[]>([]);
  const [status, setStatus] = useState<GroceryStatus>("loading");
  const [hasLoaded, setHasLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const inFlight = useRef(false);

  const load = useCallback(async () => {
    setStatus("loading");
    const { data, error } = await supabase
      .from("grocery_items")
      .select("id, ingredient_name, is_checked");
    if (error || !data) {
      // Keep whatever was loaded before.
      setStatus("error");
      return;
    }
    setItems(
      data.map((row) => ({
        id: String(row.id),
        name: row.ingredient_name as string,
        checked: Boolean(row.is_checked),
      })),
    );
    setHasLoaded(true);
    setStatus("ready");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const clearActionError = useCallback(() => setActionError(null), []);

  const runAction = useCallback(
    async (failureMessage: string | null, action: () => Promise<boolean>) => {
      if (inFlight.current) return false;
      inFlight.current = true;
      setBusy(true);
      setActionError(null);
      try {
        const ok = await action();
        if (!ok && failureMessage) setActionError(failureMessage);
        return ok;
      } catch {
        if (failureMessage) setActionError(failureMessage);
        return false;
      } finally {
        inFlight.current = false;
        setBusy(false);
      }
    },
    [],
  );

  const setChecked = useCallback(
    (id: string, checked: boolean) =>
      runAction("Couldn’t update that item. Please try again.", async () => {
        // Selecting the updated row confirms something was actually changed.
        const { data, error } = await supabase
          .from("grocery_items")
          .update({ is_checked: checked })
          .eq("id", id)
          .select("id");
        if (error || !data || data.length === 0) return false;
        setItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, checked } : item)),
        );
        return true;
      }),
    [runAction],
  );

  const removeItem = useCallback(
    (id: string) =>
      runAction("Couldn’t remove that item. Please try again.", async () => {
        const { data, error } = await supabase
          .from("grocery_items")
          .delete()
          .eq("id", id)
          .select("id");
        if (error || !data || data.length === 0) return false;
        setItems((prev) => prev.filter((item) => item.id !== id));
        return true;
      }),
    [runAction],
  );

  const addMissing = useCallback(
    async (names: readonly string[]) => {
      let inserted: GroceryItem[] = [];
      // The caller shows its own message, so no shared action error here.
      const ok = await runAction(null, async () => {
        const rows = [...new Set(names)].map((ingredient_name) => ({
          ingredient_name,
          is_checked: false,
        }));
        // ignoreDuplicates skips names already on the list, so existing rows
        // (and their checked state) are untouched and only new rows return.
        const { data, error } = await supabase
          .from("grocery_items")
          .upsert(rows, {
            onConflict: "ingredient_name",
            ignoreDuplicates: true,
          })
          .select("id, ingredient_name, is_checked");
        if (error || !data) return false;
        inserted = data.map((row) => ({
          id: String(row.id),
          name: row.ingredient_name as string,
          checked: Boolean(row.is_checked),
        }));
        if (inserted.length > 0) {
          setItems((prev) => [
            ...prev,
            ...inserted.filter((row) => !prev.some((p) => p.id === row.id)),
          ]);
        }
        return true;
      });
      return ok ? inserted : null;
    },
    [runAction],
  );

  const moveCheckedToPantry = useCallback(async () => {
    const selected = items.filter((item) => item.checked);
    if (selected.length === 0) return null;
    let moved: number | null = null;
    await runAction(null, async () => {
      // 1. Save to the pantry first. Nothing leaves Groceries unless this works.
      if (!(await saveNames(selected.map((item) => item.name)))) {
        setActionError("Couldn’t move those items. Please try again.");
        return false;
      }
      // 2. Only now delete them from Groceries. If this fails the items are
      //    already in the pantry, so a retry skips them rather than duplicating.
      const ids = selected.map((item) => item.id);
      const { data, error } = await supabase
        .from("grocery_items")
        .delete()
        .in("id", ids)
        .select("id");
      if (error || !data || data.length === 0) {
        setActionError(
          "Your items were saved to the pantry, but couldn’t be cleared from this list. Tap Move to Pantry to try again.",
        );
        return false;
      }
      setItems((prev) => prev.filter((item) => !ids.includes(item.id)));
      moved = ids.length;
      return true;
    });
    return moved;
  }, [items, runAction, saveNames]);

  const value = useMemo(
    () => ({
      items,
      status,
      hasLoaded,
      reload: load,
      busy,
      actionError,
      clearActionError,
      setChecked,
      removeItem,
      addMissing,
      moveCheckedToPantry,
    }),
    [
      items,
      status,
      hasLoaded,
      load,
      busy,
      actionError,
      clearActionError,
      setChecked,
      removeItem,
      addMissing,
      moveCheckedToPantry,
    ],
  );

  return (
    <GroceriesContext.Provider value={value}>
      {children}
    </GroceriesContext.Provider>
  );
}

export function useGroceries() {
  const ctx = useContext(GroceriesContext);
  if (!ctx)
    throw new Error("useGroceries must be used inside GroceriesProvider");
  return ctx;
}
