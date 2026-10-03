import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  router,
  useFocusEffect,
} from "expo-router";
import {
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, {
  Circle,
} from "react-native-svg";

import ThemeAccent from "../components/ThemeAccent";
import { prepareCycles } from "../database/cycles";
import {
  getVaultOverview,
  VaultMovement,
  VaultMovementType,
  VaultOrigin,
  VaultOverview,
} from "../database/vault";
import { useTheme } from "../theme/ThemeContext";

type AbaCofre =
  | "visao"
  | "movimentacoes";

type FiltroMovimentacao =
  | "todas"
  | "sobras"
  | "transferencias"
  | "entradas"
  | "retiradas";

type OrigemVisual = {
  nome: string;
  valor: number;
  cor: string;
};

type EvolucaoVisual = {
  chave: string;
  ciclo: string;
  valor: number;
  label: string;
};

type MovimentacaoVisual = {
  id: string;
  tipo: VaultMovementType;
  titulo: string;
  descricao: string;
  valor: number;
  data: string;
  dataCompleta: string;
  mes: string;
};

const filtros: {
  id: FiltroMovimentacao;
  label: string;
}[] = [
  {
    id: "todas",
    label: "Todas",
  },
  {
    id: "sobras",
    label: "Sobras",
  },
  {
    id: "transferencias",
    label: "Transferências",
  },
  {
    id: "entradas",
    label: "Entradas",
  },
  {
    id: "retiradas",
    label: "Retiradas",
  },
];

const prideOriginColors = [
  "#FF3158",
  "#168AF2",
  "#FFD21C",
];

const emptyOverview: VaultOverview = {
  balanceCents: 0,
  evolution: [],
  origins: [
    {
      type: "surplus",
      amountCents: 0,
    },
    {
      type: "transfer",
      amountCents: 0,
    },
    {
      type: "income",
      amountCents: 0,
    },
  ],
  movements: [],
  stats: {
    positiveCycles: 0,
    completedCycles: 0,
    periodGrowthCents: 0,
    periodIntervals: 0,
    largestCycleGrowthCents: 0,
    averageCycleGrowthCents: 0,
  },
};

function formatarValor(
  valor: number
) {
  return Math.abs(
    valor
  ).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatarValorSemCentavos(
  valor: number
) {
  return valor.toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }
  );
}

function criarDataLocal(
  data: string
) {
  const [ano, mes, dia] =
    data
      .split("-")
      .map(Number);

  return new Date(
    ano,
    mes - 1,
    dia
  );
}

function formatarData(
  data: string
) {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  ).format(
    criarDataLocal(data)
  );
}

function formatarMesAno(
  data: string
) {
  const texto =
    new Intl.DateTimeFormat(
      "pt-BR",
      {
        month: "long",
        year: "numeric",
      }
    ).format(
      criarDataLocal(data)
    );

  return (
    texto.charAt(0).toUpperCase() +
    texto.slice(1)
  );
}

function formatarMesCurto(
  year: number,
  month: number
) {
  const texto =
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
    texto.charAt(0).toUpperCase() +
    texto.slice(1)
  );
}

function tipoParaFiltro(
  tipo: VaultMovementType
): FiltroMovimentacao {
  if (tipo === "sobra") {
    return "sobras";
  }

  if (
    tipo === "transferencia"
  ) {
    return "transferencias";
  }

  if (tipo === "entrada") {
    return "entradas";
  }

  return "retiradas";
}

function iconeMovimentacao(
  tipo: VaultMovementType
):
  | "savings"
  | "swap-vert"
  | "add"
  | "arrow-downward" {
  if (tipo === "sobra") {
    return "savings";
  }

  if (
    tipo === "transferencia"
  ) {
    return "swap-vert";
  }

  if (tipo === "entrada") {
    return "add";
  }

  return "arrow-downward";
}

function corDaEvolucao(
  valorAtual: number,
  valorAnterior?: number
) {
  if (
    valorAnterior === undefined
  ) {
    return "#2196F3";
  }

  if (
    valorAtual > valorAnterior
  ) {
    return "#20C997";
  }

  if (
    valorAtual < valorAnterior
  ) {
    return "#FF5A67";
  }

  return "#2196F3";
}

function converterOrigem(
  origem: VaultOrigin
): OrigemVisual {
  if (
    origem.type === "surplus"
  ) {
    return {
      nome: "Sobras de ciclos",
      valor:
        origem.amountCents /
        100,
      cor: "#20C997",
    };
  }

  if (
    origem.type === "transfer"
  ) {
    return {
      nome: "Transferências",
      valor:
        origem.amountCents /
        100,
      cor: "#168AF2",
    };
  }

  return {
    nome: "Outras entradas",
    valor:
      origem.amountCents / 100,
    cor: "#7C3AED",
  };
}

function converterMovimentacao(
  movement: VaultMovement
): MovimentacaoVisual {
  return {
    id: movement.id,
    tipo: movement.type,
    titulo: movement.title,
    descricao:
      movement.description,
    valor:
      movement.amountCents /
      100,
    data: formatarData(
      movement.date
    ),
    dataCompleta:
      movement.date,
    mes: formatarMesAno(
      movement.date
    ),
  };
}

export default function CofreScreen() {
  const { theme } =
    useTheme();

  const [aba, setAba] =
    useState<AbaCofre>(
      "visao"
    );

  const [filtro, setFiltro] =
    useState<FiltroMovimentacao>(
      "todas"
    );

  const [
    overview,
    setOverview,
  ] =
    useState<VaultOverview>(
      emptyOverview
    );

  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      async function carregarCofre() {
        try {
          await prepareCycles();

          const data =
            await getVaultOverview();

          if (!ativo) {
            return;
          }

          setOverview(data);
        } catch (error) {
          console.error(
            "Erro ao carregar Cofre:",
            error
          );
        }
      }

      carregarCofre();

      return () => {
        ativo = false;
      };
    }, [])
  );

  const saldo =
    overview.balanceCents /
    100;

  const evolucao =
    useMemo<
      EvolucaoVisual[]
    >(() => {
      return overview.evolution.map(
        (item) => ({
          chave: `${
            item.year
          }-${String(
            item.month
          ).padStart(
            2,
            "0"
          )}`,

          ciclo:
            formatarMesCurto(
              item.year,
              item.month
            ),

          valor:
            item.balanceCents /
            100,

          label:
            formatarValorSemCentavos(
              item.balanceCents /
                100
            ),
        })
      );
    }, [
      overview.evolution,
    ]);

  const origens =
    useMemo(() => {
      return overview.origins.map(
        converterOrigem
      );
    }, [
      overview.origins,
    ]);

  const movimentacoes =
    useMemo(() => {
      return overview.movements.map(
        converterMovimentacao
      );
    }, [
      overview.movements,
    ]);

  const valoresEvolucao =
    evolucao.map(
      (item) => item.valor
    );

  const menorValor =
    valoresEvolucao.length > 0
      ? Math.min(
          ...valoresEvolucao
        )
      : 0;

  const maiorValor =
    valoresEvolucao.length > 0
      ? Math.max(
          ...valoresEvolucao
        )
      : 0;

  const diferencaEscala =
    maiorValor - menorValor;

  const crescimentoPeriodo =
    overview.stats
      .periodGrowthCents /
    100;

  const crescimentoPositivo =
    crescimentoPeriodo > 0;

  const crescimentoNegativo =
    crescimentoPeriodo < 0;

  const corCrescimento =
    crescimentoNegativo
      ? "#FF5A67"
      : crescimentoPositivo
        ? "#20C997"
        : theme.colors
            .textSecondary;

  const iconeCrescimento =
    crescimentoNegativo
      ? "trending-down"
      : crescimentoPositivo
        ? "trending-up"
        : "trending-flat";

  const textoPeriodo =
    overview.stats
      .periodIntervals === 0
      ? "sem ciclos anteriores para comparar"
      : crescimentoPositivo
        ? `de crescimento nos últimos ${
            overview.stats
              .periodIntervals
          } ${
            overview.stats
              .periodIntervals ===
            1
              ? "ciclo"
              : "ciclos"
          }`
        : crescimentoNegativo
          ? `de redução nos últimos ${
              overview.stats
                .periodIntervals
            } ${
              overview.stats
                .periodIntervals ===
              1
                ? "ciclo"
                : "ciclos"
            }`
          : `de variação nos últimos ${
              overview.stats
                .periodIntervals
            } ${
              overview.stats
                .periodIntervals ===
              1
                ? "ciclo"
                : "ciclos"
            }`;

  const movimentacoesFiltradas =
    useMemo(() => {
      if (
        filtro === "todas"
      ) {
        return movimentacoes;
      }

      return movimentacoes.filter(
        (movimentacao) =>
          tipoParaFiltro(
            movimentacao.tipo
          ) === filtro
      );
    }, [
      filtro,
      movimentacoes,
    ]);

  const meses =
    useMemo(() => {
      return Array.from(
        new Set(
          movimentacoesFiltradas.map(
            (
              movimentacao
            ) =>
              movimentacao.mes
          )
        )
      );
    }, [
      movimentacoesFiltradas,
    ]);

  const totalOrigens =
    origens.reduce(
      (soma, origem) =>
        soma + origem.valor,
      0
    );

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
      <View
        style={styles.header}
      >
        <Pressable
          onPress={() =>
            router.back()
          }
          hitSlop={12}
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

        <View
          style={
            styles.headerText
          }
        >
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
            Cofre
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color:
                  theme.colors
                    .textSecondary,
              },
            ]}
          >
            O que você já
            conquistou
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.balanceCard,
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
            styles.balanceTop
          }
        >
          <View
            style={
              styles.balanceContent
            }
          >
            <Text
              style={[
                styles.balanceLabel,
                {
                  color:
                    theme.colors
                      .textSecondary,
                },
              ]}
            >
              Seu Cofre
            </Text>

            <Text
              style={[
                styles.balance,
                {
                  color:
                    theme.colors
                      .text,
                },
              ]}
            >
              {formatarValor(
                saldo
              )}
            </Text>

            <View
              style={
                styles.growthRow
              }
            >
              <MaterialIcons
                name={
                  iconeCrescimento
                }
                size={20}
                color={
                  corCrescimento
                }
              />

              <Text
                style={[
                  styles.growth,
                  {
                    color:
                      corCrescimento,
                  },
                ]}
              >
                {crescimentoPeriodo >
                0
                  ? "+ "
                  : crescimentoPeriodo <
                      0
                    ? "− "
                    : ""}
                {formatarValor(
                  crescimentoPeriodo
                )}
              </Text>
            </View>

            <Text
              style={[
                styles.growthPeriod,
                {
                  color:
                    theme.colors
                      .textSecondary,
                },
              ]}
            >
              {textoPeriodo}
            </Text>
          </View>

          <ThemeAccent
            style={
              styles.vaultIcon
            }
          >
            <MaterialIcons
              name="savings"
              size={34}
              color="#FFFFFF"
            />
          </ThemeAccent>
        </View>
      </View>

      <View
        style={[
          styles.tabs,
          {
            backgroundColor:
              theme.colors
                .surfaceSecondary,
          },
        ]}
      >
        <Pressable
          onPress={() =>
            setAba("visao")
          }
          style={
            styles.tabPressable
          }
        >
          {aba === "visao" ? (
            <ThemeAccent
              style={
                styles.activeTab
              }
            >
              <Text
                style={
                  styles.activeTabText
                }
              >
                Visão geral
              </Text>
            </ThemeAccent>
          ) : (
            <View
              style={
                styles.inactiveTab
              }
            >
              <Text
                style={[
                  styles.inactiveTabText,
                  {
                    color:
                      theme.colors
                        .textSecondary,
                  },
                ]}
              >
                Visão geral
              </Text>
            </View>
          )}
        </Pressable>

        <Pressable
          onPress={() =>
            setAba(
              "movimentacoes"
            )
          }
          style={
            styles.tabPressable
          }
        >
          {aba ===
          "movimentacoes" ? (
            <ThemeAccent
              style={
                styles.activeTab
              }
            >
              <Text
                style={
                  styles.activeTabText
                }
              >
                Movimentações
              </Text>
            </ThemeAccent>
          ) : (
            <View
              style={
                styles.inactiveTab
              }
            >
              <Text
                style={[
                  styles.inactiveTabText,
                  {
                    color:
                      theme.colors
                        .textSecondary,
                  },
                ]}
              >
                Movimentações
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      {aba === "visao" ? (
        <>
          <View
            style={[
              styles.sectionCard,
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
            <Text
              style={[
                styles.sectionTitle,
                {
                  color:
                    theme.colors
                      .text,
                },
              ]}
            >
              Evolução do Cofre
            </Text>

            <Text
              style={[
                styles.sectionDescription,
                {
                  color:
                    theme.colors
                      .textSecondary,
                },
              ]}
            >
              Como seu Cofre
              mudou ao longo dos
              ciclos
            </Text>

            {evolucao.length >
            0 ? (
              <>
                <View
                  style={
                    styles.chart
                  }
                >
                  {evolucao.map(
                    (
                      item,
                      index
                    ) => {
                      const anterior =
                        index > 0
                          ? evolucao[
                              index -
                                1
                            ]
                              .valor
                          : undefined;

                      const cor =
                        corDaEvolucao(
                          item.valor,
                          anterior
                        );

                      const proporcao =
                        diferencaEscala ===
                        0
                          ? 0.5
                          : (item.valor -
                              menorValor) /
                            diferencaEscala;

                      const altura =
                        76 +
                        proporcao *
                          64;

                      return (
                        <View
                          key={
                            item.chave
                          }
                          style={
                            styles.chartColumn
                          }
                        >
                          <Text
                            numberOfLines={
                              1
                            }
                            adjustsFontSizeToFit
                            style={[
                              styles.chartValue,
                              {
                                color:
                                  theme
                                    .colors
                                    .textSecondary,
                              },
                            ]}
                          >
                            {
                              item.label
                            }
                          </Text>

                          <View
                            style={
                              styles.barArea
                            }
                          >
                            <View
                              style={[
                                styles.bar,
                                {
                                  height:
                                    altura,
                                  backgroundColor:
                                    cor,
                                },
                              ]}
                            />
                          </View>

                          <Text
                            style={[
                              styles.chartMonth,
                              {
                                color:
                                  theme
                                    .colors
                                    .text,
                              },
                            ]}
                          >
                            {
                              item.ciclo
                            }
                          </Text>
                        </View>
                      );
                    }
                  )}
                </View>

                <View
                  style={
                    styles.legend
                  }
                >
                  <View
                    style={
                      styles.legendItem
                    }
                  >
                    <View
                      style={[
                        styles.legendDot,
                        {
                          backgroundColor:
                            "#20C997",
                        },
                      ]}
                    />

                    <Text
                      style={[
                        styles.legendText,
                        {
                          color:
                            theme
                              .colors
                              .textSecondary,
                        },
                      ]}
                    >
                      Aumentou
                    </Text>
                  </View>

                  <View
                    style={
                      styles.legendItem
                    }
                  >
                    <View
                      style={[
                        styles.legendDot,
                        {
                          backgroundColor:
                            "#2196F3",
                        },
                      ]}
                    />

                    <Text
                      style={[
                        styles.legendText,
                        {
                          color:
                            theme
                              .colors
                              .textSecondary,
                        },
                      ]}
                    >
                      Manteve
                    </Text>
                  </View>

                  <View
                    style={
                      styles.legendItem
                    }
                  >
                    <View
                      style={[
                        styles.legendDot,
                        {
                          backgroundColor:
                            "#FF5A67",
                        },
                      ]}
                    />

                    <Text
                      style={[
                        styles.legendText,
                        {
                          color:
                            theme
                              .colors
                              .textSecondary,
                        },
                      ]}
                    >
                      Diminuiu
                    </Text>
                  </View>
                </View>
              </>
            ) : (
              <View
                style={
                  styles.emptyChart
                }
              >
                <MaterialIcons
                  name="show-chart"
                  size={34}
                  color={
                    theme.colors
                      .textSecondary
                  }
                />

                <Text
                  style={[
                    styles.emptyChartText,
                    {
                      color:
                        theme.colors
                          .textSecondary,
                    },
                  ]}
                >
                  A evolução do seu
                  Cofre aparecerá
                  aqui.
                </Text>
              </View>
            )}
          </View>

          <View
            style={[
              styles.sectionCard,
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
            <Text
              style={[
                styles.sectionTitle,
                {
                  color:
                    theme.colors
                      .text,
                },
              ]}
            >
              De onde veio seu
              Cofre?
            </Text>

            <Text
              style={[
                styles.sectionDescription,
                {
                  color:
                    theme.colors
                      .textSecondary,
                },
              ]}
            >
              A origem do dinheiro
              que você acumulou
            </Text>

            {totalOrigens > 0 ? (
              <>
                <OrigemDonutChart
                  origens={
                    origens
                  }
                />

                <OrigemLegenda
                  origens={
                    origens
                  }
                />
              </>
            ) : (
              <View
                style={
                  styles.emptyChart
                }
              >
                <MaterialIcons
                  name="savings"
                  size={34}
                  color={
                    theme.colors
                      .textSecondary
                  }
                />

                <Text
                  style={[
                    styles.emptyChartText,
                    {
                      color:
                        theme.colors
                          .textSecondary,
                    },
                  ]}
                >
                  Quando você
                  guardar dinheiro,
                  a composição do
                  Cofre aparecerá
                  aqui.
                </Text>
              </View>
            )}
          </View>

          <View
            style={[
              styles.sectionCard,
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
            <Text
              style={[
                styles.sectionTitle,
                {
                  color:
                    theme.colors
                      .text,
                },
              ]}
            >
              Seu histórico
            </Text>

            <View
              style={
                styles.statsGrid
              }
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
                        theme.colors
                          .text,
                    },
                  ]}
                >
                  {
                    overview.stats
                      .positiveCycles
                  }{" "}
                  de{" "}
                  {
                    overview.stats
                      .completedCycles
                  }
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
                  name={
                    iconeCrescimento
                  }
                  size={22}
                  color={
                    corCrescimento
                  }
                />

                <Text
                  style={[
                    styles.statValue,
                    {
                      color:
                        theme.colors
                          .text,
                    },
                  ]}
                >
                  {crescimentoPeriodo >
                  0
                    ? "+ "
                    : crescimentoPeriodo <
                        0
                      ? "− "
                      : ""}
                  {formatarValor(
                    crescimentoPeriodo
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
                  variação em{" "}
                  {
                    overview.stats
                      .periodIntervals
                  }{" "}
                  {overview.stats
                    .periodIntervals ===
                  1
                    ? "ciclo"
                    : "ciclos"}
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
                    theme.colors
                      .primary
                  }
                />

                <Text
                  style={[
                    styles.statValue,
                    {
                      color:
                        theme.colors
                          .text,
                    },
                  ]}
                >
                  {formatarValor(
                    overview.stats
                      .largestCycleGrowthCents /
                      100
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
                  maior crescimento
                  em um ciclo
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
                  name="timeline"
                  size={22}
                  color={
                    theme.colors
                      .primary
                  }
                />

                <Text
                  style={[
                    styles.statValue,
                    {
                      color:
                        theme.colors
                          .text,
                    },
                  ]}
                >
                  {overview.stats
                    .averageCycleGrowthCents >
                  0
                    ? "+ "
                    : overview.stats
                          .averageCycleGrowthCents <
                        0
                      ? "− "
                      : ""}
                  {formatarValor(
                    overview.stats
                      .averageCycleGrowthCents /
                      100
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
                  variação média por
                  ciclo
                </Text>
              </View>
            </View>
          </View>
        </>
      ) : (
        <View
          style={[
            styles.sectionCard,
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
              styles.sectionTitle,
              {
                color:
                  theme.colors.text,
              },
            ]}
          >
            Movimentações do Cofre
          </Text>

          <Text
            style={[
              styles.sectionDescription,
              {
                color:
                  theme.colors
                    .textSecondary,
              },
            ]}
          >
            Tudo que entrou e saiu
            do seu Cofre
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.filtersContent
            }
            style={styles.filters}
          >
            {filtros.map(
              (item) => {
                const ativo =
                  filtro === item.id;

                return (
                  <Pressable
                    key={item.id}
                    onPress={() =>
                      setFiltro(
                        item.id
                      )
                    }
                  >
                    {ativo ? (
                      <ThemeAccent
                        style={
                          styles.activeFilter
                        }
                      >
                        <Text
                          style={
                            styles.activeFilterText
                          }
                        >
                          {
                            item.label
                          }
                        </Text>
                      </ThemeAccent>
                    ) : (
                      <View
                        style={[
                          styles.inactiveFilter,
                          {
                            backgroundColor:
                              theme
                                .colors
                                .surfaceSecondary,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.inactiveFilterText,
                            {
                              color:
                                theme
                                  .colors
                                  .textSecondary,
                            },
                          ]}
                        >
                          {
                            item.label
                          }
                        </Text>
                      </View>
                    )}
                  </Pressable>
                );
              }
            )}
          </ScrollView>

          {meses.length > 0 ? (
            <View
              style={
                styles.monthGroups
              }
            >
              {meses.map((mes) => {
                const itensDoMes =
                  movimentacoesFiltradas.filter(
                    (
                      movimentacao
                    ) =>
                      movimentacao.mes ===
                      mes
                  );

                return (
                  <View
                    key={mes}
                    style={
                      styles.monthGroup
                    }
                  >
                    <Text
                      style={[
                        styles.movementMonth,
                        {
                          color:
                            theme
                              .colors
                              .textSecondary,
                        },
                      ]}
                    >
                      {mes}
                    </Text>

                    <View
                      style={[
                        styles.movementsList,
                        {
                          borderColor:
                            theme
                              .colors
                              .border,
                        },
                      ]}
                    >
                      {itensDoMes.map(
                        (
                          movimentacao,
                          index
                        ) => {
                          const isRetirada =
                            movimentacao.valor <
                            0;

                          return (
                            <View
                              key={
                                movimentacao.id
                              }
                            >
                              <View
                                style={
                                  styles.movementRow
                                }
                              >
                                <View
                                  style={[
                                    styles.movementIcon,
                                    {
                                      backgroundColor:
                                        theme
                                          .colors
                                          .surfaceSecondary,
                                    },
                                  ]}
                                >
                                  <MaterialIcons
                                    name={iconeMovimentacao(
                                      movimentacao.tipo
                                    )}
                                    size={
                                      22
                                    }
                                    color={
                                      isRetirada
                                        ? "#FF5A67"
                                        : theme
                                            .colors
                                            .primary
                                    }
                                  />
                                </View>

                                <View
                                  style={
                                    styles.movementContent
                                  }
                                >
                                  <Text
                                    style={[
                                      styles.movementTitle,
                                      {
                                        color:
                                          theme
                                            .colors
                                            .text,
                                      },
                                    ]}
                                  >
                                    {
                                      movimentacao.titulo
                                    }
                                  </Text>

                                  <Text
                                    style={[
                                      styles.movementDescription,
                                      {
                                        color:
                                          theme
                                            .colors
                                            .textSecondary,
                                      },
                                    ]}
                                  >
                                    {
                                      movimentacao.descricao
                                    }
                                  </Text>

                                  <Text
                                    style={[
                                      styles.movementDate,
                                      {
                                        color:
                                          theme
                                            .colors
                                            .textSecondary,
                                      },
                                    ]}
                                  >
                                    {
                                      movimentacao.data
                                    }
                                  </Text>
                                </View>

                                <Text
                                  style={[
                                    styles.movementValue,
                                    {
                                      color:
                                        isRetirada
                                          ? "#FF5A67"
                                          : "#20C997",
                                    },
                                  ]}
                                >
                                  {isRetirada
                                    ? "− "
                                    : "+ "}
                                  {formatarValor(
                                    movimentacao.valor
                                  )}
                                </Text>
                              </View>

                              {index <
                                itensDoMes.length -
                                  1 && (
                                <View
                                  style={[
                                    styles.divider,
                                    {
                                      backgroundColor:
                                        theme
                                          .colors
                                          .border,
                                    },
                                  ]}
                                />
                              )}
                            </View>
                          );
                        }
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View
              style={
                styles.emptyState
              }
            >
              <MaterialIcons
                name="inbox"
                size={34}
                color={
                  theme.colors
                    .textSecondary
                }
              />

              <Text
                style={[
                  styles.emptyTitle,
                  {
                    color:
                      theme.colors
                        .text,
                  },
                ]}
              >
                Nenhuma movimentação
              </Text>

              <Text
                style={[
                  styles.emptyDescription,
                  {
                    color:
                      theme.colors
                        .textSecondary,
                  },
                ]}
              >
                Não há movimentações
                desse tipo no seu
                Cofre.
              </Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

type OrigemDonutChartProps = {
  origens: OrigemVisual[];
};

function OrigemDonutChart({
  origens,
}: OrigemDonutChartProps) {
  const {
    theme,
    activeSpecialTheme,
  } = useTheme();

  const isPride =
    activeSpecialTheme ===
    "pride";

  const total =
    origens.reduce(
      (soma, origem) =>
        soma + origem.valor,
      0
    );

  const size = 220;
  const strokeWidth = 44;

  const radius =
    (size - strokeWidth) /
    2;

  const circumference =
    2 * Math.PI * radius;

  let acumulado = 0;

  return (
    <View
      style={
        styles.originChartContainer
      }
    >
      <View
        style={{
          width: size,
          height: size,
          alignItems: "center",
          justifyContent:
            "center",
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

          {origens.map(
            (origem, index) => {
              const porcentagem =
                total > 0
                  ? origem.valor /
                    total
                  : 0;

              const segmento =
                porcentagem *
                circumference;

              const offset =
                -acumulado *
                circumference;

              acumulado +=
                porcentagem;

              const cor =
                isPride
                  ? prideOriginColors[
                      index %
                        prideOriginColors.length
                    ]
                  : origem.cor;

              return (
                <Circle
                  key={
                    origem.nome
                  }
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={cor}
                  strokeWidth={
                    strokeWidth
                  }
                  fill="none"
                  strokeDasharray={`${segmento} ${
                    circumference -
                    segmento
                  }`}
                  strokeDashoffset={
                    offset
                  }
                  strokeLinecap="butt"
                  rotation="-90"
                  origin={`${
                    size / 2
                  }, ${
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
                  theme.colors
                    .text,
              },
            ]}
          >
            {formatarValorSemCentavos(
              total
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
            total
          </Text>
        </View>
      </View>
    </View>
  );
}

type OrigemLegendaProps = {
  origens: OrigemVisual[];
};

function OrigemLegenda({
  origens,
}: OrigemLegendaProps) {
  const {
    theme,
    activeSpecialTheme,
  } = useTheme();

  const isPride =
    activeSpecialTheme ===
    "pride";

  const total =
    origens.reduce(
      (soma, origem) =>
        soma + origem.valor,
      0
    );

  return (
    <View
      style={styles.originList}
    >
      {origens.map(
        (origem, index) => {
          const porcentagem =
            total > 0
              ? Math.round(
                  (origem.valor /
                    total) *
                    100
                )
              : 0;

          const cor =
            isPride
              ? prideOriginColors[
                  index %
                    prideOriginColors.length
                ]
              : origem.cor;

          return (
            <View
              key={origem.nome}
              style={
                styles.originRow
              }
            >
              <View
                style={[
                  styles.originDot,
                  {
                    backgroundColor:
                      cor,
                  },
                ]}
              />

              <View
                style={
                  styles.originContent
                }
              >
                <Text
                  style={[
                    styles.originName,
                    {
                      color:
                        theme
                          .colors
                          .text,
                    },
                  ]}
                >
                  {origem.nome}
                </Text>

                <Text
                  style={[
                    styles.originValue,
                    {
                      color:
                        theme
                          .colors
                          .textSecondary,
                    },
                  ]}
                >
                  {formatarValor(
                    origem.valor
                  )}
                </Text>
              </View>

              <Text
                style={[
                  styles.originPercentage,
                  {
                    color:
                      theme.colors
                        .text,
                  },
                ]}
              >
                {porcentagem}%
              </Text>
            </View>
          );
        }
      )}
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

    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 24,
    },

    backButton: {
      width: 44,
      height: 44,
      borderRadius: 14,
      borderWidth: 1,
      alignItems: "center",
      justifyContent:
        "center",
      marginRight: 14,
    },

    headerText: {
      flex: 1,
    },

    title: {
      fontSize: 28,
      fontWeight: "700",
      letterSpacing: -0.6,
    },

    subtitle: {
      fontSize: 14,
      marginTop: 2,
    },

    balanceCard: {
      borderRadius: 24,
      borderWidth: 1,
      padding: 20,
      marginBottom: 16,
    },

    balanceTop: {
      flexDirection: "row",
      alignItems: "center",
    },

    balanceContent: {
      flex: 1,
    },

    balanceLabel: {
      fontSize: 14,
      fontWeight: "600",
    },

    balance: {
      fontSize: 36,
      fontWeight: "700",
      letterSpacing: -1,
      marginTop: 4,
    },

    growthRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      marginTop: 12,
    },

    growth: {
      fontSize: 17,
      fontWeight: "700",
    },

    growthPeriod: {
      fontSize: 13,
      marginTop: 3,
      lineHeight: 18,
    },

    vaultIcon: {
      width: 64,
      height: 64,
      borderRadius: 21,
      alignItems: "center",
      justifyContent:
        "center",
      overflow: "hidden",
      marginLeft: 12,
    },

    tabs: {
      flexDirection: "row",
      borderRadius: 16,
      padding: 4,
      marginBottom: 16,
    },

    tabPressable: {
      flex: 1,
    },

    activeTab: {
      height: 44,
      borderRadius: 13,
      alignItems: "center",
      justifyContent:
        "center",
      overflow: "hidden",
    },

    inactiveTab: {
      height: 44,
      alignItems: "center",
      justifyContent:
        "center",
    },

    activeTabText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "700",
    },

    inactiveTabText: {
      fontSize: 14,
      fontWeight: "600",
    },

    sectionCard: {
      borderRadius: 22,
      borderWidth: 1,
      padding: 18,
      marginBottom: 16,
    },

    sectionTitle: {
      fontSize: 19,
      fontWeight: "700",
    },

    sectionDescription: {
      fontSize: 13,
      marginTop: 4,
      lineHeight: 18,
    },

    chart: {
      height: 205,
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent:
        "space-between",
      marginTop: 24,
    },

    chartColumn: {
      flex: 1,
      alignItems: "center",
    },

    chartValue: {
      width: "100%",
      paddingHorizontal: 2,
      fontSize: 9,
      fontWeight: "600",
      marginBottom: 6,
      textAlign: "center",
    },

    barArea: {
      width: 34,
      height: 140,
      justifyContent:
        "flex-end",
    },

    bar: {
      width: 34,
      borderRadius: 10,
    },

    chartMonth: {
      fontSize: 12,
      fontWeight: "600",
      marginTop: 8,
    },

    legend: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      flexWrap: "wrap",
      gap: 16,
      marginTop: 16,
    },

    legendItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },

    legendDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },

    legendText: {
      fontSize: 11,
      fontWeight: "600",
    },

    emptyChart: {
      minHeight: 190,
      alignItems: "center",
      justifyContent:
        "center",
      paddingHorizontal: 24,
    },

    emptyChartText: {
      fontSize: 13,
      lineHeight: 19,
      textAlign: "center",
      marginTop: 10,
    },

    originChartContainer: {
      alignItems: "center",
      justifyContent:
        "center",
      marginTop: 22,
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
      fontSize: 22,
      fontWeight: "700",
      letterSpacing: -0.5,
    },

    donutLabel: {
      fontSize: 13,
      fontWeight: "600",
      marginTop: 2,
    },

    originList: {
      marginTop: 22,
      gap: 16,
    },

    originRow: {
      flexDirection: "row",
      alignItems: "center",
    },

    originDot: {
      width: 14,
      height: 14,
      borderRadius: 7,
      marginRight: 12,
    },

    originContent: {
      flex: 1,
    },

    originName: {
      fontSize: 15,
      fontWeight: "600",
    },

    originValue: {
      fontSize: 13,
      marginTop: 2,
    },

    originPercentage: {
      fontSize: 15,
      fontWeight: "700",
      marginLeft: 12,
    },

    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginTop: 16,
    },

    statCard: {
      width: "48%",
      minHeight: 128,
      borderRadius: 17,
      padding: 14,
    },

    statValue: {
      fontSize: 20,
      fontWeight: "700",
      marginTop: 14,
    },

    statLabel: {
      fontSize: 12,
      lineHeight: 17,
      marginTop: 4,
    },

    filters: {
      marginTop: 18,
      marginHorizontal: -18,
    },

    filtersContent: {
      paddingHorizontal: 18,
      gap: 8,
    },

    activeFilter: {
      minHeight: 38,
      paddingHorizontal: 16,
      borderRadius: 19,
      alignItems: "center",
      justifyContent:
        "center",
      overflow: "hidden",
    },

    activeFilterText: {
      color: "#FFFFFF",
      fontSize: 13,
      fontWeight: "700",
    },

    inactiveFilter: {
      minHeight: 38,
      paddingHorizontal: 16,
      borderRadius: 19,
      alignItems: "center",
      justifyContent:
        "center",
    },

    inactiveFilterText: {
      fontSize: 13,
      fontWeight: "600",
    },

    monthGroups: {
      marginTop: 24,
      gap: 24,
    },

    monthGroup: {
      gap: 10,
    },

    movementMonth: {
      fontSize: 13,
      fontWeight: "700",
      textTransform:
        "uppercase",
      letterSpacing: 0.5,
    },

    movementsList: {
      borderTopWidth: 1,
      borderBottomWidth: 1,
    },

    movementRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 16,
    },

    movementIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: "center",
      justifyContent:
        "center",
      marginRight: 12,
    },

    movementContent: {
      flex: 1,
      paddingRight: 8,
    },

    movementTitle: {
      fontSize: 15,
      fontWeight: "700",
    },

    movementDescription: {
      fontSize: 12,
      marginTop: 2,
    },

    movementDate: {
      fontSize: 11,
      marginTop: 4,
    },

    movementValue: {
      fontSize: 14,
      fontWeight: "700",
      textAlign: "right",
    },

    divider: {
      height:
        StyleSheet.hairlineWidth,
      marginLeft: 56,
    },

    emptyState: {
      alignItems: "center",
      paddingVertical: 48,
      paddingHorizontal: 20,
    },

    emptyTitle: {
      fontSize: 16,
      fontWeight: "700",
      marginTop: 12,
    },

    emptyDescription: {
      fontSize: 13,
      lineHeight: 19,
      textAlign: "center",
      marginTop: 5,
    },
  });