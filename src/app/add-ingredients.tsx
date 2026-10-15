import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fontSizes, spacing } from "@/constants/tokens";
import { usePantry } from "@/context/pantry";
import { ALL_INGREDIENT_NAMES } from "@/data/recipes";

export default function AddIngredientsModal() {
  const router = useRouter();
  const { hasItem, addItems, busy, actionError, clearActionError } =
    usePantry();
  // Don't show a stale error from an earlier pantry action.
  useEffect(() => {
    clearActionError();
  }, [clearActionError]);

  // Local draft: only committed to the pantry when Done is pressed.
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());

  const toggle = (name: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (!next.delete(name)) next.add(name);
      return next;
    });

  const close = () => {
    clearActionError();
    router.back();
  };
  const done = async () => {
    // Close only after Supabase confirms; on failure stay open with the error.
    if (await addItems([...selected])) router.back();
  };

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <Pressable
              onPress={close}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Text style={styles.close}>✕</Text>
            </Pressable>
          ),
          headerRight: () => (
            <Pressable
              onPress={done}
              disabled={busy}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Done"
            >
              <Text style={[styles.done, busy && styles.doneBusy]}>
                {busy ? "Saving…" : "Done"}
              </Text>
            </Pressable>
          ),
        }}
      />
      {actionError && <Text style={styles.error}>{actionError}</Text>}
      <FlatList
        data={ALL_INGREDIENT_NAMES}
        keyExtractor={(name) => name}
        contentContainerStyle={styles.content}
        renderItem={({ item }) => {
          const inPantry = hasItem(item);
          const checked = inPantry || selected.has(item);
          return (
            <Pressable
              style={[styles.row, inPantry && styles.rowDisabled]}
              disabled={inPantry}
              onPress={() => toggle(item)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked, disabled: inPantry }}
            >
              <View style={[styles.box, checked && styles.boxChecked]}>
                {checked && <Text style={styles.tick}>✓</Text>}
              </View>
              <Text style={styles.name}>{item}</Text>
              {inPantry && <Text style={styles.note}>In pantry</Text>}
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.xs },
  close: {
    fontSize: fontSizes.lg,
    color: colors.text,
    paddingHorizontal: spacing.md,
  },
  done: {
    fontSize: fontSizes.md,
    fontWeight: "600",
    color: colors.accent,
    paddingHorizontal: spacing.md,
  },
  doneBusy: { opacity: 0.5 },
  error: {
    fontSize: fontSizes.sm,
    color: colors.missing,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowDisabled: { opacity: 0.5 },
  box: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.textMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  boxChecked: { backgroundColor: colors.accent, borderColor: colors.accent },
  tick: { color: colors.onAccent, fontSize: fontSizes.sm, fontWeight: "700" },
  name: {
    flex: 1,
    fontSize: fontSizes.md,
    color: colors.text,
    textTransform: "capitalize",
  },
  note: { fontSize: fontSizes.sm, color: colors.textMuted },
});
