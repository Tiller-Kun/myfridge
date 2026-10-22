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

type FavoritesStatus = "loading" | "ready" | "error";

type FavoritesValue = {
  favoriteIds: ReadonlySet<string>;
  status: FavoritesStatus;
  hasLoaded: boolean;
  reload: () => void;
  /** True while a star change is being saved. */
  busy: boolean;
  actionError: string | null;
  clearActionError: () => void;
  isFavorite: (id: string) => boolean;
  /** Saves the flip to Supabase, then updates. Resolves true on success. */
  toggleFavorite: (id: string) => Promise<boolean>;
};

const FavoritesContext = createContext<FavoritesValue | null>(null);

// Only the recipe id is stored; the recipes themselves are fixed app data.
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<ReadonlySet<string>>(
    new Set(),
  );
  const [status, setStatus] = useState<FavoritesStatus>("loading");
  const [hasLoaded, setHasLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const inFlight = useRef(false);

  const load = useCallback(async () => {
    setStatus("loading");
    const { data, error } = await supabase
      .from("favorite_recipes")
      .select("recipe_id");
    if (error || !data) {
      // Keep whatever was loaded before.
      setStatus("error");
      return;
    }
    setFavoriteIds(new Set(data.map((row) => row.recipe_id as string)));
    setHasLoaded(true);
    setStatus("ready");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const clearActionError = useCallback(() => setActionError(null), []);

  const toggleFavorite = useCallback(
    async (id: string) => {
      if (inFlight.current) return false;
      inFlight.current = true;
      setBusy(true);
      setActionError(null);
      const adding = !favoriteIds.has(id);
      try {
        let ok: boolean;
        if (adding) {
          // Upsert so a repeat can never create a duplicate or error out.
          const { error } = await supabase
            .from("favorite_recipes")
            .upsert(
              { recipe_id: id },
              { onConflict: "recipe_id", ignoreDuplicates: true },
            );
          ok = !error;
        } else {
          const { error } = await supabase
            .from("favorite_recipes")
            .delete()
            .eq("recipe_id", id);
          ok = !error;
        }
        if (!ok) {
          setActionError("Couldn’t update your favorites. Please try again.");
          return false;
        }
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          if (adding) next.add(id);
          else next.delete(id);
          return next;
        });
        return true;
      } catch {
        setActionError("Couldn’t update your favorites. Please try again.");
        return false;
      } finally {
        inFlight.current = false;
        setBusy(false);
      }
    },
    [favoriteIds],
  );

  const value = useMemo(
    () => ({
      favoriteIds,
      status,
      hasLoaded,
      reload: load,
      busy,
      actionError,
      clearActionError,
      isFavorite: (id: string) => favoriteIds.has(id),
      toggleFavorite,
    }),
    [
      favoriteIds,
      status,
      hasLoaded,
      load,
      busy,
      actionError,
      clearActionError,
      toggleFavorite,
    ],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx)
    throw new Error("useFavorites must be used inside FavoritesProvider");
  return ctx;
}
