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

type AuroraBackgroundProps = {
  children: ReactNode;
};

export default function AuroraBackground({
  children,
}: AuroraBackgroundProps) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[
          "#05091D",
          "#091334",
          "#172554",
          "#34205B",
          "#5C294F",
          "#17132F",
        ]}
        locations={[
          0,
          0.2,
          0.4,
          0.61,
          0.79,
          1,
        ]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <AuroraDecorations />

      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

function AuroraDecorations() {
  return (
    <View
      pointerEvents="none"
      style={styles.auroraLayer}
    >
      <AnimatedAuroraGlow
        style={styles.auroraBlueGlow}
        duration={11000}
        delay={0}
        movementX={38}
        movementY={20}
      />

      <AnimatedAuroraGlow
        style={styles.auroraVioletGlow}
        duration={13200}
        delay={900}
        movementX={-44}
        movementY={26}
      />

      <AnimatedAuroraGlow
        style={styles.auroraCoralGlow}
        duration={12400}
        delay={500}
        movementX={34}
        movementY={-22}
      />

      <AnimatedAuroraRibbon
        style={styles.auroraRibbonUpper}
        duration={11800}
        delay={0}
        movement={72}
        rotation="-14deg"
        colors={[
          "rgba(67, 56, 202, 0.03)",
          "rgba(99, 102, 241, 0.38)",
          "rgba(168, 85, 247, 0.68)",
          "rgba(217, 70, 239, 0.58)",
          "rgba(251, 113, 133, 0.08)",
        ]}
      />

      <AnimatedAuroraRibbon
        style={styles.auroraRibbonUpperLight}
        duration={14200}
        delay={850}
        movement={56}
        rotation="-8deg"
        colors={[
          "rgba(99, 102, 241, 0.02)",
          "rgba(129, 140, 248, 0.25)",
          "rgba(232, 121, 249, 0.54)",
          "rgba(251, 113, 133, 0.4)",
          "rgba(251, 113, 133, 0.02)",
        ]}
      />

      <AnimatedAuroraRibbon
        style={styles.auroraRibbonMiddle}
        duration={13600}
        delay={1200}
        movement={86}
        rotation="10deg"
        colors={[
          "rgba(30, 64, 175, 0.03)",
          "rgba(79, 70, 229, 0.4)",
          "rgba(168, 85, 247, 0.66)",
          "rgba(244, 63, 94, 0.54)",
          "rgba(251, 113, 133, 0.04)",
        ]}
      />

      <AnimatedAuroraRibbon
        style={styles.auroraRibbonMiddleLight}
        duration={15800}
        delay={300}
        movement={64}
        rotation="5deg"
        colors={[
          "rgba(79, 70, 229, 0.02)",
          "rgba(139, 92, 246, 0.24)",
          "rgba(236, 72, 153, 0.5)",
          "rgba(251, 146, 60, 0.28)",
          "rgba(251, 146, 60, 0.02)",
        ]}
      />

      <AnimatedAuroraRibbon
        style={styles.auroraRibbonLower}
        duration={12800}
        delay={700}
        movement={78}
        rotation="-9deg"
        colors={[
          "rgba(49, 46, 129, 0.02)",
          "rgba(126, 34, 206, 0.36)",
          "rgba(219, 39, 119, 0.58)",
          "rgba(251, 113, 133, 0.48)",
          "rgba(251, 146, 60, 0.04)",
        ]}
      />

      <AnimatedAuroraRibbon
        style={styles.auroraRibbonBottom}
        duration={15100}
        delay={1500}
        movement={68}
        rotation="7deg"
        colors={[
          "rgba(88, 28, 135, 0.02)",
          "rgba(192, 38, 211, 0.3)",
          "rgba(244, 63, 94, 0.48)",
          "rgba(251, 146, 60, 0.32)",
          "rgba(214, 181, 109, 0.03)",
        ]}
      />

      <AnimatedHorizonGlow
        style={styles.auroraHorizon}
        duration={9800}
        delay={0}
      />

      <AnimatedHorizonGlow
        style={styles.auroraHorizonCore}
        duration={11600}
        delay={600}
      />

      <AuroraLight
        style={styles.auroraLightTop}
        size={130}
      />

      <AuroraLight
        style={styles.auroraLightMiddle}
        size={95}
      />

      <AuroraLight
        style={styles.auroraLightLower}
        size={150}
      />
    </View>
  );
}

type AnimatedAuroraGlowProps = {
  style: StyleProp<ViewStyle>;
  duration: number;
  delay: number;
  movementX: number;
  movementY: number;
};

function AnimatedAuroraGlow({
  style,
  duration,
  delay,
  movementX,
  movementY,
}: AnimatedAuroraGlowProps) {
  const animation = useRef(
    new Animated.Value(0)
  ).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),

        Animated.timing(
          animation,
          {
            toValue: 1,
            duration,
            easing: Easing.inOut(
              Easing.sin
            ),
            useNativeDriver: true,
          }
        ),

        Animated.timing(
          animation,
          {
            toValue: 0,
            duration,
            easing: Easing.inOut(
              Easing.sin
            ),
            useNativeDriver: true,
          }
        ),
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
        -movementX,
        movementX,
      ],
    });

  const translateY =
    animation.interpolate({
      inputRange: [0, 1],
      outputRange: [
        -movementY,
        movementY,
      ],
    });

  const scale =
    animation.interpolate({
      inputRange: [0, 1],
      outputRange: [
        0.92,
        1.12,
      ],
    });

  const opacity =
    animation.interpolate({
      inputRange: [
        0,
        0.5,
        1,
      ],
      outputRange: [
        0.55,
        1,
        0.62,
      ],
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

type AnimatedAuroraRibbonProps = {
  style: StyleProp<ViewStyle>;
  duration: number;
  delay: number;
  movement: number;
  rotation: string;
  colors: readonly [
    string,
    string,
    string,
    string,
    string,
  ];
};

function AnimatedAuroraRibbon({
  style,
  duration,
  delay,
  movement,
  rotation,
  colors,
}: AnimatedAuroraRibbonProps) {
  const animation = useRef(
    new Animated.Value(0)
  ).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),

        Animated.timing(
          animation,
          {
            toValue: 1,
            duration,
            easing: Easing.inOut(
              Easing.sin
            ),
            useNativeDriver: true,
          }
        ),

        Animated.timing(
          animation,
          {
            toValue: 0,
            duration,
            easing: Easing.inOut(
              Easing.sin
            ),
            useNativeDriver: true,
          }
        ),
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
      inputRange: [
        0,
        0.5,
        1,
      ],
      outputRange: [
        12,
        -14,
        12,
      ],
    });

  const scaleX =
    animation.interpolate({
      inputRange: [0, 1],
      outputRange: [
        0.88,
        1.14,
      ],
    });

  const scaleY =
    animation.interpolate({
      inputRange: [
        0,
        0.5,
        1,
      ],
      outputRange: [
        0.88,
        1.08,
        0.92,
      ],
    });

  const opacity =
    animation.interpolate({
      inputRange: [
        0,
        0.5,
        1,
      ],
      outputRange: [
        0.5,
        1,
        0.58,
      ],
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
            { rotate: rotation },
            { scaleX },
            { scaleY },
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
        start={{
          x: 0,
          y: 0.5,
        }}
        end={{
          x: 1,
          y: 0.5,
        }}
        style={
          StyleSheet.absoluteFill
        }
      />
    </Animated.View>
  );
}

type AnimatedHorizonGlowProps = {
  style: StyleProp<ViewStyle>;
  duration: number;
  delay: number;
};

function AnimatedHorizonGlow({
  style,
  duration,
  delay,
}: AnimatedHorizonGlowProps) {
  const animation = useRef(
    new Animated.Value(0)
  ).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),

        Animated.timing(
          animation,
          {
            toValue: 1,
            duration,
            easing: Easing.inOut(
              Easing.sin
            ),
            useNativeDriver: true,
          }
        ),

        Animated.timing(
          animation,
          {
            toValue: 0,
            duration,
            easing: Easing.inOut(
              Easing.sin
            ),
            useNativeDriver: true,
          }
        ),
      ])
    );

    loop.start();

    return () => loop.stop();
  }, [
    animation,
    delay,
    duration,
  ]);

  const scaleX =
    animation.interpolate({
      inputRange: [0, 1],
      outputRange: [
        0.9,
        1.12,
      ],
    });

  const scaleY =
    animation.interpolate({
      inputRange: [0, 1],
      outputRange: [
        0.82,
        1.08,
      ],
    });

  const opacity =
    animation.interpolate({
      inputRange: [0, 1],
      outputRange: [
        0.48,
        0.9,
      ],
    });

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: [
            { scaleX },
            { scaleY },
          ],
        },
      ]}
    />
  );
}

type AuroraLightProps = {
  style: StyleProp<ViewStyle>;
  size: number;
};

function AuroraLight({
  style,
  size,
}: AuroraLightProps) {
  return (
    <View
      style={[
        styles.auroraLight,
        style,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      <View
        style={
          styles.auroraLightRing
        }
      />

      <View
        style={
          styles.auroraLightCore
        }
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

  auroraLayer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: "hidden",
  },

  auroraBlueGlow: {
    position: "absolute",
    width: 520,
    height: 520,
    borderRadius: 260,
    top: -290,
    left: -250,
    backgroundColor:
      "rgba(37, 99, 235, 0.24)",
  },

  auroraVioletGlow: {
    position: "absolute",
    width: 500,
    height: 500,
    borderRadius: 250,
    top: "28%",
    right: -330,
    backgroundColor:
      "rgba(168, 85, 247, 0.2)",
  },

  auroraCoralGlow: {
    position: "absolute",
    width: 540,
    height: 540,
    borderRadius: 270,
    bottom: -300,
    left: -300,
    backgroundColor:
      "rgba(251, 113, 133, 0.18)",
  },

  auroraRibbonUpper: {
    position: "absolute",
    width: 610,
    height: 120,
    borderRadius: 180,
    top: 105,
    left: -210,
    overflow: "hidden",
  },

  auroraRibbonUpperLight: {
    position: "absolute",
    width: 510,
    height: 54,
    borderRadius: 120,
    top: 215,
    right: -205,
    overflow: "hidden",
  },

  auroraRibbonMiddle: {
    position: "absolute",
    width: 650,
    height: 135,
    borderRadius: 190,
    top: "37%",
    right: -280,
    overflow: "hidden",
  },

  auroraRibbonMiddleLight: {
    position: "absolute",
    width: 520,
    height: 62,
    borderRadius: 130,
    top: "51%",
    left: -210,
    overflow: "hidden",
  },

  auroraRibbonLower: {
    position: "absolute",
    width: 630,
    height: 125,
    borderRadius: 190,
    bottom: 190,
    left: -245,
    overflow: "hidden",
  },

  auroraRibbonBottom: {
    position: "absolute",
    width: 550,
    height: 70,
    borderRadius: 150,
    bottom: 70,
    right: -220,
    overflow: "hidden",
  },

  auroraHorizon: {
    position: "absolute",
    width: 620,
    height: 190,
    borderRadius: 310,
    bottom: -115,
    left: -105,
    backgroundColor:
      "rgba(251, 113, 133, 0.2)",
  },

  auroraHorizonCore: {
    position: "absolute",
    width: 460,
    height: 105,
    borderRadius: 230,
    bottom: -58,
    left: -25,
    backgroundColor:
      "rgba(214, 181, 109, 0.2)",
  },

  auroraLight: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(214, 181, 109, 0.055)",
  },

  auroraLightRing: {
    position: "absolute",
    width: "52%",
    height: "52%",
    borderRadius: 999,
    borderWidth: 1,
    borderColor:
      "rgba(244, 211, 143, 0.25)",
  },

  auroraLightCore: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#E8CB8B",
    opacity: 0.8,
  },

  auroraLightTop: {
    top: 145,
    right: -42,
  },

  auroraLightMiddle: {
    top: "58%",
    left: -28,
  },

  auroraLightLower: {
    bottom: 125,
    right: -55,
  },
});