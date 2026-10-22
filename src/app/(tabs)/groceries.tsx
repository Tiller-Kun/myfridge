import { useEffect, useRef, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import {
  FlashNotice,
  PantryActionError,
  PantryLoadError,
  PantryLoading,
  PantryStaleNotice,
} from "@/components/pantry-status";
import { PrimaryButton } from "@/components/primary-button";
import { colors, fontSizes, spacing } from "@/constants/tokens";
import { useGroceries } from "@/context/groceries";

export default function GroceriesScreen() {
  const {
    items,
    status,
    hasLoaded,
    reload,
    busy,
    actionError,
    clearActionError,
    setChecked,
    removeItem,
    moveCheckedToPantry,
  } = useGroceries();
  const [moving, setMoving] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (flashTimer.current) clearTimeout(flashTimer.current);
    },
    [],
  );

  const checkedCount = items.filter((item) => item.checked).length;

  const move = async () => {
    if (flashTimer.current) clearTimeout(flashTimer.current);
    setFlash(null);
    setMoving(true);
    const moved = await moveCheckedToPantry();
    setMoving(false);
    if (moved) {
      setFlash(
        `Moved ${moved} ${moved === 1 ? "item" : "items"} to your pantry.`,
      );
      flashTimer.current = setTimeout(() => setFlash(null), 3000);
    }
  };

  if (!hasLoaded && status === "loading") {
    return <PantryLoading background={colors.cream} subject="grocery list" />;
  }
  if (!hasLoaded && status === "error") {
    return (
      <PantryLoadError
        background={colors.cream}
        onRetry={reload}
        subject="grocery list"
      />
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>Your grocery list is empty</Text>
        <Text style={styles.emptyText}>
          Ingredients you need to buy will show up here, where you can check
          them off as you shop.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.content}
      data={items}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View style={styles.header}>
          {flash && <FlashNotice message={flash} />}
          {actionError && (
            <PantryActionError
              message={actionError}
              onDismiss={clearActionError}
            />
          )}
          {status === "error" && (
            <PantryStaleNotice onRetry={reload} subject="grocery list" />
          )}
          <PrimaryButton
            label={moving ? "Moving…" : `Move to Pantry (${checkedCount})`}
            onPress={move}
            disabled={busy || checkedCount === 0}
          />
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Pressable
            style={styles.check}
            disabled={busy}
            onPress={() => setChecked(item.id, !item.checked)}
            accessibilityRole="checkbox"
            accessibilityLabel={item.name}
            accessibilityState={{ checked: item.checked, disabled: busy }}
          >
            <View style={[styles.box, item.checked && styles.boxChecked]}>
              {item.checked && <Text style={styles.tick}>✓</Text>}
            </View>
            <Text style={[styles.name, item.checked && styles.nameChecked]}>
              {item.name}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => removeItem(item.id)}
            disabled={busy}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${item.name} from grocery list`}
          >
            <Text style={[styles.remove, busy && styles.busy]}>Remove</Text>
          </Pressable>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { backgroundColor: colors.cream },
  content: { padding: spacing.md, gap: spacing.sm },
  header: { marginBottom: spacing.sm },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  check: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
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
  nameChecked: { color: colors.textMuted, textDecorationLine: "line-through" },
  remove: { fontSize: fontSizes.sm, fontWeight: "600", color: colors.accent },
  busy: { opacity: 0.4 },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.cream,
  },
  emptyTitle: { fontSize: fontSizes.xl, fontWeight: "700", color: colors.text },
  emptyText: {
    fontSize: fontSizes.md,
    color: colors.textMuted,
    textAlign: "center",
  },
});
