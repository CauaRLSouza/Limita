import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import TabHeader from "../../components/TabHeader";
import ThemeAccent from "../../components/ThemeAccent";
import { useTheme } from "../../theme/ThemeContext";

const bauPositivo = require("../../../assets/images/fechamento/bau-positivo.png");

function formatarDataAtual() {
  const data = new Date();

  const texto = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(data);

  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export default function HomeScreen() {
  const {
    theme,
    activeSpecialTheme,
  } = useTheme();

  const isPride =
    activeSpecialTheme === "pride";

  const [fechamentoPendente, setFechamentoPendente] =
    useState(true);

  function resolverFechamento() {
    setFechamentoPendente(false);
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <TabHeader />

      <View style={styles.greetingContainer}>
        <Text
          style={[
            styles.greeting,
            { color: theme.colors.text },
          ]}
        >
          Olá, Cacá! {isPride ? "🏳️‍🌈" : "👋"}
        </Text>

        <Text
          style={[
            styles.date,
            { color: theme.colors.textSecondary },
          ]}
        >
          {formatarDataAtual()}
        </Text>
      </View>

      {fechamentoPendente ? (
        <View
          style={[
            styles.closingCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.closingTop}>
            <Text
              style={[
                styles.closingEyebrow,
                {
                  color: theme.colors.textSecondary,
                },
              ]}
            >
              CICLO ENCERRADO
            </Text>

            <Text
              style={[
                styles.closingTitle,
                {
                  color: theme.colors.text,
                },
              ]}
            >
              Setembro terminou no positivo
            </Text>
          </View>

          <Image
            source={bauPositivo}
            style={styles.closingImage}
            resizeMode="contain"
          />

          <View style={styles.closingResult}>
            <Text
              style={[
                styles.closingResultLabel,
                {
                  color: theme.colors.textSecondary,
                },
              ]}
            >
              Você terminou o ciclo com
            </Text>

            <Text
              style={[
                styles.closingValue,
                {
                  color: theme.colors.text,
                },
              ]}
            >
              R$ 438,27
            </Text>

            <Text
              style={[
                styles.closingAvailable,
                {
                  color: theme.colors.textSecondary,
                },
              ]}
            >
              disponíveis
            </Text>
          </View>

          <View
            style={[
              styles.closingDivider,
              {
                backgroundColor: theme.colors.border,
              },
            ]}
          />

          <Text
            style={[
              styles.closingQuestion,
              {
                color: theme.colors.text,
              },
            ]}
          >
            O que você quer fazer com essa sobra?
          </Text>

          <Pressable
            onPress={resolverFechamento}
            style={({ pressed }) => ({
              opacity: pressed ? 0.82 : 1,
            })}
          >
            <ThemeAccent
              style={styles.primaryClosingButton}
            >
              <MaterialIcons
                name="savings"
                size={22}
                color="#FFFFFF"
              />

              <Text
                style={styles.primaryClosingButtonText}
              >
                Levar para o Cofre
              </Text>
            </ThemeAccent>
          </Pressable>

          <Pressable
            onPress={resolverFechamento}
            style={({ pressed }) => [
              styles.secondaryClosingButton,
              {
                borderColor: theme.colors.border,
                backgroundColor:
                  theme.colors.surfaceSecondary,
                opacity: pressed ? 0.82 : 1,
              },
            ]}
          >
            <MaterialIcons
              name="account-balance-wallet"
              size={21}
              color={theme.colors.primary}
            />

            <Text
              style={[
                styles.secondaryClosingButtonText,
                {
                  color: theme.colors.text,
                },
              ]}
            >
              Manter no dinheiro do mês
            </Text>
          </Pressable>

          <Text
            style={[
              styles.closingHint,
              {
                color: theme.colors.textSecondary,
              },
            ]}
          >
            Essa escolha define onde a sobra do ciclo
            anterior ficará disponível.
          </Text>
        </View>
      ) : (
        <>
          <Pressable
            onPress={() => router.push("/cofre")}
            style={({ pressed }) => [
              styles.card,
              styles.cofreCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                opacity: pressed ? 0.82 : 1,
              },
            ]}
          >
            <View style={styles.cofreContent}>
              <View style={styles.cofreText}>
                <Text
                  style={[
                    styles.cardTitle,
                    {
                      color:
                        theme.colors.textSecondary,
                    },
                  ]}
                >
                  Cofre
                </Text>

                <Text
                  style={[
                    styles.balance,
                    {
                      color: theme.colors.text,
                    },
                  ]}
                >
                  R$ 8.420,00
                </Text>

                <Text
                  style={[
                    styles.cardDescription,
                    {
                      color:
                        theme.colors.textSecondary,
                    },
                  ]}
                >
                  O que você já conquistou
                </Text>
              </View>

              <MaterialIcons
                name="chevron-right"
                size={28}
                color={theme.colors.textSecondary}
              />
            </View>
          </Pressable>

          <View
            style={[
              styles.card,
              {
                backgroundColor:
                  theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.monthTitle,
                {
                  color: theme.colors.text,
                },
              ]}
            >
              Dinheiro do mês
            </Text>

            <View style={styles.monthValues}>
              <Text
                style={[
                  styles.monthBalance,
                  {
                    color: theme.colors.text,
                  },
                ]}
              >
                R$ 2.847,00
              </Text>

              <Text
                style={[
                  styles.monthTotal,
                  {
                    color:
                      theme.colors.textSecondary,
                  },
                ]}
              >
                de R$ 3.600,00
              </Text>
            </View>

            <View
              style={[
                styles.progressTrack,
                {
                  backgroundColor:
                    theme.colors.surfaceSecondary,
                },
              ]}
            >
              <ThemeAccent
                style={[
                  styles.progressFill,
                  { width: "79%" },
                ]}
              />
            </View>

            <View style={styles.monthSummary}>
              <Text
                style={[
                  styles.spent,
                  {
                    color:
                      theme.colors.textSecondary,
                  },
                ]}
              >
                R$ 753,00 gastos
              </Text>

              <Text
                style={[
                  styles.remaining,
                  {
                    color:
                      theme.colors.textSecondary,
                  },
                ]}
              >
                79% disponível
              </Text>
            </View>
          </View>
        </>
      )}

      <Text
        style={[
          styles.sectionTitle,
          { color: theme.colors.text },
        ]}
      >
        Ações rápidas
      </Text>

      <View style={styles.actions}>
        <Pressable
          onPress={() =>
            router.push("/registrar-movimentacao")
          }
          style={[
            styles.actionCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <ThemeAccent style={styles.actionIcon}>
            <MaterialIcons
              name="swap-vert"
              size={28}
              color="#FFFFFF"
            />
          </ThemeAccent>

          <Text
            style={[
              styles.actionText,
              { color: theme.colors.text },
            ]}
          >
            Registrar movimentação
          </Text>
        </Pressable>

        <Pressable
          onPress={() =>
            router.push("/novo-orcamento")
          }
          style={[
            styles.actionCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          {isPride ? (
            <ThemeAccent style={styles.actionIcon}>
              <MaterialIcons
                name="add"
                size={30}
                color="#FFFFFF"
              />
            </ThemeAccent>
          ) : (
            <View
              style={[
                styles.actionIcon,
                {
                  backgroundColor:
                    theme.colors.surfaceSecondary,
                },
              ]}
            >
              <MaterialIcons
                name="add"
                size={30}
                color={theme.colors.primary}
              />
            </View>
          )}

          <Text
            style={[
              styles.actionText,
              { color: theme.colors.text },
            ]}
          >
            Adicionar orçamento
          </Text>
        </Pressable>
      </View>
    </ScrollView>
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
    paddingBottom: 32,
  },

  greetingContainer: {
    marginBottom: 28,
  },

  greeting: {
    fontSize: 30,
    fontWeight: "700",
    letterSpacing: -0.8,
  },

  date: {
    fontSize: 14,
    marginTop: 5,
  },

  card: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
  },

  cofreCard: {
    overflow: "hidden",
  },

  cofreContent: {
    flexDirection: "row",
    alignItems: "center",
  },

  cofreText: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
  },

  balance: {
    fontSize: 36,
    fontWeight: "700",
    marginTop: 5,
    letterSpacing: -1,
  },

  cardDescription: {
    fontSize: 14,
    marginTop: 7,
  },

  monthTitle: {
    fontSize: 18,
    fontWeight: "700",
  },

  monthValues: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 14,
  },

  monthBalance: {
    fontSize: 30,
    fontWeight: "700",
    letterSpacing: -0.8,
  },

  monthTotal: {
    fontSize: 14,
    marginBottom: 4,
  },

  progressTrack: {
    height: 10,
    borderRadius: 5,
    overflow: "hidden",
    marginTop: 18,
  },

  progressFill: {
    height: "100%",
    borderRadius: 5,
  },

  monthSummary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },

  spent: {
    fontSize: 13,
    fontWeight: "600",
  },

  remaining: {
    fontSize: 13,
    fontWeight: "600",
  },

  closingCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    overflow: "hidden",
  },

  closingTop: {
    alignItems: "center",
  },

  closingEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },

  closingTitle: {
    fontSize: 21,
    fontWeight: "700",
    lineHeight: 27,
    textAlign: "center",
    marginTop: 5,
  },

  closingImage: {
    width: "100%",
    height: 190,
    marginTop: 6,
    marginBottom: -2,
  },

  closingResult: {
    alignItems: "center",
  },

  closingResultLabel: {
    fontSize: 13,
    fontWeight: "600",
  },

  closingValue: {
    fontSize: 38,
    fontWeight: "800",
    letterSpacing: -1,
    marginTop: 4,
  },

  closingAvailable: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 1,
  },

  closingDivider: {
    height: 1,
    width: "100%",
    marginTop: 22,
  },

  closingQuestion: {
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
    textAlign: "center",
    marginTop: 20,
    marginBottom: 14,
  },

  primaryClosingButton: {
    minHeight: 52,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    overflow: "hidden",
  },

  primaryClosingButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  secondaryClosingButton: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    marginTop: 10,
  },

  secondaryClosingButtonText: {
    fontSize: 15,
    fontWeight: "700",
  },

  closingHint: {
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
    marginTop: 14,
    paddingHorizontal: 8,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 14,
    marginBottom: 14,
  },

  actions: {
    flexDirection: "row",
    gap: 12,
  },

  actionCard: {
    flex: 1,
    minHeight: 132,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    overflow: "hidden",
  },

  actionText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 19,
  },
});