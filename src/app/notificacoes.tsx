import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import ThemeAccent from "../components/ThemeAccent";
import { useTheme } from "../theme/ThemeContext";

type Filtro = "todas" | "nao-lidas";

type TipoNotificacao =
  | "orcamento"
  | "rendimento"
  | "gasto"
  | "sistema";

type Notificacao = {
  id: number;
  titulo: string;
  descricao: string;
  horario: string;
  grupo: "hoje" | "anteriores";
  tipo: TipoNotificacao;
  lida: boolean;
};

const notificacoesIniciais: Notificacao[] = [
  {
    id: 1,
    titulo: "Orçamento chegando ao limite",
    descricao:
      "Você já utilizou 80% do orçamento de Gastos pessoais.",
    horario: "18:42",
    grupo: "hoje",
    tipo: "orcamento",
    lida: false,
  },
  {
    id: 2,
    titulo: "Rendimento adicionado",
    descricao:
      "Seu rendimento mensal de R$ 3.600,00 foi adicionado ao saldo.",
    horario: "08:00",
    grupo: "hoje",
    tipo: "rendimento",
    lida: false,
  },
  {
    id: 3,
    titulo: "Resumo do mês disponível",
    descricao:
      "Confira como seus gastos estão distribuídos neste mês.",
    horario: "Ontem",
    grupo: "anteriores",
    tipo: "sistema",
    lida: true,
  },
  {
    id: 4,
    titulo: "Gasto registrado",
    descricao:
      "R$ 42,90 em Alimentação foi contabilizado no seu orçamento.",
    horario: "12/10",
    grupo: "anteriores",
    tipo: "gasto",
    lida: true,
  },
];

export default function NotificacoesScreen() {
  const {
    theme,
    activeSpecialTheme,
  } = useTheme();

  const isPride =
    activeSpecialTheme === "pride";

  const [filtro, setFiltro] =
    useState<Filtro>("todas");

  const [notificacoes, setNotificacoes] =
    useState<Notificacao[]>(
      notificacoesIniciais
    );

  const notificacoesFiltradas =
    useMemo(() => {
      if (filtro === "nao-lidas") {
        return notificacoes.filter(
          (notificacao) =>
            !notificacao.lida
        );
      }

      return notificacoes;
    }, [filtro, notificacoes]);

  const notificacoesHoje =
    notificacoesFiltradas.filter(
      (notificacao) =>
        notificacao.grupo === "hoje"
    );

  const notificacoesAnteriores =
    notificacoesFiltradas.filter(
      (notificacao) =>
        notificacao.grupo ===
        "anteriores"
    );

  const quantidadeNaoLidas =
    notificacoes.filter(
      (notificacao) =>
        !notificacao.lida
    ).length;

  function marcarTodasComoLidas() {
    setNotificacoes((atuais) =>
      atuais.map((notificacao) => ({
        ...notificacao,
        lida: true,
      }))
    );
  }

  function alternarLeitura(id: number) {
    setNotificacoes((atuais) =>
      atuais.map((notificacao) =>
        notificacao.id === id
          ? {
              ...notificacao,
              lida: !notificacao.lida,
            }
          : notificacao
      )
    );
  }

  function renderSegmento(
    label: string,
    valor: Filtro,
    quantidade?: number
  ) {
    const selecionado =
      filtro === valor;

    if (selecionado && isPride) {
      return (
        <Pressable
          onPress={() =>
            setFiltro(valor)
          }
          style={styles.segment}
        >
          <ThemeAccent
            style={styles.segmentAccent}
          >
            <Text
              style={[
                styles.segmentText,
                styles.segmentTextSelected,
              ]}
            >
              {label}
              {quantidade !== undefined &&
              quantidade > 0
                ? ` (${quantidade})`
                : ""}
            </Text>
          </ThemeAccent>
        </Pressable>
      );
    }

    return (
      <Pressable
        onPress={() =>
          setFiltro(valor)
        }
        style={[
          styles.segment,
          selecionado && {
            backgroundColor:
              theme.colors.primary,
          },
        ]}
      >
        <View
          style={
            styles.normalSegmentContent
          }
        >
          <Text
            style={[
              styles.segmentText,
              {
                color: selecionado
                  ? "#FFFFFF"
                  : theme.colors
                      .textSecondary,
              },
            ]}
          >
            {label}
            {quantidade !== undefined &&
            quantidade > 0
              ? ` (${quantidade})`
              : ""}
          </Text>
        </View>
      </Pressable>
    );
  }

  return (
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
          onPress={() => router.back()}
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
            color={theme.colors.text}
          />
        </Pressable>

        <View
          style={styles.headerText}
        >
          <Text
            style={[
              styles.title,
              {
                color: theme.colors.text,
              },
            ]}
          >
            Notificações
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color:
                  theme.colors
                    .textSecondary,
              },
            ]}
          >
            {quantidadeNaoLidas === 0
              ? "Tudo em dia por aqui"
              : quantidadeNaoLidas === 1
                ? "1 notificação não lida"
                : `${quantidadeNaoLidas} notificações não lidas`}
          </Text>
        </View>
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
        {renderSegmento(
          "Todas",
          "todas"
        )}

        {renderSegmento(
          "Não lidas",
          "nao-lidas",
          quantidadeNaoLidas
        )}
      </View>

      {quantidadeNaoLidas > 0 && (
        <View
          style={
            styles.actionsRow
          }
        >
          <Pressable
            onPress={
              marcarTodasComoLidas
            }
            style={({ pressed }) => [
              styles.markAllButton,
              pressed &&
                styles.pressed,
            ]}
          >
            {isPride ? (
              <ThemeAccent
                style={
                  styles.markAllIconPride
                }
              >
                <MaterialIcons
                  name="done-all"
                  size={18}
                  color="#FFFFFF"
                />
              </ThemeAccent>
            ) : (
              <MaterialIcons
                name="done-all"
                size={20}
                color={
                  theme.colors.primary
                }
              />
            )}

            <Text
              style={[
                styles.markAllText,
                {
                  color: isPride
                    ? theme.colors.text
                    : theme.colors
                        .primary,
                },
              ]}
            >
              Marcar todas como lidas
            </Text>
          </Pressable>
        </View>
      )}

      {notificacoesFiltradas.length ===
      0 ? (
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
          {isPride ? (
            <ThemeAccent
              style={
                styles.emptyIconPride
              }
            >
              <MaterialIcons
                name="notifications-none"
                size={30}
                color="#FFFFFF"
              />
            </ThemeAccent>
          ) : (
            <View
              style={[
                styles.emptyIcon,
                {
                  backgroundColor:
                    theme.colors
                      .primarySoft,
                },
              ]}
            >
              <MaterialIcons
                name="notifications-none"
                size={31}
                color={
                  theme.colors.primary
                }
              />
            </View>
          )}

          <Text
            style={[
              styles.emptyTitle,
              {
                color: theme.colors.text,
              },
            ]}
          >
            Nenhuma notificação
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
            Você não tem notificações
            não lidas no momento.
          </Text>
        </View>
      ) : (
        <>
          {notificacoesHoje.length >
            0 && (
            <NotificationSection
              title="Hoje"
              notifications={
                notificacoesHoje
              }
              onPressNotification={
                alternarLeitura
              }
            />
          )}

          {notificacoesAnteriores.length >
            0 && (
            <NotificationSection
              title="Anteriores"
              notifications={
                notificacoesAnteriores
              }
              onPressNotification={
                alternarLeitura
              }
            />
          )}
        </>
      )}
    </ScrollView>
  );
}

type NotificationSectionProps = {
  title: string;
  notifications: Notificacao[];
  onPressNotification: (
    id: number
  ) => void;
};

function NotificationSection({
  title,
  notifications,
  onPressNotification,
}: NotificationSectionProps) {
  const { theme } = useTheme();

  return (
    <View
      style={styles.section}
    >
      <Text
        style={[
          styles.sectionTitle,
          {
            color:
              theme.colors
                .textSecondary,
          },
        ]}
      >
        {title}
      </Text>

      <View
        style={[
          styles.notificationGroup,
          {
            backgroundColor:
              theme.colors.surface,
            borderColor:
              theme.colors.border,
          },
        ]}
      >
        {notifications.map(
          (notificacao, index) => (
            <View
              key={notificacao.id}
            >
              <NotificationItem
                notification={
                  notificacao
                }
                onPress={() =>
                  onPressNotification(
                    notificacao.id
                  )
                }
              />

              {index !==
                notifications.length -
                  1 && (
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
              )}
            </View>
          )
        )}
      </View>
    </View>
  );
}

type NotificationItemProps = {
  notification: Notificacao;
  onPress: () => void;
};

function NotificationItem({
  notification,
  onPress,
}: NotificationItemProps) {
  const {
    theme,
    activeSpecialTheme,
  } = useTheme();

  const isPride =
    activeSpecialTheme === "pride";

  const visual =
    getNotificationVisual(
      notification.tipo,
      isPride,
      theme.colors.primary,
      theme.colors.primarySoft,
      theme.colors.danger,
      theme.colors.success,
      theme.colors.warning
    );

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.notificationItem,
        !notification.lida &&
          styles.unreadItem,
        pressed && styles.pressed,
      ]}
    >
      {isPride &&
      !notification.lida ? (
        <ThemeAccent
          style={
            styles.notificationIconPride
          }
        >
          <MaterialIcons
            name={visual.icon}
            size={23}
            color="#FFFFFF"
          />
        </ThemeAccent>
      ) : (
        <View
          style={[
            styles.notificationIcon,
            {
              backgroundColor:
                visual.background,
            },
          ]}
        >
          <MaterialIcons
            name={visual.icon}
            size={23}
            color={visual.foreground}
          />
        </View>
      )}

      <View
        style={
          styles.notificationContent
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
                fontWeight:
                  notification.lida
                    ? "600"
                    : "700",
              },
            ]}
          >
            {notification.titulo}
          </Text>

          {!notification.lida &&
            (isPride ? (
              <ThemeAccent
                style={
                  styles.unreadDot
                }
              />
            ) : (
              <View
                style={[
                  styles.unreadDot,
                  {
                    backgroundColor:
                      theme.colors
                        .primary,
                  },
                ]}
              />
            ))}
        </View>

        <Text
          style={[
            styles.notificationDescription,
            {
              color:
                theme.colors
                  .textSecondary,
            },
          ]}
        >
          {notification.descricao}
        </Text>

        <Text
          style={[
            styles.notificationTime,
            {
              color:
                theme.colors
                  .textSecondary,
            },
          ]}
        >
          {notification.horario}
        </Text>
      </View>
    </Pressable>
  );
}

function getNotificationVisual(
  tipo: TipoNotificacao,
  isPride: boolean,
  primary: string,
  primarySoft: string,
  danger: string,
  success: string,
  warning: string
): {
  icon: keyof typeof MaterialIcons.glyphMap;
  background: string;
  foreground: string;
} {
  if (tipo === "orcamento") {
    return {
      icon: "account-balance-wallet",
      background: isPride
        ? "#FFF1DF"
        : `${warning}20`,
      foreground: isPride
        ? "#F97316"
        : warning,
    };
  }

  if (tipo === "rendimento") {
    return {
      icon: "payments",
      background: isPride
        ? "#DCFCE7"
        : `${success}20`,
      foreground: isPride
        ? "#16A36A"
        : success,
    };
  }

  if (tipo === "gasto") {
    return {
      icon: "shopping-bag",
      background: isPride
        ? "#FCE7F3"
        : `${danger}20`,
      foreground: isPride
        ? "#EC4899"
        : danger,
    };
  }

  return {
    icon: "insights",
    background: isPride
      ? "#F3E8FF"
      : primarySoft,
    foreground: isPride
      ? "#9333EA"
      : primary,
  };
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "transparent",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 60,
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
    marginRight: 15,
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
    fontSize: 13,
    marginTop: 3,
  },

  segmentedControl: {
    height: 54,
    borderRadius: 15,
    borderWidth: 1,
    padding: 3,
    flexDirection: "row",
    marginBottom: 12,
  },

  segment: {
    flex: 1,
    borderRadius: 11,
    overflow: "hidden",
  },

  segmentAccent: {
    flex: 1,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  normalSegmentContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  segmentText: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },

  segmentTextSelected: {
    color: "#FFFFFF",
  },

  actionsRow: {
    alignItems: "flex-end",
    marginBottom: 18,
  },

  markAllButton: {
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 4,
  },

  markAllIconPride: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  markAllText: {
    fontSize: 13,
    fontWeight: "700",
  },

  section: {
    marginBottom: 23,
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginLeft: 4,
    marginBottom: 10,
  },

  notificationGroup: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },

  notificationItem: {
    minHeight: 112,
    paddingHorizontal: 16,
    paddingVertical: 17,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  unreadItem: {
    opacity: 1,
  },

  notificationIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  notificationIconPride: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
    overflow: "hidden",
  },

  notificationContent: {
    flex: 1,
  },

  notificationTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  notificationTitle: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    paddingRight: 8,
  },

  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginTop: 5,
    overflow: "hidden",
  },

  notificationDescription: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
  },

  notificationTime: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 7,
    opacity: 0.8,
  },

  divider: {
    height: 1,
    marginLeft: 75,
  },

  emptyCard: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 25,
    paddingVertical: 42,
    alignItems: "center",
    marginTop: 15,
  },

  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 17,
  },

  emptyIconPride: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 17,
    overflow: "hidden",
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 7,
  },

  emptyDescription: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    maxWidth: 260,
  },

  pressed: {
    opacity: 0.7,
  },
});