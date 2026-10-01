import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import TabHeader from "../../components/TabHeader";
import ThemeAccent from "../../components/ThemeAccent";
import { useTheme } from "../../theme/ThemeContext";

type Filtro = "todos" | "entradas" | "gastos";
type TipoMovimentacao = "entrada" | "gasto";

type Movimentacao = {
  id: number;
  data: string;
  titulo: string;
  categoria: string;
  valor: number;
  tipo: TipoMovimentacao;
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor: string;
};

type GrupoMes = {
  mes: string;
  movimentacoes: Movimentacao[];
};

const grupos: GrupoMes[] = [
  {
    mes: "Outubro 2026",
    movimentacoes: [
      {
        id: 1,
        data: "14/10",
        titulo: "Pizza",
        categoria: "Alimentação",
        valor: 42.9,
        tipo: "gasto",
        icon: "restaurant",
        iconColor: "#EF4444",
      },
      {
        id: 2,
        data: "14/10",
        titulo: "Uber",
        categoria: "Transporte",
        valor: 18.4,
        tipo: "gasto",
        icon: "directions-car",
        iconColor: "#38A8D8",
      },
      {
        id: 3,
        data: "13/10",
        titulo: "Mercado",
        categoria: "Alimentação",
        valor: 83.2,
        tipo: "gasto",
        icon: "shopping-cart",
        iconColor: "#EF4444",
      },
      {
        id: 4,
        data: "12/10",
        titulo: "Cinema",
        categoria: "Lazer",
        valor: 36,
        tipo: "gasto",
        icon: "movie",
        iconColor: "#EC5A5A",
      },
      {
        id: 5,
        data: "11/10",
        titulo: "Freelance",
        categoria: "Outro",
        valor: 500,
        tipo: "entrada",
        icon: "payments",
        iconColor: "#16A36A",
      },
    ],
  },
  {
    mes: "Setembro 2026",
    movimentacoes: [
      {
        id: 6,
        data: "30/09",
        titulo: "Internet",
        categoria: "Contas",
        valor: 120,
        tipo: "gasto",
        icon: "language",
        iconColor: "#EF4444",
      },
      {
        id: 7,
        data: "25/09",
        titulo: "Salário",
        categoria: "Salário",
        valor: 3600,
        tipo: "entrada",
        icon: "account-balance-wallet",
        iconColor: "#16A36A",
      },
      {
        id: 8,
        data: "22/09",
        titulo: "Supermercado",
        categoria: "Alimentação",
        valor: 214.75,
        tipo: "gasto",
        icon: "shopping-cart",
        iconColor: "#EF4444",
      },
      {
        id: 9,
        data: "18/09",
        titulo: "Combustível",
        categoria: "Transporte",
        valor: 150,
        tipo: "gasto",
        icon: "local-gas-station",
        iconColor: "#38A8D8",
      },
    ],
  },
];

function formatarValor(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function HistoricoScreen() {
  const {
    theme,
    activeSpecialTheme,
  } = useTheme();

  const [filtro, setFiltro] =
    useState<Filtro>("todos");

  const isMeanGirls =
    activeSpecialTheme === "meanGirls";

  const gruposFiltrados = useMemo(() => {
    return grupos
      .map((grupo) => ({
        ...grupo,
        movimentacoes: grupo.movimentacoes.filter(
          (movimentacao) => {
            if (filtro === "todos") {
              return true;
            }

            if (filtro === "entradas") {
              return movimentacao.tipo === "entrada";
            }

            return movimentacao.tipo === "gasto";
          }
        ),
      }))
      .filter(
        (grupo) => grupo.movimentacoes.length > 0
      );
  }, [filtro]);

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: isMeanGirls
          ? "transparent"
          : theme.colors.background,
      }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <TabHeader />

      <View style={styles.header}>
        <Text
          style={[
            styles.title,
            { color: theme.colors.text },
          ]}
        >
          Histórico
        </Text>

        <View style={styles.headerActions}>
          <Pressable style={styles.headerButton}>
            <MaterialIcons
              name="search"
              size={29}
              color={theme.colors.text}
            />
          </Pressable>

          <Pressable style={styles.headerButton}>
            <MaterialIcons
              name="filter-list"
              size={29}
              color={theme.colors.text}
            />
          </Pressable>
        </View>
      </View>

      <View
        style={[
          styles.segmentedControl,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <FilterButton
          label="Todos"
          active={filtro === "todos"}
          onPress={() => setFiltro("todos")}
        />

        <FilterButton
          label="Entradas"
          active={filtro === "entradas"}
          onPress={() => setFiltro("entradas")}
        />

        <FilterButton
          label="Gastos"
          active={filtro === "gastos"}
          onPress={() => setFiltro("gastos")}
        />
      </View>

      <View style={styles.groups}>
        {gruposFiltrados.map((grupo) => {
          const resultado =
            grupo.movimentacoes.reduce(
              (total, movimentacao) => {
                if (
                  movimentacao.tipo === "entrada"
                ) {
                  return total + movimentacao.valor;
                }

                return total - movimentacao.valor;
              },
              0
            );

          return (
            <View
              key={grupo.mes}
              style={styles.monthGroup}
            >
              <View
                style={[
                  styles.monthHeader,
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
                      color: theme.colors.text,
                    },
                  ]}
                >
                  {grupo.mes}
                </Text>

                <Text
                  style={[
                    styles.monthResult,
                    {
                      color:
                        resultado >= 0
                          ? theme.colors.success
                          : theme.colors.danger,
                    },
                  ]}
                >
                  {resultado >= 0 ? "+" : "-"}{" "}
                  {formatarValor(
                    Math.abs(resultado)
                  )}
                </Text>
              </View>

              <View>
                {grupo.movimentacoes.map(
                  (movimentacao, index) => (
                    <View
                      key={movimentacao.id}
                      style={[
                        styles.transaction,
                        index !==
                          grupo.movimentacoes
                            .length -
                            1 && {
                          borderBottomWidth: 1,
                          borderBottomColor:
                            theme.colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.transactionDate,
                          {
                            color:
                              theme.colors
                                .textSecondary,
                          },
                        ]}
                      >
                        {movimentacao.data}
                      </Text>

                      <View
                        style={[
                          styles.transactionIcon,
                          {
                            backgroundColor:
                              movimentacao.iconColor,
                          },
                        ]}
                      >
                        <MaterialIcons
                          name={movimentacao.icon}
                          size={22}
                          color="#FFFFFF"
                        />
                      </View>

                      <View
                        style={
                          styles.transactionInfo
                        }
                      >
                        <Text
                          numberOfLines={1}
                          style={[
                            styles.transactionTitle,
                            {
                              color:
                                theme.colors.text,
                            },
                          ]}
                        >
                          {movimentacao.titulo}
                        </Text>

                        <Text
                          numberOfLines={1}
                          style={[
                            styles.transactionCategory,
                            {
                              color:
                                theme.colors
                                  .textSecondary,
                            },
                          ]}
                        >
                          {movimentacao.categoria}
                        </Text>
                      </View>

                      <Text
                        style={[
                          styles.transactionValue,
                          {
                            color:
                              movimentacao.tipo ===
                              "entrada"
                                ? theme.colors.success
                                : theme.colors.danger,
                          },
                        ]}
                      >
                        {movimentacao.tipo ===
                        "entrada"
                          ? "+"
                          : "-"}{" "}
                        {formatarValor(
                          movimentacao.valor
                        )}
                      </Text>
                    </View>
                  )
                )}
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

type FilterButtonProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

function FilterButton({
  label,
  active,
  onPress,
}: FilterButtonProps) {
  const {
    theme,
    activeSpecialTheme,
  } = useTheme();

  const isPride =
    activeSpecialTheme === "pride";

  if (active && isPride) {
    return (
      <Pressable
        onPress={onPress}
        style={styles.filterButton}
      >
        <ThemeAccent
          style={styles.filterAccent}
        >
          <Text
            style={[
              styles.filterText,
              styles.activeFilterText,
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
        styles.filterButton,
        active && {
          backgroundColor:
            theme.colors.primary,
        },
      ]}
    >
      <Text
        style={[
          styles.filterText,
          {
            color: active
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

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -0.8,
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  headerButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },

  segmentedControl: {
    flexDirection: "row",
    height: 54,
    borderRadius: 15,
    borderWidth: 1,
    padding: 3,
    marginBottom: 26,
  },

  filterButton: {
    flex: 1,
    borderRadius: 11,
    overflow: "hidden",
  },

  filterAccent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
  },

  filterText: {
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },

  activeFilterText: {
    color: "#FFFFFF",
  },

  groups: {
    gap: 26,
  },

  monthGroup: {
    width: "100%",
  },

  monthHeader: {
    minHeight: 62,
    borderRadius: 17,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  monthTitle: {
    fontSize: 20,
    fontWeight: "700",
  },

  monthResult: {
    fontSize: 18,
    fontWeight: "700",
  },

  transaction: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
  },

  transactionDate: {
    width: 52,
    fontSize: 14,
    fontWeight: "600",
  },

  transactionIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  transactionInfo: {
    flex: 1,
    paddingRight: 8,
  },

  transactionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },

  transactionCategory: {
    fontSize: 14,
    marginTop: 3,
  },

  transactionValue: {
    fontSize: 15,
    fontWeight: "700",
    textAlign: "right",
  },
});