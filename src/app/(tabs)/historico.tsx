import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useFocusEffect } from "expo-router";
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

import SearchBar from "../../components/SearchBar";
import TabHeader from "../../components/TabHeader";
import ThemeAccent from "../../components/ThemeAccent";
import TransactionFilterModal, {
  TransactionFilterValue,
} from "../../components/TransactionFilterModal";
import {
  getTransactions,
  StoredTransaction,
} from "../../database/transactions";
import { useTheme } from "../../theme/ThemeContext";

type Filtro = "todos" | "entradas" | "gastos";
type TipoMovimentacao = "entrada" | "gasto";

type Movimentacao = {
  id: number;
  data: string;
  dataCompleta: string;
  titulo: string;
  categoria: string;
  valor: number;
  tipo: TipoMovimentacao;
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor: string;
};

type GrupoMes = {
  mes: string;
  chave: string;
  movimentacoes: Movimentacao[];
};

type CategoriaVisual = {
  nome: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  cor: string;
};

const categoriasVisuais: Record<
  string,
  CategoriaVisual
> = {
  alimentacao: {
    nome: "Alimentação",
    icon: "restaurant",
    cor: "#EF4444",
  },
  transporte: {
    nome: "Transporte",
    icon: "directions-car",
    cor: "#38A8D8",
  },
  lazer: {
    nome: "Lazer",
    icon: "movie",
    cor: "#EC5A5A",
  },
  contas: {
    nome: "Contas",
    icon: "receipt-long",
    cor: "#A855F7",
  },
  salario: {
    nome: "Salário",
    icon: "account-balance-wallet",
    cor: "#16A36A",
  },
  outro: {
    nome: "Outro",
    icon: "payments",
    cor: "#16A36A",
  },
};

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

function criarDataLocal(data: string) {
  const [ano, mes, dia] = data
    .split("-")
    .map(Number);

  return new Date(
    ano,
    mes - 1,
    dia
  );
}

function formatarDiaMes(data: string) {
  const date = criarDataLocal(data);

  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      day: "2-digit",
      month: "2-digit",
    }
  ).format(date);
}

function formatarMesAno(data: string) {
  const date = criarDataLocal(data);

  const texto =
    new Intl.DateTimeFormat(
      "pt-BR",
      {
        month: "long",
        year: "numeric",
      }
    ).format(date);

  return (
    texto.charAt(0).toUpperCase() +
    texto.slice(1)
  );
}

function obterCategoriaVisual(
  categoria: string | null,
  tipo: TipoMovimentacao
): CategoriaVisual {
  if (categoria) {
    const chave =
      normalizarTexto(categoria);

    const categoriaEncontrada =
      categoriasVisuais[chave];

    if (categoriaEncontrada) {
      return categoriaEncontrada;
    }
  }

  if (tipo === "entrada") {
    return {
      nome: categoria || "Outro",
      icon: "payments",
      cor: "#16A36A",
    };
  }

  return {
    nome: categoria || "Outro",
    icon: "receipt-long",
    cor: "#EF4444",
  };
}

function converterMovimentacao(
  transaction: StoredTransaction
): Movimentacao | null {
  if (transaction.type === "transfer") {
    return null;
  }

  const tipo: TipoMovimentacao =
    transaction.type === "income"
      ? "entrada"
      : "gasto";

  const categoria =
    obterCategoriaVisual(
      transaction.category,
      tipo
    );

  const titulo =
    transaction.description?.trim() ||
    categoria.nome;

  return {
    id: transaction.id,
    data: formatarDiaMes(
      transaction.date
    ),
    dataCompleta: transaction.date,
    titulo,
    categoria: categoria.nome,
    valor:
      transaction.amountCents / 100,
    tipo,
    icon: categoria.icon,
    iconColor: categoria.cor,
  };
}

function agruparMovimentacoes(
  transactions: StoredTransaction[]
): GrupoMes[] {
  const grupos = new Map<
    string,
    GrupoMes
  >();

  for (const transaction of transactions) {
    const movimentacao =
      converterMovimentacao(transaction);

    if (!movimentacao) {
      continue;
    }

    const chave =
      transaction.date.slice(0, 7);

    const grupoExistente =
      grupos.get(chave);

    if (grupoExistente) {
      grupoExistente.movimentacoes.push(
        movimentacao
      );
      continue;
    }

    grupos.set(chave, {
      chave,
      mes: formatarMesAno(
        transaction.date
      ),
      movimentacoes: [
        movimentacao,
      ],
    });
  }

  return Array.from(
    grupos.values()
  ).sort((a, b) =>
    b.chave.localeCompare(a.chave)
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

  const [
    grupos,
    setGrupos,
  ] = useState<GrupoMes[]>([]);

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

  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      async function carregarMovimentacoes() {
        try {
          const transactions =
            await getTransactions();

          if (!ativo) {
            return;
          }

          setGrupos(
            agruparMovimentacoes(
              transactions
            )
          );
        } catch (error) {
          console.error(
            "Erro ao carregar histórico:",
            error
          );
        }
      }

      carregarMovimentacoes();

      return () => {
        ativo = false;
      };
    }, [])
  );

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
                  criarDataLocal(
                    movimentacao.dataCompleta
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
    grupos,
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
                    key={grupo.chave}
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
  const { theme } = useTheme();

  if (
    active &&
    theme.visuals.useGradientPrimary
  ) {
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