import { useMemo } from "react";
import { FlatList, StyleSheet, View } from "react-native";

import {
  PantryActionError,
  PantryStaleNotice,
} from "@/components/pantry-status";
import { RecipeCard } from "@/components/recipe-card";
import { colors, spacing } from "@/constants/tokens";
import { useFavorites } from "@/context/favorites";
import { RECIPES } from "@/data/recipes";

export default function RecipesScreen() {
  const { favoriteIds, status, reload, actionError, clearActionError } =
    useFavorites();
  // Favorites float to the top; Array.sort is stable, so the rest keep order.
  const recipes = useMemo(
    () =>
      [...RECIPES].sort(
        (a, b) => Number(favoriteIds.has(b.id)) - Number(favoriteIds.has(a.id)),
      ),
    [favoriteIds],
  );

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.content}
      data={recipes}
      keyExtractor={(recipe) => recipe.id}
      ListHeaderComponent={
        actionError || status === "error" ? (
          <View>
            {actionError && (
              <PantryActionError
                message={actionError}
                onDismiss={clearActionError}
              />
            )}
            {status === "error" && (
              <PantryStaleNotice onRetry={reload} subject="favorites" />
            )}
          </View>
        ) : null
      }
      renderItem={({ item }) => <RecipeCard recipe={item} />}
    />
  );
}

const styles = StyleSheet.create({
  list: { backgroundColor: colors.cream },
  content: { padding: spacing.md, gap: spacing.md },
});
