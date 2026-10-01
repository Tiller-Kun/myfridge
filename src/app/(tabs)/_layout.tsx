import { Tabs } from "expo-router";

import { colors } from "@/constants/tokens";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: colors.primary }}>
      <Tabs.Screen name="index" options={{ title: "Recipes" }} />
      <Tabs.Screen name="pantry" options={{ title: "Pantry" }} />
      <Tabs.Screen name="groceries" options={{ title: "Groceries" }} />
    </Tabs>
  );
}
