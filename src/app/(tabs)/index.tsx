import { FlatList, StyleSheet } from "react-native";

import { RecipeCard } from "@/components/recipe-card";
import { colors, spacing } from "@/constants/tokens";
import { RECIPES } from "@/data/recipes";

export default function RecipesScreen() {
  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.content}
      data={RECIPES}
      keyExtractor={(recipe) => recipe.id}
      renderItem={({ item }) => <RecipeCard recipe={item} />}
    />
  );
}

const styles = StyleSheet.create({
  list: { backgroundColor: colors.cream },
  content: { padding: spacing.md, gap: spacing.md },
});
