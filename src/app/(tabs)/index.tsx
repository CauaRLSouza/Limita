import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type {
  DimensionValue,
} from "react-native";

import {
  getNewlyUnlockedAchievements,
} from "../../achievements/achievements";
import AchievementUnlock from "../../components/AchievementUnlock";
import TabHeader from "../../components/TabHeader";
import ThemeAccent from "../../components/ThemeAccent";
import {
  ClosingDecision,
  getCompletedCyclesCount,
  getQualifiedCyclesCount,
  prepareCycles,
  revealCycleClosing,
  saveClosingDecision,
  setClosingStage,
  StoredCycle,
} from "../../database/cycles";
import {
  FinancialSummary,
  getFinancialSummary,
} from "../../database/finance";
import { useTheme } from "../../theme/ThemeContext";

const bauFechado = require("../../../assets/images/bau-fechado.png");
const bauPositivo = require("../../../assets/images/bau-positivo.png");
const bauNegativo = require("../../../assets/images/bau-negativo.png");

type EstadoHome =
  | "fechado"
  | "resultado"
  | "conquista"
  | "marco"
  | "resolvido";

type MarcoDisponivel = 3 | 6 | 12;

type MarcoPadraoData = {
  ciclos: 3 | 6;
  titulo: string;
  descricao: string;
  meses: string[];
  cardTitulo: string;
  estatisticas: {
    label: string;
    value: string;
    positive?: boolean;
  }[];
  interpretacao?: {
    titulo: string;
    texto: string;
  };
  rodape: string;
};

const resumoInicial: FinancialSummary = {
  monthlyMoneyCents: 0,
  vaultCents: 0,
  currentCycleIncomeCents: 0,
  currentCycleExpenseCents: 0,
};

const marcos: Record<3 | 6, MarcoPadraoData> = {
  3: {
    ciclos: 3,
    titulo: "3 ciclos com o Límita",
    descricao:
      "Você já construiu histórico suficiente para começar a enxergar padrões na sua vida financeira.",
    meses: ["Jul", "Ago", "Set"],
    cardTitulo: "Seus primeiros padrões",
    estatisticas: [
      {
        label: "Ciclos positivos",
        value: "2 de 3",
      },
      {
        label: "Ciclos negativos",
        value: "1 de 3",
      },
      {
        label: "Resultado médio",
        value: "+R$ 184,09",
        positive: true,
      },
    ],
    rodape:
      "Quanto mais ciclos você completa, mais o Límita consegue mostrar sobre a sua evolução.",
  },

  6: {
    ciclos: 6,
    titulo: "6 ciclos com o Límita",
    descricao:
      "Meio ano da sua vida financeira já passou por aqui. Agora seus ciclos e conquistas começam a contar uma história maior.",
    meses: ["Abr", "Mai", "Jun", "Jul", "Ago", "Set"],
    cardTitulo: "Seu semestre em ciclos",
    estatisticas: [
      {
        label: "Ciclos positivos",
        value: "4 de 6",
      },
      {
        label: "Resultado acumulado",
        value: "+R$ 1.240,00",
        positive: true,
      },
      {
        label: "Resultado médio",
        value: "+R$ 206,67",
        positive: true,
      },
      {
        label: "Melhor ciclo",
        value: "Ago · +R$ 480",
      },
    ],
    interpretacao: {
      titulo: "Uma mudança apareceu",
      texto:
        "Nos últimos 3 ciclos, seus gastos foram 8% menores que nos 3 primeiros.",
    },
    rodape:
      "Com mais histórico, o Límita consegue comparar seus ciclos e mostrar como seu comportamento está mudando.",
  },
};

function formatarDataAtual() {
  const texto = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function formatarDinheiro(valorCentavos: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valorCentavos / 100);
}

function nomeMes(
  year: number,
  month: number
) {
  const texto = new Intl.DateTimeFormat(
    "pt-BR",
    {
      month: "long",
    }
  ).format(
    new Date(year, month - 1, 1)
  );

  return (
    texto.charAt(0).toUpperCase() +
    texto.slice(1)
  );
}

function estadoDoCiclo(
  ciclo: StoredCycle | null
): EstadoHome {
  if (!ciclo) {
    return "resolvido";
  }

  switch (ciclo.closingStage) {
    case "closed":
      return "fechado";

    case "result":
      return "resultado";

    case "achievement":
      return "conquista";

    case "milestone":
      return "marco";

    case "resolved":
    default:
      return "resolvido";
  }
}

function marcoDosCiclos(
  ciclosConcluidos: number
): MarcoDisponivel | null {
  if (ciclosConcluidos === 3) {
    return 3;
  }

  if (ciclosConcluidos === 6) {
    return 6;
  }

  if (ciclosConcluidos === 12) {
    return 12;
  }

  return null;
}

export default function HomeScreen() {
  const {
    theme,
    activeSpecialTheme,
    setAchievementTheme,
  } = useTheme();

  const isPride =
    activeSpecialTheme === "pride";

  const [estadoHome, setEstadoHome] =
    useState<EstadoHome>("resolvido");

  const [cicloPendente, setCicloPendente] =
    useState<StoredCycle | null>(null);

  const [resumo, setResumo] =
    useState<FinancialSummary>(
      resumoInicial
    );

  const [
    ciclosConcluidos,
    setCiclosConcluidos,
  ] = useState(0);

  const [
    ciclosQualificados,
    setCiclosQualificados,
  ] = useState(0);

  const carregarHome =
    useCallback(async () => {
      try {
        const ciclo =
          await prepareCycles();

        const [
          resumoFinanceiro,
          totalConcluidos,
          totalQualificados,
        ] = await Promise.all([
          getFinancialSummary(),
          getCompletedCyclesCount(),
          getQualifiedCyclesCount(),
        ]);

        setCicloPendente(ciclo);
        setResumo(resumoFinanceiro);
        setCiclosConcluidos(
          totalConcluidos
        );
        setCiclosQualificados(
          totalQualificados
        );
        setEstadoHome(
          estadoDoCiclo(ciclo)
        );
      } catch (error) {
        console.error(
          "Erro ao carregar Home:",
          error
        );
      }
    }, []);

  useFocusEffect(
    useCallback(() => {
      carregarHome();
    }, [carregarHome])
  );

  const fechamentoNegativo =
    (cicloPendente?.resultCents ?? 0) <
    0;

  const qualificadosAntes =
    Math.max(
      0,
      ciclosQualificados -
        (cicloPendente
          ?.qualifiedAchievement
          ? 1
          : 0)
    );

  const novasConquistas =
    cicloPendente
      ?.qualifiedAchievement
      ? getNewlyUnlockedAchievements(
          qualificadosAntes,
          ciclosQualificados
        )
      : [];

  const conquistaAtual =
    novasConquistas[0] ?? null;

  const marcoAtual =
    marcoDosCiclos(ciclosConcluidos);

  const nomeMesFechamento =
    cicloPendente
      ? nomeMes(
          cicloPendente.year,
          cicloPendente.month
        )
      : "";

  const resultadoFechamento =
    cicloPendente?.resultCents ?? 0;

  const dinheiroDoMes =
    resumo.monthlyMoneyCents;

  const rendaDoCiclo =
    resumo.currentCycleIncomeCents;

  const gastosDoCiclo =
    resumo.currentCycleExpenseCents;

  const percentualDisponivel =
    rendaDoCiclo > 0
      ? Math.max(
          0,
          Math.min(
            100,
            Math.round(
              (dinheiroDoMes /
                rendaDoCiclo) *
                100
            )
          )
        )
      : 0;

  const larguraProgresso: DimensionValue =
    `${percentualDisponivel}%`;

  async function revelarFechamento() {
    if (!cicloPendente) {
      return;
    }

    try {
      const ciclo =
        await revealCycleClosing(
          cicloPendente.id
        );

      if (!ciclo) {
        return;
      }

      setCicloPendente(ciclo);
      setEstadoHome("resultado");
    } catch (error) {
      console.error(
        "Erro ao revelar fechamento:",
        error
      );
    }
  }

  async function avancarDepoisDaDecisao(
    ciclo: StoredCycle
  ) {
    if (conquistaAtual) {
      const atualizado =
        await setClosingStage(
          ciclo.id,
          "achievement"
        );

      if (atualizado) {
        setCicloPendente(atualizado);
      }

      setEstadoHome("conquista");
      return;
    }

    if (marcoAtual) {
      const atualizado =
        await setClosingStage(
          ciclo.id,
          "milestone"
        );

      if (atualizado) {
        setCicloPendente(atualizado);
      }

      setEstadoHome("marco");
      return;
    }

    const atualizado =
      await setClosingStage(
        ciclo.id,
        "resolved"
      );

    if (atualizado) {
      setCicloPendente(atualizado);
    }

    setEstadoHome("resolvido");

    const novoResumo =
      await getFinancialSummary();

    setResumo(novoResumo);
  }

  async function resolverFechamento(
    decision: ClosingDecision
  ) {
    if (!cicloPendente) {
      return;
    }

    try {
      const ciclo =
        await saveClosingDecision(
          cicloPendente.id,
          decision
        );

      if (!ciclo) {
        return;
      }

      setCicloPendente(ciclo);

      await avancarDepoisDaDecisao(
        ciclo
      );
    } catch (error) {
      console.error(
        "Erro ao resolver fechamento:",
        error
      );
    }
  }

  async function avancarDepoisDaConquista() {
    if (!cicloPendente) {
      return;
    }

    if (marcoAtual) {
      const atualizado =
        await setClosingStage(
          cicloPendente.id,
          "milestone"
        );

      if (atualizado) {
        setCicloPendente(atualizado);
      }

      setEstadoHome("marco");
      return;
    }

    const atualizado =
      await setClosingStage(
        cicloPendente.id,
        "resolved"
      );

    if (atualizado) {
      setCicloPendente(atualizado);
    }

    setEstadoHome("resolvido");

    const novoResumo =
      await getFinancialSummary();

    setResumo(novoResumo);
  }

  async function usarTemaConquista() {
    if (!conquistaAtual) {
      await avancarDepoisDaConquista();
      return;
    }

    try {
      await avancarDepoisDaConquista();

      setAchievementTheme(
        conquistaAtual.id
      );
    } catch (error) {
      console.error(
        "Erro ao usar tema da conquista:",
        error
      );
    }
  }

  async function manterTemaAtual() {
    try {
      await avancarDepoisDaConquista();
    } catch (error) {
      console.error(
        "Erro ao continuar conquista:",
        error
      );
    }
  }

  async function concluirMarco() {
    if (!cicloPendente) {
      setEstadoHome("resolvido");
      return;
    }

    try {
      const atualizado =
        await setClosingStage(
          cicloPendente.id,
          "resolved"
        );

      if (atualizado) {
        setCicloPendente(atualizado);
      }

      setEstadoHome("resolvido");

      const novoResumo =
        await getFinancialSummary();

      setResumo(novoResumo);
    } catch (error) {
      console.error(
        "Erro ao concluir marco:",
        error
      );
    }
  }

  function renderMarcoPadrao(
    ciclos: 3 | 6
  ) {
    const marco = marcos[ciclos];

    return (
      <View
        style={[
          styles.milestoneCard,
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
            styles.milestoneIconOuter
          }
        >
          <ThemeAccent
            style={
              styles.milestoneIconInner
            }
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
            styles.milestoneEyebrow,
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
            styles.milestoneTitle,
            {
              color: theme.colors.text,
            },
          ]}
        >
          {marco.titulo}
        </Text>

        <Text
          style={[
            styles.milestoneDescription,
            {
              color:
                theme.colors
                  .textSecondary,
            },
          ]}
        >
          {marco.descricao}
        </Text>

        <View
          style={[
            styles.timelineContainer,
            marco.ciclos === 6 &&
              styles.timelineContainerSix,
          ]}
        >
          {marco.meses.map(
            (mes, index) => (
              <View
                key={`${mes}-${index}`}
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
                      styles.cyclePointActive,
                      marco.ciclos ===
                        6 &&
                        styles.cyclePointActiveSix,
                    ]}
                  >
                    <MaterialIcons
                      name="check"
                      size={
                        marco.ciclos ===
                        6
                          ? 13
                          : 15
                      }
                      color="#FFFFFF"
                    />
                  </ThemeAccent>

                  {index <
                    marco.meses.length -
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
                  {mes}
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
              {marco.cardTitulo}
            </Text>
          </View>

          <View
            style={styles.patternRows}
          >
            {marco.estatisticas.map(
              (
                estatistica,
                index
              ) => (
                <View
                  key={
                    estatistica.label
                  }
                >
                  <View
                    style={
                      styles.patternRow
                    }
                  >
                    <Text
                      style={[
                        styles.patternLabel,
                        {
                          color:
                            theme.colors
                              .textSecondary,
                        },
                      ]}
                    >
                      {
                        estatistica.label
                      }
                    </Text>

                    <Text
                      style={[
                        styles.patternValue,
                        {
                          color:
                            estatistica.positive
                              ? "#20C997"
                              : theme
                                  .colors
                                  .text,
                        },
                      ]}
                    >
                      {
                        estatistica.value
                      }
                    </Text>
                  </View>

                  {index <
                    marco.estatisticas
                      .length -
                      1 && (
                    <View
                      style={[
                        styles.patternDivider,
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

        {marco.interpretacao && (
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
                name="trending-down"
                size={22}
                color="#20C997"
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
                {
                  marco.interpretacao
                    .titulo
                }
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
                {
                  marco.interpretacao
                    .texto
                }
              </Text>
            </View>
          </View>
        )}

        <Text
          style={[
            styles.milestoneHint,
            {
              color:
                theme.colors
                  .textSecondary,
            },
          ]}
        >
          {marco.rodape}
        </Text>

        <Pressable
          onPress={concluirMarco}
          style={({ pressed }) => ({
            opacity: pressed
              ? 0.82
              : 1,
          })}
        >
          <ThemeAccent
            style={
              styles.milestoneButton
            }
          >
            <Text
              style={
                styles.milestoneButtonText
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

  function renderMarcoAnual() {
    return (
      <View
        style={[
          styles.yearCard,
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
            styles.yearCelebration
          }
        >
          <View
            style={styles.yearSparkRow}
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
                styles.yearEyebrow,
                {
                  color:
                    theme.colors
                      .primary,
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
              styles.yearNumberContainer
            }
          >
            <Text
              style={[
                styles.yearNumber,
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
                  styles.yearNumberLabel,
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
                  styles.yearNumberBrand,
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
              styles.yearIntro,
              {
                color:
                  theme.colors
                    .textSecondary,
              },
            ]}
          >
            Há 12 ciclos você começou a
            acompanhar sua vida
            financeira por aqui. Hoje
            existe uma história inteira
            para olhar para trás.
          </Text>
        </View>

        <View
          style={[
            styles.yearPeriodCard,
            {
              backgroundColor:
                theme.colors
                  .surfaceSecondary,
            },
          ]}
        >
          <View
            style={
              styles.yearPeriodTop
            }
          >
            <View
              style={
                styles.yearPeriodEdge
              }
            >
              <Text
                style={[
                  styles.yearPeriodMonth,
                  {
                    color:
                      theme.colors.text,
                  },
                ]}
              >
                Out/25
              </Text>

              <Text
                style={[
                  styles.yearPeriodLabel,
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
              style={
                styles.yearPeriodMiddle
              }
            >
              <View
                style={[
                  styles.yearPeriodLine,
                  {
                    backgroundColor:
                      theme.colors
                        .border,
                  },
                ]}
              />

              <ThemeAccent
                style={
                  styles.yearPeriodBadge
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
                  styles.yearPeriodLine,
                  {
                    backgroundColor:
                      theme.colors
                        .border,
                  },
                ]}
              />
            </View>

            <View
              style={[
                styles.yearPeriodEdge,
                styles.yearPeriodEdgeRight,
              ]}
            >
              <Text
                style={[
                  styles.yearPeriodMonth,
                  {
                    color:
                      theme.colors.text,
                  },
                ]}
              >
                Set/26
              </Text>

              <Text
                style={[
                  styles.yearPeriodLabel,
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
              styles.yearPeriodCaption,
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
          style={
            styles.yearSectionHeader
          }
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
              styles.yearSectionTitle,
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
          style={styles.yearStatsGrid}
        >
          <View
            style={[
              styles.yearStatCard,
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
                styles.yearStatValue,
                {
                  color:
                    theme.colors.text,
                },
              ]}
            >
              8 de 12
            </Text>

            <Text
              style={[
                styles.yearStatLabel,
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
              styles.yearStatCard,
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
                styles.yearStatValue,
                {
                  color: "#20C997",
                },
              ]}
            >
              +R$ 2.840
            </Text>

            <Text
              style={[
                styles.yearStatLabel,
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
              styles.yearStatCard,
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
                styles.yearStatValue,
                {
                  color:
                    theme.colors.text,
                },
              ]}
            >
              +R$ 620
            </Text>

            <Text
              style={[
                styles.yearStatLabel,
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
              styles.yearStatCard,
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
                styles.yearStatValue,
                {
                  color:
                    theme.colors.text,
                },
              ]}
            >
              +R$ 236
            </Text>

            <Text
              style={[
                styles.yearStatLabel,
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
          style={
            styles.yearSectionHeader
          }
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
              styles.yearSectionTitle,
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
            styles.yearComparisonCard,
            {
              borderColor:
                theme.colors.border,
            },
          ]}
        >
          <View
            style={
              styles.yearComparisonColumns
            }
          >
            <View
              style={
                styles.yearComparisonColumn
              }
            >
              <Text
                style={[
                  styles.yearComparisonCaption,
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
                  styles.yearComparisonValue,
                  {
                    color:
                      theme.colors.text,
                  },
                ]}
              >
                R$ 3.180
              </Text>

              <Text
                style={[
                  styles.yearComparisonLabel,
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
                styles.yearComparisonDivider,
                {
                  backgroundColor:
                    theme.colors
                      .border,
                },
              ]}
            />

            <View
              style={
                styles.yearComparisonColumn
              }
            >
              <Text
                style={[
                  styles.yearComparisonCaption,
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
                  styles.yearComparisonValue,
                  {
                    color:
                      theme.colors.text,
                  },
                ]}
              >
                R$ 2.830
              </Text>

              <Text
                style={[
                  styles.yearComparisonLabel,
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
              styles.yearComparisonResult,
              {
                backgroundColor:
                  theme.colors
                    .surfaceSecondary,
              },
            ]}
          >
            <MaterialIcons
              name="south-east"
              size={20}
              color="#20C997"
            />

            <Text
              style={[
                styles.yearComparisonResultText,
                {
                  color:
                    theme.colors.text,
                },
              ]}
            >
              <Text
                style={{
                  color: "#20C997",
                  fontWeight: "800",
                }}
              >
                R$ 350 a menos
              </Text>{" "}
              por ciclo, em média.
            </Text>
          </View>
        </View>

        <View
          style={
            styles.yearSectionHeader
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
              styles.yearSectionTitle,
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
            styles.yearInsightCard,
            {
              borderColor:
                theme.colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.yearInsightIcon,
              {
                backgroundColor:
                  theme.colors
                    .surfaceSecondary,
              },
            ]}
          >
            <MaterialIcons
              name="trending-down"
              size={23}
              color="#20C997"
            />
          </View>

          <View
            style={
              styles.yearInsightContent
            }
          >
            <Text
              style={[
                styles.yearInsightTitle,
                {
                  color:
                    theme.colors.text,
                },
              ]}
            >
              Seus gastos diminuíram
            </Text>

            <Text
              style={[
                styles.yearInsightText,
                {
                  color:
                    theme.colors
                      .textSecondary,
                },
              ]}
            >
              Nos últimos 3 ciclos, você
              gastou 11% menos que nos 3
              primeiros.
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.yearInsightCard,
            {
              borderColor:
                theme.colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.yearInsightIcon,
              {
                backgroundColor:
                  theme.colors
                    .surfaceSecondary,
              },
            ]}
          >
            <MaterialIcons
              name="restaurant"
              size={22}
              color={
                theme.colors.primary
              }
            />
          </View>

          <View
            style={
              styles.yearInsightContent
            }
          >
            <Text
              style={[
                styles.yearInsightTitle,
                {
                  color:
                    theme.colors.text,
                },
              ]}
            >
              Alimentação marcou seu ano
            </Text>

            <Text
              style={[
                styles.yearInsightText,
                {
                  color:
                    theme.colors
                      .textSecondary,
                },
              ]}
            >
              Foi sua maior categoria no
              período, representando 24%
              dos seus gastos.
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.yearClosing,
            {
              backgroundColor:
                theme.colors
                  .surfaceSecondary,
            },
          ]}
        >
          <ThemeAccent
            style={
              styles.yearClosingIcon
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
              styles.yearClosingTitle,
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
              styles.yearClosingText,
              {
                color:
                  theme.colors
                    .textSecondary,
              },
            ]}
          >
            Durante 12 ciclos, você
            construiu uma visão da sua
            vida financeira que não
            existia quando começou.
          </Text>

          <Text
            style={[
              styles.yearThanks,
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
          onPress={concluirMarco}
          style={({ pressed }) => ({
            opacity: pressed
              ? 0.82
              : 1,
          })}
        >
          <ThemeAccent
            style={styles.yearButton}
          >
            <Text
              style={
                styles.yearButtonText
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

      <View
        style={
          styles.greetingContainer
        }
      >
        <Text
          style={[
            styles.greeting,
            {
              color: theme.colors.text,
            },
          ]}
        >
          Olá, Cacá!{" "}
          {isPride ? "🏳️‍🌈" : "👋"}
        </Text>

        <Text
          style={[
            styles.date,
            {
              color:
                theme.colors
                  .textSecondary,
            },
          ]}
        >
          {formatarDataAtual()}
        </Text>
      </View>

      {estadoHome === "fechado" &&
        cicloPendente && (
          <View
            style={[
              styles.closingCard,
              {
                backgroundColor:
                  theme.colors.surface,
                borderColor:
                  theme.colors.border,
              },
            ]}
          >
            <View
              style={styles.closingTop}
            >
              <Text
                style={[
                  styles.closingEyebrow,
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
                  styles.closingTitle,
                  {
                    color:
                      theme.colors.text,
                  },
                ]}
              >
                Seu ciclo de{" "}
                {nomeMesFechamento.toLowerCase()}{" "}
                terminou
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
              onPress={
                revelarFechamento
              }
              style={({ pressed }) => ({
                opacity: pressed
                  ? 0.82
                  : 1,
              })}
            >
              <ThemeAccent
                style={
                  styles.revealButton
                }
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
        )}

      {estadoHome === "resultado" &&
        cicloPendente && (
          <View
            style={[
              styles.closingCard,
              {
                backgroundColor:
                  theme.colors.surface,
                borderColor:
                  theme.colors.border,
              },
            ]}
          >
            <View
              style={styles.closingTop}
            >
              <Text
                style={[
                  styles.closingEyebrow,
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
                  styles.closingTitle,
                  {
                    color:
                      theme.colors.text,
                  },
                ]}
              >
                {nomeMesFechamento} terminou
                no{" "}
                {fechamentoNegativo
                  ? "negativo"
                  : "positivo"}
              </Text>
            </View>

            <Image
              source={
                fechamentoNegativo
                  ? bauNegativo
                  : bauPositivo
              }
              style={
                styles.closingImage
              }
              resizeMode="contain"
            />

            <View
              style={
                styles.closingResult
              }
            >
              <Text
                style={[
                  styles.closingResultLabel,
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
                  styles.closingValue,
                  {
                    color:
                      fechamentoNegativo
                        ? "#FF5A67"
                        : theme.colors
                            .text,
                  },
                ]}
              >
                {formatarDinheiro(
                  Math.abs(
                    resultadoFechamento
                  )
                )}
              </Text>

              <Text
                style={[
                  styles.closingAvailable,
                  {
                    color:
                      theme.colors
                        .textSecondary,
                  },
                ]}
              >
                {fechamentoNegativo
                  ? "de déficit"
                  : "disponíveis"}
              </Text>
            </View>

            <View
              style={[
                styles.closingDivider,
                {
                  backgroundColor:
                    theme.colors.border,
                },
              ]}
            />

            <Text
              style={[
                styles.closingQuestion,
                {
                  color:
                    theme.colors.text,
                },
              ]}
            >
              {fechamentoNegativo
                ? "Como você quer lidar com esse déficit?"
                : "O que você quer fazer com essa sobra?"}
            </Text>

            {fechamentoNegativo ? (
              <>
                <Pressable
                  onPress={() =>
                    resolverFechamento(
                      "negative_from_vault"
                    )
                  }
                  style={({
                    pressed,
                  }) => ({
                    opacity: pressed
                      ? 0.82
                      : 1,
                  })}
                >
                  <ThemeAccent
                    style={
                      styles.primaryClosingButton
                    }
                  >
                    <MaterialIcons
                      name="savings"
                      size={22}
                      color="#FFFFFF"
                    />

                    <Text
                      style={
                        styles.primaryClosingButtonText
                      }
                    >
                      Descontar do Cofre
                    </Text>
                  </ThemeAccent>
                </Pressable>

                <Pressable
                  onPress={() =>
                    resolverFechamento(
                      "negative_carry"
                    )
                  }
                  style={({
                    pressed,
                  }) => [
                    styles.secondaryClosingButton,
                    {
                      borderColor:
                        theme.colors
                          .border,
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
                      theme.colors
                        .primary
                    }
                  />

                  <Text
                    style={[
                      styles.secondaryClosingButtonText,
                      {
                        color:
                          theme.colors
                            .text,
                      },
                    ]}
                  >
                    Levar para o próximo
                    ciclo
                  </Text>
                </Pressable>

                <Text
                  style={[
                    styles.closingHint,
                    {
                      color:
                        theme.colors
                          .textSecondary,
                    },
                  ]}
                >
                  Se levar o déficit
                  adiante, o próximo ciclo
                  começará com esse valor
                  já comprometido.
                </Text>
              </>
            ) : (
              <>
                <Pressable
                  onPress={() =>
                    resolverFechamento(
                      "positive_to_vault"
                    )
                  }
                  style={({
                    pressed,
                  }) => ({
                    opacity: pressed
                      ? 0.82
                      : 1,
                  })}
                >
                  <ThemeAccent
                    style={
                      styles.primaryClosingButton
                    }
                  >
                    <MaterialIcons
                      name="savings"
                      size={22}
                      color="#FFFFFF"
                    />

                    <Text
                      style={
                        styles.primaryClosingButtonText
                      }
                    >
                      Levar para o Cofre
                    </Text>
                  </ThemeAccent>
                </Pressable>

                <Pressable
                  onPress={() =>
                    resolverFechamento(
                      "positive_keep_monthly"
                    )
                  }
                  style={({
                    pressed,
                  }) => [
                    styles.secondaryClosingButton,
                    {
                      borderColor:
                        theme.colors
                          .border,
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
                      theme.colors
                        .primary
                    }
                  />

                  <Text
                    style={[
                      styles.secondaryClosingButtonText,
                      {
                        color:
                          theme.colors
                            .text,
                      },
                    ]}
                  >
                    Manter no dinheiro do
                    mês
                  </Text>
                </Pressable>

                <Text
                  style={[
                    styles.closingHint,
                    {
                      color:
                        theme.colors
                          .textSecondary,
                    },
                  ]}
                >
                  Essa escolha define onde
                  a sobra do ciclo anterior
                  ficará disponível.
                </Text>
              </>
            )}
          </View>
        )}

      {estadoHome === "conquista" &&
        conquistaAtual && (
          <AchievementUnlock
            achievement={
              conquistaAtual
            }
            onUseTheme={
              usarTemaConquista
            }
            onKeepTheme={
              manterTemaAtual
            }
          />
        )}

      {estadoHome === "marco" &&
        marcoAtual === 3 &&
        renderMarcoPadrao(3)}

      {estadoHome === "marco" &&
        marcoAtual === 6 &&
        renderMarcoPadrao(6)}

      {estadoHome === "marco" &&
        marcoAtual === 12 &&
        renderMarcoAnual()}

      {estadoHome === "resolvido" && (
        <>
          <Pressable
            onPress={() =>
              router.push("/cofre")
            }
            style={({ pressed }) => [
              styles.card,
              styles.cofreCard,
              {
                backgroundColor:
                  theme.colors.surface,
                borderColor:
                  theme.colors.border,
                opacity: pressed
                  ? 0.82
                  : 1,
              },
            ]}
          >
            <View
              style={
                styles.cofreContent
              }
            >
              <View
                style={
                  styles.cofreText
                }
              >
                <Text
                  style={[
                    styles.cardTitle,
                    {
                      color:
                        theme.colors
                          .textSecondary,
                    },
                  ]}
                >
                  Cofre
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
                  {formatarDinheiro(
                    resumo.vaultCents
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
                  O que você já conquistou
                </Text>
              </View>

              <MaterialIcons
                name="chevron-right"
                size={28}
                color={
                  theme.colors
                    .textSecondary
                }
              />
            </View>
          </Pressable>

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
            <Text
              style={[
                styles.monthTitle,
                {
                  color:
                    theme.colors.text,
                },
              ]}
            >
              Dinheiro do mês
            </Text>

            <View
              style={
                styles.monthValues
              }
            >
              <Text
                style={[
                  styles.monthBalance,
                  {
                    color:
                      theme.colors.text,
                  },
                ]}
              >
                {formatarDinheiro(
                  dinheiroDoMes
                )}
              </Text>

              <Text
                style={[
                  styles.monthTotal,
                  {
                    color:
                      theme.colors
                        .textSecondary,
                  },
                ]}
              >
                de{" "}
                {formatarDinheiro(
                  rendaDoCiclo
                )}
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
              <ThemeAccent
                style={[
                  styles.progressFill,
                  {
                    width:
                      larguraProgresso,
                  },
                ]}
              />
            </View>

            <View
              style={
                styles.monthSummary
              }
            >
              <Text
                style={[
                  styles.spent,
                  {
                    color:
                      theme.colors
                        .textSecondary,
                  },
                ]}
              >
                {formatarDinheiro(
                  gastosDoCiclo
                )}{" "}
                gastos
              </Text>

              <Text
                style={[
                  styles.remaining,
                  {
                    color:
                      theme.colors
                        .textSecondary,
                  },
                ]}
              >
                {percentualDisponivel}%
                disponível
              </Text>
            </View>
          </View>
        </>
      )}

      <Text
        style={[
          styles.sectionTitle,
          {
            color: theme.colors.text,
          },
        ]}
      >
        Ações rápidas
      </Text>

      <View style={styles.actions}>
        <Pressable
          onPress={() =>
            router.push(
              "/registrar-movimentacao"
            )
          }
          style={[
            styles.actionCard,
            {
              backgroundColor:
                theme.colors.surface,
              borderColor:
                theme.colors.border,
            },
          ]}
        >
          <ThemeAccent
            style={styles.actionIcon}
          >
            <MaterialIcons
              name="swap-vert"
              size={28}
              color="#FFFFFF"
            />
          </ThemeAccent>

          <Text
            style={[
              styles.actionText,
              {
                color:
                  theme.colors.text,
              },
            ]}
          >
            Registrar movimentação
          </Text>
        </Pressable>

        <Pressable
          onPress={() =>
            router.push(
              "/novo-orcamento"
            )
          }
          style={[
            styles.actionCard,
            {
              backgroundColor:
                theme.colors.surface,
              borderColor:
                theme.colors.border,
            },
          ]}
        >
          {isPride ? (
            <ThemeAccent
              style={styles.actionIcon}
            >
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
                    theme.colors
                      .surfaceSecondary,
                },
              ]}
            >
              <MaterialIcons
                name="add"
                size={30}
                color={
                  theme.colors.primary
                }
              />
            </View>
          )}

          <Text
            style={[
              styles.actionText,
              {
                color:
                  theme.colors.text,
              },
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

  milestoneCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    overflow: "hidden",
    alignItems: "center",
  },

  milestoneIconOuter: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    marginBottom: 14,
  },

  milestoneIconInner: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  milestoneEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.1,
  },

  milestoneTitle: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "800",
    letterSpacing: -0.6,
    textAlign: "center",
    marginTop: 5,
  },

  milestoneDescription: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "500",
    textAlign: "center",
    paddingHorizontal: 6,
    marginTop: 10,
  },

  timelineContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 28,
    marginBottom: 26,
    paddingHorizontal: 18,
  },

  timelineContainerSix: {
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

  cyclePointActive: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    zIndex: 2,
  },

  cyclePointActiveSix: {
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

  patternRows: {
    width: "100%",
  },

  patternRow: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  patternDivider: {
    height: 1,
    width: "100%",
  },

  patternLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
  },

  patternValue: {
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

  milestoneHint: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "500",
    textAlign: "center",
    paddingHorizontal: 8,
    marginTop: 17,
    marginBottom: 17,
  },

  milestoneButton: {
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

  milestoneButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  yearCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    overflow: "hidden",
  },

  yearCelebration: {
    alignItems: "center",
    paddingTop: 8,
  },

  yearSparkRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  yearEyebrow: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.4,
  },

  yearNumberContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 12,
  },

  yearNumber: {
    fontSize: 72,
    lineHeight: 76,
    fontWeight: "900",
    letterSpacing: -4,
  },

  yearNumberLabel: {
    fontSize: 30,
    lineHeight: 33,
    fontWeight: "800",
    letterSpacing: -0.8,
  },

  yearNumberBrand: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "700",
  },

  yearIntro: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "500",
    textAlign: "center",
    paddingHorizontal: 6,
    marginTop: 14,
  },

  yearPeriodCard: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 17,
    paddingBottom: 13,
    marginTop: 24,
  },

  yearPeriodTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  yearPeriodEdge: {
    width: 62,
  },

  yearPeriodEdgeRight: {
    alignItems: "flex-end",
  },

  yearPeriodMonth: {
    fontSize: 14,
    fontWeight: "800",
  },

  yearPeriodLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },

  yearPeriodMiddle: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5,
  },

  yearPeriodLine: {
    flex: 1,
    height: 2,
  },

  yearPeriodBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginHorizontal: 5,
  },

  yearPeriodCaption: {
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 10,
  },

  yearSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginTop: 27,
    marginBottom: 13,
  },

  yearSectionTitle: {
    flex: 1,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "800",
  },

  yearStatsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  yearStatCard: {
    width: "48.4%",
    minHeight: 128,
    borderRadius: 18,
    padding: 15,
    justifyContent: "space-between",
  },

  yearStatValue: {
    fontSize: 21,
    lineHeight: 27,
    fontWeight: "800",
    letterSpacing: -0.4,
    marginTop: 11,
  },

  yearStatLabel: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
    marginTop: 3,
  },

  yearComparisonCard: {
    borderWidth: 1,
    borderRadius: 18,
    overflow: "hidden",
  },

  yearComparisonColumns: {
    flexDirection: "row",
    padding: 16,
  },

  yearComparisonColumn: {
    flex: 1,
  },

  yearComparisonDivider: {
    width: 1,
    marginHorizontal: 14,
  },

  yearComparisonCaption: {
    fontSize: 9,
    lineHeight: 13,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  yearComparisonValue: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.4,
    marginTop: 8,
  },

  yearComparisonLabel: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "600",
    marginTop: 2,
  },

  yearComparisonResult: {
    minHeight: 55,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 14,
  },

  yearComparisonResultText: {
    flexShrink: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },

  yearInsightCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 15,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 10,
  },

  yearInsightIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  yearInsightContent: {
    flex: 1,
  },

  yearInsightTitle: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "800",
  },

  yearInsightText: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "500",
    marginTop: 3,
  },

  yearClosing: {
    borderRadius: 20,
    paddingHorizontal: 19,
    paddingVertical: 22,
    alignItems: "center",
    marginTop: 18,
  },

  yearClosingIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: 13,
  },

  yearClosingTitle: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "800",
    textAlign: "center",
  },

  yearClosingText: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 8,
  },

  yearThanks: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 11,
  },

  yearButton: {
    minHeight: 54,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    overflow: "hidden",
    marginTop: 18,
  },

  yearButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
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