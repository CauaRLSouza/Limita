import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import SearchBar from "../../components/SearchBar";
import TabHeader from "../../components/TabHeader";
import ThemeAccent from "../../components/ThemeAccent";
import TransactionFilterModal, {
  TransactionFilterValue,
} from "../../components/TransactionFilterModal";
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

const prideCategoryColors: Record<string, string> = {
  Alimentação: "#FF3158",
  Transporte: "#168AF2",
  Lazer: "#FF9F1C",
  Contas: "#A855F7",
  Salário: "#22C55E",
  Outro: "#D946EF",
};

const filtrosIniciais: TransactionFilterValue = {
  categoriaId: null,
  dataInicial: null,
  dataFinal: null,
};

function formatarValor(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function normalizarTexto(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function obterMesNumero(mes: string) {
  const meses: Record<string, number> = {
    janeiro: 0,
    fevereiro: 1,
    março: 2,
    abril: 3,
    maio: 4,
    junho: 5,
    julho: 6,
    agosto: 7,
    setembro: 8,
    outubro: 9,
    novembro: 10,
    dezembro: 11,
  };

  const nomeMes = mes.split(" ")[0].toLowerCase();

  return meses[nomeMes];
}

function obterAno(mes: string) {
  return Number(mes.split(" ")[1]);
}

function obterDataMovimentacao(
  grupo: GrupoMes,
  movimentacao: Movimentacao
) {
  const [dia, mes] = movimentacao.data
    .split("/")
    .map(Number);

  const ano = obterAno(grupo.mes);
  const mesGrupo = obterMesNumero(grupo.mes);

  return new Date(
    ano,
    Number.isNaN(mes) ? mesGrupo : mes - 1,
    dia
  );
}

function inicioDoDia(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
}

function fimDoDia(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999
  );
}

export default function HistoricoScreen() {
  const {
    theme,
    activeSpecialTheme,
  } = useTheme();

  const [filtro, setFiltro] =
    useState<Filtro>("todos");

  const [pesquisaAberta, setPesquisaAberta] =
    useState(false);

  const [pesquisa, setPesquisa] =
    useState("");

  const [
    modalFiltrosAberto,
    setModalFiltrosAberto,
  ] = useState(false);

  const [
    filtrosAvancados,
    setFiltrosAvancados,
  ] = useState<TransactionFilterValue>(
    filtrosIniciais
  );

  const isPride =
    activeSpecialTheme === "pride";

  const temFiltroAvancado =
    filtrosAvancados.categoriaId !== null ||
    filtrosAvancados.dataInicial !== null ||
    filtrosAvancados.dataFinal !== null;

  const gruposFiltrados = useMemo(() => {
    const termoPesquisa =
      normalizarTexto(pesquisa);

    return grupos
      .map((grupo) => ({
        ...grupo,
        movimentacoes:
          grupo.movimentacoes.filter(
            (movimentacao) => {
              if (
                filtro === "entradas" &&
                movimentacao.tipo !==
                  "entrada"
              ) {
                return false;
              }

              if (
                filtro === "gastos" &&
                movimentacao.tipo !==
                  "gasto"
              ) {
                return false;
              }

              if (
                filtrosAvancados.categoriaId
              ) {
                const categoriaFiltro =
                  normalizarTexto(
                    filtrosAvancados
                      .categoriaId
                  );

                const categoriaMovimentacao =
                  normalizarTexto(
                    movimentacao.categoria
                  );

                if (
                  categoriaFiltro !==
                  categoriaMovimentacao
                ) {
                  return false;
                }
              }

              if (termoPesquisa) {
                const titulo =
                  normalizarTexto(
                    movimentacao.titulo
                  );

                const categoria =
                  normalizarTexto(
                    movimentacao.categoria
                  );

                const correspondePesquisa =
                  titulo.includes(
                    termoPesquisa
                  ) ||
                  categoria.includes(
                    termoPesquisa
                  );

                if (
                  !correspondePesquisa
                ) {
                  return false;
                }
              }

              if (
                filtrosAvancados
                  .dataInicial ||
                filtrosAvancados.dataFinal
              ) {
                const dataMovimentacao =
                  obterDataMovimentacao(
                    grupo,
                    movimentacao
                  );

                if (
                  filtrosAvancados
                    .dataInicial &&
                  dataMovimentacao <
                    inicioDoDia(
                      filtrosAvancados
                        .dataInicial
                    )
                ) {
                  return false;
                }

                if (
                  filtrosAvancados
                    .dataFinal &&
                  dataMovimentacao >
                    fimDoDia(
                      filtrosAvancados
                        .dataFinal
                    )
                ) {
                  return false;
                }
              }

              return true;
            }
          ),
      }))
      .filter(
        (grupo) =>
          grupo.movimentacoes.length > 0
      );
  }, [
    filtro,
    pesquisa,
    filtrosAvancados,
  ]);

  function getIconColor(
    movimentacao: Movimentacao
  ) {
    if (!isPride) {
      return movimentacao.iconColor;
    }

    return (
      prideCategoryColors[
        movimentacao.categoria
      ] ?? "#D946EF"
    );
  }

  function abrirPesquisa() {
    setPesquisaAberta(true);
  }

  function fecharPesquisa() {
    setPesquisa("");
    setPesquisaAberta(false);
  }

  function limparTudo() {
    setFiltro("todos");
    setPesquisa("");
    setFiltrosAvancados({
      categoriaId: null,
      dataInicial: null,
      dataFinal: null,
    });
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
        <TabHeader />

        <View style={styles.header}>
          <Text
            style={[
              styles.title,
              {
                color: theme.colors.text,
              },
            ]}
          >
            Histórico
          </Text>

          <View
            style={styles.headerActions}
          >
            <Pressable
              onPress={
                pesquisaAberta
                  ? fecharPesquisa
                  : abrirPesquisa
              }
              style={[
                styles.headerButton,
                pesquisaAberta && {
                  backgroundColor:
                    theme.colors
                      .surfaceSecondary,
                },
              ]}
            >
              <MaterialIcons
                name={
                  pesquisaAberta
                    ? "close"
                    : "search"
                }
                size={29}
                color={
                  pesquisaAberta
                    ? theme.colors.primary
                    : theme.colors.text
                }
              />
            </Pressable>

            <Pressable
              onPress={() =>
                setModalFiltrosAberto(
                  true
                )
              }
              style={[
                styles.headerButton,
                temFiltroAvancado && {
                  backgroundColor:
                    theme.colors
                      .surfaceSecondary,
                },
              ]}
            >
              <MaterialIcons
                name="filter-list"
                size={29}
                color={
                  temFiltroAvancado
                    ? theme.colors.primary
                    : theme.colors.text
                }
              />

              {temFiltroAvancado && (
                <View
                  style={[
                    styles.filterIndicator,
                    {
                      backgroundColor:
                        theme.colors
                          .primary,
                    },
                  ]}
                />
              )}
            </Pressable>
          </View>
        </View>

        {pesquisaAberta && (
          <View
            style={
              styles.searchContainer
            }
          >
            <SearchBar
              value={pesquisa}
              onChangeText={setPesquisa}
              placeholder="Pesquisar movimentações"
              onClose={fecharPesquisa}
              autoFocus
            />
          </View>
        )}

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
          <FilterButton
            label="Todos"
            active={filtro === "todos"}
            onPress={() =>
              setFiltro("todos")
            }
          />

          <FilterButton
            label="Entradas"
            active={
              filtro === "entradas"
            }
            onPress={() =>
              setFiltro("entradas")
            }
          />

          <FilterButton
            label="Gastos"
            active={filtro === "gastos"}
            onPress={() =>
              setFiltro("gastos")
            }
          />
        </View>

        {gruposFiltrados.length > 0 ? (
          <View style={styles.groups}>
            {gruposFiltrados.map(
              (grupo) => {
                const resultado =
                  grupo.movimentacoes.reduce(
                    (
                      total,
                      movimentacao
                    ) => {
                      if (
                        movimentacao.tipo ===
                        "entrada"
                      ) {
                        return (
                          total +
                          movimentacao.valor
                        );
                      }

                      return (
                        total -
                        movimentacao.valor
                      );
                    },
                    0
                  );

                return (
                  <View
                    key={grupo.mes}
                    style={
                      styles.monthGroup
                    }
                  >
                    <View
                      style={[
                        styles.monthHeader,
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
                          styles.monthTitle,
                          {
                            color:
                              theme.colors
                                .text,
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
                                ? theme
                                    .colors
                                    .success
                                : theme
                                    .colors
                                    .danger,
                          },
                        ]}
                      >
                        {resultado >= 0
                          ? "+"
                          : "-"}{" "}
                        {formatarValor(
                          Math.abs(
                            resultado
                          )
                        )}
                      </Text>
                    </View>

                    <View>
                      {grupo.movimentacoes.map(
                        (
                          movimentacao,
                          index
                        ) => (
                          <View
                            key={
                              movimentacao.id
                            }
                            style={[
                              styles.transaction,
                              index !==
                                grupo
                                  .movimentacoes
                                  .length -
                                  1 && {
                                borderBottomWidth: 1,
                                borderBottomColor:
                                  theme
                                    .colors
                                    .border,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.transactionDate,
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

                            <View
                              style={[
                                styles.transactionIcon,
                                {
                                  backgroundColor:
                                    getIconColor(
                                      movimentacao
                                    ),
                                },
                              ]}
                            >
                              <MaterialIcons
                                name={
                                  movimentacao.icon
                                }
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
                                numberOfLines={
                                  1
                                }
                                style={[
                                  styles.transactionTitle,
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
                                numberOfLines={
                                  1
                                }
                                style={[
                                  styles.transactionCategory,
                                  {
                                    color:
                                      theme
                                        .colors
                                        .textSecondary,
                                  },
                                ]}
                              >
                                {
                                  movimentacao.categoria
                                }
                              </Text>
                            </View>

                            <Text
                              style={[
                                styles.transactionValue,
                                {
                                  color:
                                    movimentacao.tipo ===
                                    "entrada"
                                      ? theme
                                          .colors
                                          .success
                                      : theme
                                          .colors
                                          .danger,
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
              }
            )}
          </View>
        ) : (
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
                name="search-off"
                size={32}
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
                styles.emptyDescription,
                {
                  color:
                    theme.colors
                      .textSecondary,
                },
              ]}
            >
              Não encontramos movimentações
              que correspondam à sua pesquisa
              e aos filtros selecionados.
            </Text>

            <Pressable
              onPress={limparTudo}
              style={[
                styles.emptyButton,
                {
                  borderColor:
                    theme.colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.emptyButtonText,
                  {
                    color:
                      theme.colors.text,
                  },
                ]}
              >
                Limpar filtros
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      <TransactionFilterModal
        visible={modalFiltrosAberto}
        value={filtrosAvancados}
        onApply={setFiltrosAvancados}
        onClose={() =>
          setModalFiltrosAberto(false)
        }
      />
    </>
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
              : theme.colors
                  .textSecondary,
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
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  filterIndicator: {
    position: "absolute",
    top: 7,
    right: 6,
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  searchContainer: {
    marginTop: -8,
    marginBottom: 18,
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
    alignItems: "stretch",
    justifyContent: "center",
  },

  filterAccent: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
  },

  filterText: {
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
    textAlignVertical: "center",
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

  emptyState: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 34,
    alignItems: "center",
  },

  emptyIcon: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: "700",
    marginBottom: 7,
  },

  emptyDescription: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    maxWidth: 290,
  },

  emptyButton: {
    minHeight: 46,
    borderRadius: 13,
    borderWidth: 1,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },

  emptyButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
});