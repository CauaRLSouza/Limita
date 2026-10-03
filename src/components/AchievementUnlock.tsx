import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  AchievementDefinition,
} from "../achievements/achievements";

type AchievementUnlockProps = {
  achievement: AchievementDefinition;
  onUseTheme: () => void;
  onKeepTheme: () => void;
};

const achievementGradients: Record<
  AchievementDefinition["id"],
  readonly [string, string, ...string[]]
> = {
  spark: [
    "#130B02",
    "#3B1D04",
    "#F59E0B",
    "#FFD34E",
  ],

  oasis: [
    "#011B1D",
    "#07504B",
    "#19B89E",
    "#D5BC79",
  ],

  aurora: [
    "#09163D",
    "#4C246C",
    "#D84F73",
    "#F28A78",
  ],

  constellation: [
    "#02040F",
    "#09143A",
    "#853DFF",
    "#F044C8",
  ],
};

const achievementIcons: Record<
  AchievementDefinition["id"],
  keyof typeof MaterialIcons.glyphMap
> = {
  spark: "auto-awesome",
  oasis: "spa",
  aurora: "wb-twilight",
  constellation: "auto-awesome",
};

export default function AchievementUnlock({
  achievement,
  onUseTheme,
  onKeepTheme,
}: AchievementUnlockProps) {
  return (
    <View style={styles.card}>
      <LinearGradient
        colors={
          achievementGradients[
            achievement.id
          ]
        }
        locations={[0, 0.36, 0.72, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.glowTop} />

      <View style={styles.glowBottom} />

      <View style={styles.content}>
        <Text style={styles.eyebrow}>
          UMA NOVA CONQUISTA
        </Text>

        <View style={styles.iconOuter}>
          <View style={styles.iconInner}>
            <MaterialIcons
              name={
                achievementIcons[
                  achievement.id
                ]
              }
              size={38}
              color="#FFFFFF"
            />
          </View>
        </View>

        <Text style={styles.title}>
          {achievement.unlockTitle}
        </Text>

        <View style={styles.divider} />

        <Text style={styles.message}>
          {achievement.unlockMessage}
        </Text>

        <View style={styles.rewardCard}>
          <View style={styles.rewardIcon}>
            <MaterialIcons
              name="palette"
              size={23}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.rewardText}>
            <Text style={styles.rewardEyebrow}>
              NOVA RECOMPENSA
            </Text>

            <Text style={styles.rewardTitle}>
              Tema {achievement.themeName}
            </Text>

            <Text
              style={
                styles.rewardDescription
              }
            >
              Um novo tema foi adicionado às suas conquistas.
            </Text>
          </View>

          <MaterialIcons
            name="check-circle"
            size={25}
            color="#FFFFFF"
          />
        </View>

        <Text style={styles.hint}>
          Essa conquista é permanente. O tema ficará disponível para você usar quando quiser.
        </Text>

        <Pressable
          onPress={onUseTheme}
          style={({ pressed }) => [
            styles.useThemeButton,
            pressed && styles.pressed,
          ]}
        >
          <MaterialIcons
            name="palette"
            size={21}
            color="#111111"
          />

          <Text
            style={styles.useThemeButtonText}
          >
            Usar Tema
          </Text>
        </Pressable>

        <Pressable
          onPress={onKeepTheme}
          style={({ pressed }) => [
            styles.keepThemeButton,
            pressed && styles.pressed,
          ]}
        >
          <Text
            style={styles.keepThemeButtonText}
          >
            Continuar com meu tema
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 16,
    position: "relative",
  },

  glowTop: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    top: -180,
    right: -100,
    backgroundColor:
      "rgba(255,255,255,0.13)",
  },

  glowBottom: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    bottom: -175,
    left: -100,
    backgroundColor:
      "rgba(255,255,255,0.08)",
  },

  content: {
    paddingHorizontal: 22,
    paddingTop: 25,
    paddingBottom: 20,
    alignItems: "center",
  },

  eyebrow: {
    color:
      "rgba(255,255,255,0.76)",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.4,
    textAlign: "center",
  },

  iconOuter: {
    width: 86,
    height: 86,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
    backgroundColor:
      "rgba(255,255,255,0.11)",
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.18)",
  },

  iconInner: {
    width: 66,
    height: 66,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(0,0,0,0.18)",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 27,
    lineHeight: 34,
    fontWeight: "900",
    letterSpacing: -0.7,
    textAlign: "center",
    marginTop: 21,
  },

  divider: {
    width: 42,
    height: 4,
    borderRadius: 999,
    backgroundColor:
      "rgba(255,255,255,0.35)",
    marginTop: 19,
    marginBottom: 18,
  },

  message: {
    color:
      "rgba(255,255,255,0.91)",
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "500",
    textAlign: "center",
  },

  rewardCard: {
    width: "100%",
    minHeight: 92,
    borderRadius: 18,
    backgroundColor:
      "rgba(0,0,0,0.19)",
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.14)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 14,
    marginTop: 24,
  },

  rewardIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor:
      "rgba(255,255,255,0.13)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  rewardText: {
    flex: 1,
    paddingRight: 10,
  },

  rewardEyebrow: {
    color:
      "rgba(255,255,255,0.65)",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },

  rewardTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 3,
  },

  rewardDescription: {
    color:
      "rgba(255,255,255,0.76)",
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "500",
    marginTop: 2,
  },

  hint: {
    color:
      "rgba(255,255,255,0.72)",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "500",
    textAlign: "center",
    paddingHorizontal: 8,
    marginTop: 18,
  },

  useThemeButton: {
    width: "100%",
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 20,
  },

  useThemeButtonText: {
    color: "#111111",
    fontSize: 15,
    fontWeight: "800",
  },

  keepThemeButton: {
    minHeight: 48,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },

  keepThemeButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },

  pressed: {
    opacity: 0.82,
  },
});