import { Pressable, StyleSheet, Text } from "react-native";

import { colors, fontSizes, spacing } from "@/constants/tokens";

export function PrimaryButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={styles.button}
      onPress={onPress}
      accessibilityRole="button"
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.lg,
    borderRadius: 999,
    alignItems: "center",
  },
  label: {
    color: colors.onAccent,
    fontSize: fontSizes.md,
    fontWeight: "600",
  },
});
