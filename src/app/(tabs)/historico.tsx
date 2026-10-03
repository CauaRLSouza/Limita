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
  Modal,
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
  cancelScheduledTransaction,
  getScheduledTransactions,
  getTransactions,
  StoredTransaction,
  TransactionBucket,
} from "../../database/transactions";
import { useTheme } from "../../theme/ThemeContext";

type Filtro =
  | "todos"
  | "entradas"
  | "gastos"
  | "pendentes";

type TipoMovimentacao =
  | "entrada"
  | "gasto"
  | "transferencia";

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
  bucket: TransactionBucket | null;
  transferFrom: TransactionBucket | null;
  transferTo: TransactionBucket | null;
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

const prideCategoryColors: Record<
  string,
  string
> = {
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
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      day: "2-digit",
      month: "2-digit",
    }
  ).format(
    criarDataLocal(data)
  );
}

function formatarDataCompleta(
  data: string
) {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  ).format(
    criarDataLocal(data)
  );
}

function formatarMesAno(data: string) {
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

function obterCategoriaVisual(
  categoria: string | null,
  tipo:
    | "entrada"
    | "gasto"
): CategoriaVisual {
  if (categoria) {
    const encontrada =
      categoriasVisuais[
        normalizarTexto(
          categoria
        )
      ];

    if (encontrada) {
      return encontrada;
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

function nomeDoSaldo(
  bucket: TransactionBucket | null
) {
  if (
    bucket === "monthly_money"
  ) {
    return "Dinheiro do mês";
  }

  if (
    bucket === "vault"
  ) {
    return "Cofre";
  }

  return "—";
}

function converterMovimentacao(
  transaction: StoredTransaction,
  incluirTransferencias = false
): Movimentacao | null {
  if (
    transaction.type ===
    "transfer"
  ) {
    if (!incluirTransferencias) {
      return null;
    }

    return {
      id: transaction.id,
      data: formatarDiaMes(
        transaction.date
      ),
      dataCompleta:
        transaction.date,
      titulo:
        transaction.description?.trim() ||
        "Transferência",
      categoria:
        "Transferência",
      valor:
        transaction.amountCents /
        100,
      tipo:
        "transferencia",
      icon:
        "swap-horiz",
      iconColor:
        "#64748B",
      bucket: null,
      transferFrom:
        transaction.transferFrom,
      transferTo:
        transaction.transferTo,
    };
  }

  const tipo:
    | "entrada"
    | "gasto" =
    transaction.type ===
    "income"
      ? "entrada"
      : "gasto";

  const categoria =
    obterCategoriaVisual(
      transaction.category,
      tipo
    );

  return {
    id: transaction.id,
    data: formatarDiaMes(
      transaction.date
    ),
    dataCompleta:
      transaction.date,
    titulo:
      transaction.description?.trim() ||
      categoria.nome,
    categoria:
      categoria.nome,
    valor:
      transaction.amountCents /
      100,
    tipo,
    icon:
      categoria.icon,
    iconColor:
      categoria.cor,
    bucket:
      transaction.bucket,
    transferFrom:
      transaction.transferFrom,
    transferTo:
      transaction.transferTo,
  };
}

function agruparMovimentacoes(
  transactions: StoredTransaction[],
  incluirTransferencias = false
): GrupoMes[] {
  const grupos =
    new Map<
      string,
      GrupoMes
    >();

  for (
    const transaction of
    transactions
  ) {
    const movimentacao =
      converterMovimentacao(
        transaction,
        incluirTransferencias
      );

    if (!movimentacao) {
      continue;
    }

    const chave =
      transaction.date.slice(
        0,
        7
      );

    const existente =
      grupos.get(chave);

    if (existente) {
      existente.movimentacoes.push(
        movimentacao
      );
    } else {
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
  }

  return Array.from(
    grupos.values()
  ).sort((a, b) =>
    incluirTransferencias
      ? a.chave.localeCompare(
          b.chave
        )
      : b.chave.localeCompare(
          a.chave
        )
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

  const [
    gruposPendentes,
    setGruposPendentes,
  ] = useState<GrupoMes[]>([]);

  const [
    filtro,
    setFiltro,
  ] = useState<Filtro>(
    "todos"
  );

  const [
    pesquisaAberta,
    setPesquisaAberta,
  ] = useState(false);

  const [
    pesquisa,
    setPesquisa,
  ] = useState("");

  const [
    modalFiltrosAberto,
    setModalFiltrosAberto,
  ] = useState(false);

  const [
    filtrosAvancados,
    setFiltrosAvancados,
  ] =
    useState<TransactionFilterValue>(
      filtrosIniciais
    );

  const [
    pendenteSelecionada,
    setPendenteSelecionada,
  ] =
    useState<Movimentacao | null>(
      null
    );

  const [
    confirmandoCancelamento,
    setConfirmandoCancelamento,
  ] = useState(false);

  const [
    cancelando,
    setCancelando,
  ] = useState(false);

  const isPride =
    activeSpecialTheme ===
    "pride";

  const carregarMovimentacoes =
    useCallback(
      async () => {
        const [
          transactions,
          scheduled,
        ] = await Promise.all([
          getTransactions(),
          getScheduledTransactions(),
        ]);

        setGrupos(
          agruparMovimentacoes(
            transactions
          )
        );

        setGruposPendentes(
          agruparMovimentacoes(
            scheduled,
            true
          )
        );
      },
      []
    );

  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      async function carregar() {
        try {
          const [
            transactions,
            scheduled,
          ] = await Promise.all([
            getTransactions(),
            getScheduledTransactions(),
          ]);

          if (!ativo) {
            return;
          }

          setGrupos(
            agruparMovimentacoes(
              transactions
            )
          );

          setGruposPendentes(
            agruparMovimentacoes(
              scheduled,
              true
            )
          );
        } catch (error) {
          console.error(
            "Erro ao carregar histórico:",
            error
          );
        }
      }

      carregar();

      return () => {
        ativo = false;
      };
    }, [])
  );

  const mostrandoPendentes =
    filtro ===
    "pendentes";

  const temFiltroAvancado =
    filtrosAvancados.categoriaId !==
      null ||
    filtrosAvancados.dataInicial !==
      null ||
    filtrosAvancados.dataFinal !==
      null;

  const gruposFiltrados =
    useMemo(() => {
      const termo =
        normalizarTexto(
          pesquisa
        );

      const base =
        mostrandoPendentes
          ? gruposPendentes
          : grupos;

      return base
        .map((grupo) => ({
          ...grupo,
          movimentacoes:
            grupo.movimentacoes.filter(
              (
                movimentacao
              ) => {
                if (
                  filtro ===
                    "entradas" &&
                  movimentacao.tipo !==
                    "entrada"
                ) {
                  return false;
                }

                if (
                  filtro ===
                    "gastos" &&
                  movimentacao.tipo !==
                    "gasto"
                ) {
                  return false;
                }

                if (
                  filtrosAvancados
                    .categoriaId
                ) {
                  if (
                    normalizarTexto(
                      movimentacao.categoria
                    ) !==
                    normalizarTexto(
                      filtrosAvancados
                        .categoriaId
                    )
                  ) {
                    return false;
                  }
                }

                if (termo) {
                  const corresponde =
                    normalizarTexto(
                      movimentacao.titulo
                    ).includes(
                      termo
                    ) ||
                    normalizarTexto(
                      movimentacao.categoria
                    ).includes(
                      termo
                    );

                  if (
                    !corresponde
                  ) {
                    return false;
                  }
                }

                const dataMovimentacao =
                  criarDataLocal(
                    movimentacao
                      .dataCompleta
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

                return true;
              }
            ),
        }))
        .filter(
          (grupo) =>
            grupo.movimentacoes
              .length > 0
        );
    }, [
      grupos,
      gruposPendentes,
      filtro,
      pesquisa,
      filtrosAvancados,
      mostrandoPendentes,
    ]);

  function getIconColor(
    movimentacao: Movimentacao
  ) {
    if (
      movimentacao.tipo ===
      "transferencia" ||
      !isPride
    ) {
      return movimentacao.iconColor;
    }

    return (
      prideCategoryColors[
        movimentacao.categoria
      ] ??
      movimentacao.iconColor
    );
  }

  function textoTipo(
    movimentacao: Movimentacao
  ) {
    if (
      movimentacao.tipo ===
      "entrada"
    ) {
      return "Entrada agendada";
    }

    if (
      movimentacao.tipo ===
      "gasto"
    ) {
      return "Saída agendada";
    }

    return "Transferência agendada";
  }

  function textoSaldo(
    movimentacao: Movimentacao
  ) {
    if (
      movimentacao.tipo ===
      "transferencia"
    ) {
      return `${nomeDoSaldo(
        movimentacao.transferFrom
      )} → ${nomeDoSaldo(
        movimentacao.transferTo
      )}`;
    }

    return nomeDoSaldo(
      movimentacao.bucket
    );
  }

  function abrirPendente(
    movimentacao: Movimentacao
  ) {
    setConfirmandoCancelamento(
      false
    );

    setPendenteSelecionada(
      movimentacao
    );
  }

  function fecharPendente() {
    if (cancelando) {
      return;
    }

    setPendenteSelecionada(
      null
    );

    setConfirmandoCancelamento(
      false
    );
  }

  function editarPendente() {
    if (
      !pendenteSelecionada
    ) {
      return;
    }

    const id =
      pendenteSelecionada.id;

    setPendenteSelecionada(
      null
    );

    setConfirmandoCancelamento(
      false
    );

    router.push({
      pathname:
        "/registrar-movimentacao",
      params: {
        transactionId:
          String(id),
      },
    });
  }

  async function cancelarPendente() {
    if (
      !pendenteSelecionada ||
      cancelando
    ) {
      return;
    }

    setCancelando(true);

    try {
      await cancelScheduledTransaction(
        pendenteSelecionada.id
      );

      setPendenteSelecionada(
        null
      );

      setConfirmandoCancelamento(
        false
      );

      await carregarMovimentacoes();
    } catch (error) {
      console.error(
        "Erro ao cancelar movimentação:",
        error
      );

      setPendenteSelecionada(
        null
      );

      setConfirmandoCancelamento(
        false
      );

      await carregarMovimentacoes();
    } finally {
      setCancelando(false);
    }
  }

  function limparTudo() {
    setFiltro("todos");
    setPesquisa("");
    setFiltrosAvancados(
      filtrosIniciais
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
        <TabHeader />

        <View style={styles.header}>
          <Text
            style={[
              styles.title,
              {
                color:
                  theme.colors.text,
              },
            ]}
          >
            Histórico
          </Text>

          <View
            style={
              styles.headerActions
            }
          >
            <Pressable
              onPress={() => {
                if (
                  pesquisaAberta
                ) {
                  setPesquisa("");
                }

                setPesquisaAberta(
                  !pesquisaAberta
                );
              }}
              style={
                styles.headerButton
              }
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
                    ? theme.colors
                        .primary
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
              style={
                styles.headerButton
              }
            >
              <MaterialIcons
                name="filter-list"
                size={29}
                color={
                  temFiltroAvancado
                    ? theme.colors
                        .primary
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
              onChangeText={
                setPesquisa
              }
              placeholder="Pesquisar movimentações"
              onClose={() => {
                setPesquisa("");
                setPesquisaAberta(
                  false
                );
              }}
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
            active={
              filtro === "todos"
            }
            onPress={() =>
              setFiltro("todos")
            }
          />

          <FilterButton
            label="Entradas"
            active={
              filtro ===
              "entradas"
            }
            onPress={() =>
              setFiltro(
                "entradas"
              )
            }
          />

          <FilterButton
            label="Gastos"
            active={
              filtro === "gastos"
            }
            onPress={() =>
              setFiltro("gastos")
            }
          />

          <FilterButton
            label="Pendentes"
            active={
              mostrandoPendentes
            }
            onPress={() =>
              setFiltro(
                "pendentes"
              )
            }
          />
        </View>

        {gruposFiltrados.length >
        0 ? (
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

                      if (
                        movimentacao.tipo ===
                        "gasto"
                      ) {
                        return (
                          total -
                          movimentacao.valor
                        );
                      }

                      return total;
                    },
                    0
                  );

                return (
                  <View
                    key={
                      grupo.chave
                    }
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

                      {mostrandoPendentes ? (
                        <View
                          style={[
                            styles.pendingBadge,
                            {
                              backgroundColor:
                                theme.colors
                                  .surfaceSecondary,
                            },
                          ]}
                        >
                          <MaterialIcons
                            name="schedule"
                            size={16}
                            color={
                              theme.colors
                                .textSecondary
                            }
                          />

                          <Text
                            style={[
                              styles.pendingBadgeText,
                              {
                                color:
                                  theme.colors
                                    .textSecondary,
                              },
                            ]}
                          >
                            Agendadas
                          </Text>
                        </View>
                      ) : (
                        <Text
                          style={[
                            styles.monthResult,
                            {
                              color:
                                resultado >=
                                0
                                  ? theme
                                      .colors
                                      .success
                                  : theme
                                      .colors
                                      .danger,
                            },
                          ]}
                        >
                          {resultado >=
                          0
                            ? "+"
                            : "-"}{" "}
                          {formatarValor(
                            Math.abs(
                              resultado
                            )
                          )}
                        </Text>
                      )}
                    </View>

                    {grupo.movimentacoes.map(
                      (
                        movimentacao,
                        index
                      ) => {
                        const row = (
                          <>
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
                                {mostrandoPendentes
                                  ? textoTipo(
                                      movimentacao
                                    )
                                  : movimentacao.categoria}
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
                                      : movimentacao.tipo ===
                                          "gasto"
                                        ? theme
                                            .colors
                                            .danger
                                        : theme
                                            .colors
                                            .text,
                                },
                              ]}
                            >
                              {movimentacao.tipo ===
                              "entrada"
                                ? "+"
                                : movimentacao.tipo ===
                                    "gasto"
                                  ? "-"
                                  : ""}
                              {movimentacao.tipo !==
                                "transferencia" &&
                                " "}
                              {formatarValor(
                                movimentacao.valor
                              )}
                            </Text>

                            {mostrandoPendentes && (
                              <MaterialIcons
                                name="chevron-right"
                                size={22}
                                color={
                                  theme.colors
                                    .textSecondary
                                }
                              />
                            )}
                          </>
                        );

                        const borda =
                          index !==
                          grupo
                            .movimentacoes
                            .length -
                            1
                            ? {
                                borderBottomWidth: 1,
                                borderBottomColor:
                                  theme
                                    .colors
                                    .border,
                              }
                            : {};

                        if (
                          mostrandoPendentes
                        ) {
                          return (
                            <Pressable
                              key={
                                movimentacao.id
                              }
                              onPress={() =>
                                abrirPendente(
                                  movimentacao
                                )
                              }
                              style={({
                                pressed,
                              }) => [
                                styles.transaction,
                                borda,
                                pressed && {
                                  opacity:
                                    0.65,
                                },
                              ]}
                            >
                              {row}
                            </Pressable>
                          );
                        }

                        return (
                          <View
                            key={
                              movimentacao.id
                            }
                            style={[
                              styles.transaction,
                              borda,
                            ]}
                          >
                            {row}
                          </View>
                        );
                      }
                    )}
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
                name={
                  mostrandoPendentes
                    ? "event-available"
                    : "search-off"
                }
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
              {mostrandoPendentes
                ? "Nenhuma movimentação pendente"
                : "Nenhuma movimentação"}
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
              {mostrandoPendentes
                ? "Você não possui movimentações agendadas."
                : "Não encontramos movimentações que correspondam à sua pesquisa e aos filtros selecionados."}
            </Text>

            {(temFiltroAvancado ||
              pesquisa) && (
              <Pressable
                onPress={
                  limparTudo
                }
                style={[
                  styles.emptyButton,
                  {
                    borderColor:
                      theme.colors
                        .border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.emptyButtonText,
                    {
                      color:
                        theme.colors
                          .text,
                    },
                  ]}
                >
                  Limpar filtros
                </Text>
              </Pressable>
            )}
          </View>
        )}
      </ScrollView>

      <TransactionFilterModal
        visible={
          modalFiltrosAberto
        }
        value={
          filtrosAvancados
        }
        onApply={
          setFiltrosAvancados
        }
        onClose={() =>
          setModalFiltrosAberto(
            false
          )
        }
      />

      <Modal
        visible={
          pendenteSelecionada !==
          null
        }
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={
          fecharPendente
        }
      >
        <View
          style={
            styles.modalBackdrop
          }
        >
          {pendenteSelecionada && (
            <View
              style={[
                styles.pendingModal,
                {
                  backgroundColor:
                    theme.colors.surface,
                  borderColor:
                    theme.colors.border,
                },
              ]}
            >
              {!confirmandoCancelamento ? (
                <>
                  <View
                    style={
                      styles.modalHeader
                    }
                  >
                    <View
                      style={[
                        styles.modalIcon,
                        {
                          backgroundColor:
                            `${getIconColor(
                              pendenteSelecionada
                            )}20`,
                        },
                      ]}
                    >
                      <MaterialIcons
                        name={
                          pendenteSelecionada.icon
                        }
                        size={27}
                        color={getIconColor(
                          pendenteSelecionada
                        )}
                      />
                    </View>

                    <Pressable
                      onPress={
                        fecharPendente
                      }
                      style={
                        styles.closeButton
                      }
                    >
                      <MaterialIcons
                        name="close"
                        size={25}
                        color={
                          theme.colors
                            .textSecondary
                        }
                      />
                    </Pressable>
                  </View>

                  <Text
                    style={[
                      styles.modalType,
                      {
                        color:
                          theme.colors
                            .textSecondary,
                      },
                    ]}
                  >
                    {textoTipo(
                      pendenteSelecionada
                    )}
                  </Text>

                  <Text
                    style={[
                      styles.modalTitle,
                      {
                        color:
                          theme.colors.text,
                      },
                    ]}
                  >
                    {
                      pendenteSelecionada.titulo
                    }
                  </Text>

                  <Text
                    style={[
                      styles.modalValue,
                      {
                        color:
                          pendenteSelecionada.tipo ===
                          "entrada"
                            ? theme.colors
                                .success
                            : pendenteSelecionada.tipo ===
                                "gasto"
                              ? theme.colors
                                  .danger
                              : theme.colors
                                  .text,
                      },
                    ]}
                  >
                    {pendenteSelecionada.tipo ===
                    "entrada"
                      ? "+"
                      : pendenteSelecionada.tipo ===
                          "gasto"
                        ? "-"
                        : ""}
                    {pendenteSelecionada.tipo !==
                      "transferencia" &&
                      " "}
                    {formatarValor(
                      pendenteSelecionada.valor
                    )}
                  </Text>

                  <View
                    style={[
                      styles.detailsBox,
                      {
                        borderColor:
                          theme.colors
                            .border,
                      },
                    ]}
                  >
                    <DetailRow
                      icon="calendar-today"
                      label="Data"
                      value={formatarDataCompleta(
                        pendenteSelecionada.dataCompleta
                      )}
                    />

                    <View
                      style={[
                        styles.divider,
                        {
                          backgroundColor:
                            theme.colors
                              .border,
                        },
                      ]}
                    />

                    <DetailRow
                      icon="category"
                      label="Categoria"
                      value={
                        pendenteSelecionada.categoria
                      }
                    />

                    <View
                      style={[
                        styles.divider,
                        {
                          backgroundColor:
                            theme.colors
                              .border,
                        },
                      ]}
                    />

                    <DetailRow
                      icon={
                        pendenteSelecionada.tipo ===
                        "transferencia"
                          ? "compare-arrows"
                          : pendenteSelecionada.bucket ===
                              "vault"
                            ? "savings"
                            : "account-balance-wallet"
                      }
                      label={
                        pendenteSelecionada.tipo ===
                        "transferencia"
                          ? "Origem e destino"
                          : "Saldo"
                      }
                      value={textoSaldo(
                        pendenteSelecionada
                      )}
                    />
                  </View>

                  <Pressable
                    onPress={
                      editarPendente
                    }
                  >
                    <ThemeAccent
                      style={
                        styles.editButton
                      }
                    >
                      <MaterialIcons
                        name="edit"
                        size={20}
                        color="#FFFFFF"
                      />

                      <Text
                        style={
                          styles.editButtonText
                        }
                      >
                        Editar movimentação
                      </Text>
                    </ThemeAccent>
                  </Pressable>

                  <Pressable
                    onPress={() =>
                      setConfirmandoCancelamento(
                        true
                      )
                    }
                    style={[
                      styles.cancelButton,
                      {
                        borderColor:
                          theme.colors
                            .danger,
                      },
                    ]}
                  >
                    <MaterialIcons
                      name="event-busy"
                      size={20}
                      color={
                        theme.colors.danger
                      }
                    />

                    <Text
                      style={[
                        styles.cancelButtonText,
                        {
                          color:
                            theme.colors
                              .danger,
                        },
                      ]}
                    >
                      Cancelar agendamento
                    </Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <View
                    style={[
                      styles.confirmIcon,
                      {
                        backgroundColor:
                          `${theme.colors.danger}18`,
                      },
                    ]}
                  >
                    <MaterialIcons
                      name="event-busy"
                      size={30}
                      color={
                        theme.colors.danger
                      }
                    />
                  </View>

                  <Text
                    style={[
                      styles.confirmTitle,
                      {
                        color:
                          theme.colors.text,
                      },
                    ]}
                  >
                    Cancelar agendamento?
                  </Text>

                  <Text
                    style={[
                      styles.confirmDescription,
                      {
                        color:
                          theme.colors
                            .textSecondary,
                      },
                    ]}
                  >
                    Esta movimentação será removida e não será registrada automaticamente.
                  </Text>

                  <Pressable
                    onPress={
                      cancelarPendente
                    }
                    disabled={
                      cancelando
                    }
                    style={[
                      styles.confirmCancelButton,
                      {
                        backgroundColor:
                          theme.colors
                            .danger,
                        opacity:
                          cancelando
                            ? 0.7
                            : 1,
                      },
                    ]}
                  >
                    <Text
                      style={
                        styles.confirmCancelText
                      }
                    >
                      {cancelando
                        ? "Cancelando..."
                        : "Sim, cancelar"}
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() =>
                      setConfirmandoCancelamento(
                        false
                      )
                    }
                    disabled={
                      cancelando
                    }
                    style={[
                      styles.keepButton,
                      {
                        borderColor:
                          theme.colors
                            .border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.keepButtonText,
                        {
                          color:
                            theme.colors.text,
                        },
                      ]}
                    >
                      Manter agendamento
                    </Text>
                  </Pressable>
                </>
              )}
            </View>
          )}
        </View>
      </Modal>
    </>
  );
}

type DetailRowProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
};

function DetailRow({
  icon,
  label,
  value,
}: DetailRowProps) {
  const { theme } =
    useTheme();

  return (
    <View
      style={
        styles.detailRow
      }
    >
      <View
        style={
          styles.detailLeft
        }
      >
        <MaterialIcons
          name={icon}
          size={20}
          color={
            theme.colors
              .textSecondary
          }
        />

        <Text
          style={[
            styles.detailLabel,
            {
              color:
                theme.colors
                  .textSecondary,
            },
          ]}
        >
          {label}
        </Text>
      </View>

      <Text
        style={[
          styles.detailValue,
          {
            color:
              theme.colors.text,
          },
        ]}
      >
        {value}
      </Text>
    </View>
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
  const { theme } =
    useTheme();

  if (
    active &&
    theme.visuals
      .useGradientPrimary
  ) {
    return (
      <Pressable
        onPress={onPress}
        style={
          styles.filterButton
        }
      >
        <ThemeAccent
          style={
            styles.filterAccent
          }
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
      justifyContent:
        "space-between",
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
      fontSize: 14,
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
      justifyContent:
        "space-between",
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

    pendingBadge: {
      minHeight: 32,
      paddingHorizontal: 10,
      borderRadius: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },

    pendingBadgeText: {
      fontSize: 12,
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
      textAlign: "center",
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

    modalBackdrop: {
      flex: 1,
      backgroundColor:
        "rgba(0, 0, 0, 0.62)",
      alignItems: "center",
      justifyContent:
        "center",
      paddingHorizontal: 24,
    },

    pendingModal: {
      width: "100%",
      maxWidth: 400,
      borderRadius: 24,
      borderWidth: 1,
      padding: 22,
    },

    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      marginBottom: 14,
    },

    modalIcon: {
      width: 52,
      height: 52,
      borderRadius: 17,
      alignItems: "center",
      justifyContent:
        "center",
    },

    closeButton: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent:
        "center",
    },

    modalType: {
      fontSize: 14,
      fontWeight: "700",
      marginBottom: 5,
    },

    modalTitle: {
      fontSize: 23,
      fontWeight: "800",
      marginBottom: 7,
    },

    modalValue: {
      fontSize: 28,
      fontWeight: "800",
      marginBottom: 22,
    },

    detailsBox: {
      borderWidth: 1,
      borderRadius: 17,
      paddingHorizontal: 15,
      marginBottom: 20,
    },

    detailRow: {
      minHeight: 58,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      gap: 12,
    },

    detailLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },

    detailLabel: {
      fontSize: 13,
      fontWeight: "600",
    },

    detailValue: {
      flex: 1,
      fontSize: 14,
      fontWeight: "700",
      textAlign: "right",
    },

    divider: {
      height: 1,
    },

    editButton: {
      minHeight: 54,
      borderRadius: 15,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      gap: 8,
      overflow: "hidden",
    },

    editButtonText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "700",
    },

    cancelButton: {
      minHeight: 52,
      borderRadius: 15,
      borderWidth: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      gap: 8,
      marginTop: 10,
    },

    cancelButtonText: {
      fontSize: 15,
      fontWeight: "700",
    },

    confirmIcon: {
      width: 60,
      height: 60,
      borderRadius: 20,
      alignItems: "center",
      justifyContent:
        "center",
      alignSelf: "center",
      marginBottom: 17,
    },

    confirmTitle: {
      fontSize: 22,
      fontWeight: "800",
      textAlign: "center",
    },

    confirmDescription: {
      fontSize: 14,
      lineHeight: 21,
      textAlign: "center",
      marginTop: 8,
      marginBottom: 20,
    },

    confirmCancelButton: {
      minHeight: 52,
      borderRadius: 15,
      alignItems: "center",
      justifyContent:
        "center",
    },

    confirmCancelText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "700",
    },

    keepButton: {
      minHeight: 52,
      borderRadius: 15,
      borderWidth: 1,
      alignItems: "center",
      justifyContent:
        "center",
      marginTop: 10,
    },

    keepButtonText: {
      fontSize: 15,
      fontWeight: "700",
    },
  });