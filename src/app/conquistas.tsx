import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  AchievementDefinition,
  achievements,
  getAchievementAccess,
  getAchievementProgress,
  getUnlockedAchievements,
  isAchievementUnlocked,
} from "../achievements/achievements";
import { useTheme } from "../theme/ThemeContext";

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

export default function ConquistasScreen() {
  const { theme } = useTheme();

  const achievementAccess =
    getAchievementAccess();

  const unlockedCount =
    getUnlockedAchievements(
      achievementAccess
    ).length;

  const finalAchievement =
    achievements[
      achievements.length - 1
    ];

  const totalProgress =
    finalAchievement
      ? Math.min(
          achievementAccess.positiveCycles /
            finalAchievement.requiredPositiveCycles,
          1
        )
      : 0;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={[
            styles.backButton,
            {
              backgroundColor:
                theme.colors.surface,
              borderColor:
                theme.colors.border,
            },
          ]}
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={theme.colors.text}
          />
        </Pressable>

        <Text
          style={[
            styles.title,
            {
              color: theme.colors.text,
            },
          ]}
        >
          Conquistas
        </Text>
      </View>

      <Text
        style={[
          styles.description,
          {
            color:
              theme.colors.textSecondary,
          },
        ]}
      >
        Cada ciclo positivo deixa uma marca na sua trajetória.
      </Text>

      <View
        style={[
          styles.progressCard,
          {
            backgroundColor:
              theme.colors.surface,
            borderColor:
              theme.colors.border,
          },
        ]}
      >
        <View style={styles.progressHeader}>
          <View
            style={[
              styles.progressIcon,
              {
                backgroundColor:
                  theme.colors.primarySoft,
              },
            ]}
          >
            <MaterialIcons
              name="emoji-events"
              size={25}
              color={theme.colors.primary}
            />
          </View>

          <View style={styles.progressText}>
            <Text
              style={[
                styles.progressTitle,
                {
                  color: theme.colors.text,
                },
              ]}
            >
              {achievementAccess.positiveCycles} ciclos positivos
            </Text>

            <Text
              style={[
                styles.progressDescription,
                {
                  color:
                    theme.colors
                      .textSecondary,
                },
              ]}
            >
              {unlockedCount} de{" "}
              {achievements.length} conquistas desbloqueadas
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.progressTrack,
            {
              backgroundColor:
                theme.colors.primarySoft,
            },
          ]}
        >
          <View
            style={[
              styles.progressFill,
              {
                width: `${totalProgress * 100}%`,
                backgroundColor:
                  theme.colors.primary,
              },
            ]}
          />
        </View>
      </View>

      <Text
        style={[
          styles.sectionLabel,
          {
            color:
              theme.colors.textSecondary,
          },
        ]}
      >
        SUA TRAJETÓRIA
      </Text>

      <View style={styles.achievementList}>
        {achievements.map(
          (achievement) => {
            const unlocked =
              isAchievementUnlocked(
                achievement.id,
                achievementAccess
              );

            if (unlocked) {
              return (
                <UnlockedAchievement
                  key={achievement.id}
                  achievement={
                    achievement
                  }
                />
              );
            }

            return (
              <LockedAchievement
                key={achievement.id}
                achievement={
                  achievement
                }
                positiveCycles={
                  achievementAccess.positiveCycles
                }
              />
            );
          }
        )}
      </View>
    </ScrollView>
  );
}

function UnlockedAchievement({
  achievement,
}: {
  achievement: AchievementDefinition;
}) {
  return (
    <View style={styles.unlockedCard}>
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

      <View
        style={styles.unlockedGlowTop}
      />

      <View
        style={styles.unlockedGlowBottom}
      />

      <View
        style={styles.unlockedContent}
      >
        <View
          style={styles.unlockedHeader}
        >
          <Text style={styles.eyebrow}>
            UMA NOVA CONQUISTA
          </Text>

          <View
            style={styles.unlockedBadge}
          >
            <MaterialIcons
              name="check"
              size={15}
              color="#FFFFFF"
            />

            <Text
              style={
                styles.unlockedBadgeText
              }
            >
              CONQUISTADA
            </Text>
          </View>
        </View>

        <Text
          style={styles.unlockedTitle}
        >
          {achievement.unlockTitle}
        </Text>

        <View style={styles.messageRow}>
          <View
            style={styles.messageLine}
          />

          <Text
            style={
              styles.unlockedMessage
            }
          >
            {achievement.unlockMessage}
          </Text>
        </View>
      </View>
    </View>
  );
}

function LockedAchievement({
  achievement,
  positiveCycles,
}: {
  achievement: AchievementDefinition;
  positiveCycles: number;
}) {
  const { theme } = useTheme();

  const progress =
    getAchievementProgress(
      achievement.id,
      positiveCycles
    );

  return (
    <View
      style={[
        styles.lockedCard,
        {
          backgroundColor:
            theme.colors.surface,
          borderColor:
            theme.colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.lockedIcon,
          {
            backgroundColor:
              theme.colors.primarySoft,
          },
        ]}
      >
        <MaterialIcons
          name="lock-outline"
          size={28}
          color={
            theme.colors.textSecondary
          }
        />
      </View>

      <View style={styles.lockedContent}>
        <View
          style={styles.lockedTitleRow}
        >
          <Text
            style={[
              styles.lockedTitle,
              {
                color: theme.colors.text,
              },
            ]}
          >
            Conquista bloqueada
          </Text>

          <Text
            style={[
              styles.lockedCounter,
              {
                color:
                  theme.colors
                    .textSecondary,
              },
            ]}
          >
            {progress.current}/
            {progress.required}
          </Text>
        </View>

        <Text
          style={[
            styles.lockedDescription,
            {
              color:
                theme.colors
                  .textSecondary,
            },
          ]}
        >
          {progress.remaining === 1
            ? "Conclua mais 1 ciclo positivo para desbloquear."
            : `Conclua mais ${progress.remaining} ciclos positivos para desbloquear.`}
        </Text>

        <View
          style={[
            styles.lockedProgressTrack,
            {
              backgroundColor:
                theme.colors.primarySoft,
            },
          ]}
        >
          <View
            style={[
              styles.lockedProgressFill,
              {
                width: `${
                  progress.progress * 100
                }%`,
                backgroundColor:
                  theme.colors.primary,
              },
            ]}
          />
        </View>

        <View style={styles.secretRow}>
          <MaterialIcons
            name="visibility-off"
            size={16}
            color={
              theme.colors.textSecondary
            }
          />

          <Text
            style={[
              styles.secretText,
              {
                color:
                  theme.colors
                    .textSecondary,
              },
            ]}
          >
            Conquista secreta
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "transparent",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 50,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },

  title: {
    fontSize: 29,
    fontWeight: "700",
    letterSpacing: -0.7,
  },

  description: {
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 24,
  },

  progressCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 17,
    marginBottom: 30,
  },

  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  progressIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  progressText: {
    flex: 1,
  },

  progressTitle: {
    fontSize: 17,
    fontWeight: "700",
  },

  progressDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
  },

  progressTrack: {
    height: 7,
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 16,
  },

  progressFill: {
    height: "100%",
    borderRadius: 999,
  },

  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.1,
    marginLeft: 4,
    marginBottom: 11,
  },

  achievementList: {
    gap: 14,
  },

  unlockedCard: {
    minHeight: 260,
    borderRadius: 24,
    overflow: "hidden",
    position: "relative",
  },

  unlockedGlowTop: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    top: -135,
    right: -70,
    backgroundColor:
      "rgba(255,255,255,0.12)",
  },

  unlockedGlowBottom: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    bottom: -130,
    left: -70,
    backgroundColor:
      "rgba(255,255,255,0.07)",
  },

  unlockedContent: {
    padding: 20,
  },

  unlockedHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 22,
  },

  eyebrow: {
    flex: 1,
    color:
      "rgba(255,255,255,0.72)",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.25,
  },

  unlockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor:
      "rgba(0,0,0,0.2)",
  },

  unlockedBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.7,
  },

  unlockedTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    lineHeight: 29,
    fontWeight: "800",
    letterSpacing: -0.4,
  },

  messageRow: {
    flexDirection: "row",
    marginTop: 20,
  },

  messageLine: {
    width: 4,
    borderRadius: 999,
    backgroundColor:
      "rgba(255,255,255,0.28)",
    marginRight: 14,
  },

  unlockedMessage: {
    flex: 1,
    color:
      "rgba(255,255,255,0.9)",
    fontSize: 14,
    lineHeight: 21,
  },

  lockedCard: {
    minHeight: 170,
    borderRadius: 20,
    borderWidth: 1,
    padding: 17,
    flexDirection: "row",
  },

  lockedIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  lockedContent: {
    flex: 1,
  },

  lockedTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  lockedTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
  },

  lockedCounter: {
    fontSize: 12,
    fontWeight: "700",
  },

  lockedDescription: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },

  lockedProgressTrack: {
    height: 6,
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 14,
  },

  lockedProgressFill: {
    height: "100%",
    borderRadius: 999,
  },

  secretRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
  },

  secretText: {
    fontSize: 11,
    fontWeight: "600",
  },
});