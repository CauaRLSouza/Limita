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

import {
  clearNotificationHistory,
  getNotificationHistory,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  markNotificationAsUnread,
  NotificationHistoryType,
  StoredNotification,
} from "../database/NotificationHistory";
import ThemeAccent from "../components/ThemeAccent";
import { useTheme } from "../theme/ThemeContext";

type Filtro =
  | "todas"
  | "nao-lidas";

function parseDatabaseDate(
  value: string
) {
  return new Date(
    value.replace(
      " ",
      "T"
    )
  );
}

function isToday(
  value: string
) {
  const date =
    parseDatabaseDate(
      value
    );

  const today =
    new Date();

  return (
    date.getFullYear() ===
      today.getFullYear() &&
    date.getMonth() ===
      today.getMonth() &&
    date.getDate() ===
      today.getDate()
  );
}

function formatNotificationTime(
  value: string
) {
  const date =
    parseDatabaseDate(
      value
    );

  if (isToday(value)) {
    return date.toLocaleTimeString(
      "pt-BR",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  return date.toLocaleDateString(
    "pt-BR",
    {
      day: "2-digit",
      month: "short",
    }
  );
}

function getNotificationVisual(
  type: NotificationHistoryType
) {
  if (
    type ===
    "recurring_income"
  ) {
    return {
      icon:
        "payments" as const,
    };
  }

  if (
    type ===
    "scheduled_transaction"
  ) {
    return {
      icon:
        "event" as const,
    };
  }

  if (
    type === "cycle"
  ) {
    return {
      icon:
        "autorenew" as const,
    };
  }

  if (
    type === "progress"
  ) {
    return {
      icon:
        "emoji-events" as const,
    };
  }

  return {
    icon:
      "auto-awesome" as const,
  };
}

export default function NotificacoesScreen() {
  const {
    theme,
    activeSpecialTheme,
  } = useTheme();

  const [
    filtro,
    setFiltro,
  ] = useState<Filtro>(
    "todas"
  );

  const [
    notificacoes,
    setNotificacoes,
  ] = useState<
    StoredNotification[]
  >([]);

  const [
    confirmarLimpeza,
    setConfirmarLimpeza,
  ] = useState(false);

  const [
    limpando,
    setLimpando,
  ] = useState(false);

  const isPride =
    activeSpecialTheme ===
    "pride";

  const loadNotifications =
    useCallback(
      async () => {
        try {
          const items =
            await getNotificationHistory();

          setNotificacoes(
            items
          );
        } catch (error) {
          console.error(
            "Erro ao carregar notificações:",
            error
          );
        }
      },
      []
    );

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [
      loadNotifications,
    ])
  );

  const unreadCount =
    useMemo(
      () =>
        notificacoes.filter(
          (item) =>
            !item.read
        ).length,
      [notificacoes]
    );

  const filtered =
    useMemo(
      () =>
        filtro ===
        "nao-lidas"
          ? notificacoes.filter(
              (item) =>
                !item.read
            )
          : notificacoes,
      [
        filtro,
        notificacoes,
      ]
    );

  const todayItems =
    useMemo(
      () =>
        filtered.filter(
          (item) =>
            isToday(
              item.occurredAt
            )
        ),
      [filtered]
    );

  const previousItems =
    useMemo(
      () =>
        filtered.filter(
          (item) =>
            !isToday(
              item.occurredAt
            )
        ),
      [filtered]
    );

  async function markAll() {
    await markAllNotificationsAsRead();
    await loadNotifications();
  }

  async function toggleRead(
    item: StoredNotification
  ) {
    if (item.read) {
      await markNotificationAsUnread(
        item.id
      );
    } else {
      await markNotificationAsRead(
        item.id
      );
    }

    await loadNotifications();
  }

  async function limparHistorico() {
    if (limpando) {
      return;
    }

    setLimpando(true);

    try {
      await clearNotificationHistory();

      setNotificacoes([]);
      setFiltro("todas");
      setConfirmarLimpeza(false);
    } catch (error) {
      console.error(
        "Erro ao limpar histórico de notificações:",
        error
      );
    } finally {
      setLimpando(false);
    }
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
        <View style={styles.header}>
          <Pressable
            onPress={() =>
              router.back()
            }
            style={[
              styles.backButton,
              {
                backgroundColor:
                  theme.colors.surface,
                borderColor:
                  theme.colors.border,
              },
            ]}
          >
            <MaterialIcons
              name="arrow-back"
              size={24}
              color={
                theme.colors.text
              }
            />
          </Pressable>

          <View style={styles.headerText}>
            <Text
              style={[
                styles.title,
                {
                  color:
                    theme.colors.text,
                },
              ]}
            >
              Notificações
            </Text>

            {unreadCount > 0 && (
              <Text
                style={[
                  styles.subtitle,
                  {
                    color:
                      theme.colors.textSecondary,
                  },
                ]}
              >
                {unreadCount === 1
                  ? "1 não lida"
                  : `${unreadCount} não lidas`}
              </Text>
            )}
          </View>
        </View>

        <View
          style={[
            styles.filterCard,
            {
              backgroundColor:
                theme.colors.surface,
              borderColor:
                theme.colors.border,
            },
          ]}
        >
          <Pressable
            onPress={() =>
              setFiltro(
                "todas"
              )
            }
            style={[
              styles.filterButton,
              filtro ===
                "todas" && {
                backgroundColor:
                  theme.colors.primarySoft,
              },
            ]}
          >
            <Text
              style={[
                styles.filterText,
                {
                  color:
                    filtro ===
                    "todas"
                      ? theme.colors.primary
                      : theme.colors.textSecondary,
                },
              ]}
            >
              Todas
            </Text>
          </Pressable>

          <Pressable
            onPress={() =>
              setFiltro(
                "nao-lidas"
              )
            }
            style={[
              styles.filterButton,
              filtro ===
                "nao-lidas" && {
                backgroundColor:
                  theme.colors.primarySoft,
              },
            ]}
          >
            <Text
              style={[
                styles.filterText,
                {
                  color:
                    filtro ===
                    "nao-lidas"
                      ? theme.colors.primary
                      : theme.colors.textSecondary,
                },
              ]}
            >
              Não lidas
            </Text>
          </Pressable>
        </View>

        {notificacoes.length > 0 && (
          <View
            style={
              styles.actionsRow
            }
          >
            {unreadCount > 0 && (
              <Pressable
                onPress={markAll}
                style={
                  styles.actionButton
                }
              >
                <MaterialIcons
                  name="done-all"
                  size={18}
                  color={
                    theme.colors.primary
                  }
                />

                <Text
                  style={[
                    styles.markAllText,
                    {
                      color:
                        theme.colors.primary,
                    },
                  ]}
                >
                  Marcar todas como lidas
                </Text>
              </Pressable>
            )}

            <Pressable
              onPress={() =>
                setConfirmarLimpeza(
                  true
                )
              }
              style={[
                styles.actionButton,
                unreadCount === 0 &&
                  styles.clearButtonAlone,
              ]}
            >
              <MaterialIcons
                name="delete-outline"
                size={18}
                color={
                  theme.colors.primary
                }
              />

              <Text
                style={[
                  styles.clearText,
                  {
                    color:
                      theme.colors.primary,
                  },
                ]}
              >
                Limpar histórico
              </Text>
            </Pressable>
          </View>
        )}

        {filtered.length === 0 ? (
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
                    theme.colors.primarySoft,
                },
              ]}
            >
              <MaterialIcons
                name="notifications-none"
                size={30}
                color={
                  theme.colors.primary
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
              {filtro ===
              "nao-lidas"
                ? "Tudo em dia"
                : "Nada por aqui ainda"}
            </Text>

            <Text
              style={[
                styles.emptyDescription,
                {
                  color:
                    theme.colors.textSecondary,
                },
              ]}
            >
              {filtro ===
              "nao-lidas"
                ? "Você não tem notificações pendentes de leitura."
                : "Quando algo importante acontecer no Límita, ele vai aparecer aqui."}
            </Text>
          </View>
        ) : (
          <>
            {todayItems.length >
              0 && (
              <NotificationSection
                title="HOJE"
                items={
                  todayItems
                }
                onToggleRead={
                  toggleRead
                }
                isPride={
                  isPride
                }
              />
            )}

            {previousItems.length >
              0 && (
              <NotificationSection
                title="ANTERIORES"
                items={
                  previousItems
                }
                onToggleRead={
                  toggleRead
                }
                isPride={
                  isPride
                }
              />
            )}
          </>
        )}
      </ScrollView>

      <Modal
        visible={
          confirmarLimpeza
        }
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() =>
          setConfirmarLimpeza(
            false
          )
        }
      >
        <View
          style={
            styles.modalBackdrop
          }
        >
          <View
            style={[
              styles.confirmCard,
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
                styles.confirmIcon,
                {
                  backgroundColor:
                    theme.colors.primarySoft,
                },
              ]}
            >
              <MaterialIcons
                name="delete-outline"
                size={28}
                color={
                  theme.colors.primary
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
              Limpar histórico?
            </Text>

            <Text
              style={[
                styles.confirmDescription,
                {
                  color:
                    theme.colors.textSecondary,
                },
              ]}
            >
              Todas as notificações do seu histórico serão apagadas. Essa ação não pode ser desfeita.
            </Text>

            <View
              style={
                styles.confirmActions
              }
            >
              <Pressable
                onPress={() =>
                  setConfirmarLimpeza(
                    false
                  )
                }
                disabled={
                  limpando
                }
                style={[
                  styles.cancelButton,
                  {
                    borderColor:
                      theme.colors.border,
                    backgroundColor:
                      theme.colors.surface,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.cancelButtonText,
                    {
                      color:
                        theme.colors.text,
                    },
                  ]}
                >
                  Cancelar
                </Text>
              </Pressable>

              <Pressable
                onPress={
                  limparHistorico
                }
                disabled={
                  limpando
                }
                style={
                  styles.confirmButtonWrapper
                }
              >
                <ThemeAccent
                  style={[
                    styles.confirmButton,
                    limpando && {
                      opacity: 0.7,
                    },
                  ]}
                >
                  <Text
                    style={
                      styles.confirmButtonText
                    }
                  >
                    {limpando
                      ? "Limpando..."
                      : "Limpar histórico"}
                  </Text>
                </ThemeAccent>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

type NotificationSectionProps = {
  title: string;
  items: StoredNotification[];
  onToggleRead: (
    item: StoredNotification
  ) => void;
  isPride: boolean;
};

function NotificationSection({
  title,
  items,
  onToggleRead,
  isPride,
}: NotificationSectionProps) {
  const { theme } =
    useTheme();

  return (
    <View
      style={
        styles.section
      }
    >
      <Text
        style={[
          styles.sectionTitle,
          {
            color:
              theme.colors.textSecondary,
          },
        ]}
      >
        {title}
      </Text>

      <View
        style={[
          styles.notificationCard,
          {
            backgroundColor:
              theme.colors.surface,
            borderColor:
              theme.colors.border,
          },
        ]}
      >
        {items.map(
          (
            item,
            index
          ) => (
            <View
              key={
                item.id
              }
            >
              <NotificationRow
                item={
                  item
                }
                onPress={() =>
                  onToggleRead(
                    item
                  )
                }
                isPride={
                  isPride
                }
              />

              {index <
                items.length -
                  1 && (
                <View
                  style={[
                    styles.divider,
                    {
                      backgroundColor:
                        theme.colors.border,
                    },
                  ]}
                />
              )}
            </View>
          )
        )}
      </View>
    </View>
  );
}

type NotificationRowProps = {
  item: StoredNotification;
  onPress: () => void;
  isPride: boolean;
};

function NotificationRow({
  item,
  onPress,
  isPride,
}: NotificationRowProps) {
  const { theme } =
    useTheme();

  const visual =
    getNotificationVisual(
      item.type
    );

  return (
    <Pressable
      onPress={onPress}
      style={
        styles.notificationRow
      }
    >
      <View
        style={[
          styles.notificationIcon,
          {
            backgroundColor:
              theme.colors.primarySoft,
          },
        ]}
      >
        <MaterialIcons
          name={visual.icon}
          size={23}
          color={
            theme.colors.primary
          }
        />
      </View>

      <View
        style={
          styles.notificationText
        }
      >
        <View
          style={
            styles.notificationTitleRow
          }
        >
          <Text
            style={[
              styles.notificationTitle,
              {
                color:
                  theme.colors.text,
              },
              !item.read &&
                styles.unreadTitle,
            ]}
          >
            {item.title}
          </Text>

          {!item.read && (
            <View
              style={[
                styles.unreadDot,
                {
                  backgroundColor:
                    isPride
                      ? "#FFFFFF"
                      : theme.colors.primary,
                },
              ]}
            />
          )}
        </View>

        <Text
          style={[
            styles.notificationDescription,
            {
              color:
                theme.colors.textSecondary,
            },
          ]}
        >
          {item.body}
        </Text>

        <Text
          style={[
            styles.notificationTime,
            {
              color:
                theme.colors.textSecondary,
            },
          ]}
        >
          {formatNotificationTime(
            item.occurredAt
          )}
        </Text>
      </View>
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
      paddingBottom: 50,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 26,
    },

    backButton: {
      width: 44,
      height: 44,
      borderRadius: 14,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
    },

    headerText: {
      flex: 1,
    },

    title: {
      fontSize: 29,
      fontWeight: "700",
      letterSpacing: -0.7,
    },

    subtitle: {
      fontSize: 12,
      marginTop: 2,
    },

    filterCard: {
      flexDirection: "row",
      padding: 5,
      borderWidth: 1,
      borderRadius: 16,
      marginBottom: 12,
    },

    filterButton: {
      flex: 1,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },

    filterText: {
      fontSize: 13,
      fontWeight: "700",
    },

    actionsRow: {
      minHeight: 38,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
      marginBottom: 8,
    },

    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingVertical: 8,
    },

    clearButtonAlone: {
      marginLeft: "auto",
    },

    markAllText: {
      fontSize: 12,
      fontWeight: "700",
    },

    clearText: {
      fontSize: 12,
      fontWeight: "700",
    },

    section: {
      marginTop: 18,
    },

    sectionTitle: {
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 1.1,
      marginLeft: 4,
      marginBottom: 10,
    },

    notificationCard: {
      borderRadius: 20,
      borderWidth: 1,
      overflow: "hidden",
    },

    notificationRow: {
      flexDirection: "row",
      paddingHorizontal: 16,
      paddingVertical: 16,
    },

    notificationIcon: {
      width: 46,
      height: 46,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 13,
    },

    notificationText: {
      flex: 1,
    },

    notificationTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },

    notificationTitle: {
      flex: 1,
      fontSize: 15,
      fontWeight: "600",
    },

    unreadTitle: {
      fontWeight: "800",
    },

    unreadDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
    },

    notificationDescription: {
      fontSize: 12,
      lineHeight: 17,
      marginTop: 4,
    },

    notificationTime: {
      fontSize: 11,
      marginTop: 7,
    },

    divider: {
      height: 1,
      marginLeft: 75,
    },

    emptyCard: {
      marginTop: 28,
      borderRadius: 20,
      borderWidth: 1,
      paddingVertical: 38,
      paddingHorizontal: 26,
      alignItems: "center",
    },

    emptyIcon: {
      width: 58,
      height: 58,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 15,
    },

    emptyTitle: {
      fontSize: 17,
      fontWeight: "700",
      marginBottom: 6,
    },

    emptyDescription: {
      fontSize: 13,
      lineHeight: 19,
      textAlign: "center",
    },

    modalBackdrop: {
      flex: 1,
      backgroundColor:
        "rgba(0, 0, 0, 0.62)",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 28,
    },

    confirmCard: {
      width: "100%",
      maxWidth: 390,
      borderRadius: 24,
      borderWidth: 1,
      paddingHorizontal: 22,
      paddingTop: 24,
      paddingBottom: 20,
      alignItems: "center",
    },

    confirmIcon: {
      width: 56,
      height: 56,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },

    confirmTitle: {
      fontSize: 21,
      fontWeight: "800",
      textAlign: "center",
    },

    confirmDescription: {
      fontSize: 14,
      lineHeight: 21,
      fontWeight: "500",
      textAlign: "center",
      marginTop: 8,
      marginBottom: 22,
    },

    confirmActions: {
      width: "100%",
      flexDirection: "row",
      gap: 10,
    },

    cancelButton: {
      flex: 1,
      minHeight: 52,
      borderRadius: 16,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 12,
    },

    cancelButtonText: {
      fontSize: 14,
      fontWeight: "700",
    },

    confirmButtonWrapper: {
      flex: 1.35,
      minHeight: 52,
    },

    confirmButton: {
      flex: 1,
      minHeight: 52,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      paddingHorizontal: 12,
    },

    confirmButtonText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "700",
      textAlign: "center",
    },
  });