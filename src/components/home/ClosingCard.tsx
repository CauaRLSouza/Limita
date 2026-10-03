import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  ClosingDecision,
  StoredCycle,
} from "../../database/cycles";
import { useTheme } from "../../theme/ThemeContext";
import ThemeAccent from "../ThemeAccent";

const bauFechado = require("../../../assets/images/bau-fechado.png");
const bauPositivo = require("../../../assets/images/bau-positivo.png");
const bauNegativo = require("../../../assets/images/bau-negativo.png");

type ClosingCardProps = {
  stage: "fechado" | "resultado";
  cycle: StoredCycle;
  onReveal: () => void;
  onDecision: (
    decision: ClosingDecision
  ) => void;
};

function formatMoney(
  valueCents: number
) {
  return new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  ).format(valueCents / 100);
}

function monthName(
  year: number,
  month: number
) {
  const text =
    new Intl.DateTimeFormat(
      "pt-BR",
      {
        month: "long",
      }
    ).format(
      new Date(
        year,
        month - 1,
        1
      )
    );

  return (
    text.charAt(0).toUpperCase() +
    text.slice(1)
  );
}

export default function ClosingCard({
  stage,
  cycle,
  onReveal,
  onDecision,
}: ClosingCardProps) {
  const { theme } = useTheme();

  const negative =
    (cycle.resultCents ?? 0) < 0;

  const result =
    cycle.resultCents ?? 0;

  const month =
    monthName(
      cycle.year,
      cycle.month
    );

  if (stage === "fechado") {
    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor:
              theme.colors.surface,
            borderColor:
              theme.colors.border,
          },
        ]}
      >
        <View style={styles.top}>
          <Text
            style={[
              styles.eyebrow,
              {
                color:
                  theme.colors
                    .textSecondary,
              },
            ]}
          >
            CICLO ENCERRADO
          </Text>

          <Text
            style={[
              styles.title,
              {
                color:
                  theme.colors.text,
              },
            ]}
          >
            Seu ciclo de{" "}
            {month.toLowerCase()} terminou
          </Text>
        </View>

        <Image
          source={bauFechado}
          style={
            styles.closedChestImage
          }
          resizeMode="contain"
        />

        <Text
          style={[
            styles.closedDescription,
            {
              color:
                theme.colors
                  .textSecondary,
            },
          ]}
        >
          Seu fechamento está pronto.
          Veja como você encerrou este
          ciclo e o que isso significa
          para o próximo.
        </Text>

        <Pressable
          onPress={onReveal}
          style={({ pressed }) => ({
            opacity: pressed
              ? 0.82
              : 1,
          })}
        >
          <ThemeAccent
            style={styles.revealButton}
          >
            <MaterialIcons
              name="lock-open"
              size={22}
              color="#FFFFFF"
            />

            <Text
              style={
                styles.revealButtonText
              }
            >
              Ver meu fechamento
            </Text>
          </ThemeAccent>
        </Pressable>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor:
            theme.colors.surface,
          borderColor:
            theme.colors.border,
        },
      ]}
    >
      <View style={styles.top}>
        <Text
          style={[
            styles.eyebrow,
            {
              color:
                theme.colors
                  .textSecondary,
            },
          ]}
        >
          CICLO ENCERRADO
        </Text>

        <Text
          style={[
            styles.title,
            {
              color:
                theme.colors.text,
            },
          ]}
        >
          {month} terminou no{" "}
          {negative
            ? "negativo"
            : "positivo"}
        </Text>
      </View>

      <Image
        source={
          negative
            ? bauNegativo
            : bauPositivo
        }
        style={styles.image}
        resizeMode="contain"
      />

      <View style={styles.result}>
        <Text
          style={[
            styles.resultLabel,
            {
              color:
                theme.colors
                  .textSecondary,
            },
          ]}
        >
          Você terminou o ciclo com
        </Text>

        <Text
          style={[
            styles.value,
            {
              color: negative
                ? "#FF5A67"
                : theme.colors.text,
            },
          ]}
        >
          {formatMoney(
            Math.abs(result)
          )}
        </Text>

        <Text
          style={[
            styles.available,
            {
              color:
                theme.colors
                  .textSecondary,
            },
          ]}
        >
          {negative
            ? "de déficit"
            : "disponíveis"}
        </Text>
      </View>

      <View
        style={[
          styles.divider,
          {
            backgroundColor:
              theme.colors.border,
          },
        ]}
      />

      <Text
        style={[
          styles.question,
          {
            color:
              theme.colors.text,
          },
        ]}
      >
        {negative
          ? "Como você quer lidar com esse déficit?"
          : "O que você quer fazer com essa sobra?"}
      </Text>

      {negative ? (
        <>
          <Pressable
            onPress={() =>
              onDecision(
                "negative_from_vault"
              )
            }
            style={({ pressed }) => ({
              opacity: pressed
                ? 0.82
                : 1,
            })}
          >
            <ThemeAccent
              style={
                styles.primaryButton
              }
            >
              <MaterialIcons
                name="savings"
                size={22}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.primaryButtonText
                }
              >
                Descontar do Cofre
              </Text>
            </ThemeAccent>
          </Pressable>

          <Pressable
            onPress={() =>
              onDecision(
                "negative_carry"
              )
            }
            style={({ pressed }) => [
              styles.secondaryButton,
              {
                borderColor:
                  theme.colors.border,
                backgroundColor:
                  theme.colors
                    .surfaceSecondary,
                opacity: pressed
                  ? 0.82
                  : 1,
              },
            ]}
          >
            <MaterialIcons
              name="arrow-forward"
              size={21}
              color={
                theme.colors.primary
              }
            />

            <Text
              style={[
                styles.secondaryButtonText,
                {
                  color:
                    theme.colors.text,
                },
              ]}
            >
              Levar para o próximo ciclo
            </Text>
          </Pressable>

          <Text
            style={[
              styles.hint,
              {
                color:
                  theme.colors
                    .textSecondary,
              },
            ]}
          >
            Se levar o déficit adiante, o
            próximo ciclo começará com
            esse valor já comprometido.
          </Text>
        </>
      ) : (
        <>
          <Pressable
            onPress={() =>
              onDecision(
                "positive_to_vault"
              )
            }
            style={({ pressed }) => ({
              opacity: pressed
                ? 0.82
                : 1,
            })}
          >
            <ThemeAccent
              style={
                styles.primaryButton
              }
            >
              <MaterialIcons
                name="savings"
                size={22}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.primaryButtonText
                }
              >
                Levar para o Cofre
              </Text>
            </ThemeAccent>
          </Pressable>

          <Pressable
            onPress={() =>
              onDecision(
                "positive_keep_monthly"
              )
            }
            style={({ pressed }) => [
              styles.secondaryButton,
              {
                borderColor:
                  theme.colors.border,
                backgroundColor:
                  theme.colors
                    .surfaceSecondary,
                opacity: pressed
                  ? 0.82
                  : 1,
              },
            ]}
          >
            <MaterialIcons
              name="account-balance-wallet"
              size={21}
              color={
                theme.colors.primary
              }
            />

            <Text
              style={[
                styles.secondaryButtonText,
                {
                  color:
                    theme.colors.text,
                },
              ]}
            >
              Manter no dinheiro do mês
            </Text>
          </Pressable>

          <Text
            style={[
              styles.hint,
              {
                color:
                  theme.colors
                    .textSecondary,
              },
            ]}
          >
            Essa escolha define onde a
            sobra do ciclo anterior ficará
            disponível.
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    overflow: "hidden",
  },

  top: {
    alignItems: "center",
  },

  eyebrow: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },

  title: {
    fontSize: 21,
    fontWeight: "700",
    lineHeight: 27,
    textAlign: "center",
    marginTop: 5,
  },

  closedChestImage: {
    width: "100%",
    height: 220,
    marginTop: 12,
  },

  closedDescription: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "500",
    textAlign: "center",
    paddingHorizontal: 10,
    marginTop: 6,
    marginBottom: 20,
  },

  revealButton: {
    minHeight: 54,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    overflow: "hidden",
  },

  revealButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  image: {
    width: "100%",
    height: 190,
    marginTop: 6,
    marginBottom: -2,
  },

  result: {
    alignItems: "center",
  },

  resultLabel: {
    fontSize: 13,
    fontWeight: "600",
  },

  value: {
    fontSize: 38,
    fontWeight: "800",
    letterSpacing: -1,
    marginTop: 4,
  },

  available: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 1,
  },

  divider: {
    height: 1,
    width: "100%",
    marginTop: 22,
  },

  question: {
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
    textAlign: "center",
    marginTop: 20,
    marginBottom: 14,
  },

  primaryButton: {
    minHeight: 52,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    overflow: "hidden",
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  secondaryButton: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    marginTop: 10,
  },

  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
  },

  hint: {
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
    marginTop: 14,
    paddingHorizontal: 8,
  },
});