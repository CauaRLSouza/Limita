import { usePathname } from "expo-router";
import { ReactNode } from "react";
import {
  StyleSheet,
  View,
} from "react-native";

import { useTheme } from "../theme/ThemeContext";
import AuroraBackground from "./theme-background/achievement/AuroraBackground";
import ConstellationBackground from "./theme-background/achievement/ConstellationBackground";
import OasisBackground from "./theme-background/achievement/OasisBackground";
import SparkBackground from "./theme-background/achievement/SparkBackground";
import OnWednesdays from "./theme-background/special/OnWednesdays";
import PrideBackground from "./theme-background/special/PrideBackground";

type ThemeBackgroundProps = {
  children: ReactNode;
};

export default function ThemeBackground({
  children,
}: ThemeBackgroundProps) {
  const pathname = usePathname();

  const {
    theme,
    activeSpecialTheme,
    achievementTheme,
  } = useTheme();

  const isThemesScreen = pathname === "/temas";

  if (activeSpecialTheme === "meanGirls") {
    return (
      <OnWednesdays>
        {children}
      </OnWednesdays>
    );
  }

  if (activeSpecialTheme === "pride") {
    return (
      <PrideBackground>
        {children}
      </PrideBackground>
    );
  }

  if (!isThemesScreen) {
    if (achievementTheme === "spark") {
      return (
        <SparkBackground>
          {children}
        </SparkBackground>
      );
    }

    if (achievementTheme === "oasis") {
      return (
        <OasisBackground>
          {children}
        </OasisBackground>
      );
    }

    if (achievementTheme === "aurora") {
      return (
        <AuroraBackground>
          {children}
        </AuroraBackground>
      );
    }

    if (achievementTheme === "constellation") {
      return (
        <ConstellationBackground>
          {children}
        </ConstellationBackground>
      );
    }
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            theme.colors.background,
        },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});