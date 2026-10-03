import { LinearGradient } from "expo-linear-gradient";
import {
  ReactNode,
  useEffect,
  useRef,
} from "react";
import {
  Animated,
  Easing,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

type OasisBackgroundProps = {
  children: ReactNode;
};

export default function OasisBackground({
  children,
}: OasisBackgroundProps) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[
          "#01181D",
          "#022A32",
          "#043D42",
          "#03343C",
          "#011B21",
        ]}
        locations={[0, 0.22, 0.48, 0.76, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <OasisDecorations />

      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

function OasisDecorations() {
  return (
    <View
      pointerEvents="none"
      style={styles.oasisLayer}
    >
      <AnimatedOasisHalo
        style={styles.oasisHaloTop}
        duration={7600}
        delay={0}
        movement={30}
      />

      <AnimatedOasisHalo
        style={styles.oasisHaloMiddle}
        duration={9200}
        delay={900}
        movement={-38}
      />

      <AnimatedOasisHalo
        style={styles.oasisHaloBottom}
        duration={8400}
        delay={500}
        movement={34}
      />

      <OasisSandMass
        style={styles.oasisSandTop}
        colors={[
          "rgba(232, 216, 168, 0.46)",
          "rgba(201, 173, 114, 0.32)",
          "rgba(169, 137, 78, 0.08)",
        ]}
      />

      <OasisSandMass
        style={styles.oasisSandUpper}
        colors={[
          "rgba(216, 194, 138, 0.38)",
          "rgba(190, 158, 96, 0.27)",
          "rgba(169, 137, 78, 0.06)",
        ]}
      />

      <OasisSandMass
        style={styles.oasisSandMiddle}
        colors={[
          "rgba(232, 216, 168, 0.43)",
          "rgba(199, 169, 106, 0.3)",
          "rgba(169, 137, 78, 0.07)",
        ]}
      />

      <OasisSandMass
        style={styles.oasisSandLower}
        colors={[
          "rgba(221, 201, 151, 0.42)",
          "rgba(194, 161, 98, 0.3)",
          "rgba(169, 137, 78, 0.07)",
        ]}
      />

      <OasisSandMass
        style={styles.oasisSandBottom}
        colors={[
          "rgba(232, 216, 168, 0.48)",
          "rgba(201, 173, 114, 0.34)",
          "rgba(169, 137, 78, 0.08)",
        ]}
      />

      <AnimatedTide
        style={styles.tideTop}
        duration={8200}
        delay={0}
        movement={90}
        colors={[
          "rgba(3, 105, 161, 0.12)",
          "rgba(14, 165, 233, 0.72)",
          "rgba(56, 189, 248, 0.84)",
          "rgba(14, 165, 233, 0.52)",
          "rgba(3, 105, 161, 0.08)",
        ]}
      />

      <AnimatedTide
        style={styles.tideTopHighlight}
        duration={9400}
        delay={700}
        movement={72}
        colors={[
          "rgba(14, 165, 233, 0.04)",
          "rgba(125, 211, 252, 0.62)",
          "rgba(186, 230, 253, 0.74)",
          "rgba(56, 189, 248, 0.38)",
          "rgba(14, 165, 233, 0.03)",
        ]}
      />

      <AnimatedTide
        style={styles.tideMiddle}
        duration={9800}
        delay={1200}
        movement={105}
        colors={[
          "rgba(3, 105, 161, 0.08)",
          "rgba(2, 132, 199, 0.7)",
          "rgba(14, 165, 233, 0.84)",
          "rgba(56, 189, 248, 0.55)",
          "rgba(3, 105, 161, 0.06)",
        ]}
      />

      <AnimatedTide
        style={styles.tideMiddleHighlight}
        duration={10800}
        delay={400}
        movement={78}
        colors={[
          "rgba(14, 165, 233, 0.03)",
          "rgba(56, 189, 248, 0.45)",
          "rgba(125, 211, 252, 0.7)",
          "rgba(14, 165, 233, 0.3)",
          "rgba(14, 165, 233, 0.02)",
        ]}
      />

      <AnimatedTide
        style={styles.tideBottom}
        duration={8800}
        delay={800}
        movement={96}
        colors={[
          "rgba(3, 105, 161, 0.08)",
          "rgba(2, 132, 199, 0.7)",
          "rgba(56, 189, 248, 0.8)",
          "rgba(14, 165, 233, 0.5)",
          "rgba(3, 105, 161, 0.05)",
        ]}
      />

      <AnimatedOasisBranch
        style={styles.oasisBranchTopRight}
        rotation="-20deg"
        scale={1.22}
        mirrored={false}
        variant="bright"
        duration={6200}
        delay={0}
        sway={7}
        movement={9}
      />

      <AnimatedOasisBranch
        style={styles.oasisBranchUpperLeft}
        rotation="23deg"
        scale={0.82}
        mirrored
        variant="deep"
        duration={7600}
        delay={500}
        sway={5}
        movement={7}
      />

      <AnimatedOasisBranch
        style={styles.oasisBranchMiddleRight}
        rotation="-28deg"
        scale={0.94}
        mirrored={false}
        variant="jade"
        duration={6900}
        delay={1000}
        sway={6}
        movement={8}
      />

      <AnimatedOasisBranch
        style={styles.oasisBranchLowerLeft}
        rotation="20deg"
        scale={1.05}
        mirrored
        variant="bright"
        duration={8100}
        delay={350}
        sway={7}
        movement={10}
      />

      <AnimatedOasisBranch
        style={styles.oasisBranchBottomRight}
        rotation="-32deg"
        scale={0.9}
        mirrored={false}
        variant="deep"
        duration={7300}
        delay={850}
        sway={5}
        movement={7}
      />

      <OasisGoldenGlow
        style={styles.oasisGoldTop}
        size={150}
      />

      <OasisGoldenGlow
        style={styles.oasisGoldMiddle}
        size={110}
      />

      <OasisGoldenGlow
        style={styles.oasisGoldBottom}
        size={170}
      />
    </View>
  );
}

type AnimatedOasisHaloProps = {
  style: StyleProp<ViewStyle>;
  duration: number;
  delay: number;
  movement: number;
};

function AnimatedOasisHalo({
  style,
  duration,
  delay,
  movement,
}: AnimatedOasisHaloProps) {
  const animation = useRef(
    new Animated.Value(0)
  ).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),

        Animated.timing(animation, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),

        Animated.timing(animation, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();

    return () => loop.stop();
  }, [
    animation,
    delay,
    duration,
  ]);

  const opacity =
    animation.interpolate({
      inputRange: [0, 1],
      outputRange: [0.48, 1],
    });

  const translateX =
    animation.interpolate({
      inputRange: [0, 1],
      outputRange: [
        -movement,
        movement,
      ],
    });

  const translateY =
    animation.interpolate({
      inputRange: [0, 1],
      outputRange: [
        movement * 0.18,
        -movement * 0.18,
      ],
    });

  const scale =
    animation.interpolate({
      inputRange: [0, 1],
      outputRange: [0.94, 1.08],
    });

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: [
            { translateX },
            { translateY },
            { scale },
          ],
        },
      ]}
    />
  );
}

type AnimatedTideProps = {
  style: StyleProp<ViewStyle>;
  duration: number;
  delay: number;
  movement: number;
  colors: readonly [
    string,
    string,
    string,
    string,
    string,
  ];
};

function AnimatedTide({
  style,
  duration,
  delay,
  movement,
  colors,
}: AnimatedTideProps) {
  const animation = useRef(
    new Animated.Value(0)
  ).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),

        Animated.timing(animation, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),

        Animated.timing(animation, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();

    return () => loop.stop();
  }, [
    animation,
    delay,
    duration,
  ]);

  const translateX =
    animation.interpolate({
      inputRange: [0, 1],
      outputRange: [
        -movement,
        movement,
      ],
    });

  const translateY =
    animation.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [4, -4, 4],
    });

  const scaleX =
    animation.interpolate({
      inputRange: [0, 1],
      outputRange: [0.9, 1.12],
    });

  const opacity =
    animation.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.64, 1, 0.7],
    });

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: [
            { translateX },
            { translateY },
            { scaleX },
          ],
        },
      ]}
    >
      <LinearGradient
        colors={colors}
        locations={[
          0,
          0.22,
          0.5,
          0.78,
          1,
        ]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}

function OasisSandMass({
  style,
  colors,
}: {
  style: StyleProp<ViewStyle>;
  colors: readonly [
    string,
    string,
    string,
  ];
}) {
  return (
    <View
      style={[
        styles.oasisSandMass,
        style,
      ]}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

type OasisBranchProps = {
  style: StyleProp<ViewStyle>;
  rotation: string;
  scale: number;
  mirrored: boolean;
  variant:
    | "jade"
    | "bright"
    | "deep";
  duration: number;
  delay: number;
  sway: number;
  movement: number;
};

function AnimatedOasisBranch({
  style,
  rotation,
  scale,
  mirrored,
  variant,
  duration,
  delay,
  sway,
  movement,
}: OasisBranchProps) {
  const animation = useRef(
    new Animated.Value(0)
  ).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),

        Animated.timing(animation, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),

        Animated.timing(animation, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();

    return () => loop.stop();
  }, [
    animation,
    delay,
    duration,
  ]);

  const animatedRotation =
    animation.interpolate({
      inputRange: [0, 1],
      outputRange: [
        `${-sway}deg`,
        `${sway}deg`,
      ],
    });

  const translateX =
    animation.interpolate({
      inputRange: [0, 1],
      outputRange: [
        -movement,
        movement,
      ],
    });

  const translateY =
    animation.interpolate({
      inputRange: [0, 1],
      outputRange: [3, -3],
    });

  return (
    <Animated.View
      style={[
        styles.oasisBranch,
        style,
        {
          transform: [
            { translateX },
            { translateY },
            { rotate: rotation },
            {
              rotate:
                animatedRotation,
            },
            { scale },
            {
              scaleX:
                mirrored ? -1 : 1,
            },
          ],
        },
      ]}
    >
      <OasisBranchContent
        variant={variant}
      />
    </Animated.View>
  );
}

function OasisBranchContent({
  variant,
}: {
  variant:
    | "jade"
    | "bright"
    | "deep";
}) {
  const leafColor =
    variant === "bright"
      ? "rgba(67, 245, 187, 0.58)"
      : variant === "jade"
        ? "rgba(38, 218, 164, 0.48)"
        : "rgba(20, 150, 126, 0.38)";

  const stemColor =
    variant === "bright"
      ? "rgba(115, 255, 211, 0.52)"
      : variant === "jade"
        ? "rgba(52, 222, 175, 0.44)"
        : "rgba(27, 153, 134, 0.36)";

  return (
    <>
      <View
        style={[
          styles.oasisStem,
          {
            backgroundColor:
              stemColor,
          },
        ]}
      />

      <View
        style={[
          styles.oasisLeaf,
          styles.oasisLeafOne,
          {
            backgroundColor:
              leafColor,
          },
        ]}
      />

      <View
        style={[
          styles.oasisLeaf,
          styles.oasisLeafTwo,
          {
            backgroundColor:
              leafColor,
          },
        ]}
      />

      <View
        style={[
          styles.oasisLeaf,
          styles.oasisLeafThree,
          {
            backgroundColor:
              leafColor,
          },
        ]}
      />

      <View
        style={[
          styles.oasisLeaf,
          styles.oasisLeafFour,
          {
            backgroundColor:
              leafColor,
          },
        ]}
      />

      <View
        style={[
          styles.oasisLeaf,
          styles.oasisLeafFive,
          {
            backgroundColor:
              leafColor,
          },
        ]}
      />

      <View
        style={[
          styles.oasisLeaf,
          styles.oasisLeafSix,
          {
            backgroundColor:
              leafColor,
          },
        ]}
      />
    </>
  );
}

type OasisGoldenGlowProps = {
  style: StyleProp<ViewStyle>;
  size: number;
};

function OasisGoldenGlow({
  style,
  size,
}: OasisGoldenGlowProps) {
  return (
    <View
      style={[
        styles.oasisGoldenGlow,
        style,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      <View
        style={styles.oasisGoldenRing}
      />

      <View
        style={styles.oasisGoldenCore}
      />
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

  oasisLayer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: "hidden",
  },

  oasisHaloTop: {
    position: "absolute",
    width: 420,
    height: 420,
    borderRadius: 210,
    top: -235,
    right: -165,
    backgroundColor:
      "rgba(51, 238, 183, 0.23)",
  },

  oasisHaloMiddle: {
    position: "absolute",
    width: 460,
    height: 460,
    borderRadius: 230,
    top: "29%",
    left: -335,
    backgroundColor:
      "rgba(14, 165, 198, 0.2)",
  },

  oasisHaloBottom: {
    position: "absolute",
    width: 430,
    height: 430,
    borderRadius: 215,
    bottom: -220,
    right: -250,
    backgroundColor:
      "rgba(56, 189, 248, 0.17)",
  },

  oasisSandMass: {
    position: "absolute",
    overflow: "hidden",
  },

  oasisSandTop: {
    width: 350,
    height: 150,
    borderRadius: 110,
    top: 175,
    left: -210,
    transform: [
      { rotate: "-9deg" },
    ],
  },

  oasisSandUpper: {
    width: 300,
    height: 115,
    borderRadius: 90,
    top: 355,
    right: -205,
    transform: [
      { rotate: "12deg" },
    ],
  },

  oasisSandMiddle: {
    width: 355,
    height: 140,
    borderRadius: 105,
    top: "51%",
    left: -230,
    transform: [
      { rotate: "7deg" },
    ],
  },

  oasisSandLower: {
    width: 315,
    height: 120,
    borderRadius: 95,
    bottom: 235,
    right: -205,
    transform: [
      { rotate: "-10deg" },
    ],
  },

  oasisSandBottom: {
    width: 470,
    height: 175,
    borderRadius: 130,
    bottom: -55,
    left: -190,
    transform: [
      { rotate: "7deg" },
    ],
  },

  tideTop: {
    position: "absolute",
    width: 470,
    height: 44,
    borderRadius: 100,
    top: 225,
    right: -155,
    overflow: "hidden",
    transform: [
      { rotate: "-5deg" },
    ],
  },

  tideTopHighlight: {
    position: "absolute",
    width: 330,
    height: 18,
    borderRadius: 100,
    top: 266,
    right: -35,
    overflow: "hidden",
    transform: [
      { rotate: "-3deg" },
    ],
  },

  tideMiddle: {
    position: "absolute",
    width: 500,
    height: 48,
    borderRadius: 110,
    top: "47%",
    left: -170,
    overflow: "hidden",
    transform: [
      { rotate: "5deg" },
    ],
  },

  tideMiddleHighlight: {
    position: "absolute",
    width: 340,
    height: 17,
    borderRadius: 100,
    top: "52%",
    left: -20,
    overflow: "hidden",
    transform: [
      { rotate: "2deg" },
    ],
  },

  tideBottom: {
    position: "absolute",
    width: 490,
    height: 46,
    borderRadius: 110,
    bottom: 155,
    right: -170,
    overflow: "hidden",
    transform: [
      { rotate: "-4deg" },
    ],
  },

  oasisBranch: {
    position: "absolute",
    width: 155,
    height: 185,
  },

  oasisStem: {
    position: "absolute",
    width: 4,
    height: 165,
    borderRadius: 3,
    right: 25,
    top: 5,
    transform: [
      { rotate: "11deg" },
    ],
  },

  oasisLeaf: {
    position: "absolute",
    width: 76,
    height: 31,
    borderTopLeftRadius: 44,
    borderBottomRightRadius: 44,
  },

  oasisLeafOne: {
    top: 7,
    right: 30,
    transform: [
      { rotate: "-31deg" },
    ],
  },

  oasisLeafTwo: {
    top: 34,
    right: 8,
    transform: [
      { rotate: "25deg" },
    ],
  },

  oasisLeafThree: {
    top: 63,
    right: 40,
    transform: [
      { rotate: "-39deg" },
    ],
  },

  oasisLeafFour: {
    top: 91,
    right: 5,
    transform: [
      { rotate: "31deg" },
    ],
  },

  oasisLeafFive: {
    top: 120,
    right: 37,
    transform: [
      { rotate: "-43deg" },
    ],
  },

  oasisLeafSix: {
    top: 145,
    right: 9,
    transform: [
      { rotate: "36deg" },
    ],
  },

  oasisBranchTopRight: {
    top: 65,
    right: -38,
  },

  oasisBranchUpperLeft: {
    top: 270,
    left: -66,
  },

  oasisBranchMiddleRight: {
    top: "43%",
    right: -58,
  },

  oasisBranchLowerLeft: {
    bottom: 185,
    left: -53,
  },

  oasisBranchBottomRight: {
    bottom: 20,
    right: -57,
  },

  oasisGoldenGlow: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(216, 194, 138, 0.11)",
  },

  oasisGoldenRing: {
    position: "absolute",
    width: "58%",
    height: "58%",
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor:
      "rgba(232, 216, 168, 0.3)",
  },

  oasisGoldenCore: {
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: "#D8C28A",
    opacity: 0.9,
  },

  oasisGoldTop: {
    top: 125,
    left: -55,
  },

  oasisGoldMiddle: {
    top: "61%",
    right: -30,
  },

  oasisGoldBottom: {
    bottom: 65,
    right: -55,
  },
});