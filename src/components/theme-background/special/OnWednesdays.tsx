import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ReactNode } from "react";
import {
  StyleSheet,
  Text,
  View,
} from "react-native";

type OnWednesdaysProps = {
  children: ReactNode;
};

export default function OnWednesdays({
  children,
}: OnWednesdaysProps) {
  return (
    <View style={styles.background}>
      <OnWednesdaysDecorations />

      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

function OnWednesdaysDecorations() {
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
  background: {
    flex: 1,
    backgroundColor: "#F4B3CF",
  },

  content: {
    flex: 1,
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