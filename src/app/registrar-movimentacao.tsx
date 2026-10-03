import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import CategoryPicker, {
  Categoria,
  categoriasEntrada,
  categoriasGasto,
} from "../components/CategoryPicker";
import ThemeAccent from "../components/ThemeAccent";
import {
  preparePartialVaultDeficitTest,
  resetDevelopmentData,
} from "../database/dev";
import { createTransaction } from "../database/transactions";
import { useTheme } from "../theme/ThemeContext";

type TipoMovimentacao =
  | "gasto"
  | "entrada";

type DestinoEntrada =
  | "mes"
  | "cofre";

type CheckboxRowProps = {
  label: string;
  checked: boolean;
  onPress: () => void;
};

type FeedbackState = {
  visible: boolean;
  title: string;
  message: string;
};

const CLOSED_CYCLE_ERROR =
  "Não é possível registrar uma movimentação em um ciclo já fechado.";

const INSUFFICIENT_MONTHLY_MONEY_ERROR =
  "Você só pode transferir para o Cofre o valor disponível no Dinheiro do mês.";

function formatarCentavos(
  centavos: number
) {
  return (centavos / 100).toLocaleString(
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

function dataEhFutura(
  date: Date
) {
  const hoje =
    new Date();

  const dataSelecionada =
    new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

  const dataAtual =
    new Date(
      hoje.getFullYear(),
      hoje.getMonth(),
      hoje.getDate()
    );

  return (
    dataSelecionada >
    dataAtual
  );
}

function dataEhHoje(
  date: Date
) {
  const hoje =
    new Date();

  return (
    date.getDate() ===
      hoje.getDate() &&
    date.getMonth() ===
      hoje.getMonth() &&
    date.getFullYear() ===
      hoje.getFullYear()
  );
}

function formatarData(
  date: Date
) {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  ).format(date);
}

export default function RegistrarMovimentacaoScreen() {
  const {
    theme,
    activeSpecialTheme,
  } = useTheme();

  const [
    tipo,
    setTipo,
  ] =
    useState<TipoMovimentacao>(
      "gasto"
    );

  const [
    valorCentavos,
    setValorCentavos,
  ] = useState(0);

  const [
    descricao,
    setDescricao,
  ] = useState("");

  const [
    data,
    setData,
  ] =
    useState(
      () => new Date()
    );

  const [
    mostrarSeletorData,
    setMostrarSeletorData,
  ] = useState(false);

  const [
    mostrarSeletorCategoria,
    setMostrarSeletorCategoria,
  ] = useState(false);

  const [
    categoriaGastoSelecionada,
    setCategoriaGastoSelecionada,
  ] = useState<Categoria>(
    categoriasGasto[0]
  );

  const [
    categoriaEntradaSelecionada,
    setCategoriaEntradaSelecionada,
  ] = useState<Categoria>(
    categoriasEntrada[0]
  );

  const [
    descontarDoCofre,
    setDescontarDoCofre,
  ] = useState(false);

  const [
    destinoEntrada,
    setDestinoEntrada,
  ] =
    useState<DestinoEntrada>(
      "mes"
    );

  const [
    retirarDoDinheiroDoMes,
    setRetirarDoDinheiroDoMes,
  ] = useState(false);

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

  const isGasto =
    tipo === "gasto";

  const isPride =
    activeSpecialTheme ===
    "pride";

  const movimentacaoAgendada =
    dataEhFutura(data);

  const valor =
    formatarCentavos(
      valorCentavos
    );

  const categoriaSelecionada =
    isGasto
      ? categoriaGastoSelecionada
      : categoriaEntradaSelecionada;

  const categoriasDisponiveis =
    isGasto
      ? categoriasGasto
      : categoriasEntrada;

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

  function trocarTipo(
    novoTipo: TipoMovimentacao
  ) {
    setTipo(
      novoTipo
    );

    setValorCentavos(
      0
    );

    setMostrarSeletorCategoria(
      false
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

  function alterarData(
    event: DateTimePickerEvent,
    novaData?: Date
  ) {
    if (
      Platform.OS === "android"
    ) {
      setMostrarSeletorData(
        false
      );
    }

    if (
      event.type === "set" &&
      novaData
    ) {
      setData(
        novaData
      );
    }
  }

  function selecionarCategoria(
    categoria: Categoria
  ) {
    if (isGasto) {
      setCategoriaGastoSelecionada(
        categoria
      );
    } else {
      setCategoriaEntradaSelecionada(
        categoria
      );
    }

    setMostrarSeletorCategoria(
      false
    );
  }

  function selecionarDestinoEntrada(
    destino: DestinoEntrada
  ) {
    setDestinoEntrada(
      destino
    );

    if (
      destino === "mes"
    ) {
      setRetirarDoDinheiroDoMes(
        false
      );
    }
  }

  async function limparDadosDeTeste() {
    try {
      await resetDevelopmentData();

      setValorCentavos(
        0
      );

      setDescricao("");

      setData(
        new Date()
      );

      setDescontarDoCofre(
        false
      );

      setDestinoEntrada(
        "mes"
      );

      setRetirarDoDinheiroDoMes(
        false
      );

      mostrarFeedback(
        "Dados de teste zerados",
        "Movimentações, ciclos, fechamentos e valores financeiros foram apagados."
      );
    } catch (error) {
      console.error(
        "Erro ao zerar dados de teste:",
        error
      );

      mostrarFeedback(
        "Não foi possível zerar",
        "Ocorreu um erro ao limpar os dados de desenvolvimento."
      );
    }
  }

  async function prepararTesteDeficitParcial() {
    try {
      await preparePartialVaultDeficitTest();

      mostrarFeedback(
        "Cenário preparado",
        "O ciclo anterior terminou com R$ 500 de déficit e há R$ 100 no Cofre. Volte para a Home e abra o fechamento."
      );
    } catch (error) {
      console.error(
        "Erro ao preparar cenário de déficit:",
        error
      );

      mostrarFeedback(
        "Não foi possível preparar",
        "Ocorreu um erro ao montar o cenário de teste."
      );
    }
  }

  async function salvarMovimentacao() {
    if (salvando) {
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
      if (isGasto) {
        await createTransaction({
          type: "expense",
          amountCents:
            valorCentavos,
          date: data,
          category:
            categoriaGastoSelecionada.id,
          description:
            descricao,
          bucket:
            descontarDoCofre
              ? "vault"
              : "monthly_money",
        });
      } else if (
        destinoEntrada ===
          "cofre" &&
        retirarDoDinheiroDoMes
      ) {
        await createTransaction({
          type: "transfer",
          amountCents:
            valorCentavos,
          date: data,
          description:
            descricao,
          transferFrom:
            "monthly_money",
          transferTo:
            "vault",
        });
      } else {
        await createTransaction({
          type: "income",
          amountCents:
            valorCentavos,
          date: data,
          category:
            categoriaEntradaSelecionada.id,
          description:
            descricao,
          bucket:
            destinoEntrada ===
            "cofre"
              ? "vault"
              : "monthly_money",
        });
      }

      router.back();
    } catch (error) {
      console.error(
        "Erro ao registrar movimentação:",
        error
      );

      if (
        error instanceof Error &&
        error.message ===
          CLOSED_CYCLE_ERROR
      ) {
        mostrarFeedback(
          "Esse ciclo já foi fechado",
          "Não é possível adicionar movimentações a um ciclo encerrado."
        );
        return;
      }

      if (
        error instanceof Error &&
        error.message ===
          INSUFFICIENT_MONTHLY_MONEY_ERROR
      ) {
        mostrarFeedback(
          "Saldo insuficiente",
          "Você não tem esse valor disponível no Dinheiro do mês para transferir ao Cofre."
        );
        return;
      }

      mostrarFeedback(
        "Não foi possível registrar",
        "Ocorreu um erro ao salvar a movimentação. Tente novamente."
      );
    } finally {
      setSalvando(
        false
      );
    }
  }

  function renderSegment(
    label: string,
    selected: boolean,
    onPress: () => void
  ) {
    if (
      selected &&
      isPride
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
                color:
                  selected
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

  function renderDestinoEntrada(
    label: string,
    icon:
      | "account-balance-wallet"
      | "savings",
    destino: DestinoEntrada
  ) {
    const selected =
      destinoEntrada ===
      destino;

    if (
      selected &&
      isPride
    ) {
      return (
        <Pressable
          onPress={() =>
            selecionarDestinoEntrada(
              destino
            )
          }
          style={
            styles.destinationOption
          }
        >
          <ThemeAccent
            style={
              styles.destinationAccent
            }
          >
            <MaterialIcons
              name={icon}
              size={22}
              color="#FFFFFF"
            />

            <Text
              style={[
                styles.destinationText,
                styles.destinationTextSelected,
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
        onPress={() =>
          selecionarDestinoEntrada(
            destino
          )
        }
        style={[
          styles.destinationOption,
          {
            backgroundColor:
              selected
                ? theme.colors.primary
                : theme.colors
                    .surface,
            borderColor:
              selected
                ? theme.colors.primary
                : theme.colors.border,
          },
        ]}
      >
        <MaterialIcons
          name={icon}
          size={22}
          color={
            selected
              ? "#FFFFFF"
              : theme.colors
                  .textSecondary
          }
        />

        <Text
          style={[
            styles.destinationText,
            {
              color:
                selected
                  ? "#FFFFFF"
                  : theme.colors.text,
            },
          ]}
        >
          {label}
        </Text>
      </Pressable>
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
            Registrar movimentação
          </Text>
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
            "Gasto",
            isGasto,
            () =>
              trocarTipo(
                "gasto"
              )
          )}

          {renderSegment(
            "Entrada",
            !isGasto,
            () =>
              trocarTipo(
                "entrada"
              )
          )}
        </View>

        <View
          style={[
            styles.valueCard,
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
          Data
        </Text>

        <Pressable
          onPress={() =>
            setMostrarSeletorData(
              true
            )
          }
          style={[
            styles.field,
            {
              backgroundColor:
                theme.colors.surface,
              borderColor:
                movimentacaoAgendada
                  ? theme.colors.warning
                  : theme.colors.border,
            },
          ]}
        >
          <View
            style={
              styles.fieldLeft
            }
          >
            <MaterialIcons
              name="calendar-today"
              size={22}
              color={
                movimentacaoAgendada
                  ? theme.colors.warning
                  : isPride
                    ? "#168AF2"
                    : theme.colors
                        .textSecondary
              }
            />

            <Text
              style={[
                styles.fieldText,
                {
                  color:
                    theme.colors.text,
                },
              ]}
            >
              {formatarData(
                data
              )}
            </Text>
          </View>

          <View
            style={
              styles.fieldRight
            }
          >
            {dataEhHoje(
              data
            ) && (
              <Text
                style={[
                  styles.fieldHint,
                  {
                    color:
                      theme.colors
                        .textSecondary,
                  },
                ]}
              >
                Hoje
              </Text>
            )}

            {movimentacaoAgendada && (
              <Text
                style={[
                  styles.fieldHint,
                  {
                    color:
                      theme.colors
                        .warning,
                  },
                ]}
              >
                Agendada
              </Text>
            )}

            <MaterialIcons
              name="chevron-right"
              size={24}
              color={
                movimentacaoAgendada
                  ? theme.colors.warning
                  : theme.colors
                      .textSecondary
              }
            />
          </View>
        </Pressable>

        {mostrarSeletorData && (
          <DateTimePicker
            value={data}
            mode="date"
            display={
              Platform.OS === "ios"
                ? "spinner"
                : "default"
            }
            onChange={
              alterarData
            }
          />
        )}

        {movimentacaoAgendada && (
          <View
            style={[
              styles.scheduleCard,
              {
                backgroundColor:
                  theme.colors.surface,
                borderColor:
                  theme.colors.warning,
              },
            ]}
          >
            <View
              style={[
                styles.scheduleIcon,
                {
                  backgroundColor:
                    `${theme.colors.warning}20`,
                },
              ]}
            >
              <MaterialIcons
                name="schedule"
                size={22}
                color={
                  theme.colors.warning
                }
              />
            </View>

            <View
              style={
                styles.scheduleContent
              }
            >
              <Text
                style={[
                  styles.scheduleTitle,
                  {
                    color:
                      theme.colors.text,
                  },
                ]}
              >
                Movimentação agendada
              </Text>

              <Text
                style={[
                  styles.scheduleDescription,
                  {
                    color:
                      theme.colors
                        .textSecondary,
                  },
                ]}
              >
                {isGasto
                  ? `Este gasto será registrado automaticamente em ${formatarData(data)}.`
                  : `Esta entrada será registrada automaticamente em ${formatarData(data)}.`}
              </Text>
            </View>
          </View>
        )}

        <Text
          style={[
            styles.label,
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
            styles.field,
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
              styles.fieldLeft
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
                styles.fieldText,
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

        {!isGasto && (
          <>
            <Text
              style={[
                styles.label,
                {
                  color:
                    theme.colors.text,
                },
              ]}
            >
              Adicionar em
            </Text>

            <View
              style={
                styles.destinationControl
              }
            >
              {renderDestinoEntrada(
                "Dinheiro do mês",
                "account-balance-wallet",
                "mes"
              )}

              {renderDestinoEntrada(
                "Cofre",
                "savings",
                "cofre"
              )}
            </View>

            {destinoEntrada ===
              "cofre" && (
              <View
                style={
                  styles.transferSection
                }
              >
                <CheckboxRow
                  label="Retirar do dinheiro do mês"
                  checked={
                    retirarDoDinheiroDoMes
                  }
                  onPress={() =>
                    setRetirarDoDinheiroDoMes(
                      !retirarDoDinheiroDoMes
                    )
                  }
                />

                <Text
                  style={[
                    styles.cofreHint,
                    {
                      color:
                        theme.colors
                          .textSecondary,
                    },
                  ]}
                >
                  Se marcado, o valor será transferido
                  do dinheiro do mês para o Cofre.
                </Text>
              </View>
            )}
          </>
        )}

        <Text
          style={[
            styles.label,
            {
              color:
                theme.colors.text,
            },
          ]}
        >
          Descrição (opcional)
        </Text>

        <TextInput
          value={descricao}
          onChangeText={
            setDescricao
          }
          placeholder={
            isGasto
              ? "Ex.: Pizza"
              : destinoEntrada ===
                  "cofre"
                ? "Ex.: Dinheiro guardado"
                : "Ex.: Freelance"
          }
          placeholderTextColor={
            theme.colors
              .textSecondary
          }
          style={[
            styles.descriptionInput,
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

        {isGasto && (
          <View
            style={
              styles.cofreSection
            }
          >
            <CheckboxRow
              label="Descontar do Cofre"
              checked={
                descontarDoCofre
              }
              onPress={() =>
                setDescontarDoCofre(
                  !descontarDoCofre
                )
              }
            />

            <Text
              style={[
                styles.cofreHint,
                {
                  color:
                    theme.colors
                      .textSecondary,
                },
              ]}
            >
              Se marcado, este gasto será descontado
              do Cofre em vez do dinheiro do mês.
            </Text>
          </View>
        )}

        {isPride ? (
          <Pressable
            onPress={
              salvarMovimentacao
            }
            disabled={
              salvando
            }
          >
            <ThemeAccent
              style={
                styles.saveButton
              }
            >
              <Text
                style={
                  styles.saveButtonText
                }
              >
                {salvando
                  ? "Salvando..."
                  : movimentacaoAgendada
                    ? "Agendar movimentação"
                    : "Registrar movimentação"}
              </Text>
            </ThemeAccent>
          </Pressable>
        ) : (
          <Pressable
            onPress={
              salvarMovimentacao
            }
            disabled={
              salvando
            }
            style={[
              styles.saveButton,
              {
                backgroundColor:
                  movimentacaoAgendada
                    ? theme.colors
                        .warning
                    : theme.colors
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
                : movimentacaoAgendada
                  ? "Agendar movimentação"
                  : "Registrar movimentação"}
            </Text>
          </Pressable>
        )}

        {__DEV__ && (
          <>
            <Pressable
              onPress={
                prepararTesteDeficitParcial
              }
              style={[
                styles.devScenarioButton,
                {
                  borderColor:
                    theme.colors.border,
                },
              ]}
            >
              <MaterialIcons
                name="science"
                size={20}
                color={
                  theme.colors.primary
                }
              />

              <Text
                style={[
                  styles.devScenarioText,
                  {
                    color:
                      theme.colors.primary,
                  },
                ]}
              >
                Testar déficit parcial
              </Text>
            </Pressable>

            <Pressable
              onPress={
                limparDadosDeTeste
              }
              style={[
                styles.devResetButton,
                {
                  borderColor:
                    theme.colors.border,
                },
              ]}
            >
              <MaterialIcons
                name="delete-sweep"
                size={20}
                color="#FF5A67"
              />

              <Text
                style={
                  styles.devResetText
                }
              >
                Zerar dados de teste
              </Text>
            </Pressable>
          </>
        )}
      </ScrollView>

      <CategoryPicker
        visible={
          mostrarSeletorCategoria
        }
        selectedId={
          categoriaSelecionada.id
        }
        categories={
          categoriasDisponiveis
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

function CheckboxRow({
  label,
  checked,
  onPress,
}: CheckboxRowProps) {
  const {
    theme,
    activeSpecialTheme,
  } = useTheme();

  const isPride =
    activeSpecialTheme ===
    "pride";

  return (
    <Pressable
      onPress={onPress}
      style={
        styles.checkboxRow
      }
    >
      {checked &&
      isPride ? (
        <ThemeAccent
          style={
            styles.checkbox
          }
        >
          <MaterialIcons
            name="check"
            size={18}
            color="#FFFFFF"
          />
        </ThemeAccent>
      ) : (
        <View
          style={[
            styles.checkbox,
            {
              borderColor:
                checked
                  ? theme.colors.primary
                  : theme.colors
                      .textSecondary,
              backgroundColor:
                checked
                  ? theme.colors.primary
                  : "transparent",
            },
          ]}
        >
          {checked && (
            <MaterialIcons
              name="check"
              size={18}
              color="#FFFFFF"
            />
          )}
        </View>
      )}

      <Text
        style={[
          styles.checkboxLabel,
          {
            color:
              theme.colors.text,
          },
        ]}
      >
        {label}
      </Text>
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
      marginLeft: 4,
    },

    segmentedControl: {
      flexDirection: "row",
      height: 54,
      borderRadius: 15,
      borderWidth: 1,
      padding: 3,
      marginBottom: 22,
    },

    segment: {
      flex: 1,
      borderRadius: 11,
      overflow: "hidden",
    },

    segmentContent: {
      flex: 1,
      alignItems: "center",
      justifyContent:
        "center",
    },

    segmentAccent: {
      flex: 1,
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

    valueCard: {
      height: 112,
      borderRadius: 18,
      borderWidth: 1,
      paddingHorizontal: 20,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 22,
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

    label: {
      fontSize: 16,
      fontWeight: "700",
      marginBottom: 9,
    },

    field: {
      minHeight: 64,
      borderRadius: 15,
      borderWidth: 1,
      paddingHorizontal: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      marginBottom: 19,
    },

    fieldLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 13,
    },

    fieldRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },

    fieldText: {
      fontSize: 16,
      fontWeight: "600",
    },

    fieldHint: {
      fontSize: 14,
      fontWeight: "600",
    },

    scheduleCard: {
      borderRadius: 16,
      borderWidth: 1,
      padding: 15,
      flexDirection: "row",
      alignItems:
        "flex-start",
      marginTop: -5,
      marginBottom: 19,
    },

    scheduleIcon: {
      width: 42,
      height: 42,
      borderRadius: 13,
      alignItems: "center",
      justifyContent:
        "center",
      marginRight: 12,
    },

    scheduleContent: {
      flex: 1,
    },

    scheduleTitle: {
      fontSize: 15,
      fontWeight: "700",
      marginBottom: 4,
    },

    scheduleDescription: {
      fontSize: 13,
      lineHeight: 18,
    },

    categoryIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent:
        "center",
    },

    destinationControl: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 19,
    },

    destinationOption: {
      flex: 1,
      height: 66,
      borderRadius: 15,
      borderWidth: 1,
      overflow: "hidden",
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      gap: 8,
    },

    destinationAccent: {
      width: "100%",
      height: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      gap: 8,
    },

    destinationText: {
      fontSize: 14,
      fontWeight: "700",
    },

    destinationTextSelected: {
      color: "#FFFFFF",
    },

    transferSection: {
      marginTop: -3,
      marginBottom: 18,
    },

    descriptionInput: {
      height: 62,
      borderRadius: 15,
      borderWidth: 1,
      paddingHorizontal: 16,
      fontSize: 16,
      marginBottom: 21,
    },

    cofreSection: {
      marginBottom: 2,
    },

    checkboxRow: {
      flexDirection: "row",
      alignItems: "center",
      minHeight: 45,
    },

    checkbox: {
      width: 25,
      height: 25,
      borderRadius: 6,
      borderWidth: 2,
      borderColor:
        "transparent",
      alignItems: "center",
      justifyContent:
        "center",
      marginRight: 13,
      overflow: "hidden",
    },

    checkboxLabel: {
      flex: 1,
      fontSize: 16,
      fontWeight: "500",
    },

    cofreHint: {
      fontSize: 13,
      lineHeight: 18,
      marginLeft: 38,
      marginTop: 1,
    },

    saveButton: {
      height: 58,
      borderRadius: 16,
      alignItems: "center",
      justifyContent:
        "center",
      marginTop: 24,
      overflow: "hidden",
    },

    saveButtonText: {
      color: "#FFFFFF",
      fontSize: 17,
      fontWeight: "700",
    },

    devScenarioButton: {
      height: 50,
      borderRadius: 15,
      borderWidth: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      gap: 8,
      marginTop: 18,
    },

    devScenarioText: {
      fontSize: 14,
      fontWeight: "700",
    },

    devResetButton: {
      height: 50,
      borderRadius: 15,
      borderWidth: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      gap: 8,
      marginTop: 10,
    },

    devResetText: {
      color: "#FF5A67",
      fontSize: 14,
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