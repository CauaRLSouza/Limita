import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  MilestoneStats,
} from "../../database/milestones";
import { useTheme } from "../../theme/ThemeContext";
import ThemeAccent from "../ThemeAccent";

type AnnualMilestoneCardProps = {
  stats: MilestoneStats;
  onContinue: () => void;
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

function formatSignedMoney(
  valueCents: number
) {
  if (valueCents > 0) {
    return `+${formatMoney(
      valueCents
    )}`;
  }

  return formatMoney(
    valueCents
  );
}

function shortMonth(
  year: number,
  month: number
) {
  const text =
    new Intl.DateTimeFormat(
      "pt-BR",
      {
        month: "short",
      }
    )
      .format(
        new Date(
          year,
          month - 1,
          1
        )
      )
      .replace(".", "");

  return (
    text.charAt(0).toUpperCase() +
    text.slice(1)
  );
}

function shortMonthYear(
  year: number,
  month: number
) {
  return `${shortMonth(
    year,
    month
  )}/${String(year).slice(-2)}`;
}

export default function AnnualMilestoneCard({
  stats,
  onContinue,
}: AnnualMilestoneCardProps) {
  const { theme } =
    useTheme();

  if (
    !stats.firstCycle ||
    !stats.lastCycle
  ) {
    return null;
  }

  const first =
    stats.firstCycle;

  const last =
    stats.lastCycle;

  const previousAverage =
    stats.previousGroupAverageCents;

  const recentAverage =
    stats.recentGroupAverageCents;

  const comparison =
    stats.comparisonPercentage;

  const improved =
    comparison !== null &&
    comparison > 0;

  const declined =
    comparison !== null &&
    comparison < 0;

  const averageDifference =
    previousAverage !== null &&
    recentAverage !== null
      ? recentAverage -
        previousAverage
      : null;

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
      <View
        style={
          styles.celebration
        }
      >
        <View
          style={styles.sparkRow}
        >
          <MaterialIcons
            name="auto-awesome"
            size={19}
            color={
              theme.colors.primary
            }
          />

          <Text
            style={[
              styles.eyebrow,
              {
                color:
                  theme.colors.primary,
              },
            ]}
          >
            UM ANO JUNTOS
          </Text>

          <MaterialIcons
            name="auto-awesome"
            size={19}
            color={
              theme.colors.primary
            }
          />
        </View>

        <View
          style={
            styles.numberContainer
          }
        >
          <Text
            style={[
              styles.number,
              {
                color:
                  theme.colors.text,
              },
            ]}
          >
            1
          </Text>

          <View>
            <Text
              style={[
                styles.numberLabel,
                {
                  color:
                    theme.colors.text,
                },
              ]}
            >
              ano
            </Text>

            <Text
              style={[
                styles.numberBrand,
                {
                  color:
                    theme.colors
                      .textSecondary,
                },
              ]}
            >
              com o Límita
            </Text>
          </View>
        </View>

        <Text
          style={[
            styles.intro,
            {
              color:
                theme.colors
                  .textSecondary,
            },
          ]}
        >
          Há 12 ciclos você começou a
          acompanhar sua vida financeira
          por aqui. Hoje existe uma
          história inteira para olhar
          para trás.
        </Text>
      </View>

      <View
        style={[
          styles.periodCard,
          {
            backgroundColor:
              theme.colors
                .surfaceSecondary,
          },
        ]}
      >
        <View
          style={styles.periodTop}
        >
          <View
            style={styles.periodEdge}
          >
            <Text
              style={[
                styles.periodMonth,
                {
                  color:
                    theme.colors.text,
                },
              ]}
            >
              {shortMonthYear(
                first.year,
                first.month
              )}
            </Text>

            <Text
              style={[
                styles.periodLabel,
                {
                  color:
                    theme.colors
                      .textSecondary,
                },
              ]}
            >
              início
            </Text>
          </View>

          <View
            style={styles.periodMiddle}
          >
            <View
              style={[
                styles.periodLine,
                {
                  backgroundColor:
                    theme.colors.border,
                },
              ]}
            />

            <ThemeAccent
              style={
                styles.periodBadge
              }
            >
              <MaterialIcons
                name="check"
                size={16}
                color="#FFFFFF"
              />
            </ThemeAccent>

            <View
              style={[
                styles.periodLine,
                {
                  backgroundColor:
                    theme.colors.border,
                },
              ]}
            />
          </View>

          <View
            style={[
              styles.periodEdge,
              styles.periodEdgeRight,
            ]}
          >
            <Text
              style={[
                styles.periodMonth,
                {
                  color:
                    theme.colors.text,
                },
              ]}
            >
              {shortMonthYear(
                last.year,
                last.month
              )}
            </Text>

            <Text
              style={[
                styles.periodLabel,
                {
                  color:
                    theme.colors
                      .textSecondary,
                },
              ]}
            >
              agora
            </Text>
          </View>
        </View>

        <Text
          style={[
            styles.periodCaption,
            {
              color:
                theme.colors
                  .textSecondary,
            },
          ]}
        >
          12 ciclos concluídos
        </Text>
      </View>

      <View
        style={styles.sectionHeader}
      >
        <MaterialIcons
          name="insights"
          size={23}
          color={
            theme.colors.primary
          }
        />

        <Text
          style={[
            styles.sectionTitle,
            {
              color:
                theme.colors.text,
            },
          ]}
        >
          Seu ano em números
        </Text>
      </View>

      <View
        style={styles.statsGrid}
      >
        <View
          style={[
            styles.statCard,
            {
              backgroundColor:
                theme.colors
                  .surfaceSecondary,
            },
          ]}
        >
          <MaterialIcons
            name="check-circle-outline"
            size={22}
            color="#20C997"
          />

          <Text
            style={[
              styles.statValue,
              {
                color:
                  theme.colors.text,
              },
            ]}
          >
            {stats.positiveCycles} de 12
          </Text>

          <Text
            style={[
              styles.statLabel,
              {
                color:
                  theme.colors
                    .textSecondary,
              },
            ]}
          >
            ciclos positivos
          </Text>
        </View>

        <View
          style={[
            styles.statCard,
            {
              backgroundColor:
                theme.colors
                  .surfaceSecondary,
            },
          ]}
        >
          <MaterialIcons
            name="account-balance-wallet"
            size={22}
            color={
              theme.colors.primary
            }
          />

          <Text
            style={[
              styles.statValue,
              {
                color:
                  stats.accumulatedBalanceCents >
                  0
                    ? "#20C997"
                    : theme.colors.text,
              },
            ]}
          >
            {formatSignedMoney(
              stats.accumulatedBalanceCents
            )}
          </Text>

          <Text
            style={[
              styles.statLabel,
              {
                color:
                  theme.colors
                    .textSecondary,
              },
            ]}
          >
            saldo acumulado
          </Text>
        </View>

        <View
          style={[
            styles.statCard,
            {
              backgroundColor:
                theme.colors
                  .surfaceSecondary,
            },
          ]}
        >
          <MaterialIcons
            name="emoji-events"
            size={22}
            color={
              theme.colors.primary
            }
          />

          <Text
            style={[
              styles.statValue,
              {
                color:
                  (stats.bestCycle
                    ?.resultCents ??
                    0) > 0
                    ? "#20C997"
                    : theme.colors.text,
              },
            ]}
          >
            {stats.bestCycle
              ? formatSignedMoney(
                  stats.bestCycle
                    .resultCents
                )
              : "—"}
          </Text>

          <Text
            style={[
              styles.statLabel,
              {
                color:
                  theme.colors
                    .textSecondary,
              },
            ]}
          >
            {stats.bestCycle
              ? `melhor ciclo · ${shortMonth(
                  stats.bestCycle.year,
                  stats.bestCycle.month
                )}`
              : "melhor ciclo"}
          </Text>
        </View>

        <View
          style={[
            styles.statCard,
            {
              backgroundColor:
                theme.colors
                  .surfaceSecondary,
            },
          ]}
        >
          <MaterialIcons
            name="show-chart"
            size={22}
            color={
              theme.colors.primary
            }
          />

          <Text
            style={[
              styles.statValue,
              {
                color:
                  stats.averageResultCents >
                  0
                    ? "#20C997"
                    : theme.colors.text,
              },
            ]}
          >
            {formatSignedMoney(
              stats.averageResultCents
            )}
          </Text>

          <Text
            style={[
              styles.statLabel,
              {
                color:
                  theme.colors
                    .textSecondary,
              },
            ]}
          >
            média por ciclo
          </Text>
        </View>
      </View>

      <View
        style={styles.sectionHeader}
      >
        <MaterialIcons
          name="compare-arrows"
          size={24}
          color={
            theme.colors.primary
          }
        />

        <Text
          style={[
            styles.sectionTitle,
            {
              color:
                theme.colors.text,
            },
          ]}
        >
          Primeira metade × segunda metade
        </Text>
      </View>

      <View
        style={[
          styles.comparisonCard,
          {
            borderColor:
              theme.colors.border,
          },
        ]}
      >
        <View
          style={
            styles.comparisonColumns
          }
        >
          <View
            style={
              styles.comparisonColumn
            }
          >
            <Text
              style={[
                styles.comparisonCaption,
                {
                  color:
                    theme.colors
                      .textSecondary,
                },
              ]}
            >
              CICLOS 1–6
            </Text>

            <Text
              style={[
                styles.comparisonValue,
                {
                  color:
                    theme.colors.text,
                },
              ]}
            >
              {previousAverage !== null
                ? formatSignedMoney(
                    previousAverage
                  )
                : "—"}
            </Text>

            <Text
              style={[
                styles.comparisonLabel,
                {
                  color:
                    theme.colors
                      .textSecondary,
                },
              ]}
            >
              resultado médio
            </Text>
          </View>

          <View
            style={[
              styles.comparisonDivider,
              {
                backgroundColor:
                  theme.colors.border,
              },
            ]}
          />

          <View
            style={
              styles.comparisonColumn
            }
          >
            <Text
              style={[
                styles.comparisonCaption,
                {
                  color:
                    theme.colors
                      .textSecondary,
                },
              ]}
            >
              CICLOS 7–12
            </Text>

            <Text
              style={[
                styles.comparisonValue,
                {
                  color:
                    theme.colors.text,
                },
              ]}
            >
              {recentAverage !== null
                ? formatSignedMoney(
                    recentAverage
                  )
                : "—"}
            </Text>

            <Text
              style={[
                styles.comparisonLabel,
                {
                  color:
                    theme.colors
                      .textSecondary,
                },
              ]}
            >
              resultado médio
            </Text>
          </View>
        </View>

        {averageDifference !==
          null && (
          <View
            style={[
              styles.comparisonResult,
              {
                backgroundColor:
                  theme.colors
                    .surfaceSecondary,
              },
            ]}
          >
            <MaterialIcons
              name={
                averageDifference > 0
                  ? "north-east"
                  : averageDifference < 0
                    ? "south-east"
                    : "east"
              }
              size={20}
              color={
                averageDifference > 0
                  ? "#20C997"
                  : theme.colors.primary
              }
            />

            <Text
              style={[
                styles.comparisonResultText,
                {
                  color:
                    theme.colors.text,
                },
              ]}
            >
              {averageDifference ===
              0 ? (
                "Seu resultado médio permaneceu igual."
              ) : (
                <>
                  <Text
                    style={{
                      color:
                        averageDifference >
                        0
                          ? "#20C997"
                          : theme.colors
                              .primary,
                      fontWeight:
                        "800",
                    }}
                  >
                    {formatMoney(
                      Math.abs(
                        averageDifference
                      )
                    )}{" "}
                    {averageDifference >
                    0
                      ? "a mais"
                      : "a menos"}
                  </Text>{" "}
                  de resultado por ciclo,
                  em média.
                </>
              )}
            </Text>
          </View>
        )}
      </View>

      {comparison !== null && (
        <>
          <View
            style={
              styles.sectionHeader
            }
          >
            <MaterialIcons
              name="auto-graph"
              size={23}
              color={
                theme.colors.primary
              }
            />

            <Text
              style={[
                styles.sectionTitle,
                {
                  color:
                    theme.colors.text,
                },
              ]}
            >
              O que mudou em um ano
            </Text>
          </View>

          <View
            style={[
              styles.insightCard,
              {
                borderColor:
                  theme.colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.insightIcon,
                {
                  backgroundColor:
                    theme.colors
                      .surfaceSecondary,
                },
              ]}
            >
              <MaterialIcons
                name={
                  improved
                    ? "trending-up"
                    : declined
                      ? "trending-down"
                      : "trending-flat"
                }
                size={23}
                color={
                  improved
                    ? "#20C997"
                    : theme.colors
                        .primary
                }
              />
            </View>

            <View
              style={
                styles.insightContent
              }
            >
              <Text
                style={[
                  styles.insightTitle,
                  {
                    color:
                      theme.colors.text,
                  },
                ]}
              >
                {improved
                  ? "Seu resultado médio melhorou"
                  : declined
                    ? "Seu resultado médio caiu"
                    : "Seu resultado médio ficou estável"}
              </Text>

              <Text
                style={[
                  styles.insightText,
                  {
                    color:
                      theme.colors
                        .textSecondary,
                  },
                ]}
              >
                {improved
                  ? `Na segunda metade, seu resultado médio foi ${Math.abs(
                      Math.round(
                        comparison
                      )
                    )}% maior que nos 6 primeiros ciclos.`
                  : declined
                    ? `Na segunda metade, seu resultado médio foi ${Math.abs(
                        Math.round(
                          comparison
                        )
                      )}% menor que nos 6 primeiros ciclos.`
                    : "Sua média de resultado foi igual nas duas metades dos 12 ciclos."}
              </Text>
            </View>
          </View>
        </>
      )}

      <View
        style={[
          styles.closing,
          {
            backgroundColor:
              theme.colors
                .surfaceSecondary,
          },
        ]}
      >
        <ThemeAccent
          style={
            styles.closingIcon
          }
        >
          <MaterialIcons
            name="favorite"
            size={24}
            color="#FFFFFF"
          />
        </ThemeAccent>

        <Text
          style={[
            styles.closingTitle,
            {
              color:
                theme.colors.text,
            },
          ]}
        >
          Isso é só o começo.
        </Text>

        <Text
          style={[
            styles.closingText,
            {
              color:
                theme.colors
                  .textSecondary,
            },
          ]}
        >
          Durante 12 ciclos, você
          construiu uma visão da sua vida
          financeira que não existia
          quando começou.
        </Text>

        <Text
          style={[
            styles.thanks,
            {
              color:
                theme.colors.text,
            },
          ]}
        >
          Obrigado por deixar o Límita
          fazer parte dela. 💙
        </Text>
      </View>

      <Pressable
        onPress={onContinue}
        style={({ pressed }) => ({
          opacity: pressed
            ? 0.82
            : 1,
        })}
      >
        <ThemeAccent
          style={styles.button}
        >
          <Text
            style={
              styles.buttonText
            }
          >
            Continuar
          </Text>

          <MaterialIcons
            name="arrow-forward"
            size={21}
            color="#FFFFFF"
          />
        </ThemeAccent>
      </Pressable>
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

  celebration: {
    alignItems: "center",
    paddingTop: 8,
  },

  sparkRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  eyebrow: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.4,
  },

  numberContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 12,
  },

  number: {
    fontSize: 72,
    lineHeight: 76,
    fontWeight: "900",
    letterSpacing: -4,
  },

  numberLabel: {
    fontSize: 30,
    lineHeight: 33,
    fontWeight: "800",
    letterSpacing: -0.8,
  },

  numberBrand: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "700",
  },

  intro: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "500",
    textAlign: "center",
    paddingHorizontal: 6,
    marginTop: 14,
  },

  periodCard: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 17,
    paddingBottom: 13,
    marginTop: 24,
  },

  periodTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  periodEdge: {
    width: 62,
  },

  periodEdgeRight: {
    alignItems: "flex-end",
  },

  periodMonth: {
    fontSize: 14,
    fontWeight: "800",
  },

  periodLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },

  periodMiddle: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5,
  },

  periodLine: {
    flex: 1,
    height: 2,
  },

  periodBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginHorizontal: 5,
  },

  periodCaption: {
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 10,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginTop: 27,
    marginBottom: 13,
  },

  sectionTitle: {
    flex: 1,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "800",
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  statCard: {
    width: "48.4%",
    minHeight: 128,
    borderRadius: 18,
    padding: 15,
    justifyContent: "space-between",
  },

  statValue: {
    fontSize: 21,
    lineHeight: 27,
    fontWeight: "800",
    letterSpacing: -0.4,
    marginTop: 11,
  },

  statLabel: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
    marginTop: 3,
  },

  comparisonCard: {
    borderWidth: 1,
    borderRadius: 18,
    overflow: "hidden",
  },

  comparisonColumns: {
    flexDirection: "row",
    padding: 16,
  },

  comparisonColumn: {
    flex: 1,
  },

  comparisonDivider: {
    width: 1,
    marginHorizontal: 14,
  },

  comparisonCaption: {
    fontSize: 9,
    lineHeight: 13,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  comparisonValue: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.4,
    marginTop: 8,
  },

  comparisonLabel: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "600",
    marginTop: 2,
  },

  comparisonResult: {
    minHeight: 55,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 14,
  },

  comparisonResultText: {
    flexShrink: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },

  insightCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 15,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 10,
  },

  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  insightContent: {
    flex: 1,
  },

  insightTitle: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "800",
  },

  insightText: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "500",
    marginTop: 3,
  },

  closing: {
    borderRadius: 20,
    paddingHorizontal: 19,
    paddingVertical: 22,
    alignItems: "center",
    marginTop: 18,
  },

  closingIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: 13,
  },

  closingTitle: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "800",
    textAlign: "center",
  },

  closingText: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 8,
  },

  thanks: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 11,
  },

  button: {
    minHeight: 54,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    overflow: "hidden",
    marginTop: 18,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});