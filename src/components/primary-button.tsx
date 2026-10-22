import { Pressable, StyleSheet, Text } from "react-native";

import { colors, fontSizes, spacing } from "@/constants/tokens";

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      style={[styles.button, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
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
  disabled: { opacity: 0.45 },
  label: {
    color: colors.onAccent,
    fontSize: fontSizes.md,
    fontWeight: "600",
  },
});
