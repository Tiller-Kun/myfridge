import { Tabs } from "expo-router";
import { SymbolView } from "expo-symbols";
import type { ComponentProps } from "react";
import type { ColorValue } from "react-native";

import { colors, fontSizes } from "@/constants/tokens";

type SymbolName = ComponentProps<typeof SymbolView>["name"];

// One outline symbol for inactive and its filled twin for active (iOS);
// Android/web use the Material symbol, with colour carrying the state.
function tabIcon(inactive: SymbolName, active: SymbolName) {
  return function TabIcon({
    color,
    focused,
  }: {
    color: ColorValue;
    focused: boolean;
  }) {
    return (
      <SymbolView
        name={focused ? active : inactive}
        tintColor={color}
        size={24}
        weight={focused ? "semibold" : "regular"}
      />
    );
  };
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: { fontSize: fontSizes.xs, fontWeight: "600" },
        headerTitleStyle: {
          fontSize: fontSizes.lg,
          fontWeight: "700",
          color: colors.text,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Recipes",
          tabBarIcon: tabIcon(
            { ios: "book", android: "menu_book", web: "menu_book" },
            { ios: "book.fill", android: "menu_book", web: "menu_book" },
          ),
        }}
      />
      <Tabs.Screen
        name="pantry"
        options={{
          title: "Pantry",
          tabBarIcon: tabIcon(
            { ios: "refrigerator", android: "kitchen", web: "kitchen" },
            { ios: "refrigerator.fill", android: "kitchen", web: "kitchen" },
          ),
        }}
      />
      <Tabs.Screen
        name="groceries"
        options={{
          title: "Groceries",
          tabBarIcon: tabIcon(
            { ios: "cart", android: "shopping_cart", web: "shopping_cart" },
            {
              ios: "cart.fill",
              android: "shopping_cart",
              web: "shopping_cart",
            },
          ),
        }}
      />
    </Tabs>
  );
}
