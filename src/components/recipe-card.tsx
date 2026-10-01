import { Link } from "expo-router";
import {
  Image,
  Pressable,
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
import { useFavorites } from "@/context/favorites";
import type { Recipe } from "@/data/recipes";

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  const badge = difficultyColors[recipe.difficulty];
  const { width } = useWindowDimensions();
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(recipe.id);
  // Photos are square: size the column from the screen width so the whole
  // dish stays in view, and keep the card at least as tall as the column.
  const imageSize = Math.min(
    Math.max((width - spacing.md * 2) * 0.38, 110),
    200,
  );

  return (
    <View style={styles.shadow}>
      <Link
        href={{ pathname: "/recipe/[id]", params: { id: recipe.id } }}
        asChild
      >
        <Pressable
          style={StyleSheet.flatten([styles.card, { minHeight: imageSize }])}
        >
          <View style={{ width: imageSize }}>
            <Image
              source={recipe.image}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
          <View style={styles.body}>
            <Text
              style={styles.title}
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
            >
              {recipe.title}
            </Text>
            <Text style={styles.summary} numberOfLines={4}>
              {recipe.summary}
            </Text>
            <View style={styles.metaRow}>
              <Text style={styles.meta}>{recipe.cookTimeMinutes} min</Text>
              <View
                style={[styles.badge, { backgroundColor: badge.background }]}
              >
                <Text style={[styles.badgeText, { color: badge.text }]}>
                  {recipe.difficulty}
                </Text>
              </View>
            </View>
            <Text style={styles.link}>View recipe ›</Text>
          </View>
        </Pressable>
      </Link>
      <Pressable
        style={styles.star}
        hitSlop={8}
        onPress={() => toggleFavorite(recipe.id)}
        accessibilityRole="button"
        accessibilityLabel={
          favorite
            ? `Remove ${recipe.title} from favorites`
            : `Add ${recipe.title} to favorites`
        }
        accessibilityState={{ selected: favorite }}
      >
        <Text style={[styles.starIcon, favorite && styles.starIconActive]}>
          {favorite ? "★" : "☆"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderRadius: spacing.md,
    overflow: "hidden",
  },
  shadow: {
    borderRadius: spacing.md,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  image: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  body: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  title: {
    marginRight: 24,
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },
  summary: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  meta: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  star: {
    position: "absolute",
    top: spacing.xs,
    right: spacing.xs,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
  },
  starIcon: {
    fontSize: 22,
    lineHeight: 26,
    color: colors.textMuted,
  },
  starIconActive: {
    color: colors.star,
  },
  link: {
    fontSize: fontSizes.sm,
    fontWeight: "600",
    color: colors.accent,
    marginTop: spacing.xs,
  },
});
