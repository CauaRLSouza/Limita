import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useTheme } from "../theme/ThemeContext";

type ThemeBackgroundProps = {
  children: ReactNode;
};

export default function ThemeBackground({
  children,
}: ThemeBackgroundProps) {
  const {
    theme,
    activeSpecialTheme,
  } = useTheme();

  const isMeanGirls =
    activeSpecialTheme === "meanGirls";

  const isPride =
    activeSpecialTheme === "pride";

  if (isMeanGirls) {
    return (
      <View style={styles.meanGirlsBackground}>
        <MeanGirlsDecorations />

        <View style={styles.content}>
          {children}
        </View>
      </View>
    );
  }

  if (isPride) {
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
        <View style={styles.content}>
          {children}
        </View>

        <PrideDecorations />
      </View>
    );
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

function PrideDecorations() {
  return (
    <View
      pointerEvents="none"
      style={styles.prideDecorationsLayer}
    >
      <View style={styles.prideCornerLayer}>
        <View style={styles.prideCorner}>
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
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.prideGradient}
          />
        </View>
      </View>

      <PrideHeart
        style={styles.prideHeartUpperLeft}
        rotation="-15deg"
      />

      <PrideHeart
        style={styles.prideHeartUpperRight}
        rotation="14deg"
      />

      <PrideHeart
        style={styles.prideHeartMiddleLeft}
        rotation="12deg"
      />

      <PrideHeart
        style={styles.prideHeartMiddleRight}
        rotation="-13deg"
      />

      <PrideHeart
        style={styles.prideHeartLowerLeft}
        rotation="-10deg"
      />

      <PrideHeart
        style={styles.prideHeartLowerRight}
        rotation="15deg"
      />
    </View>
  );
}

type PrideHeartProps = {
  style: object;
  rotation: string;
};

function PrideHeart({
  style,
  rotation,
}: PrideHeartProps) {
  return (
    <View
      style={[
        styles.prideHeartContainer,
        style,
        {
          transform: [
            {
              rotate: rotation,
            },
          ],
        },
      ]}
    >
      <LinearGradient
        colors={[
          "#F9A8D4",
          "#FDE68A",
          "#A7F3D0",
          "#BFDBFE",
          "#DDD6FE",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.prideHeartGradient}
      >
        <MaterialIcons
          name="favorite"
          size={34}
          color="#FFFFFF"
          style={styles.prideHeartMask}
        />
      </LinearGradient>
    </View>
  );
}

function MeanGirlsDecorations() {
  return (
    <View
      pointerEvents="none"
      style={styles.decorationsLayer}
    >
      <Text
        style={[
          styles.crown,
          styles.crownTop,
        ]}
      >
        ♕
      </Text>

      <Text
        style={[
          styles.xoxo,
          styles.xoxoTop,
        ]}
      >
        XOXO
      </Text>

      <MaterialIcons
        name="auto-awesome"
        size={38}
        color="#DC6597"
        style={[
          styles.doodle,
          styles.sparkleTop,
        ]}
      />

      <MaterialIcons
        name="favorite-border"
        size={44}
        color="#DC6597"
        style={[
          styles.doodle,
          styles.heartUpper,
        ]}
      />

      <Text
        style={[
          styles.crown,
          styles.crownMiddle,
        ]}
      >
        ♕
      </Text>

      <MaterialIcons
        name="auto-awesome"
        size={34}
        color="#DC6597"
        style={[
          styles.doodle,
          styles.sparkleMiddle,
        ]}
      />

      <Text
        style={[
          styles.xoxo,
          styles.xoxoMiddle,
        ]}
      >
        XOXO
      </Text>

      <MaterialIcons
        name="favorite-border"
        size={48}
        color="#DC6597"
        style={[
          styles.doodle,
          styles.heartLower,
        ]}
      />

      <Text
        style={[
          styles.crown,
          styles.crownLower,
        ]}
      >
        ♕
      </Text>

      <MaterialIcons
        name="auto-awesome"
        size={40}
        color="#DC6597"
        style={[
          styles.doodle,
          styles.sparkleLower,
        ]}
      />

      <Text
        style={[
          styles.xoxo,
          styles.xoxoBottom,
        ]}
      >
        XOXO
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    flex: 1,
  },

  meanGirlsBackground: {
    flex: 1,
    backgroundColor: "#F4B3CF",
  },

  prideDecorationsLayer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 1000,
    elevation: 1000,
  },

  prideCornerLayer: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 145,
    height: 105,
    overflow: "hidden",
  },

  prideCorner: {
    position: "absolute",
    width: 190,
    height: 95,
    top: -50,
    right: -45,
    borderBottomLeftRadius: 120,
    overflow: "hidden",
    transform: [
      {
        rotate: "15deg",
      },
    ],
  },

  prideGradient: {
    flex: 1,
  },

  prideHeartContainer: {
    position: "absolute",
    width: 42,
    height: 42,
    opacity: 0.42,
  },

  prideHeartGradient: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
  },

  prideHeartMask: {
    opacity: 0.85,
  },

  prideHeartUpperLeft: {
    top: 170,
    left: 16,
  },

  prideHeartUpperRight: {
    top: 285,
    right: 18,
  },

  prideHeartMiddleLeft: {
    top: "43%",
    left: 18,
  },

  prideHeartMiddleRight: {
    top: "55%",
    right: 17,
  },

  prideHeartLowerLeft: {
    bottom: 175,
    left: 18,
  },

  prideHeartLowerRight: {
    bottom: 78,
    right: 18,
  },

  decorationsLayer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },

  doodle: {
    position: "absolute",
    opacity: 0.25,
  },

  xoxo: {
    position: "absolute",
    color: "#DC6597",
    fontSize: 25,
    fontWeight: "900",
    fontStyle: "italic",
    letterSpacing: 1,
    opacity: 0.24,
  },

  crown: {
    position: "absolute",
    color: "#DC6597",
    fontSize: 58,
    lineHeight: 64,
    fontWeight: "700",
    opacity: 0.24,
  },

  crownTop: {
    top: 74,
    right: 22,
    transform: [
      {
        rotate: "17deg",
      },
    ],
  },

  xoxoTop: {
    top: 170,
    left: 16,
    transform: [
      {
        rotate: "-13deg",
      },
    ],
  },

  sparkleTop: {
    top: 245,
    right: 26,
    transform: [
      {
        rotate: "13deg",
      },
    ],
  },

  heartUpper: {
    top: 315,
    left: 18,
    transform: [
      {
        rotate: "-16deg",
      },
    ],
  },

  crownMiddle: {
    top: "43%",
    right: 18,
    transform: [
      {
        rotate: "13deg",
      },
    ],
  },

  sparkleMiddle: {
    top: "51%",
    left: 24,
    transform: [
      {
        rotate: "-9deg",
      },
    ],
  },

  xoxoMiddle: {
    top: "59%",
    right: 15,
    transform: [
      {
        rotate: "15deg",
      },
    ],
  },

  heartLower: {
    top: "68%",
    left: 20,
    transform: [
      {
        rotate: "14deg",
      },
    ],
  },

  crownLower: {
    bottom: 125,
    right: 20,
    transform: [
      {
        rotate: "-16deg",
      },
    ],
  },

  sparkleLower: {
    bottom: 78,
    left: 24,
    transform: [
      {
        rotate: "11deg",
      },
    ],
  },

  xoxoBottom: {
    bottom: 25,
    right: 18,
    transform: [
      {
        rotate: "-10deg",
      },
    ],
  },
});