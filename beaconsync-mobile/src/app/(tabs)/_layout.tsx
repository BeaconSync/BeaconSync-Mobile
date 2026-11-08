import { Tabs } from "expo-router";
import { Bell, House, UserRound, Users } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import TabIcon from "../../components/TabIcon";
import { colors } from "../../theme/colors";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarHideOnKeyboard: true,
        tabBarLabelPosition: "below-icon",
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 64 + insets.bottom,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 8),
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="inicio"
        options={{
          title: "Início",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon={House}
              color={focused ? colors.primary : colors.textSecondary}
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="pessoas"
        options={{
          title: "Pessoas",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon={Users}
              color={focused ? colors.primary : colors.textSecondary}
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="alertas"
        options={{
          title: "Alertas",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon={Bell}
              color={focused ? colors.primary : colors.textSecondary}
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon={UserRound}
              color={focused ? colors.primary : colors.textSecondary}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}