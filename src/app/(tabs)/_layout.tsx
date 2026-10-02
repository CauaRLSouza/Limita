import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs } from "expo-router";
import {
  ColorValue,
  StyleSheet,
  View,
} from "react-native";

import { useTheme } from "../../theme/ThemeContext";

export default function TabsLayout() {
  const {
    theme,
    activeSpecialTheme,
  } = useTheme();

  const isMeanGirls =
    activeSpecialTheme === "meanGirls";

  const isPride =
    activeSpecialTheme === "pride";

  const hasDecorativeBackground =
    isMeanGirls || isPride;

  function renderTabIcon(
    name:
      | "home"
      | "history"
      | "donut-large"
      | "account-balance-wallet"
      | "person",
    color: ColorValue,
    size: number,
    focused: boolean
  ) {
    if (isPride && focused) {
      return (
        <LinearGradient
          colors={[
            "#FF2D55",
            "#FF8A00",
            "#FFD60A",
            "#22C55E",
            "#06B6D4",
            "#2563EB",
            "#7C3AED",
            "#D946EF",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.prideTabIcon}
        >
          <MaterialIcons
            name={name}
            size={size - 3}
            color="#FFFFFF"
          />
        </LinearGradient>
      );
    }

    return (
      <View style={styles.normalTabIcon}>
        <MaterialIcons
          name={name}
          size={size}
          color={color}
        />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        sceneStyle: {
          backgroundColor:
            hasDecorativeBackground
              ? "transparent"
              : theme.colors.background,
        },

        tabBarStyle: {
          backgroundColor:
            theme.colors.surface,
          borderTopColor:
            theme.colors.border,
        },

        tabBarActiveTintColor:
          isPride
            ? theme.colors.text
            : theme.colors.primary,

        tabBarInactiveTintColor:
          theme.colors.textSecondary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarIcon: ({
            color,
            size,
            focused,
          }) =>
            renderTabIcon(
              "home",
              color,
              size,
              focused
            ),
        }}
      />

      <Tabs.Screen
        name="historico"
        options={{
          title: "Histórico",
          tabBarIcon: ({
            color,
            size,
            focused,
          }) =>
            renderTabIcon(
              "history",
              color,
              size,
              focused
            ),
        }}
      />

      <Tabs.Screen
        name="extrato"
        options={{
          title: "Extrato",
          tabBarIcon: ({
            color,
            size,
            focused,
          }) =>
            renderTabIcon(
              "donut-large",
              color,
              size,
              focused
            ),
        }}
      />

      <Tabs.Screen
        name="orcamentos"
        options={{
          title: "Orçamentos",
          tabBarIcon: ({
            color,
            size,
            focused,
          }) =>
            renderTabIcon(
              "account-balance-wallet",
              color,
              size,
              focused
            ),
        }}
      />

      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: ({
            color,
            size,
            focused,
          }) =>
            renderTabIcon(
              "person",
              color,
              size,
              focused
            ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  normalTabIcon: {
    alignItems: "center",
    justifyContent: "center",
  },

  prideTabIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
});