import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  router,
  useFocusEffect,
} from "expo-router";
import {
  useCallback,
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

import TabHeader from "../../components/TabHeader";
import ThemeAccent from "../../components/ThemeAccent";
import {
  BudgetPeriod,
  BudgetProgress,
  deleteBudget,
  getBudgetsProgress,
} from "../../database/budgets";
import { useTheme } from "../../theme/ThemeContext";

type DeleteState = {
  visible: boolean;
  id: number | null;
  name: string;
  deleting: boolean;
};

type FeedbackState = {
  visible: boolean;
  title: string;
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

function formatarData(
  value: string
) {
  const [
    year,
    month,
    day,
  ] = value
    .split("-")
    .map(Number);

  return new Date(
    year,
    month - 1,
    day
  ).toLocaleDateString(
    "pt-BR"
  );
}

function periodoLabel(
  period: BudgetPeriod
) {
  if (
    period === "daily"
  ) {
    return "por dia";
  }

  if (
    period === "weekly"
  ) {
    return "por semana";
  }

  return "por mês";
}

function statusDisponivel(
  progress: BudgetProgress
) {
  if (!progress.active) {
    return `começa em ${formatarData(
      progress.periodStart
    )}`;
  }

  if (
    progress.availableCents >= 0
  ) {
    return "disponíveis neste período";
  }

  return "acima do orçamento";
}

function textoReset(
  progress: BudgetProgress
) {
  if (!progress.active) {
    return `Início: ${formatarData(
      progress.periodStart
    )}`;
  }

  if (
    !progress.nextResetDate
  ) {
    return `Período termina em ${formatarData(
      progress.periodEnd
    )}`;
  }

  return `Próximo reset: ${formatarData(
    progress.nextResetDate
  )}`;
}

export default function OrcamentosScreen() {
  const {
    theme,
    activeSpecialTheme,
  } = useTheme();

  const isPride =
    activeSpecialTheme ===
    "pride";

  const [
    orcamentos,
    setOrcamentos,
  ] = useState<
    BudgetProgress[]
  >([]);

  const [
    carregando,
    setCarregando,
  ] = useState(true);

  const [
    deleteState,
    setDeleteState,
  ] = useState<DeleteState>({
    visible: false,
    id: null,
    name: "",
    deleting: false,
  });

  const [
    feedback,
    setFeedback,
  ] = useState<FeedbackState>({
    visible: false,
    title: "",
    message: "",
  });

  const carregarOrcamentos =
    useCallback(
      async () => {
        try {
          const dados =
            await getBudgetsProgress();

          setOrcamentos(
            dados.filter(
              (item) =>
                !item.finished
            )
          );
        } catch (error) {
          console.error(
            "Erro ao carregar orçamentos:",
            error
          );
        } finally {
          setCarregando(
            false
          );
        }
      },
      []
    );

  useFocusEffect(
    useCallback(() => {
      setCarregando(true);

      carregarOrcamentos();
    }, [
      carregarOrcamentos,
    ])
  );

  const possuiOrcamento =
    orcamentos.length > 0;

  function abrirNovoOrcamento() {
    if (
      possuiOrcamento
    ) {
      return;
    }

    router.push(
      "/novo-orcamento"
    );
  }

  function editarOrcamento(
    id: number
  ) {
    router.push({
      pathname:
        "/novo-orcamento",
      params: {
        id: String(id),
      },
    });
  }

  function solicitarExclusao(
    id: number,
    name: string
  ) {
    setDeleteState({
      visible: true,
      id,
      name,
      deleting: false,
    });
  }

  function cancelarExclusao() {
    if (
      deleteState.deleting
    ) {
      return;
    }

    setDeleteState({
      visible: false,
      id: null,
      name: "",
      deleting: false,
    });
  }

  async function confirmarExclusao() {
    if (
      deleteState.id ===
        null ||
      deleteState.deleting
    ) {
      return;
    }

    setDeleteState(
      (atual) => ({
        ...atual,
        deleting: true,
      })
    );

    try {
      await deleteBudget(
        deleteState.id
      );

      setDeleteState({
        visible: false,
        id: null,
        name: "",
        deleting: false,
      });

      await carregarOrcamentos();
    } catch (error) {
      console.error(
        "Erro ao excluir orçamento:",
        error
      );

      setDeleteState({
        visible: false,
        id: null,
        name: "",
        deleting: false,
      });

      setFeedback({
        visible: true,
        title:
          "Não foi possível excluir",
        message:
          "Ocorreu um erro ao excluir este orçamento.",
      });
    }
  }

  function fecharFeedback() {
    setFeedback(
      (atual) => ({
        ...atual,
        visible: false,
      })
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
      >
        <TabHeader />

        <View
          style={styles.header}
        >
          <Text
            style={[
              styles.title,
              {
                color:
                  theme.colors.text,
              },
            ]}
          >
            Orçamentos
          </Text>

          {!carregando &&
            !possuiOrcamento && (
              <Pressable
                onPress={
                  abrirNovoOrcamento
                }
                style={
                  styles.addButton
                }
              >
                <MaterialIcons
                  name="add"
                  size={34}
                  color={
                    theme.colors
                      .primary
                  }
                />
              </Pressable>
            )}
        </View>

        {!carregando &&
        !possuiOrcamento ? (
          <View
            style={[
              styles.emptyCard,
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
                name="account-balance-wallet"
                size={31}
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
              Nenhum orçamento
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
              Crie um orçamento para
              acompanhar seu limite de
              gastos.
            </Text>

            {isPride ? (
              <Pressable
                onPress={
                  abrirNovoOrcamento
                }
                style={
                  styles.emptyCreatePressable
                }
              >
                <ThemeAccent
                  style={
                    styles.emptyCreateAccent
                  }
                >
                  <MaterialIcons
                    name="add"
                    size={22}
                    color="#FFFFFF"
                  />

                  <Text
                    style={
                      styles.emptyCreateText
                    }
                  >
                    Criar orçamento
                  </Text>
                </ThemeAccent>
              </Pressable>
            ) : (
              <Pressable
                onPress={
                  abrirNovoOrcamento
                }
                style={[
                  styles.emptyCreateButton,
                  {
                    backgroundColor:
                      theme.colors
                        .primary,
                  },
                ]}
              >
                <MaterialIcons
                  name="add"
                  size={22}
                  color="#FFFFFF"
                />

                <Text
                  style={
                    styles.emptyCreateText
                  }
                >
                  Criar orçamento
                </Text>
              </Pressable>
            )}
          </View>
        ) : (
          orcamentos.map(
            (progress) => (
              <BudgetCard
                key={
                  progress
                    .budget.id
                }
                progress={
                  progress
                }
                onEdit={() =>
                  editarOrcamento(
                    progress
                      .budget.id
                  )
                }
                onDelete={() =>
                  solicitarExclusao(
                    progress
                      .budget.id,
                    progress
                      .budget.name
                  )
                }
              />
            )
          )
        )}
      </ScrollView>

      <Modal
        visible={
          deleteState.visible
        }
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={
          cancelarExclusao
        }
      >
        <View
          style={
            styles.modalBackdrop
          }
        >
          <View
            style={[
              styles.deleteModalCard,
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
                styles.deleteModalIcon,
                {
                  backgroundColor:
                    `${theme.colors.danger}18`,
                },
              ]}
            >
              <MaterialIcons
                name="delete-outline"
                size={29}
                color={
                  theme.colors.danger
                }
              />
            </View>

            <Text
              style={[
                styles.deleteModalTitle,
                {
                  color:
                    theme.colors.text,
                },
              ]}
            >
              Excluir orçamento?
            </Text>

            <Text
              style={[
                styles.deleteModalMessage,
                {
                  color:
                    theme.colors
                      .textSecondary,
                },
              ]}
            >
              “{deleteState.name}” será
              excluído. Esta ação não
              poderá ser desfeita.
            </Text>

            <View
              style={
                styles.deleteModalActions
              }
            >
              <Pressable
                onPress={
                  cancelarExclusao
                }
                disabled={
                  deleteState.deleting
                }
                style={[
                  styles.modalCancelButton,
                  {
                    backgroundColor:
                      theme.colors
                        .surfaceSecondary,
                    borderColor:
                      theme.colors
                        .border,
                    opacity:
                      deleteState.deleting
                        ? 0.6
                        : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.modalCancelText,
                    {
                      color:
                        theme.colors
                          .text,
                    },
                  ]}
                >
                  Cancelar
                </Text>
              </Pressable>

              <Pressable
                onPress={
                  confirmarExclusao
                }
                disabled={
                  deleteState.deleting
                }
                style={[
                  styles.modalDeleteButton,
                  {
                    backgroundColor:
                      theme.colors
                        .danger,
                    opacity:
                      deleteState.deleting
                        ? 0.7
                        : 1,
                  },
                ]}
              >
                <MaterialIcons
                  name="delete-outline"
                  size={20}
                  color="#FFFFFF"
                />

                <Text
                  style={
                    styles.modalDeleteText
                  }
                >
                  {deleteState.deleting
                    ? "Excluindo..."
                    : "Excluir"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

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

type BudgetCardProps = {
  progress: BudgetProgress;
  onEdit: () => void;
  onDelete: () => void;
};

function BudgetCard({
  progress,
  onEdit,
  onDelete,
}: BudgetCardProps) {
  const {
    theme,
    activeSpecialTheme,
  } = useTheme();

  const isPride =
    activeSpecialTheme ===
    "pride";

  const percentualVisual =
    Math.min(
      Math.max(
        progress.usedPercentage,
        0
      ),
      100
    );

  const excedido =
    progress.availableCents <
    0;

  const valorDisponivel =
    Math.abs(
      progress.availableCents
    );

  const mostrarRitmo =
    progress.active &&
    progress.budget.period !==
      "daily" &&
    progress.dailyPaceCents !==
      null &&
    progress.remainingDays !==
      null;

  return (
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
      <Text
        style={[
          styles.budgetTitle,
          {
            color:
              theme.colors.text,
          },
        ]}
      >
        {progress.budget.name}
      </Text>

      <View
        style={
          styles.budgetValueRow
        }
      >
        <Text
          style={[
            styles.budgetValue,
            {
              color:
                theme.colors.text,
            },
          ]}
        >
          R${" "}
          {formatarCentavos(
            progress.budget
              .amountCents
          )}
        </Text>

        <Text
          style={[
            styles.budgetPeriod,
            {
              color:
                theme.colors
                  .textSecondary,
            },
          ]}
        >
          {periodoLabel(
            progress.budget
              .period
          )}
        </Text>
      </View>

      <Text
        style={[
          styles.availableValue,
          {
            color: excedido
              ? theme.colors.danger
              : theme.colors
                  .primary,
          },
        ]}
      >
        R${" "}
        {formatarCentavos(
          valorDisponivel
        )}

        <Text
          style={[
            styles.availableLabel,
            {
              color:
                theme.colors
                  .textSecondary,
            },
          ]}
        >
          {" "}
          {statusDisponivel(
            progress
          )}
        </Text>
      </Text>

      <View
        style={
          styles.progressRow
        }
      >
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
          {isPride &&
          !excedido ? (
            <ThemeAccent
              style={[
                styles.progressFill,
                {
                  width: `${percentualVisual}%`,
                },
              ]}
            />
          ) : (
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor:
                    excedido
                      ? theme.colors
                          .danger
                      : theme.colors
                          .primary,
                  width: `${percentualVisual}%`,
                },
              ]}
            />
          )}
        </View>

        <Text
          style={[
            styles.progressText,
            {
              color:
                excedido
                  ? theme.colors
                      .danger
                  : theme.colors
                      .textSecondary,
            },
          ]}
        >
          {progress.usedPercentage}%
          utilizado
        </Text>
      </View>

      {mostrarRitmo && (
        <View
          style={[
            styles.paceCard,
            {
              backgroundColor:
                theme.colors
                  .surfaceSecondary,
              borderColor:
                theme.colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.paceIcon,
              {
                backgroundColor:
                  `${theme.colors.primary}18`,
              },
            ]}
          >
            <MaterialIcons
              name="speed"
              size={21}
              color={
                theme.colors.primary
              }
            />
          </View>

          <View
            style={
              styles.paceContent
            }
          >
            <Text
              style={[
                styles.paceValue,
                {
                  color:
                    theme.colors
                      .primary,
                },
              ]}
            >
              Até R${" "}
              {formatarCentavos(
                progress.dailyPaceCents!
              )}{" "}
              por dia
            </Text>

            <Text
              style={[
                styles.paceDescription,
                {
                  color:
                    theme.colors
                      .textSecondary,
                },
              ]}
            >
              para permanecer dentro deste orçamento.
            </Text>
          </View>
        </View>
      )}

      <View
        style={styles.resetRow}
      >
        <MaterialIcons
          name={
            progress.active
              ? "refresh"
              : "schedule"
          }
          size={19}
          color={
            theme.colors
              .textSecondary
          }
        />

        <Text
          style={[
            styles.resetText,
            {
              color:
                theme.colors
                  .textSecondary,
            },
          ]}
        >
          {textoReset(
            progress
          )}
        </Text>
      </View>

      <View
        style={[
          styles.actionsDivider,
          {
            backgroundColor:
              theme.colors.border,
          },
        ]}
      />

      <View
        style={
          styles.actionsRow
        }
      >
        <Pressable
          onPress={onEdit}
          style={[
            styles.editButton,
            {
              backgroundColor:
                theme.colors
                  .surfaceSecondary,
              borderColor:
                theme.colors.border,
            },
          ]}
        >
          <MaterialIcons
            name="edit"
            size={20}
            color={
              isPride
                ? "#7C3AED"
                : theme.colors
                    .primary
            }
          />

          <Text
            style={[
              styles.editButtonText,
              {
                color:
                  isPride
                    ? "#7C3AED"
                    : theme.colors
                        .primary,
              },
            ]}
          >
            Editar
          </Text>
        </Pressable>

        <Pressable
          onPress={onDelete}
          style={[
            styles.deleteButton,
            {
              borderColor:
                theme.colors
                  .danger,
            },
          ]}
        >
          <MaterialIcons
            name="delete-outline"
            size={21}
            color={
              theme.colors.danger
            }
          />

          <Text
            style={[
              styles.deleteButtonText,
              {
                color:
                  theme.colors.danger,
              },
            ]}
          >
            Excluir
          </Text>
        </Pressable>
      </View>
    </View>
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

    addButton: {
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent:
        "center",
    },

    budgetCard: {
      borderRadius: 22,
      borderWidth: 1,
      padding: 20,
      marginBottom: 16,
    },

    budgetTitle: {
      fontSize: 19,
      fontWeight: "700",
    },

    budgetValueRow: {
      flexDirection: "row",
      alignItems:
        "baseline",
      marginTop: 14,
    },

    budgetValue: {
      fontSize: 30,
      fontWeight: "700",
      letterSpacing: -0.6,
    },

    budgetPeriod: {
      fontSize: 16,
      fontWeight: "600",
      marginLeft: 7,
    },

    availableValue: {
      fontSize: 17,
      fontWeight: "700",
      marginTop: 18,
    },

    availableLabel: {
      fontSize: 15,
      fontWeight: "500",
    },

    progressRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 13,
    },

    progressTrack: {
      flex: 1,
      height: 11,
      borderRadius: 6,
      overflow: "hidden",
    },

    progressFill: {
      height: "100%",
      borderRadius: 6,
    },

    progressText: {
      width: 105,
      textAlign: "right",
      fontSize: 13,
      fontWeight: "600",
    },

    paceCard: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 16,
      borderWidth: 1,
      padding: 14,
      marginTop: 17,
    },

    paceIcon: {
      width: 42,
      height: 42,
      borderRadius: 13,
      alignItems: "center",
      justifyContent:
        "center",
      marginRight: 12,
    },

    paceContent: {
      flex: 1,
    },

    paceValue: {
      fontSize: 16,
      fontWeight: "800",
      marginBottom: 3,
    },

    paceDescription: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: "500",
    },

    resetRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      marginTop: 15,
    },

    resetText: {
      flex: 1,
      fontSize: 14,
      fontWeight: "500",
    },

    actionsDivider: {
      height: 1,
      marginTop: 19,
      marginBottom: 16,
    },

    actionsRow: {
      flexDirection: "row",
      gap: 10,
    },

    editButton: {
      flex: 1,
      height: 48,
      borderRadius: 14,
      borderWidth: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      gap: 7,
    },

    editButtonText: {
      fontSize: 14,
      fontWeight: "700",
    },

    deleteButton: {
      flex: 1,
      height: 48,
      borderRadius: 14,
      borderWidth: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      gap: 7,
    },

    deleteButtonText: {
      fontSize: 14,
      fontWeight: "700",
    },

    emptyCard: {
      borderRadius: 22,
      borderWidth: 1,
      paddingHorizontal: 24,
      paddingVertical: 38,
      alignItems: "center",
    },

    emptyIcon: {
      width: 62,
      height: 62,
      borderRadius: 31,
      alignItems: "center",
      justifyContent:
        "center",
      marginBottom: 16,
    },

    emptyTitle: {
      fontSize: 20,
      fontWeight: "700",
      textAlign: "center",
    },

    emptyDescription: {
      maxWidth: 280,
      fontSize: 14,
      lineHeight: 20,
      textAlign: "center",
      marginTop: 7,
    },

    emptyCreatePressable: {
      width: "100%",
      marginTop: 22,
      borderRadius: 16,
      overflow: "hidden",
    },

    emptyCreateAccent: {
      height: 54,
      borderRadius: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      gap: 8,
    },

    emptyCreateButton: {
      width: "100%",
      height: 54,
      borderRadius: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      gap: 8,
      marginTop: 22,
    },

    emptyCreateText: {
      color: "#FFFFFF",
      fontSize: 16,
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

    deleteModalCard: {
      width: "100%",
      maxWidth: 380,
      borderRadius: 24,
      borderWidth: 1,
      paddingHorizontal: 22,
      paddingTop: 24,
      paddingBottom: 20,
      alignItems: "center",
    },

    deleteModalIcon: {
      width: 56,
      height: 56,
      borderRadius: 18,
      alignItems: "center",
      justifyContent:
        "center",
      marginBottom: 16,
    },

    deleteModalTitle: {
      fontSize: 21,
      fontWeight: "800",
      textAlign: "center",
    },

    deleteModalMessage: {
      fontSize: 14,
      lineHeight: 21,
      fontWeight: "500",
      textAlign: "center",
      marginTop: 8,
      marginBottom: 22,
    },

    deleteModalActions: {
      width: "100%",
      flexDirection: "row",
      gap: 10,
    },

    modalCancelButton: {
      flex: 1,
      minHeight: 52,
      borderRadius: 16,
      borderWidth: 1,
      alignItems: "center",
      justifyContent:
        "center",
    },

    modalCancelText: {
      fontSize: 15,
      fontWeight: "700",
    },

    modalDeleteButton: {
      flex: 1,
      minHeight: 52,
      borderRadius: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      gap: 7,
    },

    modalDeleteText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "700",
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