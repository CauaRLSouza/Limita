import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  Categoria,
  categoriasEntrada,
  categoriasGasto,
} from "./CategoryPicker";
import ThemeAccent from "./ThemeAccent";
import { useTheme } from "../theme/ThemeContext";

export type TransactionFilterValue = {
  categoriaId: string | null;
  dataInicial: Date | null;
  dataFinal: Date | null;
};

type TransactionFilterModalProps = {
  visible: boolean;
  value: TransactionFilterValue;
  onApply: (value: TransactionFilterValue) => void;
  onClose: () => void;
};

type SeletorData = "inicial" | "final" | null;

const categorias = [
  ...categoriasGasto,
  ...categoriasEntrada.filter(
    (categoriaEntrada) =>
      !categoriasGasto.some(
        (categoriaGasto) =>
          categoriaGasto.id === categoriaEntrada.id
      )
  ),
];

export default function TransactionFilterModal({
  visible,
  value,
  onApply,
  onClose,
}: TransactionFilterModalProps) {
  const {
    theme,
    activeSpecialTheme,
  } = useTheme();

  const [categoriaId, setCategoriaId] = useState<string | null>(
    value.categoriaId
  );

  const [dataInicial, setDataInicial] = useState<Date | null>(
    value.dataInicial
  );

  const [dataFinal, setDataFinal] = useState<Date | null>(
    value.dataFinal
  );

  const [seletorData, setSeletorData] =
    useState<SeletorData>(null);

  const isPride =
    activeSpecialTheme === "pride";

  function formatarData(date: Date | null) {
    if (!date) {
      return "Qualquer data";
    }

    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  }

  function selecionarData(
    event: DateTimePickerEvent,
    novaData?: Date
  ) {
    if (Platform.OS === "android") {
      setSeletorData(null);
    }

    if (
      event.type !== "set" ||
      !novaData ||
      !seletorData
    ) {
      return;
    }

    if (seletorData === "inicial") {
      setDataInicial(novaData);

      if (
        dataFinal &&
        novaData > dataFinal
      ) {
        setDataFinal(null);
      }

      return;
    }

    setDataFinal(novaData);
  }

  function limparFiltros() {
    setCategoriaId(null);
    setDataInicial(null);
    setDataFinal(null);
    setSeletorData(null);
  }

  function aplicarFiltros() {
    onApply({
      categoriaId,
      dataInicial,
      dataFinal,
    });

    onClose();
  }

  function fecharModal() {
    setCategoriaId(value.categoriaId);
    setDataInicial(value.dataInicial);
    setDataFinal(value.dataFinal);
    setSeletorData(null);
    onClose();
  }

  function renderCategoria(categoria: Categoria) {
    const selecionada =
      categoriaId === categoria.id;

    if (selecionada && isPride) {
      return (
        <Pressable
          key={categoria.id}
          onPress={() =>
            setCategoriaId(
              categoriaId === categoria.id
                ? null
                : categoria.id
            )
          }
          style={styles.categoryWrapper}
        >
          <ThemeAccent
            style={styles.categorySelected}
          >
            <MaterialIcons
              name={categoria.icon}
              size={18}
              color="#FFFFFF"
            />

            <Text style={styles.categorySelectedText}>
              {categoria.nome}
            </Text>
          </ThemeAccent>
        </Pressable>
      );
    }

    return (
      <Pressable
        key={categoria.id}
        onPress={() =>
          setCategoriaId(
            categoriaId === categoria.id
              ? null
              : categoria.id
          )
        }
        style={[
          styles.category,
          {
            backgroundColor: selecionada
              ? theme.colors.primary
              : theme.colors.surfaceSecondary,
            borderColor: selecionada
              ? theme.colors.primary
              : theme.colors.border,
          },
        ]}
      >
        <MaterialIcons
          name={categoria.icon}
          size={18}
          color={
            selecionada
              ? "#FFFFFF"
              : categoria.cor
          }
        />

        <Text
          style={[
            styles.categoryText,
            {
              color: selecionada
                ? "#FFFFFF"
                : theme.colors.text,
            },
          ]}
        >
          {categoria.nome}
        </Text>
      </Pressable>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={fecharModal}
    >
      <Pressable
        style={styles.overlay}
        onPress={fecharModal}
      >
        <Pressable
          onPress={() => {}}
          style={[
            styles.modal,
            {
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.header}>
            <Text
              style={[
                styles.title,
                {
                  color: theme.colors.text,
                },
              ]}
            >
              Filtrar movimentações
            </Text>

            <Pressable
              onPress={fecharModal}
              style={styles.closeButton}
            >
              <MaterialIcons
                name="close"
                size={26}
                color={theme.colors.text}
              />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: theme.colors.text,
                },
              ]}
            >
              Categoria
            </Text>

            <View style={styles.categories}>
              {categorias.map(renderCategoria)}
            </View>

            <Text
              style={[
                styles.sectionTitle,
                styles.periodTitle,
                {
                  color: theme.colors.text,
                },
              ]}
            >
              Período
            </Text>

            <Text
              style={[
                styles.dateLabel,
                {
                  color: theme.colors.textSecondary,
                },
              ]}
            >
              De
            </Text>

            <Pressable
              onPress={() =>
                setSeletorData("inicial")
              }
              style={[
                styles.dateField,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <View style={styles.dateLeft}>
                <MaterialIcons
                  name="calendar-today"
                  size={20}
                  color={theme.colors.textSecondary}
                />

                <Text
                  style={[
                    styles.dateText,
                    {
                      color: dataInicial
                        ? theme.colors.text
                        : theme.colors.textSecondary,
                    },
                  ]}
                >
                  {formatarData(dataInicial)}
                </Text>
              </View>

              {dataInicial && (
                <Pressable
                  onPress={() =>
                    setDataInicial(null)
                  }
                  hitSlop={10}
                >
                  <MaterialIcons
                    name="close"
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                </Pressable>
              )}
            </Pressable>

            <Text
              style={[
                styles.dateLabel,
                {
                  color: theme.colors.textSecondary,
                },
              ]}
            >
              Até
            </Text>

            <Pressable
              onPress={() =>
                setSeletorData("final")
              }
              style={[
                styles.dateField,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <View style={styles.dateLeft}>
                <MaterialIcons
                  name="event"
                  size={21}
                  color={theme.colors.textSecondary}
                />

                <Text
                  style={[
                    styles.dateText,
                    {
                      color: dataFinal
                        ? theme.colors.text
                        : theme.colors.textSecondary,
                    },
                  ]}
                >
                  {formatarData(dataFinal)}
                </Text>
              </View>

              {dataFinal && (
                <Pressable
                  onPress={() =>
                    setDataFinal(null)
                  }
                  hitSlop={10}
                >
                  <MaterialIcons
                    name="close"
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                </Pressable>
              )}
            </Pressable>

            {seletorData && (
              <DateTimePicker
                value={
                  seletorData === "inicial"
                    ? dataInicial ?? new Date()
                    : dataFinal ??
                      dataInicial ??
                      new Date()
                }
                mode="date"
                display={
                  Platform.OS === "ios"
                    ? "spinner"
                    : "default"
                }
                minimumDate={
                  seletorData === "final" &&
                  dataInicial
                    ? dataInicial
                    : undefined
                }
                onChange={selecionarData}
              />
            )}
          </ScrollView>

          <View
            style={[
              styles.footer,
              {
                borderTopColor: theme.colors.border,
              },
            ]}
          >
            <Pressable
              onPress={limparFiltros}
              style={[
                styles.clearButton,
                {
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.clearButtonText,
                  {
                    color: theme.colors.text,
                  },
                ]}
              >
                Limpar
              </Text>
            </Pressable>

            {isPride ? (
              <Pressable
                onPress={aplicarFiltros}
                style={styles.applyWrapper}
              >
                <ThemeAccent
                  style={styles.applyButton}
                >
                  <Text style={styles.applyButtonText}>
                    Aplicar filtros
                  </Text>
                </ThemeAccent>
              </Pressable>
            ) : (
              <Pressable
                onPress={aplicarFiltros}
                style={[
                  styles.applyButton,
                  styles.applyWrapper,
                  {
                    backgroundColor: theme.colors.primary,
                  },
                ]}
              >
                <Text style={styles.applyButtonText}>
                  Aplicar filtros
                </Text>
              </Pressable>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "flex-end",
  },

  modal: {
    maxHeight: "86%",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingTop: 20,
  },

  header: {
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
  },

  closeButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 12,
  },

  periodTitle: {
    marginTop: 25,
  },

  categories: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },

  categoryWrapper: {
    borderRadius: 12,
    overflow: "hidden",
  },

  category: {
    minHeight: 42,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  categorySelected: {
    minHeight: 42,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderRadius: 12,
  },

  categoryText: {
    fontSize: 14,
    fontWeight: "600",
  },

  categorySelectedText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  dateLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 7,
  },

  dateField: {
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  dateLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  dateText: {
    fontSize: 15,
    fontWeight: "600",
  },

  footer: {
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 24,
    flexDirection: "row",
    gap: 10,
  },

  clearButton: {
    height: 54,
    paddingHorizontal: 22,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  clearButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },

  applyWrapper: {
    flex: 1,
  },

  applyButton: {
    height: 54,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  applyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});