import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  router,
  useLocalSearchParams,
} from "expo-router";
import {
  useEffect,
  useState,
} from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import ThemeAccent from "../components/ThemeAccent";
import {
  BudgetPeriod,
  createBudget,
  getBudgetById,
  updateBudget,
} from "../database/budgets";
import { useTheme } from "../theme/ThemeContext";

type Periodo =
  | "Diário"
  | "Semanal"
  | "Mensal";

type FeedbackState = {
  visible: boolean;
  title: string;
  message: string;
};

const periodos: Periodo[] = [
  "Diário",
  "Semanal",
  "Mensal",
];

const periodoParaBanco: Record<
  Periodo,
  BudgetPeriod
> = {
  Diário: "daily",
  Semanal: "weekly",
  Mensal: "monthly",
};

const periodoDoBanco: Record<
  BudgetPeriod,
  Periodo
> = {
  daily: "Diário",
  weekly: "Semanal",
  monthly: "Mensal",
};

function normalizarData(
  data: Date
) {
  const novaData =
    new Date(data);

  novaData.setHours(
    0,
    0,
    0,
    0
  );

  return novaData;
}

function dataParaBanco(
  data: Date
) {
  const ano =
    data.getFullYear();

  const mes = String(
    data.getMonth() + 1
  ).padStart(2, "0");

  const dia = String(
    data.getDate()
  ).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function dataDoBanco(
  value: string
) {
  const [
    ano,
    mes,
    dia,
  ] = value
    .split("-")
    .map(Number);

  return normalizarData(
    new Date(
      ano,
      mes - 1,
      dia
    )
  );
}

function formatarData(
  data: Date
) {
  return data.toLocaleDateString(
    "pt-BR"
  );
}

function mesmaData(
  primeira: Date,
  segunda: Date
) {
  return (
    primeira.getFullYear() ===
      segunda.getFullYear() &&
    primeira.getMonth() ===
      segunda.getMonth() &&
    primeira.getDate() ===
      segunda.getDate()
  );
}

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
    texto.replace(
      /\D/g,
      ""
    );

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

export default function NovoOrcamentoScreen() {
  const {
    theme,
    activeSpecialTheme,
  } = useTheme();

  const params =
    useLocalSearchParams<{
      id?: string | string[];
    }>();

  const idParam =
    Array.isArray(params.id)
      ? params.id[0]
      : params.id;

  const budgetId =
    idParam
      ? Number(idParam)
      : null;

  const isEditing =
    budgetId !== null &&
    Number.isInteger(
      budgetId
    ) &&
    budgetId > 0;

  const isPride =
    activeSpecialTheme ===
    "pride";

  const useGradientPrimary =
    theme.visuals
      .useGradientPrimary;

  const hoje =
    normalizarData(
      new Date()
    );

  const [
    nome,
    setNome,
  ] = useState(
    "Gastos pessoais"
  );

  const [
    valorCentavos,
    setValorCentavos,
  ] = useState(0);

  const [
    periodo,
    setPeriodo,
  ] =
    useState<Periodo>(
      "Diário"
    );

  const [
    mostrarPeriodos,
    setMostrarPeriodos,
  ] = useState(false);

  const [
    repetirAutomaticamente,
    setRepetirAutomaticamente,
  ] = useState(true);

  const [
    dataInicio,
    setDataInicio,
  ] = useState<Date>(
    () =>
      normalizarData(
        new Date()
      )
  );

  const [
    mostrarDatePicker,
    setMostrarDatePicker,
  ] = useState(false);

  const [
    carregando,
    setCarregando,
  ] = useState(
    isEditing
  );

  const [
    salvando,
    setSalvando,
  ] = useState(false);

  const [
    feedback,
    setFeedback,
  ] =
    useState<FeedbackState>({
      visible: false,
      title: "",
      message: "",
    });

  const valor =
    formatarCentavos(
      valorCentavos
    );

  const dataEhHoje =
    mesmaData(
      dataInicio,
      hoje
    );

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      if (
        !isEditing ||
        budgetId === null
      ) {
        setCarregando(false);
        return;
      }

      try {
        const budget =
          await getBudgetById(
            budgetId
          );

        if (!ativo) {
          return;
        }

        if (!budget) {
          mostrarFeedback(
            "Orçamento não encontrado",
            "Esse orçamento não existe mais."
          );
          setCarregando(false);
          return;
        }

        setNome(
          budget.name
        );

        setValorCentavos(
          budget.amountCents
        );

        setPeriodo(
          periodoDoBanco[
            budget.period
          ]
        );

        setRepetirAutomaticamente(
          budget.autoRepeat
        );

        setDataInicio(
          dataDoBanco(
            budget.startDate
          )
        );
      } catch (error) {
        console.error(
          "Erro ao carregar orçamento:",
          error
        );

        if (ativo) {
          mostrarFeedback(
            "Não foi possível carregar",
            "Ocorreu um erro ao carregar este orçamento."
          );
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregar();

    return () => {
      ativo = false;
    };
  }, [
    budgetId,
    isEditing,
  ]);

  function mostrarFeedback(
    title: string,
    message: string
  ) {
    setFeedback({
      visible: true,
      title,
      message,
    });
  }

  function fecharFeedback() {
    setFeedback(
      (atual) => ({
        ...atual,
        visible: false,
      })
    );
  }

  function alterarValor(
    texto: string
  ) {
    setValorCentavos(
      extrairCentavos(
        texto
      )
    );
  }

  function selecionarPeriodo(
    novoPeriodo: Periodo
  ) {
    setPeriodo(
      novoPeriodo
    );

    setMostrarPeriodos(
      false
    );
  }

  function abrirDatePicker() {
    setMostrarPeriodos(
      false
    );

    setMostrarDatePicker(
      true
    );
  }

  function alterarData(
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) {
    if (
      Platform.OS ===
      "android"
    ) {
      setMostrarDatePicker(
        false
      );
    }

    if (
      event.type ===
        "dismissed" ||
      !selectedDate
    ) {
      return;
    }

    const novaData =
      normalizarData(
        selectedDate
      );

    if (
      !isEditing &&
      novaData.getTime() <
        hoje.getTime()
    ) {
      return;
    }

    setDataInicio(
      novaData
    );
  }

  async function salvarOrcamento() {
    if (salvando) {
      return;
    }

    const nomeLimpo =
      nome.trim();

    if (!nomeLimpo) {
      mostrarFeedback(
        "Nome obrigatório",
        "Dê um nome ao seu orçamento."
      );
      return;
    }

    if (
      valorCentavos <= 0
    ) {
      mostrarFeedback(
        "Valor inválido",
        "Informe um valor maior que zero."
      );
      return;
    }

    setSalvando(true);

    try {
      const input = {
        name: nomeLimpo,
        amountCents:
          valorCentavos,
        period:
          periodoParaBanco[
            periodo
          ],
        autoRepeat:
          repetirAutomaticamente,
        startDate:
          dataParaBanco(
            dataInicio
          ),
      };

      if (
        isEditing &&
        budgetId !== null
      ) {
        await updateBudget(
          budgetId,
          input
        );
      } else {
        await createBudget(
          input
        );
      }

      router.back();
    } catch (error) {
      console.error(
        "Erro ao salvar orçamento:",
        error
      );

      mostrarFeedback(
        "Não foi possível salvar",
        error instanceof Error
          ? error.message
          : "Ocorreu um erro ao salvar o orçamento."
      );
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <View
        style={
          styles.loadingScreen
        }
      >
        <ActivityIndicator
          size="large"
          color={
            theme.colors.primary
          }
        />

        <Text
          style={[
            styles.loadingText,
            {
              color:
                theme.colors
                  .textSecondary,
            },
          ]}
        >
          Carregando orçamento...
        </Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={styles.header}
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
              size={29}
              color={
                theme.colors.text
              }
            />
          </Pressable>

          <Text
            style={[
              styles.title,
              {
                color:
                  theme.colors.text,
              },
            ]}
          >
            {isEditing
              ? "Editar orçamento"
              : "Novo orçamento"}
          </Text>
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
          Nome
        </Text>

        <TextInput
          value={nome}
          onChangeText={setNome}
          placeholder="Ex.: Gastos pessoais"
          placeholderTextColor={
            theme.colors
              .textSecondary
          }
          style={[
            styles.input,
            {
              backgroundColor:
                theme.colors.surface,
              borderColor:
                theme.colors.border,
              color:
                theme.colors.text,
            },
          ]}
        />

        <Text
          style={[
            styles.label,
            {
              color:
                theme.colors.text,
            },
          ]}
        >
          Valor
        </Text>

        <View
          style={[
            styles.valueInputContainer,
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
            selectTextOnFocus={
              false
            }
            style={[
              styles.valueInput,
              {
                color:
                  theme.colors.text,
              },
            ]}
          />
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
          Período
        </Text>

        <Pressable
          onPress={() =>
            setMostrarPeriodos(
              (atual) =>
                !atual
            )
          }
          style={[
            styles.select,
            {
              backgroundColor:
                theme.colors.surface,
              borderColor:
                isPride
                  ? "#A855F7"
                  : theme.colors
                      .border,
            },
          ]}
        >
          <Text
            style={[
              styles.selectText,
              {
                color:
                  theme.colors.text,
              },
            ]}
          >
            {periodo}
          </Text>

          <MaterialIcons
            name={
              mostrarPeriodos
                ? "keyboard-arrow-up"
                : "keyboard-arrow-down"
            }
            size={27}
            color={
              isPride
                ? "#A855F7"
                : theme.colors
                    .textSecondary
            }
          />
        </Pressable>

        {mostrarPeriodos && (
          <View
            style={[
              styles.dropdown,
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
            {periodos.map(
              (
                item,
                index
              ) => (
                <Pressable
                  key={item}
                  onPress={() =>
                    selecionarPeriodo(
                      item
                    )
                  }
                  style={[
                    styles.dropdownItem,
                    index !==
                      periodos.length -
                        1 && {
                      borderBottomWidth: 1,
                      borderBottomColor:
                        theme.colors
                          .border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.dropdownText,
                      {
                        color:
                          periodo ===
                          item
                            ? isPride
                              ? "#A855F7"
                              : theme
                                  .colors
                                  .primary
                            : theme
                                .colors
                                .text,
                      },
                    ]}
                  >
                    {item}
                  </Text>

                  {periodo ===
                    item && (
                    <MaterialIcons
                      name="check"
                      size={22}
                      color={
                        isPride
                          ? "#A855F7"
                          : theme
                              .colors
                              .primary
                      }
                    />
                  )}
                </Pressable>
              )
            )}
          </View>
        )}

        <View
          style={
            styles.repeatRow
          }
        >
          <View
            style={
              styles.repeatTextContainer
            }
          >
            <Text
              style={[
                styles.repeatTitle,
                {
                  color:
                    theme.colors.text,
                },
              ]}
            >
              Repetir automaticamente
            </Text>

            <Text
              style={[
                styles.repeatDescription,
                {
                  color:
                    theme.colors
                      .textSecondary,
                },
              ]}
            >
              Cria um novo período quando
              o atual terminar
            </Text>
          </View>

          <BudgetSwitch
            value={
              repetirAutomaticamente
            }
            onValueChange={
              setRepetirAutomaticamente
            }
          />
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
          Data de início
        </Text>

        <Pressable
          onPress={
            abrirDatePicker
          }
          style={[
            styles.dateField,
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
              styles.dateLeft
            }
          >
            <MaterialIcons
              name="calendar-today"
              size={22}
              color={
                isPride
                  ? "#168AF2"
                  : theme.colors
                      .textSecondary
              }
            />

            <Text
              style={[
                styles.dateText,
                {
                  color:
                    theme.colors.text,
                },
              ]}
            >
              {dataEhHoje
                ? "Hoje"
                : isEditing
                  ? "Início"
                  : "Agendado"}
            </Text>
          </View>

          <Text
            style={[
              styles.dateValue,
              {
                color:
                  theme.colors
                    .textSecondary,
              },
            ]}
          >
            {formatarData(
              dataInicio
            )}
          </Text>

          <MaterialIcons
            name="chevron-right"
            size={25}
            color={
              theme.colors
                .textSecondary
            }
          />
        </Pressable>

        {mostrarDatePicker && (
          <DateTimePicker
            value={dataInicio}
            mode="date"
            display={
              Platform.OS ===
              "ios"
                ? "inline"
                : "default"
            }
            minimumDate={
              isEditing
                ? undefined
                : hoje
            }
            onChange={
              alterarData
            }
          />
        )}

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
          <MaterialIcons
            name="info-outline"
            size={22}
            color={
              isPride
                ? "#7C3AED"
                : theme.colors
                    .primary
            }
          />

          <View
            style={
              styles.summaryContent
            }
          >
            <Text
              style={[
                styles.summaryTitle,
                {
                  color:
                    theme.colors.text,
                },
              ]}
            >
              Seu orçamento
            </Text>

            <Text
              style={[
                styles.summaryText,
                {
                  color:
                    theme.colors
                      .textSecondary,
                },
              ]}
            >
              R$ {valor} •{" "}
              {periodo.toLowerCase()}
              {repetirAutomaticamente
                ? " • renovação automática"
                : ""}
              {!dataEhHoje
                ? ` • começa em ${formatarData(
                    dataInicio
                  )}`
                : ""}
            </Text>
          </View>
        </View>

        {useGradientPrimary ? (
          <Pressable
            onPress={
              salvarOrcamento
            }
            disabled={
              salvando
            }
            style={[
              styles.savePressable,
              {
                opacity:
                  salvando
                    ? 0.7
                    : 1,
              },
            ]}
          >
            <ThemeAccent
              style={
                styles.saveButtonGradient
              }
            >
              <Text
                style={
                  styles.saveButtonText
                }
              >
                {salvando
                  ? "Salvando..."
                  : isEditing
                    ? "Salvar alterações"
                    : "Salvar orçamento"}
              </Text>
            </ThemeAccent>
          </Pressable>
        ) : (
          <Pressable
            onPress={
              salvarOrcamento
            }
            disabled={
              salvando
            }
            style={[
              styles.saveButton,
              {
                backgroundColor:
                  theme.colors
                    .primary,
                opacity:
                  salvando
                    ? 0.7
                    : 1,
              },
            ]}
          >
            <Text
              style={
                styles.saveButtonText
              }
            >
              {salvando
                ? "Salvando..."
                : isEditing
                  ? "Salvar alterações"
                  : "Salvar orçamento"}
            </Text>
          </Pressable>
        )}
      </ScrollView>

      <Modal
        visible={
          feedback.visible
        }
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={
          fecharFeedback
        }
      >
        <View
          style={
            styles.modalBackdrop
          }
        >
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
              style={[
                styles.feedbackIcon,
                {
                  backgroundColor:
                    `${theme.colors.primary}18`,
                },
              ]}
            >
              <MaterialIcons
                name="info-outline"
                size={27}
                color={
                  theme.colors.primary
                }
              />
            </View>

            <Text
              style={[
                styles.feedbackTitle,
                {
                  color:
                    theme.colors.text,
                },
              ]}
            >
              {feedback.title}
            </Text>

            <Text
              style={[
                styles.feedbackMessage,
                {
                  color:
                    theme.colors
                      .textSecondary,
                },
              ]}
            >
              {feedback.message}
            </Text>

            <Pressable
              onPress={
                fecharFeedback
              }
              style={({
                pressed,
              }) => ({
                opacity:
                  pressed
                    ? 0.82
                    : 1,
                width: "100%",
              })}
            >
              <ThemeAccent
                style={
                  styles.feedbackButton
                }
              >
                <Text
                  style={
                    styles.feedbackButtonText
                  }
                >
                  Entendi
                </Text>
              </ThemeAccent>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

type BudgetSwitchProps = {
  value: boolean;
  onValueChange: (
    value: boolean
  ) => void;
};

function BudgetSwitch({
  value,
  onValueChange,
}: BudgetSwitchProps) {
  const { theme } =
    useTheme();

  if (
    value &&
    theme.visuals
      .useGradientPrimary
  ) {
    return (
      <Pressable
        onPress={() =>
          onValueChange(
            false
          )
        }
        style={
          styles.customSwitch
        }
      >
        <ThemeAccent
          style={
            styles.switchTrack
          }
        >
          <View
            style={[
              styles.switchThumb,
              styles.switchThumbOn,
            ]}
          />
        </ThemeAccent>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={() =>
        onValueChange(
          !value
        )
      }
      style={[
        styles.customSwitch,
        {
          backgroundColor:
            value
              ? theme.colors
                  .primary
              : theme.colors
                  .surfaceSecondary,
        },
      ]}
    >
      <View
        style={[
          styles.switchThumb,
          value
            ? styles.switchThumbOn
            : styles.switchThumbOff,
        ]}
      />
    </Pressable>
  );
}

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor:
        "transparent",
    },

    loadingScreen: {
      flex: 1,
      backgroundColor:
        "transparent",
      alignItems: "center",
      justifyContent:
        "center",
      gap: 14,
    },

    loadingText: {
      fontSize: 14,
      fontWeight: "600",
    },

    content: {
      paddingHorizontal: 20,
      paddingTop: 54,
      paddingBottom: 110,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 30,
    },

    backButton: {
      width: 44,
      height: 44,
      alignItems: "flex-start",
      justifyContent:
        "center",
    },

    title: {
      fontSize: 27,
      fontWeight: "700",
      letterSpacing: -0.5,
      marginLeft: 4,
    },

    label: {
      fontSize: 16,
      fontWeight: "700",
      marginBottom: 9,
    },

    input: {
      height: 64,
      borderRadius: 16,
      borderWidth: 1,
      paddingHorizontal: 17,
      fontSize: 16,
      fontWeight: "500",
      marginBottom: 22,
    },

    valueInputContainer: {
      height: 72,
      borderRadius: 16,
      borderWidth: 1,
      paddingHorizontal: 17,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 22,
    },

    currency: {
      fontSize: 21,
      fontWeight: "700",
      marginRight: 8,
    },

    valueInput: {
      flex: 1,
      fontSize: 24,
      fontWeight: "700",
      padding: 0,
    },

    select: {
      height: 64,
      borderRadius: 16,
      borderWidth: 1,
      paddingHorizontal: 17,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      marginBottom: 22,
    },

    selectText: {
      fontSize: 16,
      fontWeight: "600",
    },

    dropdown: {
      borderRadius: 16,
      borderWidth: 1,
      overflow: "hidden",
      marginTop: -14,
      marginBottom: 22,
    },

    dropdownItem: {
      height: 56,
      paddingHorizontal: 17,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    dropdownText: {
      fontSize: 16,
      fontWeight: "600",
    },

    repeatRow: {
      minHeight: 82,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      marginBottom: 22,
    },

    repeatTextContainer: {
      flex: 1,
      paddingRight: 16,
    },

    repeatTitle: {
      fontSize: 16,
      fontWeight: "700",
    },

    repeatDescription: {
      fontSize: 13,
      lineHeight: 18,
      marginTop: 5,
    },

    customSwitch: {
      width: 52,
      height: 30,
      borderRadius: 15,
      overflow: "hidden",
      justifyContent:
        "center",
    },

    switchTrack: {
      flex: 1,
      width: "100%",
      borderRadius: 15,
      justifyContent:
        "center",
    },

    switchThumb: {
      position: "absolute",
      top: 3,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor:
        "#FFFFFF",
    },

    switchThumbOn: {
      right: 3,
    },

    switchThumbOff: {
      left: 3,
    },

    dateField: {
      minHeight: 64,
      borderRadius: 16,
      borderWidth: 1,
      paddingHorizontal: 16,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 24,
    },

    dateLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      flex: 1,
    },

    dateText: {
      fontSize: 16,
      fontWeight: "600",
    },

    dateValue: {
      fontSize: 14,
      marginRight: 5,
    },

    summaryCard: {
      borderRadius: 17,
      borderWidth: 1,
      padding: 16,
      flexDirection: "row",
      alignItems:
        "flex-start",
      gap: 12,
    },

    summaryContent: {
      flex: 1,
    },

    summaryTitle: {
      fontSize: 15,
      fontWeight: "700",
    },

    summaryText: {
      fontSize: 13,
      lineHeight: 19,
      marginTop: 4,
    },

    savePressable: {
      marginTop: 28,
      borderRadius: 17,
      overflow: "hidden",
    },

    saveButtonGradient: {
      height: 60,
      borderRadius: 17,
      alignItems: "center",
      justifyContent:
        "center",
      overflow: "hidden",
    },

    saveButton: {
      height: 60,
      borderRadius: 17,
      alignItems: "center",
      justifyContent:
        "center",
      marginTop: 28,
      overflow: "hidden",
    },

    saveButtonText: {
      color: "#FFFFFF",
      fontSize: 17,
      fontWeight: "700",
    },

    modalBackdrop: {
      flex: 1,
      backgroundColor:
        "rgba(0, 0, 0, 0.62)",
      alignItems: "center",
      justifyContent:
        "center",
      paddingHorizontal: 28,
    },

    feedbackCard: {
      width: "100%",
      maxWidth: 380,
      borderRadius: 24,
      borderWidth: 1,
      paddingHorizontal: 22,
      paddingTop: 24,
      paddingBottom: 20,
      alignItems: "center",
    },

    feedbackIcon: {
      width: 54,
      height: 54,
      borderRadius: 18,
      alignItems: "center",
      justifyContent:
        "center",
      marginBottom: 16,
    },

    feedbackTitle: {
      fontSize: 21,
      fontWeight: "800",
      textAlign: "center",
    },

    feedbackMessage: {
      fontSize: 14,
      lineHeight: 21,
      fontWeight: "500",
      textAlign: "center",
      marginTop: 8,
      marginBottom: 22,
    },

    feedbackButton: {
      width: "100%",
      minHeight: 52,
      borderRadius: 16,
      alignItems: "center",
      justifyContent:
        "center",
      overflow: "hidden",
    },

    feedbackButtonText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "700",
    },
  });