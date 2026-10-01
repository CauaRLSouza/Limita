import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import {
  StyleProp,
  View,
  ViewStyle,
} from "react-native";

import { useTheme } from "../theme/ThemeContext";

type ThemeAccentProps = {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function ThemeAccent({
  children,
  style,
}: ThemeAccentProps) {
  const {
    theme,
    activeSpecialTheme,
  } = useTheme();

  const isPride =
    activeSpecialTheme === "pride";

  if (isPride) {
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
        locations={[
          0,
          0.14,
          0.28,
          0.42,
          0.56,
          0.7,
          0.84,
          1,
        ]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={style}
      >
        {children}
      </LinearGradient>
    );
  }

  return (
    <View
      style={[
        {
          backgroundColor:
            theme.colors.primary,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}