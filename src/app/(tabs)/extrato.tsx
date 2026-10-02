import MaterialIcons from "@expo/vector-icons/MaterialIcons";
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

type ComparacaoMesAnterior = {
  mes: string;
  gastos: number;
};

type DadosMes = {
  encerrado: boolean;
  entradas: number;
  categorias: Categoria[];
  mediaDiaria: number;
  diasRestantes: number;
  comparacaoAnterior?: ComparacaoMesAnterior;
};

const dadosPorMes: Record<string, DadosMes> = {
  "2026-10": {
    encerrado: false,
    entradas: 3600,
    mediaDiaria: 60,
    diasRestantes: 17,
    categorias: [
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
    ],
  },

  "2026-09": {
    encerrado: true,
    entradas: 3600,
    mediaDiaria: 53.6,
    diasRestantes: 0,
    comparacaoAnterior: {
      mes: "Agosto",
      gastos: 1780,
    },
    categorias: [
      {
        id: 1,
        nome: "Alimentação",
        valor: 320,
        porcentagem: 20,
        cor: "#EF4444",
      },
      {
        id: 2,
        nome: "Transporte",
        valor: 280,
        porcentagem: 17,
        cor: "#168AF2",
      },
      {
        id: 3,
        nome: "Lazer",
        valor: 220,
        porcentagem: 14,
        cor: "#F59E0B",
      },
      {
        id: 4,
        nome: "Compras",
        valor: 250,
        porcentagem: 16,
        cor: "#A855F7",
      },
      {
        id: 5,
        nome: "Contas",
        valor: 180,
        porcentagem: 11,
        cor: "#D946EF",
      },
      {
        id: 6,
        nome: "Outros",
        valor: 358,
        porcentagem: 22,
        cor: "#FB7185",
      },
    ],
  },
};

const prideCategoryColors = [
  "#FF3158",
  "#168AF2",
  "#FFD21C",
  "#FF8A1F",
  "#7C3AED",
  "#E64BD8",
];

const nomesMeses = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function formatarValor(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function criarChaveMes(
  ano: number,
  mes: number
) {
  return `${ano}-${String(
    mes + 1
  ).padStart(2, "0")}`;
}

export default function ExtratoScreen() {
  const {
    theme,
    activeSpecialTheme,
  } = useTheme();

  const [aba, setAba] =
    useState<Aba>("distribuicao");

  const [anoSelecionado, setAnoSelecionado] =
    useState(2026);

  const [mesSelecionado, setMesSelecionado] =
    useState(9);

  const isPride =
    activeSpecialTheme === "pride";

  const chaveMes = criarChaveMes(
    anoSelecionado,
    mesSelecionado
  );

  const dadosMes =
    dadosPorMes[chaveMes];

  const categorias =
    dadosMes?.categorias ?? [];

  const totalGasto = categorias.reduce(
    (total, categoria) =>
      total + categoria.valor,
    0
  );

  const entradas =
    dadosMes?.entradas ?? 0;

  const resultado =
    entradas - totalGasto;

  const percentualGasto =
    entradas > 0
      ? Math.round(
          (totalGasto / entradas) * 100
        )
      : 0;

  const percentualRestante =
    entradas > 0
      ? Math.round(
          (resultado / entradas) * 100
        )
      : 0;

  const mediaDiaria =
    dadosMes?.mediaDiaria ?? 0;

  const diasRestantes =
    dadosMes?.diasRestantes ?? 0;

  const podeGastarPorDia =
    diasRestantes > 0
      ? resultado / diasRestantes
      : 0;

  const maiorCategoria =
    categorias.length > 0
      ? categorias.reduce(
          (maior, categoria) =>
            categoria.valor >
            maior.valor
              ? categoria
              : maior
        )
      : null;

  function irParaMesAnterior() {
    if (mesSelecionado === 0) {
      setMesSelecionado(11);
      setAnoSelecionado(
        (ano) => ano - 1
      );
      return;
    }

    setMesSelecionado(
      (mes) => mes - 1
    );
  }

  function irParaProximoMes() {
    if (mesSelecionado === 11) {
      setMesSelecionado(0);
      setAnoSelecionado(
        (ano) => ano + 1
      );
      return;
    }

    setMesSelecionado(
      (mes) => mes + 1
    );
  }

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
            style={
              styles.segmentAccent
            }
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
        <View
          style={
            styles.segmentContent
          }
        >
          <Text
            style={[
              styles.segmentText,
              {
                color: selected
                  ? "#FFFFFF"
                  : theme.colors
                      .textSecondary,
              },
            ]}
          >
            {label}
          </Text>
        </View>
      </Pressable>
    );
  }

  function renderEmptyState() {
    return (
      <View
        style={[
          styles.emptyState,
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
            styles.emptyIcon,
            {
              backgroundColor:
                theme.colors
                  .surfaceSecondary,
            },
          ]}
        >
          <MaterialIcons
            name="receipt-long"
            size={30}
            color={
              theme.colors
                .textSecondary
            }
          />
        </View>

        <Text
          style={[
            styles.emptyTitle,
            {
              color:
                theme.colors.text,
            },
          ]}
        >
          Nenhuma movimentação
        </Text>

        <Text
          style={[
            styles.emptyText,
            {
              color:
                theme.colors
                  .textSecondary,
            },
          ]}
        >
          Não há movimentações
          registradas neste mês.
        </Text>
      </View>
    );
  }

  function renderComparativoAtual() {
    return (
      <View
        style={
          styles.comparisonContent
        }
      >
        <View
          style={[
            styles.incomeCard,
            {
              backgroundColor:
                theme.colors.surface,
              borderColor:
                theme.colors.border,
            },
          ]}
        >
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
            Entradas do mês
          </Text>

          <Text
            style={[
              styles.incomeValue,
              {
                color:
                  theme.colors.text,
              },
            ]}
          >
            {formatarValor(entradas)}
          </Text>

          <Text
            style={[
              styles.cardDescription,
              {
                color:
                  theme.colors
                    .textSecondary,
              },
            ]}
          >
            Total recebido em{" "}
            {nomesMeses[
              mesSelecionado
            ].toLowerCase()}
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
          <View
            style={
              styles.summaryHeader
            }
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
                Total de gastos
              </Text>

              <Text
                style={[
                  styles.summaryValue,
                  {
                    color:
                      theme.colors
                        .text,
                  },
                ]}
              >
                {formatarValor(
                  totalGasto
                )}
              </Text>
            </View>

            <Text
              style={[
                styles.spentPercentage,
                {
                  color:
                    theme.colors
                      .warning,
                },
              ]}
            >
              {percentualGasto}% das
              entradas
            </Text>
          </View>

          <ProgressBar
            value={percentualGasto}
            type="warning"
          />

          <View
            style={
              styles.remainingHeader
            }
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
                Dinheiro do mês
              </Text>

              <Text
                style={[
                  styles.summaryValue,
                  {
                    color:
                      resultado < 0
                        ? theme.colors
                            .danger
                        : theme.colors
                            .text,
                  },
                ]}
              >
                {formatarValor(
                  resultado
                )}
              </Text>
            </View>

            <Text
              style={[
                styles.remainingPercentage,
                {
                  color:
                    resultado < 0
                      ? theme.colors
                          .danger
                      : theme.colors
                          .primary,
                },
              ]}
            >
              {resultado >= 0
                ? `${Math.max(
                    0,
                    percentualRestante
                  )}% restante`
                : `${Math.abs(
                    percentualRestante
                  )}% acima`}
            </Text>
          </View>

          <ProgressBar
            value={Math.max(
              0,
              percentualRestante
            )}
            type="primary"
          />

          <View
            style={[
              styles.metrics,
              {
                borderTopColor:
                  theme.colors.border,
              },
            ]}
          >
            <View
              style={styles.metric}
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
                Média diária
              </Text>

              <Text
                style={[
                  styles.metricValue,
                  {
                    color:
                      theme.colors
                        .text,
                  },
                ]}
              >
                {formatarValor(
                  mediaDiaria
                )}
              </Text>
            </View>

            <View
              style={[
                styles.metric,
                styles.metricMiddle,
                {
                  borderLeftColor:
                    theme.colors
                      .border,
                  borderRightColor:
                    theme.colors
                      .border,
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
                      theme.colors
                        .text,
                  },
                ]}
              >
                {diasRestantes}
              </Text>
            </View>

            <View
              style={styles.metric}
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
                Pode gastar/dia
              </Text>

              <Text
                style={[
                  styles.metricValue,
                  {
                    color:
                      podeGastarPorDia <
                      0
                        ? theme.colors
                            .danger
                        : theme.colors
                            .text,
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
      </View>
    );
  }

  function renderResumoEncerrado() {
    const comparacao =
      dadosMes.comparacaoAnterior;

    const diferenca =
      comparacao
        ? totalGasto -
          comparacao.gastos
        : 0;

    const percentualDiferenca =
      comparacao &&
      comparacao.gastos > 0
        ? Math.round(
            (Math.abs(diferenca) /
              comparacao.gastos) *
              100
          )
        : 0;

    const gastouMais =
      diferenca > 0;

    return (
      <View
        style={
          styles.comparisonContent
        }
      >
        <View
          style={[
            styles.closedSummaryCard,
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
              styles.closedTitleRow
            }
          >
            <View
              style={[
                styles.closedIcon,
                {
                  backgroundColor:
                    resultado >= 0
                      ? theme.colors
                          .primarySoft
                      : theme.colors
                          .surfaceSecondary,
                },
              ]}
            >
              <MaterialIcons
                name={
                  resultado >= 0
                    ? "check"
                    : "warning-amber"
                }
                size={24}
                color={
                  resultado >= 0
                    ? theme.colors
                        .success
                    : theme.colors
                        .danger
                }
              />
            </View>

            <View
              style={
                styles.closedTitleContent
              }
            >
              <Text
                style={[
                  styles.closedEyebrow,
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
                  styles.closedTitle,
                  {
                    color:
                      theme.colors
                        .text,
                  },
                ]}
              >
                Resumo de{" "}
                {
                  nomesMeses[
                    mesSelecionado
                  ]
                }
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.closedNumbers,
              {
                borderTopColor:
                  theme.colors.border,
              },
            ]}
          >
            <SummaryNumber
              label="Entradas"
              value={entradas}
            />

            <SummaryNumber
              label="Gastos"
              value={totalGasto}
            />

            <SummaryNumber
              label="Resultado"
              value={resultado}
              highlight
            />
          </View>
        </View>

        <View
          style={[
            styles.resultCard,
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
              styles.resultHeader
            }
          >
            <View
              style={[
                styles.resultIcon,
                {
                  backgroundColor:
                    resultado >= 0
                      ? theme.colors
                          .primarySoft
                      : theme.colors
                          .surfaceSecondary,
                },
              ]}
            >
              <MaterialIcons
                name={
                  resultado >= 0
                    ? "savings"
                    : "trending-down"
                }
                size={25}
                color={
                  resultado >= 0
                    ? theme.colors
                        .success
                    : theme.colors
                        .danger
                }
              />
            </View>

            <View
              style={styles.resultInfo}
            >
              <Text
                style={[
                  styles.resultTitle,
                  {
                    color:
                      theme.colors
                        .text,
                  },
                ]}
              >
                {resultado >= 0
                  ? "Fechamento positivo"
                  : "Fechamento negativo"}
              </Text>

              <Text
                style={[
                  styles.resultText,
                  {
                    color:
                      theme.colors
                        .textSecondary,
                  },
                ]}
              >
                {resultado >= 0
                  ? "Você terminou o ciclo com dinheiro disponível."
                  : "Seus gastos ultrapassaram o dinheiro disponível neste ciclo."}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.cofreResult,
              {
                backgroundColor:
                  theme.colors
                    .surfaceSecondary,
              },
            ]}
          >
            <Text
              style={[
                styles.cofreResultLabel,
                {
                  color:
                    theme.colors
                      .textSecondary,
                },
              ]}
            >
              {resultado >= 0
                ? "Enviado ao Cofre"
                : "Déficit para o próximo ciclo"}
            </Text>

            <Text
              style={[
                styles.cofreResultValue,
                {
                  color:
                    resultado >= 0
                      ? theme.colors
                          .success
                      : theme.colors
                          .danger,
                },
              ]}
            >
              {formatarValor(
                Math.abs(resultado)
              )}
            </Text>
          </View>
        </View>

        {comparacao && (
          <View
            style={[
              styles.analysisCard,
              {
                backgroundColor:
                  theme.colors.surface,
                borderColor:
                  theme.colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.analysisTitle,
                {
                  color:
                    theme.colors.text,
                },
              ]}
            >
              Comparação com{" "}
              {comparacao.mes}
            </Text>

            <View
              style={
                styles.comparisonRow
              }
            >
              <View>
                <Text
                  style={[
                    styles.comparisonMain,
                    {
                      color:
                        gastouMais
                          ? theme.colors
                              .danger
                          : theme.colors
                              .success,
                    },
                  ]}
                >
                  {gastouMais
                    ? "↑"
                    : "↓"}{" "}
                  {percentualDiferenca}%
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
                  nos gastos
                </Text>
              </View>

              <View
                style={
                  styles.comparisonTextContainer
                }
              >
                <Text
                  style={[
                    styles.comparisonText,
                    {
                      color:
                        theme.colors
                          .text,
                    },
                  ]}
                >
                  Você gastou{" "}
                  {formatarValor(
                    Math.abs(
                      diferenca
                    )
                  )}{" "}
                  {gastouMais
                    ? "a mais"
                    : "a menos"}{" "}
                  que em{" "}
                  {comparacao.mes.toLowerCase()}.
                </Text>
              </View>
            </View>
          </View>
        )}

        {maiorCategoria && (
          <View
            style={[
              styles.analysisCard,
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
                styles.analysisHeader
              }
            >
              <MaterialIcons
                name="pie-chart"
                size={23}
                color={
                  theme.colors.primary
                }
              />

              <Text
                style={[
                  styles.analysisTitle,
                  {
                    color:
                      theme.colors
                        .text,
                  },
                ]}
              >
                Seus gastos
              </Text>
            </View>

            <Text
              style={[
                styles.analysisText,
                {
                  color:
                    theme.colors
                      .textSecondary,
                },
              ]}
            >
              Sua maior categoria foi{" "}
              <Text
                style={[
                  styles.analysisStrong,
                  {
                    color:
                      theme.colors
                        .text,
                  },
                ]}
              >
                {maiorCategoria.nome}
              </Text>
              , com{" "}
              {formatarValor(
                maiorCategoria.valor
              )}{" "}
              ({maiorCategoria.porcentagem}%
              dos gastos do mês).
            </Text>
          </View>
        )}

        <View
          style={[
            styles.feedbackCard,
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
              styles.analysisHeader
            }
          >
            <MaterialIcons
              name="lightbulb-outline"
              size={24}
              color={
                resultado >= 0
                  ? theme.colors
                      .success
                  : theme.colors
                      .warning
              }
            />

            <Text
              style={[
                styles.analysisTitle,
                {
                  color:
                    theme.colors.text,
                },
              ]}
            >
              Feedback financeiro
            </Text>
          </View>

          <Text
            style={[
              styles.feedbackText,
              {
                color:
                  theme.colors
                    .textSecondary,
              },
            ]}
          >
            {resultado >= 0 &&
            comparacao &&
            !gastouMais
              ? `Você fechou o ciclo no positivo e ainda reduziu seus gastos em relação a ${comparacao.mes.toLowerCase()}. Continue assim: manter espaço entre o que entra e o que sai ajuda o Cofre a crescer com consistência.`
              : resultado >= 0
              ? `Você terminou o ciclo com ${formatarValor(
                  resultado
                )} disponíveis. Esse valor fortalece o seu Cofre e aumenta sua margem financeira para os próximos ciclos.`
              : maiorCategoria
              ? `Este ciclo terminou acima do dinheiro disponível. ${maiorCategoria.nome} foi sua maior categoria de gastos. Vale observar essa categoria no próximo ciclo para tentar recuperar margem sem precisar cortar tudo de uma vez.`
              : "Este ciclo terminou acima do dinheiro disponível. No próximo ciclo, acompanhe os gastos desde o início para recuperar sua margem financeira."}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={
        styles.content
      }
      showsVerticalScrollIndicator={
        false
      }
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
            borderColor:
              theme.colors.border,
          },
        ]}
      >
        <Pressable
          onPress={irParaMesAnterior}
          style={styles.monthArrow}
        >
          <Text
            style={[
              styles.arrowText,
              {
                color:
                  theme.colors
                    .textSecondary,
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
              color:
                theme.colors.text,
            },
          ]}
        >
          {nomesMeses[mesSelecionado]}{" "}
          {anoSelecionado}
        </Text>

        <Pressable
          onPress={irParaProximoMes}
          style={styles.monthArrow}
        >
          <Text
            style={[
              styles.arrowText,
              {
                color:
                  theme.colors
                    .textSecondary,
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
            borderColor:
              theme.colors.border,
          },
        ]}
      >
        {renderSegment(
          "Distribuição",
          aba === "distribuicao",
          () =>
            setAba("distribuicao")
        )}

        {renderSegment(
          "Comparativo",
          aba === "comparativo",
          () =>
            setAba("comparativo")
        )}
      </View>

      {!dadosMes ? (
        renderEmptyState()
      ) : aba === "distribuicao" ? (
        <>
          <View
            style={
              styles.chartContainer
            }
          >
            <DonutChart
              categorias={categorias}
              total={totalGasto}
            />
          </View>

          <View
            style={
              styles.categoryList
            }
          >
            {categorias.map(
              (
                categoria,
                index
              ) => {
                const categoryColor =
                  isPride
                    ? prideCategoryColors[
                        index %
                          prideCategoryColors.length
                      ]
                    : categoria.cor;

                return (
                  <View
                    key={
                      categoria.id
                    }
                    style={[
                      styles.categoryRow,
                      {
                        borderBottomColor:
                          theme.colors
                            .border,
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
                              theme.colors
                                .text,
                          },
                        ]}
                      >
                        {
                          categoria.nome
                        }
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
                              theme.colors
                                .text,
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
                        {
                          categoria.porcentagem
                        }
                        %
                      </Text>
                    </View>
                  </View>
                );
              }
            )}
          </View>
        </>
      ) : dadosMes.encerrado ? (
        renderResumoEncerrado()
      ) : (
        renderComparativoAtual()
      )}
    </ScrollView>
  );
}

type SummaryNumberProps = {
  label: string;
  value: number;
  highlight?: boolean;
};

function SummaryNumber({
  label,
  value,
  highlight = false,
}: SummaryNumberProps) {
  const { theme } = useTheme();

  return (
    <View
      style={
        styles.summaryNumber
      }
    >
      <Text
        style={[
          styles.summaryNumberLabel,
          {
            color:
              theme.colors
                .textSecondary,
          },
        ]}
      >
        {label}
      </Text>

      <Text
        style={[
          styles.summaryNumberValue,
          {
            color: highlight
              ? value >= 0
                ? theme.colors.success
                : theme.colors.danger
              : theme.colors.text,
          },
        ]}
      >
        {highlight && value > 0
          ? "+"
          : ""}
        {formatarValor(value)}
      </Text>
    </View>
  );
}

type ProgressBarProps = {
  value: number;
  type: "warning" | "primary";
};

function ProgressBar({
  value,
  type,
}: ProgressBarProps) {
  const {
    theme,
    activeSpecialTheme,
  } = useTheme();

  const isPride =
    activeSpecialTheme === "pride";

  const width = `${Math.max(
    0,
    Math.min(value, 100)
  )}%` as `${number}%`;

  return (
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
            styles.progressFill,
            { width },
          ]}
        />
      ) : (
        <View
          style={[
            styles.progressFill,
            {
              width,
              backgroundColor:
                type === "warning"
                  ? theme.colors
                      .warning
                  : theme.colors
                      .primary,
            },
          ]}
        />
      )}
    </View>
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
            theme.colors
              .surfaceSecondary
          }
          strokeWidth={
            strokeWidth
          }
          fill="none"
        />

        {categorias.map(
          (
            categoria,
            index
          ) => {
            const segmentLength =
              (categoria.porcentagem /
                100) *
              circumference;

            const offset =
              -(accumulatedPercentage /
                100) *
              circumference;

            accumulatedPercentage +=
              categoria.porcentagem;

            const segmentColor =
              isPride
                ? prideCategoryColors[
                    index %
                      prideCategoryColors.length
                  ]
                : categoria.cor;

            return (
              <Circle
                key={
                  categoria.id
                }
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={
                  segmentColor
                }
                strokeWidth={
                  strokeWidth
                }
                fill="none"
                strokeDasharray={`${segmentLength} ${
                  circumference -
                  segmentLength
                }`}
                strokeDashoffset={
                  offset
                }
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

      <View
        style={
          styles.donutCenter
        }
      >
        <Text
          style={[
            styles.donutValue,
            {
              color:
                theme.colors.text,
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
                theme.colors
                  .textSecondary,
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
    textAlign: "center",
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
    alignItems: "stretch",
    justifyContent: "center",
  },

  segmentContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  segmentAccent: {
    flex: 1,
    width: "100%",
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

  incomeCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
  },

  cardLabel: {
    fontSize: 14,
    fontWeight: "600",
  },

  cardDescription: {
    fontSize: 14,
    marginTop: 7,
  },

  incomeValue: {
    fontSize: 29,
    fontWeight: "700",
    marginTop: 5,
    letterSpacing: -0.5,
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
    maxWidth: 120,
    textAlign: "right",
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

  progressFill: {
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

  closedSummaryCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
  },

  closedTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  closedIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  closedTitleContent: {
    flex: 1,
  },

  closedEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.7,
  },

  closedTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 2,
  },

  closedNumbers: {
    flexDirection: "row",
    borderTopWidth: 1,
    marginTop: 18,
    paddingTop: 17,
  },

  summaryNumber: {
    flex: 1,
    paddingRight: 5,
  },

  summaryNumberLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 5,
  },

  summaryNumberValue: {
    fontSize: 15,
    fontWeight: "700",
  },

  resultCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
  },

  resultHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  resultIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  resultInfo: {
    flex: 1,
  },

  resultTitle: {
    fontSize: 17,
    fontWeight: "700",
  },

  resultText: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },

  cofreResult: {
    borderRadius: 14,
    padding: 15,
    marginTop: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  cofreResultLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
  },

  cofreResultValue: {
    fontSize: 18,
    fontWeight: "800",
  },

  analysisCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
  },

  analysisHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 11,
  },

  analysisTitle: {
    fontSize: 16,
    fontWeight: "700",
  },

  analysisText: {
    fontSize: 14,
    lineHeight: 21,
  },

  analysisStrong: {
    fontWeight: "700",
  },

  comparisonRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 17,
  },

  comparisonMain: {
    fontSize: 25,
    fontWeight: "800",
  },

  comparisonLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 1,
  },

  comparisonTextContainer: {
    flex: 1,
    marginLeft: 22,
  },

  comparisonText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
  },

  feedbackCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
  },

  feedbackText: {
    fontSize: 14,
    lineHeight: 21,
  },

  emptyState: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 42,
    alignItems: "center",
  },

  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },

  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 7,
  },
});