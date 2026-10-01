import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";

import TabHeader from "../../components/TabHeader";
import ThemeAccent from "../../components/ThemeAccent";
import { useTheme } from "../../theme/ThemeContext";

type Aba = "distribuicao" | "comparativo";

type Categoria = {
  id: number;
  nome: string;
  valor: number;
  porcentagem: number;
  cor: string;
};

const categorias: Categoria[] = [
  {
    id: 1,
    nome: "Alimentação",
    valor: 360,
    porcentagem: 20,
    cor: "#EF4444",
  },
  {
    id: 2,
    nome: "Transporte",
    valor: 324,
    porcentagem: 18,
    cor: "#168AF2",
  },
  {
    id: 3,
    nome: "Lazer",
    valor: 270,
    porcentagem: 15,
    cor: "#F59E0B",
  },
  {
    id: 4,
    nome: "Compras",
    valor: 270,
    porcentagem: 15,
    cor: "#A855F7",
  },
  {
    id: 5,
    nome: "Contas",
    valor: 126,
    porcentagem: 7,
    cor: "#D946EF",
  },
  {
    id: 6,
    nome: "Outros",
    valor: 450,
    porcentagem: 25,
    cor: "#FB7185",
  },
];

const prideCategoryColors = [
  "#FF3158",
  "#168AF2",
  "#FFD21C",
  "#FF8A1F",
  "#7C3AED",
  "#E64BD8",
];

function formatarValor(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function ExtratoScreen() {
  const {
    theme,
    activeSpecialTheme,
  } = useTheme();

  const [aba, setAba] =
    useState<Aba>("distribuicao");

  const isPride =
    activeSpecialTheme === "pride";

  const totalGasto = categorias.reduce(
    (total, categoria) =>
      total + categoria.valor,
    0
  );

  const salario = 3600;
  const restante = salario - totalGasto;

  const percentualGasto = Math.round(
    (totalGasto / salario) * 100
  );

  const percentualRestante = Math.round(
    (restante / salario) * 100
  );

  const mediaDiaria = 60;
  const diasRestantes = 17;

  const podeGastarPorDia =
    restante / diasRestantes;

  function renderSegment(
    label: string,
    selected: boolean,
    onPress: () => void
  ) {
    if (selected && isPride) {
      return (
        <Pressable
          onPress={onPress}
          style={styles.segment}
        >
          <ThemeAccent
            style={styles.segmentAccent}
          >
            <Text
              style={[
                styles.segmentText,
                styles.selectedSegmentText,
              ]}
            >
              {label}
            </Text>
          </ThemeAccent>
        </Pressable>
      );
    }

    return (
      <Pressable
        onPress={onPress}
        style={[
          styles.segment,
          selected && {
            backgroundColor:
              theme.colors.primary,
          },
        ]}
      >
        <Text
          style={[
            styles.segmentText,
            {
              color: selected
                ? "#FFFFFF"
                : theme.colors.textSecondary,
            },
          ]}
        >
          {label}
        </Text>
      </Pressable>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <TabHeader />

      <Text
        style={[
          styles.title,
          {
            color: theme.colors.text,
          },
        ]}
      >
        Extrato
      </Text>

      <View
        style={[
          styles.monthSelector,
          {
            backgroundColor:
              theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Pressable style={styles.monthArrow}>
          <Text
            style={[
              styles.arrowText,
              {
                color:
                  theme.colors.textSecondary,
              },
            ]}
          >
            ‹
          </Text>
        </Pressable>

        <Text
          style={[
            styles.monthText,
            {
              color: theme.colors.text,
            },
          ]}
        >
          Outubro 2026
        </Text>

        <Pressable style={styles.monthArrow}>
          <Text
            style={[
              styles.arrowText,
              {
                color:
                  theme.colors.textSecondary,
              },
            ]}
          >
            ›
          </Text>
        </Pressable>
      </View>

      <View
        style={[
          styles.segmentedControl,
          {
            backgroundColor:
              theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        {renderSegment(
          "Distribuição",
          aba === "distribuicao",
          () => setAba("distribuicao")
        )}

        {renderSegment(
          "Comparativo",
          aba === "comparativo",
          () => setAba("comparativo")
        )}
      </View>

      {aba === "distribuicao" ? (
        <>
          <View style={styles.chartContainer}>
            <DonutChart
              categorias={categorias}
              total={totalGasto}
            />
          </View>

          <View style={styles.categoryList}>
            {categorias.map(
              (categoria, index) => {
                const categoryColor = isPride
                  ? prideCategoryColors[
                      index %
                        prideCategoryColors.length
                    ]
                  : categoria.cor;

                return (
                  <View
                    key={categoria.id}
                    style={[
                      styles.categoryRow,
                      {
                        borderBottomColor:
                          theme.colors.border,
                      },
                    ]}
                  >
                    <View
                      style={
                        styles.categoryNameContainer
                      }
                    >
                      <View
                        style={[
                          styles.categoryDot,
                          {
                            backgroundColor:
                              categoryColor,
                          },
                        ]}
                      />

                      <Text
                        style={[
                          styles.categoryName,
                          {
                            color:
                              theme.colors.text,
                          },
                        ]}
                      >
                        {categoria.nome}
                      </Text>
                    </View>

                    <View
                      style={
                        styles.categoryValues
                      }
                    >
                      <Text
                        style={[
                          styles.categoryValue,
                          {
                            color:
                              theme.colors.text,
                          },
                        ]}
                      >
                        {formatarValor(
                          categoria.valor
                        )}
                      </Text>

                      <Text
                        style={[
                          styles.categoryPercentage,
                          {
                            color:
                              theme.colors
                                .textSecondary,
                          },
                        ]}
                      >
                        {categoria.porcentagem}%
                      </Text>
                    </View>
                  </View>
                );
              }
            )}
          </View>
        </>
      ) : (
        <View style={styles.comparisonContent}>
          <View
            style={[
              styles.salaryCard,
              {
                backgroundColor:
                  theme.colors.surface,
                borderColor:
                  theme.colors.border,
              },
            ]}
          >
            <View style={styles.salaryTop}>
              <View>
                <Text
                  style={[
                    styles.cardLabel,
                    {
                      color:
                        theme.colors
                          .textSecondary,
                    },
                  ]}
                >
                  Salário do mês
                </Text>

                <Text
                  style={[
                    styles.salaryValue,
                    {
                      color:
                        theme.colors.text,
                    },
                  ]}
                >
                  {formatarValor(salario)}
                </Text>
              </View>

              <Pressable
                style={[
                  styles.configureButton,
                  {
                    borderColor:
                      theme.colors
                        .textSecondary,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.configureText,
                    {
                      color:
                        theme.colors.text,
                    },
                  ]}
                >
                  Configurar
                </Text>
              </Pressable>
            </View>

            <Text
              style={[
                styles.receivedText,
                {
                  color:
                    theme.colors
                      .textSecondary,
                },
              ]}
            >
              Recebido em 01/10/2026
            </Text>
          </View>

          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor:
                  theme.colors.surface,
                borderColor:
                  theme.colors.border,
              },
            ]}
          >
            <View style={styles.summaryHeader}>
              <View>
                <Text
                  style={[
                    styles.cardLabel,
                    {
                      color:
                        theme.colors
                          .textSecondary,
                    },
                  ]}
                >
                  Total de gastos
                </Text>

                <Text
                  style={[
                    styles.summaryValue,
                    {
                      color:
                        theme.colors.text,
                    },
                  ]}
                >
                  {formatarValor(totalGasto)}
                </Text>
              </View>

              <Text
                style={[
                  styles.spentPercentage,
                  {
                    color:
                      theme.colors.warning,
                  },
                ]}
              >
                {percentualGasto}% do salário
              </Text>
            </View>

            <View
              style={[
                styles.progressTrack,
                {
                  backgroundColor:
                    theme.colors
                      .surfaceSecondary,
                },
              ]}
            >
              {isPride ? (
                <ThemeAccent
                  style={[
                    styles.progressSpent,
                    {
                      width: `${Math.min(
                        percentualGasto,
                        100
                      )}%`,
                    },
                  ]}
                />
              ) : (
                <View
                  style={[
                    styles.progressSpent,
                    {
                      backgroundColor:
                        theme.colors.warning,
                      width: `${Math.min(
                        percentualGasto,
                        100
                      )}%`,
                    },
                  ]}
                />
              )}
            </View>

            <View
              style={styles.remainingHeader}
            >
              <View>
                <Text
                  style={[
                    styles.cardLabel,
                    {
                      color:
                        theme.colors
                          .textSecondary,
                    },
                  ]}
                >
                  Restante do mês
                </Text>

                <Text
                  style={[
                    styles.summaryValue,
                    {
                      color:
                        theme.colors.text,
                    },
                  ]}
                >
                  {formatarValor(restante)}
                </Text>
              </View>

              <Text
                style={[
                  styles.remainingPercentage,
                  {
                    color:
                      theme.colors.primary,
                  },
                ]}
              >
                {percentualRestante}% restante
              </Text>
            </View>

            <View
              style={[
                styles.progressTrack,
                {
                  backgroundColor:
                    theme.colors
                      .surfaceSecondary,
                },
              ]}
            >
              {isPride ? (
                <ThemeAccent
                  style={[
                    styles.progressRemaining,
                    {
                      width: `${Math.max(
                        0,
                        Math.min(
                          percentualRestante,
                          100
                        )
                      )}%`,
                    },
                  ]}
                />
              ) : (
                <View
                  style={[
                    styles.progressRemaining,
                    {
                      backgroundColor:
                        theme.colors.primary,
                      width: `${Math.max(
                        0,
                        Math.min(
                          percentualRestante,
                          100
                        )
                      )}%`,
                    },
                  ]}
                />
              )}
            </View>

            <View
              style={[
                styles.metrics,
                {
                  borderTopColor:
                    theme.colors.border,
                },
              ]}
            >
              <View style={styles.metric}>
                <Text
                  style={[
                    styles.metricLabel,
                    {
                      color:
                        theme.colors
                          .textSecondary,
                    },
                  ]}
                >
                  Média diária
                </Text>

                <Text
                  style={[
                    styles.metricValue,
                    {
                      color:
                        theme.colors.text,
                    },
                  ]}
                >
                  {formatarValor(mediaDiaria)}
                </Text>
              </View>

              <View
                style={[
                  styles.metric,
                  styles.metricMiddle,
                  {
                    borderLeftColor:
                      theme.colors.border,
                    borderRightColor:
                      theme.colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.metricLabel,
                    {
                      color:
                        theme.colors
                          .textSecondary,
                    },
                  ]}
                >
                  Dias restantes
                </Text>

                <Text
                  style={[
                    styles.metricValue,
                    {
                      color:
                        theme.colors.text,
                    },
                  ]}
                >
                  {diasRestantes}
                </Text>
              </View>

              <View style={styles.metric}>
                <Text
                  style={[
                    styles.metricLabel,
                    {
                      color:
                        theme.colors
                          .textSecondary,
                    },
                  ]}
                >
                  Pode gastar/dia
                </Text>

                <Text
                  style={[
                    styles.metricValue,
                    {
                      color:
                        theme.colors.text,
                    },
                  ]}
                >
                  {formatarValor(
                    podeGastarPorDia
                  )}
                </Text>
              </View>
            </View>
          </View>

          <View
            style={[
              styles.previousMonthCard,
              {
                backgroundColor:
                  theme.colors.surface,
                borderColor:
                  theme.colors.border,
              },
            ]}
          >
            <View
              style={styles.previousMonthTop}
            >
              <Text
                style={[
                  styles.previousMonthTitle,
                  {
                    color:
                      theme.colors.text,
                  },
                ]}
              >
                Comparação com o mês anterior
              </Text>

              <View
                style={[
                  styles.changeBadge,
                  {
                    backgroundColor:
                      theme.colors.primarySoft,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.changeBadgeText,
                    {
                      color:
                        theme.colors.danger,
                    },
                  ]}
                >
                  ↑ 12%
                </Text>
              </View>
            </View>

            <Text
              style={[
                styles.previousMonthText,
                {
                  color:
                    theme.colors
                      .textSecondary,
                },
              ]}
            >
              Você gastou R$ 192,00 a mais que em
              setembro.
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

type DonutChartProps = {
  categorias: Categoria[];
  total: number;
};

function DonutChart({
  categorias,
  total,
}: DonutChartProps) {
  const {
    theme,
    activeSpecialTheme,
  } = useTheme();

  const isPride =
    activeSpecialTheme === "pride";

  const size = 280;
  const strokeWidth = 62;

  const radius =
    (size - strokeWidth) / 2;

  const circumference =
    2 * Math.PI * radius;

  let accumulatedPercentage = 0;

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg
        width={size}
        height={size}
        style={styles.svg}
      >
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={
            theme.colors.surfaceSecondary
          }
          strokeWidth={strokeWidth}
          fill="none"
        />

        {categorias.map(
          (categoria, index) => {
            const segmentLength =
              (categoria.porcentagem / 100) *
              circumference;

            const offset =
              -(accumulatedPercentage / 100) *
              circumference;

            accumulatedPercentage +=
              categoria.porcentagem;

            const segmentColor = isPride
              ? prideCategoryColors[
                  index %
                    prideCategoryColors.length
                ]
              : categoria.cor;

            return (
              <Circle
                key={categoria.id}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={segmentColor}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={`${segmentLength} ${
                  circumference -
                  segmentLength
                }`}
                strokeDashoffset={offset}
                strokeLinecap="butt"
                rotation="-90"
                origin={`${size / 2}, ${
                  size / 2
                }`}
              />
            );
          }
        )}
      </Svg>

      <View style={styles.donutCenter}>
        <Text
          style={[
            styles.donutValue,
            {
              color: theme.colors.text,
            },
          ]}
        >
          {formatarValor(total)}
        </Text>

        <Text
          style={[
            styles.donutLabel,
            {
              color:
                theme.colors.textSecondary,
            },
          ]}
        >
          gastos
        </Text>
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
    paddingBottom: 40,
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -0.8,
    marginBottom: 24,
  },

  monthSelector: {
    height: 64,
    borderRadius: 17,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  monthArrow: {
    width: 58,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  arrowText: {
    fontSize: 42,
    fontWeight: "300",
    lineHeight: 45,
  },

  monthText: {
    fontSize: 19,
    fontWeight: "700",
  },

  segmentedControl: {
    flexDirection: "row",
    height: 54,
    borderRadius: 15,
    borderWidth: 1,
    padding: 3,
    marginBottom: 24,
  },

  segment: {
    flex: 1,
    borderRadius: 11,
    overflow: "hidden",
  },

  segmentAccent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
  },

  segmentText: {
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },

  selectedSegmentText: {
    color: "#FFFFFF",
  },

  chartContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
  },

  svg: {
    position: "absolute",
  },

  donutCenter: {
    alignItems: "center",
    justifyContent: "center",
  },

  donutValue: {
    fontSize: 25,
    fontWeight: "700",
    letterSpacing: -0.5,
  },

  donutLabel: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 3,
  },

  categoryList: {
    marginTop: 10,
  },

  categoryRow: {
    minHeight: 57,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  categoryNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  categoryDot: {
    width: 15,
    height: 15,
    borderRadius: 8,
    marginRight: 12,
  },

  categoryName: {
    fontSize: 16,
    fontWeight: "600",
  },

  categoryValues: {
    flexDirection: "row",
    alignItems: "center",
  },

  categoryValue: {
    width: 115,
    textAlign: "right",
    fontSize: 15,
    fontWeight: "600",
  },

  categoryPercentage: {
    width: 48,
    textAlign: "right",
    fontSize: 15,
    fontWeight: "700",
  },

  comparisonContent: {
    gap: 14,
  },

  salaryCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
  },

  salaryTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  cardLabel: {
    fontSize: 14,
    fontWeight: "600",
  },

  salaryValue: {
    fontSize: 29,
    fontWeight: "700",
    marginTop: 5,
    letterSpacing: -0.5,
  },

  configureButton: {
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  configureText: {
    fontSize: 14,
    fontWeight: "700",
  },

  receivedText: {
    fontSize: 14,
    marginTop: 7,
  },

  summaryCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
  },

  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  summaryValue: {
    fontSize: 26,
    fontWeight: "700",
    marginTop: 4,
  },

  spentPercentage: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 4,
  },

  progressTrack: {
    height: 11,
    borderRadius: 6,
    overflow: "hidden",
    marginTop: 12,
  },

  progressSpent: {
    height: "100%",
    borderRadius: 6,
  },

  remainingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 24,
  },

  remainingPercentage: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 4,
  },

  progressRemaining: {
    height: "100%",
    borderRadius: 6,
  },

  metrics: {
    flexDirection: "row",
    borderTopWidth: 1,
    marginTop: 25,
    paddingTop: 18,
  },

  metric: {
    flex: 1,
    paddingHorizontal: 7,
  },

  metricMiddle: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },

  metricLabel: {
    fontSize: 11,
    fontWeight: "600",
    minHeight: 30,
  },

  metricValue: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 4,
  },

  previousMonthCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
  },

  previousMonthTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  previousMonthTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
  },

  changeBadge: {
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },

  changeBadgeText: {
    fontSize: 14,
    fontWeight: "700",
  },

  previousMonthText: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10,
  },
});