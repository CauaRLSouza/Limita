import { LinearGradient } from "expo-linear-gradient";
import { usePathname } from "expo-router";
import {
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Easing,
  ImageSourcePropType,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

type ConstellationBackgroundProps = {
  children: ReactNode;
};

const constellationAssets = {
  horizonte: require("../../../../assets/images/constelacao/horizonte-cosmos.png"),
  meteoro: require("../../../../assets/images/constelacao/meteoro-cosmos.png"),
  nebulosa: require("../../../../assets/images/constelacao/nebulosa-cosmos.png"),
  nuvem: require("../../../../assets/images/constelacao/nuvem-cosmos.png"),
  orbita: require("../../../../assets/images/constelacao/orbita-cosmos.png"),
  planetaOrbital: require("../../../../assets/images/constelacao/planeta_orbital-cosmos.png"),
  planeta: require("../../../../assets/images/constelacao/planeta-cosmos.png"),
};

export default function ConstellationBackground({
  children,
}: ConstellationBackgroundProps) {
  const pathname = usePathname();
  const previousPath = useRef(pathname);
  const cooldown = useRef(0);

  const [meteorKey, setMeteorKey] =
    useState(0);

  const [showMeteor, setShowMeteor] =
    useState(false);

  useEffect(() => {
    if (previousPath.current === pathname) {
      return;
    }

    previousPath.current = pathname;

    if (cooldown.current > 0) {
      cooldown.current -= 1;
      return;
    }

    if (Math.random() < 0.25) {
      setMeteorKey(
        (current) => current + 1
      );

      setShowMeteor(true);
      cooldown.current = 2;
    }
  }, [pathname]);

  const composition =
    getConstellationComposition(
      pathname
    );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[
          "#02040F",
          "#050A21",
          "#09143A",
          "#130C35",
          "#050716",
        ]}
        locations={[
          0,
          0.22,
          0.47,
          0.74,
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
        style={
          StyleSheet.absoluteFill
        }
      />

      <ConstellationAtmosphere />

      <ConstellationComposition
        composition={composition}
      />

      {showMeteor && (
        <AnimatedMeteor
          key={meteorKey}
          onEnd={() =>
            setShowMeteor(false)
          }
        />
      )}

      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

type ConstellationCompositionName =
  | "horizon"
  | "planet"
  | "orbital"
  | "nebula";

function getConstellationComposition(
  pathname: string
): ConstellationCompositionName {
  let hash = 0;

  for (
    let index = 0;
    index < pathname.length;
    index += 1
  ) {
    hash =
      (
        hash * 31 +
        pathname.charCodeAt(index)
      ) %
      1000;
  }

  const option = hash % 4;

  if (option === 0) {
    return "horizon";
  }

  if (option === 1) {
    return "planet";
  }

  if (option === 2) {
    return "orbital";
  }

  return "nebula";
}

function ConstellationComposition({
  composition,
}: {
  composition:
    ConstellationCompositionName;
}) {
  if (composition === "horizon") {
    return (
      <View
        pointerEvents="none"
        style={
          styles.constellationAssetLayer
        }
      >
        <AnimatedCosmicAsset
          source={
            constellationAssets.nebulosa
          }
          style={
            styles.constellationNebulaUpper
          }
          duration={16000}
          movement={24}
        />

        <AnimatedCosmicAsset
          source={
            constellationAssets.horizonte
          }
          style={
            styles.constellationHorizon
          }
          duration={19000}
          movement={12}
        />
      </View>
    );
  }

  if (composition === "planet") {
    return (
      <View
        pointerEvents="none"
        style={
          styles.constellationAssetLayer
        }
      >
        <AnimatedCosmicAsset
          source={
            constellationAssets.nuvem
          }
          style={
            styles.constellationCloudUpper
          }
          duration={17000}
          movement={32}
        />

        <AnimatedCosmicAsset
          source={
            constellationAssets.planeta
          }
          style={
            styles.constellationPlanet
          }
          duration={21000}
          movement={14}
        />
      </View>
    );
  }

  if (composition === "orbital") {
    return (
      <View
        pointerEvents="none"
        style={
          styles.constellationAssetLayer
        }
      >
        <AnimatedCosmicAsset
          source={
            constellationAssets.orbita
          }
          style={
            styles.constellationOrbit
          }
          duration={22000}
          movement={18}
        />

        <AnimatedCosmicAsset
          source={
            constellationAssets.planetaOrbital
          }
          style={
            styles.constellationOrbitalPlanet
          }
          duration={18500}
          movement={12}
        />
      </View>
    );
  }

  return (
    <View
      pointerEvents="none"
      style={
        styles.constellationAssetLayer
      }
    >
      <AnimatedCosmicAsset
        source={
          constellationAssets.nebulosa
        }
        style={
          styles.constellationNebulaLarge
        }
        duration={18000}
        movement={36}
      />

      <AnimatedCosmicAsset
        source={
          constellationAssets.nuvem
        }
        style={
          styles.constellationCloudLower
        }
        duration={20500}
        movement={28}
      />
    </View>
  );
}

function ConstellationAtmosphere() {
  return (
    <View
      pointerEvents="none"
      style={
        styles.constellationAtmosphere
      }
    >
      <AnimatedCosmicGlow
        style={
          styles.constellationBlueGlow
        }
        duration={12000}
        movement={34}
      />

      <AnimatedCosmicGlow
        style={
          styles.constellationPurpleGlow
        }
        duration={15000}
        movement={-42}
      />

      <AnimatedCosmicGlow
        style={
          styles.constellationPinkGlow
        }
        duration={13500}
        movement={38}
      />

      <ConstellationStars />
    </View>
  );
}

function ConstellationStars() {
  return (
    <>
      <View
        style={[
          styles.cosmicStar,
          styles.cosmicStarOne,
        ]}
      />

      <View
        style={[
          styles.cosmicStar,
          styles.cosmicStarTwo,
        ]}
      />

      <View
        style={[
          styles.cosmicStar,
          styles.cosmicStarThree,
        ]}
      />

      <View
        style={[
          styles.cosmicStar,
          styles.cosmicStarFour,
        ]}
      />

      <View
        style={[
          styles.cosmicStar,
          styles.cosmicStarFive,
        ]}
      />

      <View
        style={[
          styles.cosmicStar,
          styles.cosmicStarSix,
        ]}
      />

      <View
        style={[
          styles.cosmicStar,
          styles.cosmicStarSeven,
        ]}
      />

      <View
        style={[
          styles.cosmicStar,
          styles.cosmicStarEight,
        ]}
      />
    </>
  );
}

function AnimatedCosmicGlow({
  style,
  duration,
  movement,
}: {
  style: StyleProp<ViewStyle>;
  duration: number;
  movement: number;
}) {
  const animation = useRef(
    new Animated.Value(0)
  ).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
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

    return () => {
      loop.stop();
    };
  }, [
    animation,
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
      inputRange: [0, 1],
      outputRange: [
        0.48,
        1,
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
              scale,
            },
          ],
        },
      ]}
    />
  );
}

function AnimatedCosmicAsset({
  source,
  style,
  duration,
  movement,
}: {
  source: ImageSourcePropType;
  style: any;
  duration: number;
  movement: number;
}) {
  const animation = useRef(
    new Animated.Value(0)
  ).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
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

    return () => {
      loop.stop();
    };
  }, [
    animation,
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
      inputRange: [0, 1],
      outputRange: [
        8,
        -8,
      ],
    });

  const scale =
    animation.interpolate({
      inputRange: [0, 1],
      outputRange: [
        0.98,
        1.04,
      ],
    });

  return (
    <Animated.Image
      source={source}
      resizeMode="contain"
      style={[
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
              scale,
            },
          ],
        },
      ]}
    />
  );
}

function AnimatedMeteor({
  onEnd,
}: {
  onEnd: () => void;
}) {
  const progress = useRef(
    new Animated.Value(0)
  ).current;

  const configuration =
    useRef({
      top:
        90 +
        Math.random() *
          260,
      duration:
        2200 +
        Math.random() *
          800,
      rotation: 0,
    }).current;

  useEffect(() => {
    const animation =
      Animated.timing(
        progress,
        {
          toValue: 1,
          duration:
            configuration.duration,
          easing:
            Easing.out(
              Easing.cubic
            ),
          useNativeDriver: true,
        }
      );

    animation.start(
      ({
        finished,
      }) => {
        if (finished) {
          onEnd();
        }
      }
    );

    return () => {
      animation.stop();
    };
  }, [
    configuration.duration,
    onEnd,
    progress,
  ]);

  const translateX =
    progress.interpolate({
      inputRange: [0, 1],
      outputRange: [
        620,
        -190,
      ],
    });

  const translateY =
    progress.interpolate({
      inputRange: [0, 1],
      outputRange: [
        -100,
        340,
      ],
    });

  const opacity =
    progress.interpolate({
      inputRange: [
        0,
        0.08,
        0.78,
        1,
      ],
      outputRange: [
        0,
        1,
        1,
        0,
      ],
    });

  return (
    <Animated.Image
      source={
        constellationAssets.meteoro
      }
      resizeMode="contain"
      style={[
        styles.constellationMeteor,
        {
          top:
            configuration.top,
          opacity,
          transform: [
            {
              translateX,
            },
            {
              translateY,
            },
            {
              rotate:
                `${configuration.rotation}deg`,
            },
          ],
        },
      ]}
    />
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
    },

    content: {
      flex: 1,
    },

    constellationAssetLayer: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      overflow: "hidden",
    },

    constellationAtmosphere: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      overflow: "hidden",
    },

    constellationBlueGlow: {
      position: "absolute",
      width: 500,
      height: 500,
      borderRadius: 250,
      top: -260,
      left: -260,
      backgroundColor:
        "rgba(37, 99, 235, 0.2)",
    },

    constellationPurpleGlow: {
      position: "absolute",
      width: 520,
      height: 520,
      borderRadius: 260,
      top: "30%",
      right: -340,
      backgroundColor:
        "rgba(124, 58, 237, 0.19)",
    },

    constellationPinkGlow: {
      position: "absolute",
      width: 500,
      height: 500,
      borderRadius: 250,
      bottom: -300,
      left: -290,
      backgroundColor:
        "rgba(217, 70, 239, 0.13)",
    },

    constellationNebulaUpper: {
      position: "absolute",
      width: 500,
      height: 360,
      top: 25,
      right: -180,
      opacity: 0.7,
    },

    constellationHorizon: {
      position: "absolute",
      width: 590,
      height: 370,
      bottom: -155,
      left: -110,
      opacity: 0.88,
    },

    constellationCloudUpper: {
      position: "absolute",
      width: 470,
      height: 330,
      top: 80,
      left: -210,
      opacity: 0.64,
    },

    constellationPlanet: {
      position: "absolute",
      width: 350,
      height: 350,
      bottom: -95,
      right: -145,
      opacity: 0.9,
    },

    constellationOrbit: {
      position: "absolute",
      width: 520,
      height: 520,
      top: "19%",
      left: -260,
      opacity: 0.55,
    },

    constellationOrbitalPlanet: {
      position: "absolute",
      width: 390,
      height: 390,
      bottom: -115,
      right: -135,
      opacity: 0.88,
    },

    constellationNebulaLarge: {
      position: "absolute",
      width: 620,
      height: 470,
      top: 40,
      left: -270,
      opacity: 0.72,
    },

    constellationCloudLower: {
      position: "absolute",
      width: 550,
      height: 390,
      bottom: -100,
      right: -260,
      opacity: 0.56,
    },

    constellationMeteor: {
      position: "absolute",
      width: 190,
      height: 100,
      left: -190,
      zIndex: 20,
    },

    cosmicStar: {
      position: "absolute",
      width: 3,
      height: 3,
      borderRadius: 2,
      backgroundColor:
        "#FFFFFF",
      shadowColor:
        "#FFFFFF",
      shadowOpacity: 1,
      shadowRadius: 7,
      elevation: 4,
    },

    cosmicStarOne: {
      top: 95,
      left: "16%",
    },

    cosmicStarTwo: {
      top: 190,
      right: "18%",
      width: 2,
      height: 2,
    },

    cosmicStarThree: {
      top: "35%",
      left: "8%",
      width: 4,
      height: 4,
    },

    cosmicStarFour: {
      top: "46%",
      right: "11%",
    },

    cosmicStarFive: {
      top: "58%",
      left: "18%",
      width: 2,
      height: 2,
    },

    cosmicStarSix: {
      bottom: 245,
      right: "21%",
      width: 4,
      height: 4,
    },

    cosmicStarSeven: {
      bottom: 155,
      left: "12%",
    },

    cosmicStarEight: {
      bottom: 72,
      right: "9%",
      width: 2,
      height: 2,
    },
  });