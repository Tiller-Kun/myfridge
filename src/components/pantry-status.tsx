import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "@/components/primary-button";
import { colors, fontSizes, spacing } from "@/constants/tokens";

export function PantryLoading({
  background,
  subject = "pantry",
}: {
  background: string;
  subject?: string;
}) {
  return (
    <View style={[styles.center, { backgroundColor: background }]}>
      <ActivityIndicator color={colors.accent} />
      <Text style={styles.text}>Loading your {subject}…</Text>
    </View>
  );
}

export function PantryLoadError({
  background,
  onRetry,
  subject = "pantry",
}: {
  background: string;
  onRetry: () => void;
  subject?: string;
}) {
  return (
    <View style={[styles.center, { backgroundColor: background }]}>
      <Text style={styles.title}>Couldn’t load your {subject}</Text>
      <Text style={styles.text}>Check your connection and try again.</Text>
      <PrimaryButton label="Try again" onPress={onRetry} />
    </View>
  );
}

/** Inline notice for when a refresh failed but earlier data is still shown. */
export function PantryStaleNotice({
  onRetry,
  subject = "pantry",
}: {
  onRetry: () => void;
  subject?: string;
}) {
  return (
    <View style={styles.notice}>
      <Text style={styles.noticeText}>Couldn’t refresh your {subject}.</Text>
      <Text
        style={styles.noticeAction}
        onPress={onRetry}
        accessibilityRole="button"
      >
        Retry
      </Text>
    </View>
  );
}

/** Brief confirmation in the same card style as the notices; the caller hides it. */
export function FlashNotice({ message }: { message: string }) {
  return (
    <View style={styles.notice} accessibilityLiveRegion="polite">
      <Text style={[styles.noticeText, styles.flashText]}>{message}</Text>
    </View>
  );
}

/** Inline error for a failed add/remove, with a way to dismiss it. */
export function PantryActionError({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  return (
    <View style={styles.notice}>
      <Text style={[styles.noticeText, styles.noticeMessage]}>{message}</Text>
      <Text
        style={styles.noticeAction}
        onPress={onDismiss}
        accessibilityRole="button"
      >
        Dismiss
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: { fontSize: fontSizes.xl, fontWeight: "700", color: colors.text },
  text: {
    fontSize: fontSizes.md,
    color: colors.textMuted,
    textAlign: "center",
  },
  notice: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.md,
    borderRadius: spacing.md,
    backgroundColor: colors.card,
    marginBottom: spacing.sm,
  },
  flashText: { color: colors.success },
  noticeMessage: { flex: 1, marginRight: spacing.md },
  noticeText: { fontSize: fontSizes.sm, color: colors.missing },
  noticeAction: {
    fontSize: fontSizes.sm,
    fontWeight: "600",
    color: colors.accent,
  },
});
