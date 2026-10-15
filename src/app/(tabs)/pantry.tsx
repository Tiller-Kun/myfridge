import { useRouter } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "@/components/primary-button";
import { colors, fontSizes, spacing } from "@/constants/tokens";
import { usePantry } from "@/context/pantry";

export default function PantryScreen() {
  const router = useRouter();
  const { items, removeItem } = usePantry();
  const openAdd = () => router.push("/add-ingredients");

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>Your pantry is empty</Text>
        <Text style={styles.emptyText}>
          Keep track of the ingredients you have at home. Add what you have and
          it will show up here.
        </Text>
        <PrimaryButton label="Add your first ingredient" onPress={openAdd} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.content}
      data={items}
      keyExtractor={(name) => name}
      ListHeaderComponent={
        <View style={styles.header}>
          <PrimaryButton label="Add ingredient" onPress={openAdd} />
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Text style={styles.name}>{item}</Text>
          <Pressable
            onPress={() => removeItem(item)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${item} from pantry`}
          >
            <Text style={styles.remove}>Remove</Text>
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
    backgroundColor: colors.card,
    borderRadius: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  name: {
    flex: 1,
    fontSize: fontSizes.md,
    color: colors.text,
    textTransform: "capitalize",
  },
  remove: {
    fontSize: fontSizes.sm,
    fontWeight: "600",
    color: colors.accent,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.cream,
  },
  emptyTitle: {
    fontSize: fontSizes.xl,
    fontWeight: "700",
    color: colors.text,
  },
  emptyText: {
    fontSize: fontSizes.md,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
});
