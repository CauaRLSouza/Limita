import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

import {
  categoriasGasto,
} from "../../components/CategoryPicker";
import TabHeader from "../../components/TabHeader";
import ThemeAccent from "../../components/ThemeAccent";
import {
  MonthlyStatement,
  StatementCategory,
  getMonthlyStatement,
} from "../../database/statements";
import { useTheme } from "../../theme/ThemeContext";

type Aba =
  | "distribuicao"
  | "resumo";

type CategoriaVisual = {
  id: string;
  nome: string;
  valorCentavos: number;
  porcentagem: number;
  cor: string;
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

const nomesMesesCurtos = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

function formatarValorCentavos(
  centavos: number
) {
  return (
    centavos / 100
  ).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function getCategoriaVisual(
  categoria: StatementCategory
): CategoriaVisual {
  const encontrada =
    categoriasGasto.find(
      (item) =>
        item.id === categoria.id
    );

  return {
    id: categoria.id,
    nome:
      encontrada?.nome ??
      categoria.name ??
      "Outro",
    valorCentavos:
      categoria.amountCents,
    porcentagem:
      categoria.percentage,
    cor:
      encontrada?.cor ??
      "#94A3B8",
  };
}

function getPreviousMonthName(
  statement: MonthlyStatement
) {
  if (
    !statement.previousMonth
  ) {
    return "";
  }

  return nomesMeses[
    statement.previousMonth.month -
      1
  ];
}

function getCurrentMonth() {
  const now = new Date();

  return {
    year: now.getFullYear(),
    month: now.getMonth(),
  };
}

function isFutureMonth(
  year: number,
  month: number
) {
  const current =
    getCurrentMonth();

  if (year > current.year) {
    return true;
  }

  return (
    year === current.year &&
    month > current.month
  );
}

export default function ExtratoScreen() {
  const {
    theme,
    activeSpecialTheme,
  } = useTheme();

  const currentMonth =
    useMemo(
      () => getCurrentMonth(),
      []
    );

  const [aba, setAba] =
    useState<Aba>(
      "distribuicao"
    );

  const [
    anoSelecionado,
    setAnoSelecionado,
  ] = useState(
    currentMonth.year
  );

  const [
    mesSelecionado,
    setMesSelecionado,
  ] = useState(
    currentMonth.month
  );

  const [
    seletorPeriodoAberto,
    setSeletorPeriodoAberto,
  ] = useState(false);

  const [
    anoDoSeletor,
    setAnoDoSeletor,
  ] = useState(
    currentMonth.year
  );

  const [
    statement,
    setStatement,
  ] =
    useState<MonthlyStatement | null>(
      null
    );

  const [
    carregando,
    setCarregando,
  ] = useState(true);

  const [
    erro,
    setErro,
  ] =
    useState(false);

  const isPride =
    activeSpecialTheme ===
    "pride";

  const carregarExtrato =
    useCallback(
      async () => {
        setCarregando(true);
        setErro(false);

        try {
          const dados =
            await getMonthlyStatement(
              anoSelecionado,
              mesSelecionado + 1
            );

          setStatement(
            dados
          );
        } catch (error) {
          console.error(
            "Erro ao carregar extrato:",
            error
          );

          setStatement(
            null
          );

          setErro(true);
        } finally {
          setCarregando(
            false
          );
        }
      },
      [
        anoSelecionado,
        mesSelecionado,
      ]
    );

  useFocusEffect(
    useCallback(() => {
      carregarExtrato();
    }, [carregarExtrato])
  );

  const categorias =
    useMemo(
      () =>
        (
          statement?.categories ??
          []
        ).map(
          getCategoriaVisual
        ),
      [statement]
    );

  const entradas =
    statement?.externalIncomeCents ??
    0;

  const totalGasto =
    statement?.expenseCents ??
    0;

  const resultado =
    statement?.resultCents ??
    0;

  const mediaDiaria =
    statement
      ?.averageDailyExpenseCents ??
    0;

  const diasRestantes =
    statement?.remainingDays ??
    0;

  const cicloEncerrado =
    statement?.status ===
    "closed";

  const percentualGasto =
    entradas > 0
      ? Math.round(
          (totalGasto /
            entradas) *
            100
        )
      : totalGasto > 0
        ? 100
        : 0;

  const percentualRestante =
    entradas > 0 &&
    resultado > 0
      ? Math.round(
          (resultado /
            entradas) *
            100
        )
      : 0;

  const podeGastarPorDia =
    diasRestantes > 0
      ? Math.round(
          resultado /
            diasRestantes
        )
      : 0;

  const maiorCategoria =
    categorias.length > 0
      ? categorias.reduce(
          (
            maior,
            categoria
          ) =>
            categoria.valorCentavos >
            maior.valorCentavos
              ? categoria
              : maior
        )
      : null;

  const podeIrProximoMes =
    !isFutureMonth(
      anoSelecionado,
      mesSelecionado + 1
    );

  function irParaMesAnterior() {
    if (
      mesSelecionado === 0
    ) {
      setMesSelecionado(
        11
      );

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
    if (
      !podeIrProximoMes
    ) {
      return;
    }

    if (
      mesSelecionado === 11
    ) {
      setMesSelecionado(
        0
      );

      setAnoSelecionado(
        (ano) => ano + 1
      );

      return;
    }

    setMesSelecionado(
      (mes) => mes + 1
    );
  }

  function abrirSeletorPeriodo() {
    setAnoDoSeletor(
      anoSelecionado
    );

    setSeletorPeriodoAberto(
      true
    );
  }

  function fecharSeletorPeriodo() {
    setSeletorPeriodoAberto(
      false
    );
  }

  function irParaAnoAnterior() {
    setAnoDoSeletor(
      (ano) => ano - 1
    );
  }

  function irParaAnoSeguinte() {
    if (
      anoDoSeletor >=
      currentMonth.year
    ) {
      return;
    }

    setAnoDoSeletor(
      (ano) => ano + 1
    );
  }

  function selecionarPeriodo(
    mes: number
  ) {
    if (
      isFutureMonth(
        anoDoSeletor,
        mes
      )
    ) {
      return;
    }

    setAnoSelecionado(
      anoDoSeletor
    );

    setMesSelecionado(
      mes
    );

    setSeletorPeriodoAberto(
      false
    );
  }

  function renderSegment(
    label: string,
    selected: boolean,
    onPress: () => void
  ) {
    if (
      selected &&
      theme.visuals
        .useGradientPrimary
    ) {
      return (
        <Pressable
          onPress={onPress}
          style={
            styles.segment
          }
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

  function renderLoading() {
    return (
      <View
        style={
          styles.loadingContainer
        }
      >
        <ActivityIndicator
          size="large"
          color={
            theme.colors.primary
          }
        />
      </View>
    );
  }

  function renderError() {
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
            name="error-outline"
            size={30}
            color={
              theme.colors.danger
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
          Não foi possível carregar
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
          O Extrato encontrou um
          problema ao buscar os dados
          deste mês.
        </Text>

        <Pressable
          onPress={
            carregarExtrato
          }
          style={[
            styles.retryButton,
            {
              backgroundColor:
                theme.colors.primary,
            },
          ]}
        >
          <Text
            style={
              styles.retryButtonText
            }
          >
            Tentar novamente
          </Text>
        </Pressable>
      </View>
    );
  }

  function renderResumoAtual() {
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
            {formatarValorCentavos(
              entradas
            )}
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
                      theme.colors.text,
                  },
                ]}
              >
                {formatarValorCentavos(
                  totalGasto
                )}
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
              {percentualGasto}% das
              entradas
            </Text>
          </View>

          <ProgressBar
            value={
              percentualGasto
            }
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
                Resultado do mês
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
                {formatarValorCentavos(
                  resultado
                )}
              </Text>
            </View>

            {entradas > 0 && (
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
                  ? `${percentualRestante}% preservado`
                  : `${Math.round(
                      (Math.abs(
                        resultado
                      ) /
                        entradas) *
                        100
                    )}% acima`}
              </Text>
            )}
          </View>

          <ProgressBar
            value={
              percentualRestante
            }
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
              style={
                styles.metric
              }
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
                      theme.colors.text,
                  },
                ]}
              >
                {formatarValorCentavos(
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

            <View
              style={
                styles.metric
              }
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
                Margem/dia
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
                {formatarValorCentavos(
                  podeGastarPorDia
                )}
              </Text>
            </View>
          </View>
        </View>

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
                      theme.colors.text,
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
              Sua maior categoria até
              agora é{" "}
              <Text
                style={[
                  styles.analysisStrong,
                  {
                    color:
                      theme.colors.text,
                  },
                ]}
              >
                {maiorCategoria.nome}
              </Text>
              , com{" "}
              {formatarValorCentavos(
                maiorCategoria.valorCentavos
              )}{" "}
              (
              {Math.round(
                maiorCategoria.porcentagem
              )}
              % dos gastos).
            </Text>
          </View>
        )}
      </View>
    );
  }

  function renderDestinoFechamento() {
    if (!statement) {
      return null;
    }

    const decision =
      statement.closingDecision;

    if (
      resultado === 0
    ) {
      return (
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
            Consequência para o próximo
            ciclo
          </Text>

          <Text
            style={[
              styles.cofreResultValue,
              {
                color:
                  theme.colors.text,
              },
            ]}
          >
            Nenhuma
          </Text>
        </View>
      );
    }

    if (
      decision ===
      "positive_to_vault"
    ) {
      return (
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
            Levado para o Cofre
          </Text>

          <Text
            style={[
              styles.cofreResultValue,
              {
                color:
                  theme.colors.success,
              },
            ]}
          >
            {formatarValorCentavos(
              resultado
            )}
          </Text>
        </View>
      );
    }

    if (
      decision ===
      "positive_keep_monthly"
    ) {
      return (
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
            Mantido para o próximo ciclo
          </Text>

          <Text
            style={[
              styles.cofreResultValue,
              {
                color:
                  theme.colors.success,
              },
            ]}
          >
            {formatarValorCentavos(
              statement.carryCents
            )}
          </Text>
        </View>
      );
    }

    if (
      decision ===
      "negative_carry"
    ) {
      return (
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
            Levado para o próximo ciclo
          </Text>

          <Text
            style={[
              styles.cofreResultValue,
              {
                color:
                  theme.colors.danger,
              },
            ]}
          >
            {formatarValorCentavos(
              Math.abs(
                statement.carryCents
              )
            )}
          </Text>
        </View>
      );
    }

    if (
      decision ===
      "negative_from_vault"
    ) {
      const cobertura =
        statement.vaultCoverageCents;

      const restante =
        Math.abs(
          statement.carryCents
        );

      return (
        <View
          style={
            styles.closingEffects
          }
        >
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
              Coberto pelo Cofre
            </Text>

            <Text
              style={[
                styles.cofreResultValue,
                {
                  color:
                    cobertura > 0
                      ? theme.colors
                          .success
                      : theme.colors
                          .textSecondary,
                },
              ]}
            >
              {formatarValorCentavos(
                cobertura
              )}
            </Text>
          </View>

          {restante > 0 && (
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
                Restante levado para o
                próximo ciclo
              </Text>

              <Text
                style={[
                  styles.cofreResultValue,
                  {
                    color:
                      theme.colors.danger,
                  },
                ]}
              >
                {formatarValorCentavos(
                  restante
                )}
              </Text>
            </View>
          )}
        </View>
      );
    }

    return (
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
          Fechamento
        </Text>

        <Text
          style={[
            styles.cofreResultValue,
            {
              color:
                theme.colors
                  .textSecondary,
            },
          ]}
        >
          Pendente
        </Text>
      </View>
    );
  }

  function renderResumoEncerrado() {
    if (!statement) {
      return null;
    }

    const comparacao =
      statement.previousMonth;

    const diferenca =
      comparacao
        ? totalGasto -
          comparacao.expenseCents
        : 0;

    const percentualDiferenca =
      comparacao &&
      comparacao.expenseCents >
        0
        ? Math.round(
            (Math.abs(
              diferenca
            ) /
              comparacao.expenseCents) *
              100
          )
        : 0;

    const gastouMais =
      diferenca > 0;

    const mesAnterior =
      getPreviousMonthName(
        statement
      );

    const resultadoPositivo =
      resultado > 0;

    const resultadoNegativo =
      resultado < 0;

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
                    resultadoPositivo
                      ? theme.colors
                          .primarySoft
                      : theme.colors
                          .surfaceSecondary,
                },
              ]}
            >
              <MaterialIcons
                name={
                  resultadoPositivo
                    ? "check"
                    : resultadoNegativo
                      ? "warning-amber"
                      : "remove"
                }
                size={24}
                color={
                  resultadoPositivo
                    ? theme.colors
                        .success
                    : resultadoNegativo
                      ? theme.colors
                          .danger
                      : theme.colors
                          .textSecondary
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
                      theme.colors.text,
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
              valueCents={
                entradas
              }
            />

            <SummaryNumber
              label="Gastos"
              valueCents={
                totalGasto
              }
            />

            <SummaryNumber
              label="Resultado"
              valueCents={
                resultado
              }
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
                    resultadoPositivo
                      ? theme.colors
                          .primarySoft
                      : theme.colors
                          .surfaceSecondary,
                },
              ]}
            >
              <MaterialIcons
                name={
                  resultadoPositivo
                    ? "savings"
                    : resultadoNegativo
                      ? "trending-down"
                      : "balance"
                }
                size={25}
                color={
                  resultadoPositivo
                    ? theme.colors
                        .success
                    : resultadoNegativo
                      ? theme.colors
                          .danger
                      : theme.colors
                          .textSecondary
                }
              />
            </View>

            <View
              style={
                styles.resultInfo
              }
            >
              <Text
                style={[
                  styles.resultTitle,
                  {
                    color:
                      theme.colors.text,
                  },
                ]}
              >
                {resultadoPositivo
                  ? "Fechamento positivo"
                  : resultadoNegativo
                    ? "Fechamento negativo"
                    : "Fechamento neutro"}
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
                {resultadoPositivo
                  ? "Você terminou o ciclo com mais entradas do que gastos."
                  : resultadoNegativo
                    ? "Seus gastos ultrapassaram as entradas registradas neste ciclo."
                    : "Entradas e gastos se equilibraram neste ciclo."}
              </Text>
            </View>
          </View>

          {renderDestinoFechamento()}
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
              {mesAnterior}
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
                        diferenca === 0
                          ? theme.colors
                              .textSecondary
                          : gastouMais
                            ? theme.colors
                                .danger
                            : theme.colors
                                .success,
                    },
                  ]}
                >
                  {diferenca === 0
                    ? "—"
                    : gastouMais
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
                        theme.colors.text,
                    },
                  ]}
                >
                  {diferenca === 0
                    ? `Seus gastos ficaram no mesmo valor de ${mesAnterior.toLowerCase()}.`
                    : `Você gastou ${formatarValorCentavos(
                        Math.abs(
                          diferenca
                        )
                      )} ${
                        gastouMais
                          ? "a mais"
                          : "a menos"
                      } que em ${mesAnterior.toLowerCase()}.`}
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
                      theme.colors.text,
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
                      theme.colors.text,
                  },
                ]}
              >
                {maiorCategoria.nome}
              </Text>
              , com{" "}
              {formatarValorCentavos(
                maiorCategoria.valorCentavos
              )}{" "}
              (
              {Math.round(
                maiorCategoria.porcentagem
              )}
              % dos gastos do mês).
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
                resultadoPositivo
                  ? theme.colors
                      .success
                  : resultadoNegativo
                    ? theme.colors
                        .warning
                    : theme.colors
                        .textSecondary
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
            {resultadoPositivo &&
            comparacao &&
            diferenca < 0
              ? `Você terminou o ciclo com saldo positivo e gastou menos que em ${mesAnterior.toLowerCase()}. O resultado mostra uma margem maior entre o que entrou e o que saiu.`
              : resultadoPositivo
                ? `Você terminou o ciclo com ${formatarValorCentavos(
                    resultado
                  )} de resultado positivo entre entradas e gastos.`
                : resultadoNegativo &&
                    maiorCategoria
                  ? `Este ciclo terminou com ${formatarValorCentavos(
                      Math.abs(
                        resultado
                      )
                    )} de déficit. ${maiorCategoria.nome} foi sua maior categoria de gastos neste período.`
                  : resultadoNegativo
                    ? `Este ciclo terminou com ${formatarValorCentavos(
                        Math.abs(
                          resultado
                        )
                      )} de déficit entre entradas e gastos.`
                    : "Entradas e gastos terminaram no mesmo valor neste ciclo."}
          </Text>
        </View>
      </View>
    );
  }

  function renderConteudo() {
    if (carregando) {
      return renderLoading();
    }

    if (erro) {
      return renderError();
    }

    if (
      !statement ||
      !statement.hasActivity
    ) {
      return renderEmptyState();
    }

    if (
      aba ===
      "distribuicao"
    ) {
      if (
        totalGasto === 0
      ) {
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
                name="pie-chart-outline"
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
              Nenhum gasto
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
              Há movimentações neste mês,
              mas nenhum gasto para
              distribuir por categoria.
            </Text>
          </View>
        );
      }

      return (
        <>
          <View
            style={
              styles.chartContainer
            }
          >
            <DonutChart
              categorias={
                categorias
              }
              totalCents={
                totalGasto
              }
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
                        {formatarValorCentavos(
                          categoria.valorCentavos
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
                        {Math.round(
                          categoria.porcentagem
                        )}
                        %
                      </Text>
                    </View>
                  </View>
                );
              }
            )}
          </View>
        </>
      );
    }

    return cicloEncerrado
      ? renderResumoEncerrado()
      : renderResumoAtual();
  }

  return (
    <>
      <ScrollView
        style={
          styles.screen
        }
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
              color:
                theme.colors.text,
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
            onPress={
              irParaMesAnterior
            }
            style={
              styles.monthArrow
            }
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

          <Pressable
            onPress={
              abrirSeletorPeriodo
            }
            style={
              styles.monthButton
            }
          >
            <Text
              style={[
                styles.monthText,
                {
                  color:
                    theme.colors.text,
                },
              ]}
            >
              {
                nomesMeses[
                  mesSelecionado
                ]
              }{" "}
              {anoSelecionado}
            </Text>

            <MaterialIcons
              name="expand-more"
              size={22}
              color={
                theme.colors
                  .textSecondary
              }
            />
          </Pressable>

          <Pressable
            onPress={
              irParaProximoMes
            }
            disabled={
              !podeIrProximoMes
            }
            style={
              styles.monthArrow
            }
          >
            <Text
              style={[
                styles.arrowText,
                {
                  color:
                    theme.colors
                      .textSecondary,
                  opacity:
                    podeIrProximoMes
                      ? 1
                      : 0.25,
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
            aba ===
              "distribuicao",
            () =>
              setAba(
                "distribuicao"
              )
          )}

          {renderSegment(
            "Resumo do mês",
            aba === "resumo",
            () =>
              setAba("resumo")
          )}
        </View>

        {renderConteudo()}
      </ScrollView>

      <Modal
        visible={
          seletorPeriodoAberto
        }
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={
          fecharSeletorPeriodo
        }
      >
        <Pressable
          style={
            styles.modalBackdrop
          }
          onPress={
            fecharSeletorPeriodo
          }
        >
          <Pressable
            onPress={() => {}}
            style={[
              styles.periodModal,
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
                styles.periodModalHeader
              }
            >
              <View>
                <Text
                  style={[
                    styles.periodModalTitle,
                    {
                      color:
                        theme.colors.text,
                    },
                  ]}
                >
                  Selecionar período
                </Text>

                <Text
                  style={[
                    styles.periodModalSubtitle,
                    {
                      color:
                        theme.colors
                          .textSecondary,
                    },
                  ]}
                >
                  Escolha o mês que deseja
                  consultar
                </Text>
              </View>

              <Pressable
                onPress={
                  fecharSeletorPeriodo
                }
                hitSlop={10}
                style={[
                  styles.modalCloseButton,
                  {
                    backgroundColor:
                      theme.colors
                        .surfaceSecondary,
                  },
                ]}
              >
                <MaterialIcons
                  name="close"
                  size={21}
                  color={
                    theme.colors
                      .textSecondary
                  }
                />
              </Pressable>
            </View>

            <View
              style={[
                styles.yearSelector,
                {
                  backgroundColor:
                    theme.colors
                      .surfaceSecondary,
                },
              ]}
            >
              <Pressable
                onPress={
                  irParaAnoAnterior
                }
                style={
                  styles.yearArrow
                }
              >
                <MaterialIcons
                  name="chevron-left"
                  size={28}
                  color={
                    theme.colors
                      .textSecondary
                  }
                />
              </Pressable>

              <Text
                style={[
                  styles.yearText,
                  {
                    color:
                      theme.colors.text,
                  },
                ]}
              >
                {anoDoSeletor}
              </Text>

              <Pressable
                onPress={
                  irParaAnoSeguinte
                }
                disabled={
                  anoDoSeletor >=
                  currentMonth.year
                }
                style={
                  styles.yearArrow
                }
              >
                <MaterialIcons
                  name="chevron-right"
                  size={28}
                  color={
                    theme.colors
                      .textSecondary
                  }
                  style={{
                    opacity:
                      anoDoSeletor >=
                      currentMonth.year
                        ? 0.25
                        : 1,
                  }}
                />
              </Pressable>
            </View>

            <View
              style={
                styles.monthGrid
              }
            >
              {nomesMesesCurtos.map(
                (
                  nomeMes,
                  index
                ) => {
                  const futuro =
                    isFutureMonth(
                      anoDoSeletor,
                      index
                    );

                  const selecionado =
                    anoDoSeletor ===
                      anoSelecionado &&
                    index ===
                      mesSelecionado;

                  return (
                    <Pressable
                      key={
                        nomeMes
                      }
                      onPress={() =>
                        selecionarPeriodo(
                          index
                        )
                      }
                      disabled={
                        futuro
                      }
                      style={[
                        styles.monthGridItem,
                        {
                          borderColor:
                            selecionado
                              ? theme
                                  .colors
                                  .primary
                              : theme
                                  .colors
                                  .border,
                          backgroundColor:
                            selecionado
                              ? theme
                                  .colors
                                  .primarySoft
                              : theme
                                  .colors
                                  .surfaceSecondary,
                          opacity:
                            futuro
                              ? 0.35
                              : 1,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.monthGridText,
                          {
                            color:
                              selecionado
                                ? theme
                                    .colors
                                    .primary
                                : theme
                                    .colors
                                    .text,
                          },
                        ]}
                      >
                        {nomeMes}
                      </Text>
                    </Pressable>
                  );
                }
              )}
            </View>

            <Pressable
              onPress={
                fecharSeletorPeriodo
              }
              style={[
                styles.cancelPeriodButton,
                {
                  borderColor:
                    theme.colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.cancelPeriodText,
                  {
                    color:
                      theme.colors
                        .textSecondary,
                  },
                ]}
              >
                Cancelar
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

type SummaryNumberProps = {
  label: string;
  valueCents: number;
  highlight?: boolean;
};

function SummaryNumber({
  label,
  valueCents,
  highlight = false,
}: SummaryNumberProps) {
  const { theme } =
    useTheme();

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
              ? valueCents > 0
                ? theme.colors
                    .success
                : valueCents < 0
                  ? theme.colors
                      .danger
                  : theme.colors
                      .text
              : theme.colors.text,
          },
        ]}
      >
        {highlight &&
        valueCents > 0
          ? "+"
          : ""}
        {formatarValorCentavos(
          valueCents
        )}
      </Text>
    </View>
  );
}

type ProgressBarProps = {
  value: number;
  type:
    | "warning"
    | "primary";
};

function ProgressBar({
  value,
  type,
}: ProgressBarProps) {
  const { theme } =
    useTheme();

  const width =
    `${Math.max(
      0,
      Math.min(
        value,
        100
      )
    )}%` as `${number}%`;

  const useAccent =
    type === "primary" &&
    theme.visuals
      .useGradientPrimary;

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
      {useAccent ? (
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
  categorias: CategoriaVisual[];
  totalCents: number;
};

function DonutChart({
  categorias,
  totalCents,
}: DonutChartProps) {
  const {
    theme,
    activeSpecialTheme,
  } = useTheme();

  const isPride =
    activeSpecialTheme ===
    "pride";

  const size = 280;
  const strokeWidth = 62;

  const radius =
    (size - strokeWidth) /
    2;

  const center =
    size / 2;

  function polarToCartesian(
    angle: number
  ) {
    const angleInRadians =
      ((angle - 90) *
        Math.PI) /
      180;

    return {
      x:
        center +
        radius *
          Math.cos(
            angleInRadians
          ),
      y:
        center +
        radius *
          Math.sin(
            angleInRadians
          ),
    };
  }

  function createArcPath(
    startAngle: number,
    endAngle: number
  ) {
    const start =
      polarToCartesian(
        startAngle
      );

    const end =
      polarToCartesian(
        endAngle
      );

    const sweep =
      endAngle -
      startAngle;

    const largeArcFlag =
      sweep > 180
        ? 1
        : 0;

    return [
      "M",
      start.x,
      start.y,
      "A",
      radius,
      radius,
      0,
      largeArcFlag,
      1,
      end.x,
      end.y,
    ].join(" ");
  }

  let accumulatedPercentage =
    0;

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems:
          "center",
        justifyContent:
          "center",
      }}
    >
      <Svg
        width={size}
        height={size}
        style={
          styles.svg
        }
      >
        <Circle
          cx={center}
          cy={center}
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
            const percentage =
              Math.max(
                0,
                Math.min(
                  categoria.porcentagem,
                  100
                )
              );

            if (
              percentage <= 0
            ) {
              return null;
            }

            const startAngle =
              (accumulatedPercentage /
                100) *
              360;

            const endAngle =
              ((accumulatedPercentage +
                percentage) /
                100) *
              360;

            accumulatedPercentage +=
              percentage;

            const segmentColor =
              isPride
                ? prideCategoryColors[
                    index %
                      prideCategoryColors.length
                  ]
                : categoria.cor;

            if (
              percentage >= 99.999
            ) {
              return (
                <Circle
                  key={
                    categoria.id
                  }
                  cx={
                    center
                  }
                  cy={
                    center
                  }
                  r={radius}
                  stroke={
                    segmentColor
                  }
                  strokeWidth={
                    strokeWidth
                  }
                  fill="none"
                />
              );
            }

            return (
              <Path
                key={
                  categoria.id
                }
                d={createArcPath(
                  startAngle,
                  endAngle
                )}
                stroke={
                  segmentColor
                }
                strokeWidth={
                  strokeWidth
                }
                strokeLinecap="butt"
                strokeLinejoin="miter"
                fill="none"
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
          {formatarValorCentavos(
            totalCents
          )}
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

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor:
        "transparent",
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
      justifyContent:
        "space-between",
      marginBottom: 14,
    },

    monthArrow: {
      width: 58,
      height: "100%",
      alignItems: "center",
      justifyContent:
        "center",
    },

    arrowText: {
      fontSize: 42,
      fontWeight: "300",
      lineHeight: 45,
    },

    monthButton: {
      flex: 1,
      height: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
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
      justifyContent:
        "center",
    },

    segmentContent: {
      flex: 1,
      alignItems: "center",
      justifyContent:
        "center",
    },

    segmentAccent: {
      flex: 1,
      width: "100%",
      alignItems: "center",
      justifyContent:
        "center",
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

    loadingContainer: {
      minHeight: 260,
      alignItems: "center",
      justifyContent:
        "center",
    },

    retryButton: {
      minHeight: 46,
      borderRadius: 14,
      paddingHorizontal: 20,
      alignItems: "center",
      justifyContent:
        "center",
      marginTop: 20,
    },

    retryButtonText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "700",
    },

    chartContainer: {
      alignItems: "center",
      justifyContent:
        "center",
      marginVertical: 8,
    },

    svg: {
      position: "absolute",
    },

    donutCenter: {
      alignItems: "center",
      justifyContent:
        "center",
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
      justifyContent:
        "space-between",
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
      justifyContent:
        "space-between",
      alignItems:
        "flex-start",
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
      justifyContent:
        "space-between",
      alignItems:
        "flex-start",
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
      justifyContent:
        "center",
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
      alignItems:
        "flex-start",
    },

    resultIcon: {
      width: 46,
      height: 46,
      borderRadius: 14,
      alignItems: "center",
      justifyContent:
        "center",
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

    closingEffects: {
      gap: 8,
      marginTop: 17,
    },

    cofreResult: {
      borderRadius: 14,
      padding: 15,
      marginTop: 17,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
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
      justifyContent:
        "center",
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

    modalBackdrop: {
      flex: 1,
      backgroundColor:
        "rgba(0, 0, 0, 0.45)",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 20,
    },

    periodModal: {
      width: "100%",
      maxWidth: 420,
      borderRadius: 24,
      borderWidth: 1,
      padding: 20,
    },

    periodModalHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent:
        "space-between",
      gap: 16,
      marginBottom: 20,
    },

    periodModalTitle: {
      fontSize: 21,
      fontWeight: "800",
      letterSpacing: -0.4,
    },

    periodModalSubtitle: {
      fontSize: 13,
      lineHeight: 18,
      marginTop: 4,
    },

    modalCloseButton: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },

    yearSelector: {
      height: 58,
      borderRadius: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      marginBottom: 16,
    },

    yearArrow: {
      width: 58,
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
    },

    yearText: {
      fontSize: 20,
      fontWeight: "800",
    },

    monthGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent:
        "space-between",
      rowGap: 10,
    },

    monthGridItem: {
      width: "31.5%",
      minHeight: 50,
      borderRadius: 14,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    },

    monthGridText: {
      fontSize: 14,
      fontWeight: "700",
    },

    cancelPeriodButton: {
      height: 50,
      borderRadius: 15,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 20,
    },

    cancelPeriodText: {
      fontSize: 14,
      fontWeight: "700",
    },
  });