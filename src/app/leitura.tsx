import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  router,
  useLocalSearchParams,
} from "expo-router";
import {
  useEffect,
  useState,
} from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  dismissFinancialReading,
  FinancialReading,
  markFinancialReadingAsRead,
} from "../database/readings";
import { useTheme } from "../theme/ThemeContext";

export default function ReadingScreen() {
  const {
    theme,
    achievementTheme,
  } = useTheme();

  const params =
    useLocalSearchParams<{
      id?: string;
    }>();

  const [
    reading,
    setReading,
  ] =
    useState<FinancialReading | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

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

  useEffect(() => {
    let active = true;

    async function loadReading() {
      const id =
        Number(params.id);

      if (
        !Number.isInteger(id) ||
        id <= 0
      ) {
        if (active) {
          setLoading(false);
        }

        return;
      }

      try {
        const result =
          await markFinancialReadingAsRead(
            id
          );

        if (active) {
          setReading(
            result
          );
        }
      } catch (error) {
        console.error(
          "Erro ao carregar Leitura:",
          error
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadReading();

    return () => {
      active = false;
    };
  }, [params.id]);

  function openAction() {
    if (!reading) {
      return;
    }

    switch (
      reading.actionType
    ) {
      case "budget":
        router.replace(
          "/(tabs)/orcamentos"
        );
        return;

      case "statement":
        router.replace(
          "/(tabs)/extrato"
        );
        return;

      case "history":
        router.replace(
          "/(tabs)/historico"
        );
        return;

      default:
        return;
    }
  }

  async function dismiss() {
    if (!reading) {
      return;
    }

    try {
      await dismissFinancialReading(
        reading.id
      );

      router.back();
    } catch (error) {
      console.error(
        "Erro ao descartar Leitura:",
        error
      );
    }
  }

  if (loading) {
    return (
      <View
        style={[
          styles.center,
          {
            backgroundColor:
              theme.colors
                .background,
          },
        ]}
      >
        <Text
          style={{
            color:
              theme.colors
                .textSecondary,
          }}
        >
          Carregando leitura...
        </Text>
      </View>
    );
  }

  if (!reading) {
    return (
      <View
        style={[
          styles.center,
          {
            backgroundColor:
              theme.colors
                .background,
          },
        ]}
      >
        <MaterialIcons
          name="auto-stories"
          size={40}
          color={
            theme.colors
              .textSecondary
          }
        />

        <Text
          style={[
            styles.notFoundTitle,
            {
              color:
                theme.colors.text,
            },
          ]}
        >
          Leitura não encontrada
        </Text>

        <Pressable
          onPress={() =>
            router.back()
          }
          style={[
            styles.backSimpleButton,
            {
              borderColor:
                theme.colors.border,
            },
          ]}
        >
          <Text
            style={{
              color:
                theme.colors.text,
              fontWeight: "700",
            }}
          >
            Voltar
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={[
        styles.screen,
        {
          backgroundColor:
            theme.colors
              .background,
        },
      ]}
      contentContainerStyle={
        styles.content
      }
      showsVerticalScrollIndicator={
        false
      }
    >
      <View
        style={
          styles.topBar
        }
      >
        <Pressable
          onPress={() =>
            router.back()
          }
          style={[
            styles.backButton,
            {
              backgroundColor:
                theme.colors
                  .surface,
              borderColor:
                theme.colors
                  .border,
            },
          ]}
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={
              theme.colors.text
            }
          />
        </Pressable>

        <Text
          style={[
            styles.screenTitle,
            {
              color:
                theme.colors.text,
            },
          ]}
        >
          Leitura do Límita
        </Text>

        <View
          style={
            styles.topSpacer
          }
        />
      </View>

      <View
        style={[
          styles.identity,
          {
            backgroundColor:
              softAccentColor,
            borderColor:
              accentColor,
          },
        ]}
      >
        <View
          style={[
            styles.logo,
            {
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
        </View>

        <View
          style={
            styles.identityText
          }
        >
          <Text
            style={[
              styles.identityTitle,
              {
                color:
                  theme.colors.text,
              },
            ]}
          >
            Límita percebeu algo
          </Text>

          <Text
            style={[
              styles.identitySubtitle,
              {
                color:
                  theme.colors
                    .textSecondary,
              },
            ]}
          >
            Uma leitura baseada no
            seu comportamento
            financeiro.
          </Text>
        </View>
      </View>

      <Text
        style={[
          styles.title,
          {
            color:
              theme.colors.text,
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
              accentColor,
          },
        ]}
      >
        {reading.summary}
      </Text>

      <View
        style={[
          styles.detailCard,
          {
            backgroundColor:
              theme.colors.surface,
            borderColor:
              theme.colors.border,
          },
        ]}
      >
        <MaterialIcons
          name="lightbulb-outline"
          size={24}
          color={
            accentColor
          }
        />

        <Text
          style={[
            styles.detail,
            {
              color:
                theme.colors.text,
            },
          ]}
        >
          {reading.detail}
        </Text>
      </View>

      {reading.actionType &&
        reading.actionLabel && (
          <Pressable
            onPress={
              openAction
            }
            style={[
              styles.actionButton,
              {
                backgroundColor:
                  accentColor,
              },
            ]}
          >
            <Text
              style={
                styles.actionButtonText
              }
            >
              {
                reading.actionLabel
              }
            </Text>

            <MaterialIcons
              name="arrow-forward"
              size={20}
              color="#FFFFFF"
            />
          </Pressable>
        )}

      <Pressable
        onPress={dismiss}
        style={[
          styles.dismissButton,
          {
            borderColor:
              theme.colors.border,
          },
        ]}
      >
        <MaterialIcons
          name="close"
          size={19}
          color={
            theme.colors
              .textSecondary
          }
        />

        <Text
          style={[
            styles.dismissText,
            {
              color:
                theme.colors
                  .textSecondary,
            },
          ]}
        >
          Descartar leitura
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 40,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    marginBottom: 30,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  screenTitle: {
    fontSize: 17,
    fontWeight: "700",
  },

  topSpacer: {
    width: 44,
  },

  identity: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    marginBottom: 28,
  },

  logo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  logoText: {
    fontSize: 27,
    fontWeight: "800",
  },

  identityText: {
    flex: 1,
  },

  identityTitle: {
    fontSize: 16,
    fontWeight: "700",
  },

  identitySubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },

  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "700",
    letterSpacing: -0.7,
  },

  summary: {
    fontSize: 17,
    lineHeight: 25,
    fontWeight: "700",
    marginTop: 14,
  },

  detailCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 20,
    marginTop: 24,
  },

  detail: {
    fontSize: 15,
    lineHeight: 24,
    marginTop: 14,
  },

  actionButton: {
    minHeight: 54,
    borderRadius: 16,
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  dismissButton: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  dismissText: {
    fontSize: 14,
    fontWeight: "700",
  },

  notFoundTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 14,
  },

  backSimpleButton: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 22,
    paddingVertical: 12,
    marginTop: 20,
  },
});