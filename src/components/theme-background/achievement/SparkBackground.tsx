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

import { useTheme } from "../../../theme/ThemeContext";

type SparkBackgroundProps = {
  children: ReactNode;
};

export default function SparkBackground({
  children,
}: SparkBackgroundProps) {
  const { theme } = useTheme();

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

        Animated.timing(
          animation,
          {
            toValue: 1,
            duration,
            easing:
              Easing.inOut(
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
            easing:
              Easing.inOut(
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

  const opacity =
    animation.interpolate({
      inputRange: [0, 1],
      outputRange: [
        0.55,
        1,
      ],
    });

  const scale =
    animation.interpolate({
      inputRange: [0, 1],
      outputRange: [
        0.96,
        1.04,
      ],
    });

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: [
            { scale },
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

        Animated.timing(
          animation,
          {
            toValue: 1,
            duration,
            easing:
              Easing.out(
                Easing.quad
              ),
            useNativeDriver: true,
          }
        ),

        Animated.timing(
          animation,
          {
            toValue: 0.12,
            duration:
              duration * 1.15,
            easing:
              Easing.in(
                Easing.quad
              ),
            useNativeDriver: true,
          }
        ),

        Animated.delay(
          Math.round(
            duration * 0.35
          )
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
            { scale },
            { rotate: rotation },
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
            borderRadius:
              size * 1.5,
          },
        ]}
      />

      <View
        style={[
          styles.sparkGlow,
          {
            width:
              size * 1.75,
            height:
              size * 1.75,
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
            height:
              size * 1.45,
            borderRadius: size,
          },
        ]}
      />

      <View
        style={[
          styles.sparkHorizontalRay,
          {
            width:
              size * 1.45,
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
            height:
              size * 0.72,
            borderRadius: size,
          },
        ]}
      />

      <View
        style={[
          styles.sparkHorizontalCore,
          {
            width:
              size * 0.72,
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    flex: 1,
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
    backgroundColor:
      "#FFD24A",
  },

  sparkHorizontalCore: {
    position: "absolute",
    backgroundColor:
      "#FFD24A",
  },

  sparkCore: {
    position: "absolute",
    backgroundColor:
      "#FFFBEA",
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
});