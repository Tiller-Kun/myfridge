import { Stack, useLocalSearchParams } from "expo-router";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import {
  colors,
  difficultyColors,
  fontSizes,
  spacing,
} from "@/constants/tokens";
import { RECIPES } from "@/data/recipes";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width, height } = useWindowDimensions();
  const recipe = RECIPES.find((r) => r.id === id);

  if (!recipe) {
    return (
      <View style={styles.empty}>
        <Text style={styles.summary}>Recipe not found.</Text>
      </View>
    );
  }

  const badge = difficultyColors[recipe.difficulty];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Stack.Screen
        options={{ title: recipe.title, headerBackTitle: "Recipes" }}
      />
      <Image
        source={recipe.image}
        style={{ width, height: Math.min(width, height * 0.45) }}
        resizeMode="cover"
      />

      <View style={styles.section}>
        <Text style={styles.title}>{recipe.title}</Text>
        <Text style={styles.summary}>{recipe.summary}</Text>
      </View>

      <View style={styles.stats}>
        <Stat label="Cook time" value={`${recipe.cookTimeMinutes} min`} />
        <View style={[styles.stat, { backgroundColor: badge.background }]}>
          <Text style={[styles.statValue, { color: badge.text }]}>
            {recipe.difficulty}
          </Text>
          <Text style={[styles.statLabel, { color: badge.text }]}>
            Difficulty
          </Text>
        </View>
        <Stat label="Servings" value={String(recipe.servings)} />
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Ingredients</Text>
        {recipe.ingredients.map((item) => (
          <View key={item.name} style={styles.ingredientRow}>
            <Text style={styles.ingredientName}>{item.name}</Text>
            <Text style={styles.ingredientAmount}>
              {item.quantity}
              {item.unit ? ` ${item.unit}` : ""}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Steps</Text>
        {recipe.steps.map((step, index) => (
          <View key={index} style={styles.stepRow}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xl, gap: spacing.lg },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  section: { paddingHorizontal: spacing.md, gap: spacing.sm },
  title: { fontSize: 32, fontWeight: "800", color: colors.text },
  summary: { fontSize: fontSizes.md, color: colors.textMuted, lineHeight: 22 },
  stats: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  stat: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.md,
    borderRadius: spacing.md,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  statValue: { fontSize: fontSizes.lg, fontWeight: "700", color: colors.text },
  statLabel: { fontSize: fontSizes.sm, color: colors.textMuted },
  heading: { fontSize: fontSizes.lg, fontWeight: "700", color: colors.text },
  ingredientRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  ingredientName: {
    fontSize: fontSizes.sm,
    color: colors.text,
    textTransform: "capitalize",
  },
  ingredientAmount: { fontSize: fontSizes.sm, color: colors.textMuted },
  stepRow: {
    flexDirection: "row",
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    fontSize: fontSizes.sm,
    fontWeight: "700",
    color: colors.text,
  },
  stepText: {
    flex: 1,
    fontSize: fontSizes.md,
    color: colors.text,
    lineHeight: 22,
  },
});
