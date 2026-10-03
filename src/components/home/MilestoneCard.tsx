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

type MilestoneCardProps = {
  milestone: 3 | 6;
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

export default function MilestoneCard({
  milestone,
  stats,
  onContinue,
}: MilestoneCardProps) {
  const { theme } = useTheme();

  const title =
    milestone === 3
      ? "3 ciclos com o Límita"
      : "6 ciclos com o Límita";

  const description =
    milestone === 3
      ? "Você já construiu histórico suficiente para começar a enxergar padrões na sua vida financeira."
      : "Meio ano da sua vida financeira já passou por aqui. Agora seus ciclos e conquistas começam a contar uma história maior.";

  const cardTitle =
    milestone === 3
      ? "Seus primeiros padrões"
      : "Seu semestre em ciclos";

  const footer =
    milestone === 3
      ? "Quanto mais ciclos você completa, mais o Límita consegue mostrar sobre a sua evolução."
      : "Com mais histórico, o Límita consegue comparar seus ciclos e mostrar como seu comportamento está mudando.";

  const statistics =
    milestone === 3
      ? [
          {
            label:
              "Ciclos positivos",
            value: `${stats.positiveCycles} de 3`,
            positive: false,
          },
          {
            label:
              "Ciclos negativos",
            value: `${stats.negativeCycles} de 3`,
            positive: false,
          },
          {
            label:
              "Resultado médio",
            value:
              formatSignedMoney(
                stats.averageResultCents
              ),
            positive:
              stats.averageResultCents >
              0,
          },
        ]
      : [
          {
            label:
              "Ciclos positivos",
            value: `${stats.positiveCycles} de 6`,
            positive: false,
          },
          {
            label:
              "Resultado acumulado",
            value:
              formatSignedMoney(
                stats.accumulatedBalanceCents
              ),
            positive:
              stats.accumulatedBalanceCents >
              0,
          },
          {
            label:
              "Resultado médio",
            value:
              formatSignedMoney(
                stats.averageResultCents
              ),
            positive:
              stats.averageResultCents >
              0,
          },
          {
            label:
              "Melhor ciclo",
            value:
              stats.bestCycle
                ? `${shortMonth(
                    stats.bestCycle
                      .year,
                    stats.bestCycle
                      .month
                  )} · ${formatSignedMoney(
                    stats.bestCycle
                      .resultCents
                  )}`
                : "—",
            positive: false,
          },
        ];

  const comparison =
    stats.expenseComparisonPercentage;

  const reduced =
    comparison !== null &&
    comparison < 0;

  const increased =
    comparison !== null &&
    comparison > 0;

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
      <View style={styles.iconOuter}>
        <ThemeAccent
          style={styles.iconInner}
        >
          <MaterialIcons
            name="auto-awesome"
            size={30}
            color="#FFFFFF"
          />
        </ThemeAccent>
      </View>

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
        UM NOVO MARCO
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
        {title}
      </Text>

      <Text
        style={[
          styles.description,
          {
            color:
              theme.colors
                .textSecondary,
          },
        ]}
      >
        {description}
      </Text>

      <View
        style={[
          styles.timeline,
          milestone === 6 &&
            styles.timelineSix,
        ]}
      >
        {stats.cycles.map(
          (cycle, index) => (
            <View
              key={cycle.id}
              style={
                styles.timelineItem
              }
            >
              <View
                style={
                  styles.timelineTop
                }
              >
                <ThemeAccent
                  style={[
                    styles.cyclePoint,
                    milestone === 6 &&
                      styles.cyclePointSix,
                  ]}
                >
                  <MaterialIcons
                    name="check"
                    size={
                      milestone === 6
                        ? 13
                        : 15
                    }
                    color="#FFFFFF"
                  />
                </ThemeAccent>

                {index <
                  stats.cycles.length -
                    1 && (
                  <View
                    style={[
                      styles.timelineLine,
                      {
                        backgroundColor:
                          theme.colors
                            .border,
                      },
                    ]}
                  />
                )}
              </View>

              <Text
                style={[
                  styles.cycleMonth,
                  {
                    color:
                      theme.colors
                        .textSecondary,
                  },
                ]}
              >
                {shortMonth(
                  cycle.year,
                  cycle.month
                )}
              </Text>
            </View>
          )
        )}
      </View>

      <View
        style={[
          styles.patternCard,
          {
            backgroundColor:
              theme.colors
                .surfaceSecondary,
          },
        ]}
      >
        <View
          style={
            styles.patternHeader
          }
        >
          <MaterialIcons
            name="insights"
            size={22}
            color={
              theme.colors.primary
            }
          />

          <Text
            style={[
              styles.patternTitle,
              {
                color:
                  theme.colors.text,
              },
            ]}
          >
            {cardTitle}
          </Text>
        </View>

        <View style={styles.rows}>
          {statistics.map(
            (
              statistic,
              index
            ) => (
              <View
                key={
                  statistic.label
                }
              >
                <View
                  style={
                    styles.row
                  }
                >
                  <Text
                    style={[
                      styles.label,
                      {
                        color:
                          theme.colors
                            .textSecondary,
                      },
                    ]}
                  >
                    {
                      statistic.label
                    }
                  </Text>

                  <Text
                    style={[
                      styles.value,
                      {
                        color:
                          statistic.positive
                            ? "#20C997"
                            : theme
                                .colors
                                .text,
                      },
                    ]}
                  >
                    {
                      statistic.value
                    }
                  </Text>
                </View>

                {index <
                  statistics.length -
                    1 && (
                  <View
                    style={[
                      styles.divider,
                      {
                        backgroundColor:
                          theme.colors
                            .border,
                      },
                    ]}
                  />
                )}
              </View>
            )
          )}
        </View>
      </View>

      {milestone === 6 &&
        comparison !== null && (
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
              style={
                styles.insightIcon
              }
            >
              <MaterialIcons
                name={
                  reduced
                    ? "trending-down"
                    : increased
                      ? "trending-up"
                      : "trending-flat"
                }
                size={22}
                color={
                  reduced
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
                      theme.colors
                        .text,
                  },
                ]}
              >
                {reduced
                  ? "Uma redução apareceu"
                  : increased
                    ? "Uma mudança apareceu"
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
                {reduced
                  ? `Nos últimos 3 ciclos, seus gastos foram ${Math.abs(
                      Math.round(
                        comparison
                      )
                    )}% menores que nos 3 primeiros.`
                  : increased
                    ? `Nos últimos 3 ciclos, seus gastos foram ${Math.abs(
                        Math.round(
                          comparison
                        )
                      )}% maiores que nos 3 primeiros.`
                    : "Nos últimos 3 ciclos, sua média de gastos ficou igual à dos 3 primeiros."}
              </Text>
            </View>
          </View>
        )}

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
        {footer}
      </Text>

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
    alignItems: "center",
  },

  iconOuter: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    marginBottom: 14,
  },

  iconInner: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  eyebrow: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.1,
  },

  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "800",
    letterSpacing: -0.6,
    textAlign: "center",
    marginTop: 5,
  },

  description: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "500",
    textAlign: "center",
    paddingHorizontal: 6,
    marginTop: 10,
  },

  timeline: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 28,
    marginBottom: 26,
    paddingHorizontal: 18,
  },

  timelineSix: {
    paddingHorizontal: 2,
  },

  timelineItem: {
    flex: 1,
    alignItems: "center",
  },

  timelineTop: {
    width: "100%",
    alignItems: "center",
    position: "relative",
  },

  cyclePoint: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    zIndex: 2,
  },

  cyclePointSix: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },

  timelineLine: {
    position: "absolute",
    left: "50%",
    right: "-50%",
    top: 16,
    height: 2,
    zIndex: 1,
  },

  cycleMonth: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 7,
  },

  patternCard: {
    width: "100%",
    borderRadius: 18,
    padding: 17,
  },

  patternHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 15,
  },

  patternTitle: {
    fontSize: 16,
    fontWeight: "700",
  },

  rows: {
    width: "100%",
  },

  row: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  divider: {
    height: 1,
    width: "100%",
  },

  label: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
  },

  value: {
    fontSize: 14,
    fontWeight: "800",
    textAlign: "right",
  },

  insightCard: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginTop: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  insightIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  insightContent: {
    flex: 1,
  },

  insightTitle: {
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 4,
  },

  insightText: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "500",
  },

  hint: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "500",
    textAlign: "center",
    paddingHorizontal: 8,
    marginTop: 17,
    marginBottom: 17,
  },

  button: {
    minHeight: 52,
    minWidth: 180,
    borderRadius: 16,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    overflow: "hidden",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});