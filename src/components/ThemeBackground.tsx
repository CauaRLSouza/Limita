import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MaskedView from "@react-native-masked-view/masked-view";
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
    achievementTheme,
  } = useTheme();

  const isMeanGirls =
    activeSpecialTheme === "meanGirls";

  const isPride =
    activeSpecialTheme === "pride";

  const isSpark =
    achievementTheme === "spark" &&
    activeSpecialTheme === "none";

  const isOasis =
    achievementTheme === "oasis" &&
    activeSpecialTheme === "none";

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

  if (isSpark) {
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
        <SparkDecorations />

        <View style={styles.content}>
          {children}
        </View>
      </View>
    );
  }

  if (isOasis) {
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
          locations={[
            0,
            0.22,
            0.48,
            0.76,
            1,
          ]}
          start={{
            x: 0,
            y: 0,
          }}
          end={{
            x: 1,
            y: 1,
          }}
          style={StyleSheet.absoluteFill}
        />

        <OasisDecorations />

        <View style={styles.content}>
          {children}
        </View>
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
          easing: Easing.inOut(
            Easing.sin
          ),
          useNativeDriver: true,
        }),

        Animated.timing(animation, {
          toValue: 0,
          duration,
          easing: Easing.inOut(
            Easing.sin
          ),
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();

    return () => {
      loop.stop();
    };
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
            {
              translateX,
            },
            {
              translateY,
            },
            {
              scale,
            },
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
          easing: Easing.inOut(
            Easing.sin
          ),
          useNativeDriver: true,
        }),

        Animated.timing(animation, {
          toValue: 0,
          duration,
          easing: Easing.inOut(
            Easing.sin
          ),
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();

    return () => {
      loop.stop();
    };
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
      outputRange: [
        4,
        -4,
        4,
      ],
    });

  const scaleX =
    animation.interpolate({
      inputRange: [0, 1],
      outputRange: [0.9, 1.12],
    });

  const opacity =
    animation.interpolate({
      inputRange: [
        0,
        0.5,
        1,
      ],
      outputRange: [
        0.64,
        1,
        0.7,
      ],
    });

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: [
            {
              translateX,
            },
            {
              translateY,
            },
            {
              scaleX,
            },
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
        start={{
          x: 0,
          y: 0,
        }}
        end={{
          x: 1,
          y: 1,
        }}
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
          easing: Easing.inOut(
            Easing.sin
          ),
          useNativeDriver: true,
        }),

        Animated.timing(animation, {
          toValue: 0,
          duration,
          easing: Easing.inOut(
            Easing.sin
          ),
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();

    return () => {
      loop.stop();
    };
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
      outputRange: [
        3,
        -3,
      ],
    });

  return (
    <Animated.View
      style={[
        styles.oasisBranch,
        style,
        {
          transform: [
            {
              translateX,
            },
            {
              translateY,
            },
            {
              rotate: rotation,
            },
            {
              rotate: animatedRotation,
            },
            {
              scale,
            },
            {
              scaleX:
                mirrored
                  ? -1
                  : 1,
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

function SparkDecorations() {
  return (
    <View
      pointerEvents="none"
      style={styles.sparkLayer}
    >
      <AnimatedHalo
        style={styles.sparkHaloTop}
        duration={2600}
        delay={0}
      />

      <AnimatedHalo
        style={styles.sparkHaloBottom}
        duration={3100}
        delay={700}
      />

      <AnimatedSpark
        style={styles.sparkTopRight}
        size={28}
        delay={0}
        duration={620}
        rotation="10deg"
      />

      <AnimatedSpark
        style={styles.sparkUpperLeft}
        size={17}
        delay={240}
        duration={780}
        rotation="-12deg"
      />

      <AnimatedSpark
        style={styles.sparkUpperMiddle}
        size={12}
        delay={530}
        duration={540}
        rotation="8deg"
      />

      <AnimatedSpark
        style={styles.sparkMiddleRight}
        size={15}
        delay={120}
        duration={690}
        rotation="-8deg"
      />

      <AnimatedSpark
        style={styles.sparkMiddleLeft}
        size={23}
        delay={410}
        duration={850}
        rotation="14deg"
      />

      <AnimatedSpark
        style={styles.sparkLowerRight}
        size={26}
        delay={680}
        duration={650}
        rotation="-15deg"
      />

      <AnimatedSpark
        style={styles.sparkLowerLeft}
        size={12}
        delay={330}
        duration={570}
        rotation="7deg"
      />

      <AnimatedSpark
        style={styles.sparkTinyTop}
        size={8}
        delay={760}
        duration={460}
        rotation="-6deg"
      />

      <AnimatedSpark
        style={styles.sparkTinyMiddle}
        size={9}
        delay={170}
        duration={510}
        rotation="12deg"
      />
    </View>
  );
}

type AnimatedHaloProps = {
  style: StyleProp<ViewStyle>;
  duration: number;
  delay: number;
};

function AnimatedHalo({
  style,
  duration,
  delay,
}: AnimatedHaloProps) {
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
          easing: Easing.inOut(
            Easing.sin
          ),
          useNativeDriver: true,
        }),

        Animated.timing(animation, {
          toValue: 0,
          duration,
          easing: Easing.inOut(
            Easing.sin
          ),
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();

    return () => {
      loop.stop();
    };
  }, [
    animation,
    delay,
    duration,
  ]);

  const opacity =
    animation.interpolate({
      inputRange: [0, 1],
      outputRange: [0.55, 1],
    });

  const scale =
    animation.interpolate({
      inputRange: [0, 1],
      outputRange: [0.96, 1.04],
    });

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: [
            {
              scale,
            },
          ],
        },
      ]}
    />
  );
}

type AnimatedSparkProps = {
  style: StyleProp<ViewStyle>;
  size: number;
  delay: number;
  duration: number;
  rotation: string;
};

function AnimatedSpark({
  style,
  size,
  delay,
  duration,
  rotation,
}: AnimatedSparkProps) {
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
          easing: Easing.out(
            Easing.quad
          ),
          useNativeDriver: true,
        }),

        Animated.timing(animation, {
          toValue: 0.12,
          duration:
            duration * 1.15,
          easing: Easing.in(
            Easing.quad
          ),
          useNativeDriver: true,
        }),

        Animated.delay(
          Math.round(
            duration * 0.35
          )
        ),
      ])
    );

    loop.start();

    return () => {
      loop.stop();
    };
  }, [
    animation,
    delay,
    duration,
  ]);

  const opacity =
    animation.interpolate({
      inputRange: [
        0,
        0.12,
        0.55,
        1,
      ],
      outputRange: [
        0.2,
        0.3,
        0.72,
        1,
      ],
    });

  const scale =
    animation.interpolate({
      inputRange: [
        0,
        0.45,
        1,
      ],
      outputRange: [
        0.72,
        0.92,
        1.24,
      ],
    });

  return (
    <Animated.View
      style={[
        styles.sparkContainer,
        style,
        {
          width: size * 3,
          height: size * 3,
          opacity,
          transform: [
            {
              scale,
            },
            {
              rotate: rotation,
            },
          ],
        },
      ]}
    >
      <View
        style={[
          styles.sparkOuterGlow,
          {
            width: size * 3,
            height: size * 3,
            borderRadius: size * 1.5,
          },
        ]}
      />

      <View
        style={[
          styles.sparkGlow,
          {
            width: size * 1.75,
            height: size * 1.75,
            borderRadius:
              size * 0.875,
          },
        ]}
      />

      <View
        style={[
          styles.sparkVerticalRay,
          {
            width: Math.max(
              1.5,
              size * 0.09
            ),
            height: size * 1.45,
            borderRadius: size,
          },
        ]}
      />

      <View
        style={[
          styles.sparkHorizontalRay,
          {
            width: size * 1.45,
            height: Math.max(
              1.5,
              size * 0.09
            ),
            borderRadius: size,
          },
        ]}
      />

      <View
        style={[
          styles.sparkVerticalCore,
          {
            width: Math.max(
              2,
              size * 0.14
            ),
            height: size * 0.72,
            borderRadius: size,
          },
        ]}
      />

      <View
        style={[
          styles.sparkHorizontalCore,
          {
            width: size * 0.72,
            height: Math.max(
              2,
              size * 0.14
            ),
            borderRadius: size,
          },
        ]}
      />

      <View
        style={[
          styles.sparkCore,
          {
            width: Math.max(
              4,
              size * 0.24
            ),
            height: Math.max(
              4,
              size * 0.24
            ),
            borderRadius: size,
          },
        ]}
      />
    </Animated.View>
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
          start={{
            x: 0,
            y: 0,
          }}
          end={{
            x: 1,
            y: 1,
          }}
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
          start={{
            x: 0,
            y: 0,
          }}
          end={{
            x: 1,
            y: 1,
          }}
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
      {
        rotate: "-9deg",
      },
    ],
  },

  oasisSandUpper: {
    width: 300,
    height: 115,
    borderRadius: 90,
    top: 355,
    right: -205,
    transform: [
      {
        rotate: "12deg",
      },
    ],
  },

  oasisSandMiddle: {
    width: 355,
    height: 140,
    borderRadius: 105,
    top: "51%",
    left: -230,
    transform: [
      {
        rotate: "7deg",
      },
    ],
  },

  oasisSandLower: {
    width: 315,
    height: 120,
    borderRadius: 95,
    bottom: 235,
    right: -205,
    transform: [
      {
        rotate: "-10deg",
      },
    ],
  },

  oasisSandBottom: {
    width: 470,
    height: 175,
    borderRadius: 130,
    bottom: -55,
    left: -190,
    transform: [
      {
        rotate: "7deg",
      },
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
      {
        rotate: "-5deg",
      },
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
      {
        rotate: "-3deg",
      },
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
      {
        rotate: "5deg",
      },
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
      {
        rotate: "2deg",
      },
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
      {
        rotate: "-4deg",
      },
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
      {
        rotate: "11deg",
      },
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
      {
        rotate: "-31deg",
      },
    ],
  },

  oasisLeafTwo: {
    top: 34,
    right: 8,
    transform: [
      {
        rotate: "25deg",
      },
    ],
  },

  oasisLeafThree: {
    top: 63,
    right: 40,
    transform: [
      {
        rotate: "-39deg",
      },
    ],
  },

  oasisLeafFour: {
    top: 91,
    right: 5,
    transform: [
      {
        rotate: "31deg",
      },
    ],
  },

  oasisLeafFive: {
    top: 120,
    right: 37,
    transform: [
      {
        rotate: "-43deg",
      },
    ],
  },

  oasisLeafSix: {
    top: 145,
    right: 9,
    transform: [
      {
        rotate: "36deg",
      },
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

  sparkLayer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: "hidden",
  },

  sparkHaloTop: {
    position: "absolute",
    width: 290,
    height: 290,
    borderRadius: 145,
    top: -165,
    right: -110,
    backgroundColor:
      "rgba(255, 183, 0, 0.11)",
  },

  sparkHaloBottom: {
    position: "absolute",
    width: 330,
    height: 330,
    borderRadius: 165,
    bottom: -205,
    left: -190,
    backgroundColor:
      "rgba(255, 140, 0, 0.085)",
  },

  sparkContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },

  sparkOuterGlow: {
    position: "absolute",
    backgroundColor:
      "rgba(255, 170, 0, 0.035)",
  },

  sparkGlow: {
    position: "absolute",
    backgroundColor:
      "rgba(255, 190, 40, 0.13)",
  },

  sparkVerticalRay: {
    position: "absolute",
    backgroundColor:
      "rgba(255, 170, 0, 0.72)",
  },

  sparkHorizontalRay: {
    position: "absolute",
    backgroundColor:
      "rgba(255, 170, 0, 0.72)",
  },

  sparkVerticalCore: {
    position: "absolute",
    backgroundColor: "#FFD24A",
  },

  sparkHorizontalCore: {
    position: "absolute",
    backgroundColor: "#FFD24A",
  },

  sparkCore: {
    position: "absolute",
    backgroundColor: "#FFFBEA",
  },

  sparkTopRight: {
    top: 155,
    right: 23,
  },

  sparkUpperLeft: {
    top: 270,
    left: 17,
  },

  sparkUpperMiddle: {
    top: 395,
    right: 52,
  },

  sparkMiddleRight: {
    top: "45%",
    right: 13,
  },

  sparkMiddleLeft: {
    top: "57%",
    left: 14,
  },

  sparkLowerRight: {
    bottom: 115,
    right: 21,
  },

  sparkLowerLeft: {
    bottom: 250,
    left: 38,
  },

  sparkTinyTop: {
    top: 215,
    right: 92,
  },

  sparkTinyMiddle: {
    top: "64%",
    right: 71,
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