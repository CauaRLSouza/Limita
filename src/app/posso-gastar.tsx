import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

import CategoryPicker, {
  Categoria,
  categoriasGasto,
} from "../components/CategoryPicker";
import ThemeAccent from "../components/ThemeAccent";
import { hasApplicableBudget } from "../database/budgets";
import { createTransaction } from "../database/transactions";
import {
  CanISpendResult,
  simulateCanISpend,
} from "../insights/CanISpend";
import {
  buildCanISpendAnalysis,
  CanISpendAnalysis,
  CanISpendAnalysisPoint,
} from "../insights/CanISpendAnalysis";
import { useTheme } from "../theme/ThemeContext";

type MaterialIconName =
  React.ComponentProps<
    typeof MaterialIcons
  >["name"];

type AnalysisPage = {
  key: string;
  icon: MaterialIconName;
  eyebrow: string;
  title: string;
  text: string;
  final: boolean;
};

type FeedbackState = {
  visible: boolean;
  message: string;
};

function formatarCentavos(
  centavos: number
) {
  return (
    centavos / 100
  ).toLocaleString(
    "pt-BR",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  );
}

function extrairCentavos(
  texto: string
) {
  const numeros =
    texto.replace(/\D/g, "");

  if (!numeros) {
    return 0;
  }

  const valor =
    Number(numeros);

  if (
    !Number.isFinite(valor) ||
    valor < 0
  ) {
    return 0;
  }

  return valor;
}

function getPointIcon(
  point: CanISpendAnalysisPoint
): MaterialIconName {
  switch (point.key) {
    case "budget":
      return "account-balance-wallet";

    case "scheduled_outflow":
      return "event";

    case "future_income":
      return "payments";

    case "spending_pace":
      return "speed";

    case "cycle_time":
      return "schedule";

    default:
      return "info-outline";
  }
}

function getPointEyebrow(
  point: CanISpendAnalysisPoint
) {
  switch (point.key) {
    case "budget":
      return "Seu planejamento";

    case "scheduled_outflow":
      return "Compromissos";

    case "future_income":
      return "Próximos recebimentos";

    case "spending_pace":
      return "Seu comportamento";

    case "cycle_time":
      return "Seu ciclo";

    default:
      return "Contexto";
  }
}

function buildPages(
  analysis: CanISpendAnalysis
): AnalysisPage[] {
  const contextPages =
    analysis.points.map(
      (point) => ({
        key: point.key,
        icon:
          getPointIcon(
            point
          ),
        eyebrow:
          getPointEyebrow(
            point
          ),
        title: point.title,
        text: point.text,
        final: false,
      })
    );

  return [
    {
      key: "impact",
      icon:
        "account-balance-wallet",
      eyebrow:
        "Impacto imediato",
      title:
        analysis.headline,
      text:
        analysis.summary,
      final: false,
    },
    ...contextPages,
    {
      key: "consideration",
      icon:
        "lightbulb-outline",
      eyebrow:
        "Análise do Límita",
      title:
        "O que considerar",
      text:
        analysis.consideration,
      final: true,
    },
  ];
}

export default function PossoGastarScreen() {
  const {
    theme,
    activeSpecialTheme,
  } = useTheme();

  const {
    width: screenWidth,
  } = useWindowDimensions();

  const isPride =
    activeSpecialTheme ===
    "pride";

  const horizontalPadding =
    20;

  const pageWidth =
    screenWidth -
    horizontalPadding * 2;

  const scrollRef =
    useRef<ScrollView | null>(
      null
    );

  const [
    valorCentavos,
    setValorCentavos,
  ] = useState(0);

  const [
    categoriaSelecionada,
    setCategoriaSelecionada,
  ] = useState<Categoria>(
    categoriasGasto[0]
  );

  const [
    mostrarSeletorCategoria,
    setMostrarSeletorCategoria,
  ] = useState(false);

  const [
    possuiOrcamento,
    setPossuiOrcamento,
  ] = useState(false);

  const [
    descontarDoOrcamento,
    setDescontarDoOrcamento,
  ] = useState(true);

  const [
    carregandoContexto,
    setCarregandoContexto,
  ] = useState(true);

  const [
    analisando,
    setAnalisando,
  ] = useState(false);

  const [
    registrando,
    setRegistrando,
  ] = useState(false);

  const [
    resultado,
    setResultado,
  ] =
    useState<CanISpendResult | null>(
      null
    );

  const [
    analise,
    setAnalise,
  ] =
    useState<CanISpendAnalysis | null>(
      null
    );

  const [
    paginaAtual,
    setPaginaAtual,
  ] = useState(0);

  const [
    feedback,
    setFeedback,
  ] =
    useState<FeedbackState>({
      visible: false,
      message: "",
    });

  useEffect(() => {
    let ativo = true;

    async function carregarContexto() {
      try {
        const existe =
          await hasApplicableBudget(
            new Date()
          );

        if (ativo) {
          setPossuiOrcamento(
            existe
          );

          if (!existe) {
            setDescontarDoOrcamento(
              false
            );
          }
        }
      } catch (error) {
        console.error(
          "Erro ao verificar orçamento aplicável:",
          error
        );

        if (ativo) {
          setPossuiOrcamento(
            false
          );

          setDescontarDoOrcamento(
            false
          );
        }
      } finally {
        if (ativo) {
          setCarregandoContexto(
            false
          );
        }
      }
    }

    carregarContexto();

    return () => {
      ativo = false;
    };
  }, []);

  const valor =
    formatarCentavos(
      valorCentavos
    );

  const paginas =
    analise
      ? buildPages(
          analise
        )
      : [];

  const ultimaPagina =
    paginas.length > 0 &&
    paginaAtual ===
      paginas.length - 1;

  function alterarValor(
    texto: string
  ) {
    setValorCentavos(
      extrairCentavos(
        texto
      )
    );

    setFeedback({
      visible: false,
      message: "",
    });
  }

  function selecionarCategoria(
    categoria: Categoria
  ) {
    setCategoriaSelecionada(
      categoria
    );

    setMostrarSeletorCategoria(
      false
    );
  }

  async function analisarGasto() {
    if (
      analisando ||
      carregandoContexto
    ) {
      return;
    }

    if (
      valorCentavos <= 0
    ) {
      setFeedback({
        visible: true,
        message:
          "Informe um valor maior que zero para fazer a simulação.",
      });

      return;
    }

    setAnalisando(true);

    setFeedback({
      visible: false,
      message: "",
    });

    try {
      const simulacao =
        await simulateCanISpend(
          valorCentavos,
          possuiOrcamento
            ? descontarDoOrcamento
            : false
        );

      const novaAnalise =
        buildCanISpendAnalysis(
          simulacao
        );

      setResultado(
        simulacao
      );

      setAnalise(
        novaAnalise
      );

      setPaginaAtual(0);

      requestAnimationFrame(
        () => {
          scrollRef.current?.scrollTo({
            x: 0,
            animated: false,
          });
        }
      );
    } catch (error) {
      console.error(
        "Erro ao simular gasto:",
        error
      );

      setFeedback({
        visible: true,
        message:
          error instanceof Error
            ? error.message
            : "Não foi possível analisar este gasto agora.",
      });
    } finally {
      setAnalisando(
        false
      );
    }
  }

  function editarSimulacao() {
    if (registrando) {
      return;
    }

    setResultado(null);
    setAnalise(null);
    setPaginaAtual(0);

    setFeedback({
      visible: false,
      message: "",
    });
  }

  function encerrarSimulacao() {
    if (registrando) {
      return;
    }

    router.back();
  }

  async function registrarGasto() {
    if (
      registrando ||
      !resultado
    ) {
      return;
    }

    setRegistrando(true);

    setFeedback({
      visible: false,
      message: "",
    });

    try {
      await createTransaction({
        type: "expense",
        amountCents:
          resultado.simulatedAmountCents,
        date: new Date(),
        category:
          categoriaSelecionada.id,
        bucket:
          "monthly_money",
        countsTowardBudget:
          possuiOrcamento
            ? descontarDoOrcamento
            : true,
        description: "",
      });

      router.back();
    } catch (error) {
      console.error(
        "Erro ao registrar gasto da simulação:",
        error
      );

      setFeedback({
        visible: true,
        message:
          error instanceof Error
            ? error.message
            : "Não foi possível registrar este gasto agora.",
      });
    } finally {
      setRegistrando(
        false
      );
    }
  }

  function atualizarPagina(
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) {
    if (
      pageWidth <= 0
    ) {
      return;
    }

    const offset =
      event.nativeEvent
        .contentOffset.x;

    const novaPagina =
      Math.round(
        offset /
          pageWidth
      );

    if (
      novaPagina >= 0 &&
      novaPagina <
        paginas.length
    ) {
      setPaginaAtual(
        novaPagina
      );
    }
  }

  function irParaPagina(
    index: number
  ) {
    scrollRef.current?.scrollTo({
      x:
        index *
        pageWidth,
      animated: true,
    });

    setPaginaAtual(
      index
    );
  }

  function renderPrimaryButton(
    label: string,
    onPress: () => void,
    disabled = false
  ) {
    if (isPride) {
      return (
        <Pressable
          onPress={onPress}
          disabled={disabled}
          style={{
            opacity:
              disabled
                ? 0.65
                : 1,
          }}
        >
          <ThemeAccent
            style={
              styles.primaryButton
            }
          >
            <Text
              style={
                styles.primaryButtonText
              }
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
        disabled={disabled}
        style={[
          styles.primaryButton,
          {
            backgroundColor:
              theme.colors.primary,
            opacity:
              disabled
                ? 0.65
                : 1,
          },
        ]}
      >
        <Text
          style={
            styles.primaryButtonText
          }
        >
          {label}
        </Text>
      </Pressable>
    );
  }

  if (
    resultado &&
    analise
  ) {
    return (
      <View
        style={
          styles.resultScreen
        }
      >
        <View
          style={
            styles.resultHeader
          }
        >
          <Pressable
            onPress={
              editarSimulacao
            }
            disabled={
              registrando
            }
            style={
              styles.backButton
            }
          >
            <MaterialIcons
              name="arrow-back"
              size={28}
              color={
                theme.colors.text
              }
            />
          </Pressable>

          <View
            style={
              styles.resultHeaderContent
            }
          >
            <Text
              style={[
                styles.headerTitle,
                {
                  color:
                    theme.colors.text,
                },
              ]}
            >
              Posso gastar?
            </Text>

            <Text
              style={[
                styles.simulationValue,
                {
                  color:
                    theme.colors
                      .textSecondary,
                },
              ]}
            >
              Simulação de R${" "}
              {formatarCentavos(
                resultado
                  .simulatedAmountCents
              )}
            </Text>
          </View>
        </View>

        <View
          style={
            styles.carouselArea
          }
        >
          <ScrollView
            ref={
              scrollRef
            }
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={
              false
            }
            decelerationRate="fast"
            snapToInterval={
              pageWidth
            }
            snapToAlignment="start"
            disableIntervalMomentum
            onMomentumScrollEnd={
              atualizarPagina
            }
            contentContainerStyle={{
              paddingHorizontal:
                horizontalPadding,
            }}
          >
            {paginas.map(
              (pagina) => (
                <View
                  key={
                    pagina.key
                  }
                  style={[
                    styles.page,
                    {
                      width:
                        pageWidth,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.analysisCard,
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
                    <View
                      style={[
                        styles.analysisIcon,
                        {
                          backgroundColor:
                            theme.colors
                              .primarySoft,
                        },
                      ]}
                    >
                      <MaterialIcons
                        name={
                          pagina.icon
                        }
                        size={32}
                        color={
                          theme.colors
                            .primary
                        }
                      />
                    </View>

                    <Text
                      style={[
                        styles.eyebrow,
                        {
                          color:
                            theme.colors
                              .primary,
                        },
                      ]}
                    >
                      {
                        pagina.eyebrow
                      }
                    </Text>

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
                      {
                        pagina.title
                      }
                    </Text>

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
                      {
                        pagina.text
                      }
                    </Text>

                    {pagina.final && (
                      <View
                        style={
                          styles.finalActions
                        }
                      >
                        {feedback.visible && (
                          <View
                            style={
                              styles.resultFeedback
                            }
                          >
                            <MaterialIcons
                              name="info-outline"
                              size={18}
                              color={
                                theme.colors
                                  .warning
                              }
                            />

                            <Text
                              style={[
                                styles.resultFeedbackText,
                                {
                                  color:
                                    theme.colors
                                      .warning,
                                },
                              ]}
                            >
                              {
                                feedback.message
                              }
                            </Text>
                          </View>
                        )}

                        {renderPrimaryButton(
                          registrando
                            ? "Registrando..."
                            : "Registrar gasto",
                          registrarGasto,
                          registrando
                        )}

                        <Pressable
                          onPress={
                            encerrarSimulacao
                          }
                          disabled={
                            registrando
                          }
                          style={[
                            styles.secondaryButton,
                            {
                              borderColor:
                                theme.colors
                                  .border,
                              backgroundColor:
                                theme.colors
                                  .surfaceSecondary,
                              opacity:
                                registrando
                                  ? 0.65
                                  : 1,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.secondaryButtonText,
                              {
                                color:
                                  theme.colors
                                    .text,
                              },
                            ]}
                          >
                            Encerrar simulação
                          </Text>
                        </Pressable>
                      </View>
                    )}
                  </View>
                </View>
              )
            )}
          </ScrollView>
        </View>

        <View
          style={
            styles.paginationArea
          }
        >
          <View
            style={
              styles.dots
            }
          >
            {paginas.map(
              (
                pagina,
                index
              ) => (
                <Pressable
                  key={
                    pagina.key
                  }
                  onPress={() =>
                    irParaPagina(
                      index
                    )
                  }
                  hitSlop={8}
                >
                  <View
                    style={[
                      styles.dot,
                      {
                        width:
                          index ===
                          paginaAtual
                            ? 22
                            : 8,
                        backgroundColor:
                          index ===
                          paginaAtual
                            ? theme
                                .colors
                                .primary
                            : theme
                                .colors
                                .border,
                      },
                    ]}
                  />
                </Pressable>
              )
            )}
          </View>

          {!ultimaPagina && (
            <View
              style={
                styles.swipeHint
              }
            >
              <Text
                style={[
                  styles.swipeHintText,
                  {
                    color:
                      theme.colors
                        .textSecondary,
                  },
                ]}
              >
                Deslize para continuar
              </Text>

              <MaterialIcons
                name="arrow-forward"
                size={17}
                color={
                  theme.colors
                    .textSecondary
                }
              />
            </View>
          )}
        </View>
      </View>
    );
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
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={
            styles.header
          }
        >
          <Pressable
            onPress={() =>
              router.back()
            }
            style={
              styles.backButton
            }
          >
            <MaterialIcons
              name="arrow-back"
              size={28}
              color={
                theme.colors.text
              }
            />
          </Pressable>

          <Text
            style={[
              styles.headerTitle,
              {
                color:
                  theme.colors.text,
              },
            ]}
          >
            Posso gastar?
          </Text>
        </View>

        <View
          style={[
            styles.introCard,
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
              styles.introIcon,
              {
                backgroundColor:
                  theme.colors
                    .primarySoft,
              },
            ]}
          >
            <MaterialIcons
              name="calculate"
              size={28}
              color={
                theme.colors.primary
              }
            />
          </View>

          <View
            style={
              styles.introContent
            }
          >
            <Text
              style={[
                styles.introTitle,
                {
                  color:
                    theme.colors.text,
                },
              ]}
            >
              Veja o impacto antes de gastar
            </Text>

            <Text
              style={[
                styles.introText,
                {
                  color:
                    theme.colors
                      .textSecondary,
                },
              ]}
            >
              Simule uma compra e veja como ela afetaria seu ciclo antes de decidir.
            </Text>
          </View>
        </View>

        <Text
          style={[
            styles.label,
            {
              color:
                theme.colors.text,
            },
          ]}
        >
          Quanto você pretende gastar?
        </Text>

        <View
          style={[
            styles.valueCard,
            {
              backgroundColor:
                theme.colors.surface,
              borderColor:
                feedback.visible
                  ? theme.colors.warning
                  : theme.colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.currency,
              {
                color:
                  theme.colors
                    .textSecondary,
              },
            ]}
          >
            R$
          </Text>

          <TextInput
            value={valor}
            onChangeText={
              alterarValor
            }
            keyboardType="number-pad"
            style={[
              styles.valueInput,
              {
                color:
                  theme.colors.text,
              },
            ]}
          />
        </View>

        {feedback.visible && (
          <View
            style={
              styles.feedbackRow
            }
          >
            <MaterialIcons
              name="info-outline"
              size={18}
              color={
                theme.colors.warning
              }
            />

            <Text
              style={[
                styles.feedbackText,
                {
                  color:
                    theme.colors.warning,
                },
              ]}
            >
              {
                feedback.message
              }
            </Text>
          </View>
        )}

        <Text
          style={[
            styles.label,
            styles.categoryLabel,
            {
              color:
                theme.colors.text,
            },
          ]}
        >
          Categoria
        </Text>

        <Pressable
          onPress={() =>
            setMostrarSeletorCategoria(
              true
            )
          }
          style={[
            styles.categoryField,
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
              styles.categoryLeft
            }
          >
            <View
              style={[
                styles.categoryIcon,
                {
                  backgroundColor:
                    categoriaSelecionada.cor,
                },
              ]}
            >
              <MaterialIcons
                name={
                  categoriaSelecionada.icon
                }
                size={19}
                color="#FFFFFF"
              />
            </View>

            <Text
              style={[
                styles.categoryText,
                {
                  color:
                    theme.colors.text,
                },
              ]}
            >
              {
                categoriaSelecionada.nome
              }
            </Text>
          </View>

          <MaterialIcons
            name="chevron-right"
            size={24}
            color={
              theme.colors
                .textSecondary
            }
          />
        </Pressable>

        {carregandoContexto ? (
          <View
            style={
              styles.loadingContext
            }
          >
            <ActivityIndicator
              color={
                theme.colors.primary
              }
            />

            <Text
              style={[
                styles.loadingContextText,
                {
                  color:
                    theme.colors
                      .textSecondary,
                },
              ]}
            >
              Preparando contexto...
            </Text>
          </View>
        ) : (
          possuiOrcamento && (
            <View
              style={[
                styles.budgetCard,
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
                  styles.budgetHeader
                }
              >
                <View
                  style={[
                    styles.budgetIcon,
                    {
                      backgroundColor:
                        theme.colors
                          .primarySoft,
                    },
                  ]}
                >
                  <MaterialIcons
                    name="account-balance-wallet"
                    size={22}
                    color={
                      theme.colors
                        .primary
                    }
                  />
                </View>

                <View
                  style={
                    styles.budgetHeaderContent
                  }
                >
                  <Text
                    style={[
                      styles.budgetTitle,
                      {
                        color:
                          theme.colors
                            .text,
                      },
                    ]}
                  >
                    Esse gasto deve consumir seu orçamento?
                  </Text>

                  <Text
                    style={[
                      styles.budgetText,
                      {
                        color:
                          theme.colors
                            .textSecondary,
                      },
                    ]}
                  >
                    Isso define se o valor também entra no limite do orçamento atual.
                  </Text>
                </View>
              </View>

              <View
                style={
                  styles.choiceRow
                }
              >
                <Pressable
                  onPress={() =>
                    setDescontarDoOrcamento(
                      true
                    )
                  }
                  style={[
                    styles.choiceButton,
                    {
                      borderColor:
                        descontarDoOrcamento
                          ? theme.colors
                              .primary
                          : theme.colors
                              .border,
                      backgroundColor:
                        descontarDoOrcamento
                          ? theme.colors
                              .primary
                          : theme.colors
                              .surfaceSecondary,
                    },
                  ]}
                >
                  <MaterialIcons
                    name={
                      descontarDoOrcamento
                        ? "check-circle"
                        : "radio-button-unchecked"
                    }
                    size={20}
                    color={
                      descontarDoOrcamento
                        ? "#FFFFFF"
                        : theme.colors
                            .textSecondary
                    }
                  />

                  <Text
                    style={[
                      styles.choiceText,
                      {
                        color:
                          descontarDoOrcamento
                            ? "#FFFFFF"
                            : theme.colors
                                .text,
                      },
                    ]}
                  >
                    Sim
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() =>
                    setDescontarDoOrcamento(
                      false
                    )
                  }
                  style={[
                    styles.choiceButton,
                    {
                      borderColor:
                        !descontarDoOrcamento
                          ? theme.colors
                              .primary
                          : theme.colors
                              .border,
                      backgroundColor:
                        !descontarDoOrcamento
                          ? theme.colors
                              .primary
                          : theme.colors
                              .surfaceSecondary,
                    },
                  ]}
                >
                  <MaterialIcons
                    name={
                      !descontarDoOrcamento
                        ? "check-circle"
                        : "radio-button-unchecked"
                    }
                    size={20}
                    color={
                      !descontarDoOrcamento
                        ? "#FFFFFF"
                        : theme.colors
                            .textSecondary
                    }
                  />

                  <Text
                    style={[
                      styles.choiceText,
                      {
                        color:
                          !descontarDoOrcamento
                            ? "#FFFFFF"
                            : theme.colors
                                .text,
                      },
                    ]}
                  >
                    Não
                  </Text>
                </Pressable>
              </View>
            </View>
          )
        )}

        {renderPrimaryButton(
          analisando
            ? "Analisando..."
            : "Analisar gasto",
          analisarGasto,
          analisando ||
            carregandoContexto
        )}

        <View
          style={
            styles.disclaimer
          }
        >
          <MaterialIcons
            name="visibility"
            size={17}
            color={
              theme.colors
                .textSecondary
            }
          />

          <Text
            style={[
              styles.disclaimerText,
              {
                color:
                  theme.colors
                    .textSecondary,
              },
            ]}
          >
            A simulação não registra nenhuma movimentação e não decide por você.
          </Text>
        </View>
      </ScrollView>

      <CategoryPicker
        visible={
          mostrarSeletorCategoria
        }
        selectedId={
          categoriaSelecionada.id
        }
        categories={
          categoriasGasto
        }
        onSelect={
          selecionarCategoria
        }
        onClose={() =>
          setMostrarSeletorCategoria(
            false
          )
        }
      />
    </>
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
      paddingTop: 54,
      paddingBottom: 110,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 24,
    },

    backButton: {
      width: 42,
      height: 42,
      justifyContent:
        "center",
    },

    headerTitle: {
      fontSize: 23,
      fontWeight: "700",
    },

    introCard: {
      borderRadius: 20,
      borderWidth: 1,
      padding: 17,
      flexDirection: "row",
      alignItems:
        "flex-start",
      marginBottom: 26,
    },

    introIcon: {
      width: 48,
      height: 48,
      borderRadius: 15,
      alignItems: "center",
      justifyContent:
        "center",
      marginRight: 13,
    },

    introContent: {
      flex: 1,
    },

    introTitle: {
      fontSize: 16,
      fontWeight: "800",
      marginBottom: 5,
    },

    introText: {
      fontSize: 13,
      lineHeight: 19,
      fontWeight: "500",
    },

    label: {
      fontSize: 16,
      fontWeight: "700",
      marginBottom: 9,
    },

    categoryLabel: {
      marginTop: 21,
    },

    valueCard: {
      height: 112,
      borderRadius: 18,
      borderWidth: 1,
      paddingHorizontal: 20,
      flexDirection: "row",
      alignItems: "center",
    },

    currency: {
      fontSize: 30,
      fontWeight: "600",
      marginRight: 10,
    },

    valueInput: {
      flex: 1,
      fontSize: 40,
      fontWeight: "600",
      padding: 0,
    },

    feedbackRow: {
      flexDirection: "row",
      alignItems:
        "flex-start",
      gap: 7,
      marginTop: 9,
    },

    feedbackText: {
      flex: 1,
      fontSize: 13,
      lineHeight: 18,
      fontWeight: "600",
    },

    categoryField: {
      minHeight: 64,
      borderRadius: 15,
      borderWidth: 1,
      paddingHorizontal: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    categoryLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 13,
    },

    categoryIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent:
        "center",
    },

    categoryText: {
      fontSize: 16,
      fontWeight: "600",
    },

    loadingContext: {
      minHeight: 90,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      gap: 10,
      marginTop: 16,
    },

    loadingContextText: {
      fontSize: 14,
      fontWeight: "600",
    },

    budgetCard: {
      borderRadius: 18,
      borderWidth: 1,
      padding: 17,
      marginTop: 20,
    },

    budgetHeader: {
      flexDirection: "row",
      alignItems:
        "flex-start",
    },

    budgetIcon: {
      width: 43,
      height: 43,
      borderRadius: 13,
      alignItems: "center",
      justifyContent:
        "center",
      marginRight: 11,
    },

    budgetHeaderContent: {
      flex: 1,
    },

    budgetTitle: {
      fontSize: 15,
      lineHeight: 20,
      fontWeight: "800",
    },

    budgetText: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: "500",
      marginTop: 4,
    },

    choiceRow: {
      flexDirection: "row",
      gap: 10,
      marginTop: 17,
    },

    choiceButton: {
      flex: 1,
      height: 49,
      borderRadius: 14,
      borderWidth: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      gap: 7,
    },

    choiceText: {
      fontSize: 15,
      fontWeight: "800",
    },

    primaryButton: {
      height: 58,
      borderRadius: 16,
      alignItems: "center",
      justifyContent:
        "center",
      marginTop: 24,
      overflow: "hidden",
    },

    primaryButtonText: {
      color: "#FFFFFF",
      fontSize: 17,
      fontWeight: "700",
    },

    disclaimer: {
      flexDirection: "row",
      alignItems:
        "flex-start",
      justifyContent:
        "center",
      gap: 7,
      marginTop: 14,
      paddingHorizontal: 14,
    },

    disclaimerText: {
      flexShrink: 1,
      fontSize: 12,
      lineHeight: 18,
      textAlign: "center",
      fontWeight: "500",
    },

    resultScreen: {
      flex: 1,
      backgroundColor:
        "transparent",
      paddingTop: 54,
    },

    resultHeader: {
      paddingHorizontal: 20,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },

    resultHeaderContent: {
      flex: 1,
    },

    simulationValue: {
      fontSize: 13,
      fontWeight: "600",
      marginTop: 2,
    },

    carouselArea: {
      flex: 1,
      justifyContent:
        "center",
    },

    page: {
      paddingHorizontal: 4,
      justifyContent:
        "center",
    },

    analysisCard: {
      minHeight: 430,
      borderRadius: 26,
      borderWidth: 1,
      paddingHorizontal: 24,
      paddingVertical: 26,
      justifyContent:
        "center",
    },

    analysisIcon: {
      width: 58,
      height: 58,
      borderRadius: 18,
      alignItems: "center",
      justifyContent:
        "center",
      marginBottom: 22,
    },

    eyebrow: {
      fontSize: 12,
      fontWeight: "800",
      textTransform:
        "uppercase",
      letterSpacing: 0.7,
      marginBottom: 9,
    },

    analysisTitle: {
      fontSize: 23,
      lineHeight: 30,
      fontWeight: "800",
      marginBottom: 13,
    },

    analysisText: {
      fontSize: 15,
      lineHeight: 23,
      fontWeight: "500",
    },

    finalActions: {
      marginTop: 10,
    },

    resultFeedback: {
      flexDirection: "row",
      alignItems:
        "flex-start",
      gap: 7,
      marginBottom: 2,
    },

    resultFeedbackText: {
      flex: 1,
      fontSize: 12,
      lineHeight: 18,
      fontWeight: "600",
    },

    secondaryButton: {
      height: 54,
      borderRadius: 16,
      borderWidth: 1,
      alignItems: "center",
      justifyContent:
        "center",
      marginTop: 10,
    },

    secondaryButtonText: {
      fontSize: 15,
      fontWeight: "700",
    },

    paginationArea: {
      paddingHorizontal: 20,
      paddingBottom: 28,
      alignItems: "center",
    },

    dots: {
      minHeight: 24,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      gap: 7,
    },

    dot: {
      height: 8,
      borderRadius: 4,
    },

    swipeHint: {
      minHeight: 24,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      gap: 4,
      marginTop: 4,
    },

    swipeHintText: {
      fontSize: 12,
      fontWeight: "600",
    },
  });