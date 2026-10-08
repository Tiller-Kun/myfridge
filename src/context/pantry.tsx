import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

type PantryValue = {
  items: readonly string[];
  hasItem: (name: string) => boolean;
  addItems: (names: readonly string[]) => void;
  removeItem: (name: string) => void;
};

const PantryContext = createContext<PantryValue | null>(null);

// In-memory only: lives above the tabs, so it survives tab switches but
// resets when the app reloads.
export function PantryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<readonly string[]>([]);

  const addItems = useCallback((names: readonly string[]) => {
    setItems((prev) => [...prev, ...names.filter((n) => !prev.includes(n))]);
  }, []);

  const removeItem = useCallback((name: string) => {
    setItems((prev) => prev.filter((n) => n !== name));
  }, []);

  const value = useMemo(
    () => ({
      items,
      hasItem: (name: string) => items.includes(name),
      addItems,
      removeItem,
    }),
    [items, addItems, removeItem],
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
