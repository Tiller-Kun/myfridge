import { Stack } from "expo-router";

import { FavoritesProvider } from "@/context/favorites";
import { GroceriesProvider } from "@/context/groceries";
import { PantryProvider } from "@/context/pantry";

export default function RootLayout() {
  return (
    <FavoritesProvider>
      <PantryProvider>
        <GroceriesProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="recipe/[id]" options={{ title: "Recipe" }} />
            <Stack.Screen
              name="add-ingredients"
              options={{ title: "Add ingredients", presentation: "modal" }}
            />
          </Stack>
        </GroceriesProvider>
      </PantryProvider>
    </FavoritesProvider>
  );
}
