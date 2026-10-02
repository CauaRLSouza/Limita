import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { useState } from "react";
import {
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
import { useTheme } from "../theme/ThemeContext";

type TipoMovimentacao = "gasto" | "entrada";

type CheckboxRowProps = {
  label: string;
  checked: boolean;
  onPress: () => void;
};

export default function RegistrarMovimentacaoScreen() {
  const {
    theme,
    activeSpecialTheme,
  } = useTheme();

  const [tipo, setTipo] =
    useState<TipoMovimentacao>("gasto");

  const [valor, setValor] = useState("42,90");
  const [descricao, setDescricao] = useState("");

  const [data, setData] =
    useState(() => new Date());

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

  const isGasto = tipo === "gasto";

  const isPride =
    activeSpecialTheme === "pride";

  const movimentacaoAgendada =
    dataEhFutura(data);

  const categoriaSelecionada =
    isGasto
      ? categoriaGastoSelecionada
      : categoriaEntradaSelecionada;

  const categoriasDisponiveis =
    isGasto
      ? categoriasGasto
      : categoriasEntrada;

  function trocarTipo(
    novoTipo: TipoMovimentacao
  ) {
    setTipo(novoTipo);
    setMostrarSeletorCategoria(false);

    if (novoTipo === "gasto") {
      setValor("42,90");
    } else {
      setValor("500,00");
    }
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

  function dataEhHoje(
    date: Date
  ) {
    const hoje = new Date();

    return (
      date.getDate() ===
        hoje.getDate() &&
      date.getMonth() ===
        hoje.getMonth() &&
      date.getFullYear() ===
        hoje.getFullYear()
    );
  }

  function dataEhFutura(
    date: Date
  ) {
    const hoje = new Date();

    const dataSelecionada = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

    const dataAtual = new Date(
      hoje.getFullYear(),
      hoje.getMonth(),
      hoje.getDate()
    );

    return dataSelecionada > dataAtual;
  }

  function alterarData(
    event: DateTimePickerEvent,
    novaData?: Date
  ) {
    if (Platform.OS === "android") {
      setMostrarSeletorData(false);
    }

    if (
      event.type === "set" &&
      novaData
    ) {
      setData(novaData);
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
        <View
          style={styles.segmentContent}
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
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <MaterialIcons
              name="arrow-back"
              size={28}
              color={theme.colors.text}
            />
          </Pressable>

          <Text
            style={[
              styles.headerTitle,
              {
                color: theme.colors.text,
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
            () => trocarTipo("gasto")
          )}

          {renderSegment(
            "Entrada",
            !isGasto,
            () => trocarTipo("entrada")
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
            onChangeText={setValor}
            keyboardType="decimal-pad"
            placeholder="0,00"
            placeholderTextColor={
              theme.colors.textSecondary
            }
            style={[
              styles.valueInput,
              {
                color: theme.colors.text,
              },
            ]}
          />
        </View>

        <Text
          style={[
            styles.label,
            {
              color: theme.colors.text,
            },
          ]}
        >
          Data
        </Text>

        <Pressable
          onPress={() =>
            setMostrarSeletorData(true)
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
            style={styles.fieldLeft}
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
              {formatarData(data)}
            </Text>
          </View>

          <View
            style={styles.fieldRight}
          >
            {dataEhHoje(data) && (
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
                      theme.colors.warning,
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
            onChange={alterarData}
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
              color: theme.colors.text,
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
            style={styles.fieldLeft}
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
              theme.colors.textSecondary
            }
          />
        </Pressable>

        <Text
          style={[
            styles.label,
            {
              color: theme.colors.text,
            },
          ]}
        >
          Descrição (opcional)
        </Text>

        <TextInput
          value={descricao}
          onChangeText={setDescricao}
          placeholder={
            isGasto
              ? "Ex.: Pizza"
              : "Ex.: Freelance"
          }
          placeholderTextColor={
            theme.colors.textSecondary
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
          <View style={styles.cofreSection}>
            <CheckboxRow
              label="Descontar do Cofre"
              checked={descontarDoCofre}
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
          <Pressable>
            <ThemeAccent
              style={styles.saveButton}
            >
              <Text
                style={
                  styles.saveButtonText
                }
              >
                {movimentacaoAgendada
                  ? "Agendar movimentação"
                  : "Registrar movimentação"}
              </Text>
            </ThemeAccent>
          </Pressable>
        ) : (
          <Pressable
            style={[
              styles.saveButton,
              {
                backgroundColor:
                  movimentacaoAgendada
                    ? theme.colors.warning
                    : theme.colors
                        .primary,
              },
            ]}
          >
            <Text
              style={
                styles.saveButtonText
              }
            >
              {movimentacaoAgendada
                ? "Agendar movimentação"
                : "Registrar movimentação"}
            </Text>
          </Pressable>
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
    activeSpecialTheme === "pride";

  return (
    <Pressable
      onPress={onPress}
      style={styles.checkboxRow}
    >
      {checked && isPride ? (
        <ThemeAccent
          style={styles.checkbox}
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
              borderColor: checked
                ? theme.colors.primary
                : theme.colors
                    .textSecondary,
              backgroundColor: checked
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
            color: theme.colors.text,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "transparent",
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
    justifyContent: "center",
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
    justifyContent: "center",
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
    justifyContent: "space-between",
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
    alignItems: "flex-start",
    marginTop: -5,
    marginBottom: 19,
  },

  scheduleIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
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
    justifyContent: "center",
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
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
    overflow: "hidden",
  },

  checkboxLabel: {
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
    justifyContent: "center",
    marginTop: 24,
    overflow: "hidden",
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
});