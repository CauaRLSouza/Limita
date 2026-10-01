import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

import { useTheme } from "../theme/ThemeContext";

type ThemeBackgroundProps = {
  children: ReactNode;
};

const prideColors = [
  "#FF2D55",
  "#FF8A00",
  "#FFD60A",
  "#22C55E",
  "#06B6D4",
  "#2563EB",
  "#7C3AED",
  "#D946EF",
] as const;

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
        <PrideDecorations />

        <View style={styles.content}>
          {children}
        </View>

        <PrideCorner />
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
      <PrideHeart
        style={styles.prideHeartUpperLeft}
        rotation="-15deg"
        size={48}
      />

      <PrideHeart
        style={styles.prideHeartUpperRight}
        rotation="14deg"
        size={42}
      />

      <PrideHeart
        style={styles.prideHeartMiddleLeft}
        rotation="12deg"
        size={46}
      />

      <PrideHeart
        style={styles.prideHeartMiddleRight}
        rotation="-13deg"
        size={50}
      />

      <PrideHeart
        style={styles.prideHeartLowerLeft}
        rotation="-10deg"
        size={44}
      />

      <PrideHeart
        style={styles.prideHeartLowerRight}
        rotation="15deg"
        size={48}
      />
    </View>
  );
}

function PrideCorner() {
  return (
    <View
      pointerEvents="none"
      style={styles.prideCornerLayer}
    >
      <View style={styles.prideCorner}>
        <LinearGradient
          colors={prideColors}
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
  );
}

type PrideHeartProps = {
  style: StyleProp<ViewStyle>;
  rotation: string;
  size: number;
};

function PrideHeart({
  style,
  rotation,
  size,
}: PrideHeartProps) {
  return (
    <View
      style={[
        styles.prideHeartContainer,
        style,
        {
          width: size,
          height: size,
          transform: [
            {
              rotate: rotation,
            },
          ],
        },
      ]}
    >
      <MaskedView
        style={{
          width: size,
          height: size,
        }}
        maskElement={
          <View
            style={[
              styles.heartMaskContainer,
              {
                width: size,
                height: size,
              },
            ]}
          >
            <MaterialIcons
              name="favorite"
              size={size}
              color="#000000"
            />
          </View>
        }
      >
        <LinearGradient
          colors={prideColors}
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
          style={{
            width: size,
            height: size,
          }}
        />
      </MaskedView>
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
  },

  prideCornerLayer: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 145,
    height: 105,
    overflow: "hidden",
    zIndex: 1000,
    elevation: 1000,
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
    opacity: 0.32,
  },

  heartMaskContainer: {
    alignItems: "center",
    justifyContent: "center",
  },

  prideHeartUpperLeft: {
    top: 178,
    left: 17,
  },

  prideHeartUpperRight: {
    top: 300,
    right: 20,
  },

  prideHeartMiddleLeft: {
    top: "43%",
    left: 19,
  },

  prideHeartMiddleRight: {
    top: "56%",
    right: 18,
  },

  prideHeartLowerLeft: {
    bottom: 178,
    left: 18,
  },

  prideHeartLowerRight: {
    bottom: 82,
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