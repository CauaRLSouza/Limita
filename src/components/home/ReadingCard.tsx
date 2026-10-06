import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  FinancialReading,
} from "../../database/readings";
import { useTheme } from "../../theme/ThemeContext";

type ReadingCardProps = {
  readings: FinancialReading[];
  unreadCount: number;
  onOpen: (
    reading: FinancialReading
  ) => void;
  onDismiss: (
    reading: FinancialReading
  ) => void;
};

const SCREEN_WIDTH =
  Dimensions.get("window").width;

const CARD_WIDTH =
  SCREEN_WIDTH - 40;

export default function ReadingCard({
  readings,
  unreadCount,
  onOpen,
  onDismiss,
}: ReadingCardProps) {
  const {
    theme,
    achievementTheme,
  } = useTheme();

  if (readings.length === 0) {
    return null;
  }

  const isConstellation =
    achievementTheme ===
    "constellation";

  const accentColor =
    isConstellation
      ? "#22D3C5"
      : theme.colors.primary;

  const softAccentColor =
    isConstellation
      ? "rgba(34, 211, 197, 0.12)"
      : theme.colors.primarySoft;

  return (
    <View
      style={
        styles.container
      }
    >
      <View
        style={
          styles.header
        }
      >
        <View
          style={
            styles.headerIdentity
          }
        >
          <View
            style={[
              styles.logo,
              {
                backgroundColor:
                  softAccentColor,
                borderColor:
                  accentColor,
              },
            ]}
          >
            <Text
              style={[
                styles.logoText,
                {
                  color:
                    accentColor,
                },
              ]}
            >
              L
            </Text>

            {unreadCount > 0 && (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor:
                      accentColor,
                  },
                ]}
              >
                <Text
                  style={
                    styles.badgeText
                  }
                >
                  {unreadCount >
                  99
                    ? "99+"
                    : unreadCount}
                </Text>
              </View>
            )}
          </View>

          <View>
            <Text
              style={[
                styles.headerTitle,
                {
                  color:
                    theme.colors
                      .text,
                },
              ]}
            >
              Leituras do Límita
            </Text>

            {readings.length >
              1 && (
              <Text
                style={[
                  styles.headerSubtitle,
                  {
                    color:
                      theme.colors
                        .textSecondary,
                  },
                ]}
              >
                Deslize para ver
                outras leituras
              </Text>
            )}
          </View>
        </View>

        {readings.length >
          1 && (
          <Text
            style={[
              styles.counter,
              {
                color:
                  theme.colors
                    .textSecondary,
              },
            ]}
          >
            {readings.length}
          </Text>
        )}
      </View>

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={
          false
        }
        decelerationRate="fast"
        snapToInterval={
          CARD_WIDTH + 12
        }
        contentContainerStyle={
          styles.carousel
        }
      >
        {readings.map(
          (reading) => (
            <View
              key={reading.id}
              style={[
                styles.card,
                {
                  width:
                    CARD_WIDTH,
                  backgroundColor:
                    softAccentColor,
                  borderColor:
                    accentColor,
                },
              ]}
            >
              <View
                style={
                  styles.cardTop
                }
              >
                <View
                  style={[
                    styles.smallLogo,
                    {
                      borderColor:
                        accentColor,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.smallLogoText,
                      {
                        color:
                          accentColor,
                      },
                    ]}
                  >
                    L
                  </Text>
                </View>

                {reading.readAt ===
                  null && (
                  <View
                    style={[
                      styles.newPill,
                      {
                        backgroundColor:
                          accentColor,
                      },
                    ]}
                  >
                    <Text
                      style={
                        styles.newPillText
                      }
                    >
                      NOVA
                    </Text>
                  </View>
                )}
              </View>

              <Text
                style={[
                  styles.title,
                  {
                    color:
                      theme.colors
                        .text,
                  },
                ]}
              >
                {reading.title}
              </Text>

              <Text
                style={[
                  styles.summary,
                  {
                    color:
                      theme.colors
                        .textSecondary,
                  },
                ]}
              >
                {reading.summary}
              </Text>

              <View
                style={
                  styles.actions
                }
              >
                <Pressable
                  onPress={() =>
                    onOpen(
                      reading
                    )
                  }
                  style={[
                    styles.primaryButton,
                    {
                      backgroundColor:
                        accentColor,
                    },
                  ]}
                >
                  <MaterialIcons
                    name="auto-stories"
                    size={18}
                    color="#FFFFFF"
                  />

                  <Text
                    style={
                      styles.primaryButtonText
                    }
                  >
                    Ler
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() =>
                    onDismiss(
                      reading
                    )
                  }
                  style={[
                    styles.secondaryButton,
                    {
                      borderColor:
                        theme.colors
                          .border,
                      backgroundColor:
                        theme.colors
                          .surface,
                    },
                  ]}
                >
                  <MaterialIcons
                    name="close"
                    size={18}
                    color={
                      theme.colors
                        .textSecondary
                    }
                  />

                  <Text
                    style={[
                      styles.secondaryButtonText,
                      {
                        color:
                          theme.colors
                            .textSecondary,
                      },
                    ]}
                  >
                    Descartar
                  </Text>
                </Pressable>
              </View>
            </View>
          )
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    marginBottom: 12,
  },

  headerIdentity: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  logo: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  logoText: {
    fontSize: 22,
    fontWeight: "800",
  },

  badge: {
    position: "absolute",
    top: -7,
    right: -7,
    minWidth: 21,
    height: 21,
    paddingHorizontal: 5,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },

  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },

  counter: {
    fontSize: 13,
    fontWeight: "700",
  },

  carousel: {
    gap: 12,
  },

  card: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 20,
  },

  cardTop: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  smallLogo: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },

  smallLogoText: {
    fontSize: 16,
    fontWeight: "800",
  },

  newPill: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
  },

  newPillText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  title: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "700",
  },

  summary: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },

  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },

  primaryButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  secondaryButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
});