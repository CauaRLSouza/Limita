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

const categoryNames: Record<
  string,
  string
> = {
  food: "Alimentação",
  transport: "Transporte",
  housing: "Moradia",
  health: "Saúde",
  education: "Educação",
  leisure: "Lazer",
  shopping: "Compras",
  subscriptions: "Assinaturas",
  bills: "Contas",
  other: "Outros",
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

function categoryName(
  category: string | null
) {
  if (!category) {
    return "Outros";
  }

  return (
    categoryNames[category] ??
    category
  );
}

export default function AnnualMilestoneCard({
  stats,
  onContinue,
}: AnnualMilestoneCardProps) {
  const { theme } = useTheme();

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

  const expenseDifference =
    stats.expenseDifferenceCents ??
    0;

  const expensePercentage =
    stats.expenseComparisonPercentage;

  const expensesDecreased =
    expenseDifference < 0;

  const expensesIncreased =
    expenseDifference > 0;

  const category =
    categoryName(
      stats.topExpenseCategory
    );

  const categoryPercentage =
    stats.topExpenseCategoryPercentage !==
    null
      ? Math.round(
          stats.topExpenseCategoryPercentage
        )
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
        style={styles.celebration}
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

      <View style={styles.statsGrid}>
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
            name="trending-up"
            size={22}
            color="#20C997"
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
            resultado acumulado
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
            name="arrow-upward"
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
                  theme.colors.text,
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
            melhor ciclo
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
                  theme.colors.text,
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
            resultado médio
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
          Você no começo × você agora
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
              PRIMEIROS 3 CICLOS
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
              {formatMoney(
                stats.firstThreeAverageExpenseCents ??
                  0
              )}
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
              gastos por ciclo
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
              ÚLTIMOS 3 CICLOS
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
              {formatMoney(
                stats.lastThreeAverageExpenseCents ??
                  0
              )}
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
              gastos por ciclo
            </Text>
          </View>
        </View>

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
              expensesDecreased
                ? "south-east"
                : expensesIncreased
                  ? "north-east"
                  : "east"
            }
            size={20}
            color={
              expensesDecreased
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
            {expenseDifference ===
            0 ? (
              "Sua média de gastos permaneceu igual."
            ) : (
              <>
                <Text
                  style={{
                    color:
                      expensesDecreased
                        ? "#20C997"
                        : theme.colors
                            .primary,
                    fontWeight: "800",
                  }}
                >
                  {formatMoney(
                    Math.abs(
                      expenseDifference
                    )
                  )}{" "}
                  {expensesDecreased
                    ? "a menos"
                    : "a mais"}
                </Text>{" "}
                por ciclo, em média.
              </>
            )}
          </Text>
        </View>
      </View>

      <View
        style={styles.sectionHeader}
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

      {expensePercentage !== null && (
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
                expensesDecreased
                  ? "trending-down"
                  : expensesIncreased
                    ? "trending-up"
                    : "trending-flat"
              }
              size={23}
              color={
                expensesDecreased
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
              {expensesDecreased
                ? "Seus gastos diminuíram"
                : expensesIncreased
                  ? "Seus gastos aumentaram"
                  : "Seus gastos ficaram estáveis"}
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
              {expensesDecreased
                ? `Nos últimos 3 ciclos, você gastou ${Math.abs(
                    Math.round(
                      expensePercentage
                    )
                  )}% menos que nos 3 primeiros.`
                : expensesIncreased
                  ? `Nos últimos 3 ciclos, você gastou ${Math.abs(
                      Math.round(
                        expensePercentage
                      )
                    )}% mais que nos 3 primeiros.`
                  : "Nos últimos 3 ciclos, sua média de gastos ficou igual à dos 3 primeiros."}
            </Text>
          </View>
        </View>
      )}

      {stats.topExpenseCategory &&
        categoryPercentage !== null && (
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
                name="category"
                size={22}
                color={
                  theme.colors.primary
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
                {category} marcou seu ano
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
                Foi sua maior categoria no
                período, representando{" "}
                {categoryPercentage}% dos
                seus gastos.
              </Text>
            </View>
          </View>
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
          style={styles.closingIcon}
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