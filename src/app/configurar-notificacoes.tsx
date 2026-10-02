import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

import { useNotificationPreferences } from "../notifications/NotificationPreferencesContext";
import { solicitarPermissaoNotificacoes } from "../notifications/notifications";
import { useTheme } from "../theme/ThemeContext";

export default function ConfigurarNotificacoesScreen() {
  const {
    theme,
    activeSpecialTheme,
  } = useTheme();

  const {
    notificacoesAtivas,
    setNotificacoesAtivas,
    orcamentos,
    setOrcamentos,
    movimentacoesAgendadas,
    setMovimentacoesAgendadas,
    cicloFinanceiro,
    setCicloFinanceiro,
    lembretes,
    setLembretes,
    temasEspeciais,
    setTemasEspeciais,
  } = useNotificationPreferences();

  const isPride =
    activeSpecialTheme === "pride";

  const switchTrack = {
    false: theme.colors.border,
    true: theme.colors.primary,
  };

  async function alterarNotificacoesAtivas(
    value: boolean
  ) {
    if (!value) {
      setNotificacoesAtivas(false);
      return;
    }

    try {
      const permitido =
        await solicitarPermissaoNotificacoes();

      if (permitido) {
        setNotificacoesAtivas(true);
        return;
      }

      setNotificacoesAtivas(false);

      Alert.alert(
        "Notificações desativadas",
        "Para receber avisos do Límita, permita notificações nas configurações do seu dispositivo."
      );
    } catch (error) {
      console.error(
        "Erro ao solicitar permissão de notificações:",
        error
      );

      setNotificacoesAtivas(false);

      Alert.alert(
        "Não foi possível ativar",
        "O Límita não conseguiu solicitar a permissão de notificações."
      );
    }
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
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
      </View>

      <View
        style={[
          styles.mainCard,
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
            styles.mainIcon,
            {
              backgroundColor:
                theme.colors.primarySoft,
            },
          ]}
        >
          <MaterialIcons
            name="notifications-none"
            size={28}
            color={theme.colors.primary}
          />
        </View>

        <View style={styles.mainText}>
          <Text
            style={[
              styles.mainTitle,
              {
                color: theme.colors.text,
              },
            ]}
          >
            Notificações do Límita
          </Text>

          <Text
            style={[
              styles.mainDescription,
              {
                color:
                  theme.colors.textSecondary,
              },
            ]}
          >
            Receba lembretes importantes sobre sua
            organização financeira.
          </Text>
        </View>

        <Switch
          value={notificacoesAtivas}
          onValueChange={
            alterarNotificacoesAtivas
          }
          trackColor={switchTrack}
          thumbColor={
            notificacoesAtivas
              ? isPride
                ? "#FFFFFF"
                : theme.colors.primary
              : "#F4F4F5"
          }
        />
      </View>

      <Text
        style={[
          styles.sectionLabel,
          {
            color:
              theme.colors.textSecondary,
          },
        ]}
      >
        AVISOS FINANCEIROS
      </Text>

      <View
        style={[
          styles.card,
          {
            backgroundColor:
              theme.colors.surface,
            borderColor:
              theme.colors.border,
          },
        ]}
      >
        <NotificationItem
          icon="account-balance-wallet"
          title="Orçamentos"
          description="Avisos quando seus gastos se aproximarem ou ultrapassarem um orçamento."
          value={
            notificacoesAtivas &&
            orcamentos
          }
          disabled={!notificacoesAtivas}
          onValueChange={setOrcamentos}
        />

        <Divider />

        <NotificationItem
          icon="event"
          title="Movimentações agendadas"
          description="Avisos sobre entradas e gastos programados."
          value={
            notificacoesAtivas &&
            movimentacoesAgendadas
          }
          disabled={!notificacoesAtivas}
          onValueChange={
            setMovimentacoesAgendadas
          }
        />

        <Divider />

        <NotificationItem
          icon="autorenew"
          title="Ciclo financeiro"
          description="Informações importantes sobre o início e o fechamento dos seus ciclos."
          value={
            notificacoesAtivas &&
            cicloFinanceiro
          }
          disabled={!notificacoesAtivas}
          onValueChange={
            setCicloFinanceiro
          }
        />

        <Divider />

        <NotificationItem
          icon="notifications-active"
          title="Lembretes"
          description="Lembretes úteis para manter suas movimentações e planejamento em dia."
          value={
            notificacoesAtivas &&
            lembretes
          }
          disabled={!notificacoesAtivas}
          onValueChange={setLembretes}
        />
      </View>

      <Text
        style={[
          styles.sectionLabel,
          styles.specialSectionLabel,
          {
            color:
              theme.colors.textSecondary,
          },
        ]}
      >
        EXPERIÊNCIA
      </Text>

      <View
        style={[
          styles.card,
          {
            backgroundColor:
              theme.colors.surface,
            borderColor:
              theme.colors.border,
          },
        ]}
      >
        <NotificationItem
          icon="auto-awesome"
          title="Temas especiais"
          description="Receba avisos quando um tema especial for ativado por uma data, evento ou condição."
          value={
            notificacoesAtivas &&
            temasEspeciais
          }
          disabled={!notificacoesAtivas}
          onValueChange={setTemasEspeciais}
        />
      </View>

      <View
        style={[
          styles.infoCard,
          {
            backgroundColor:
              theme.colors.primarySoft,
          },
        ]}
      >
        <MaterialIcons
          name="info-outline"
          size={20}
          color={theme.colors.primary}
        />

        <Text
          style={[
            styles.infoText,
            {
              color: theme.colors.text,
            },
          ]}
        >
          Você pode alterar essas preferências
          quando quiser. O Límita evita notificações
          desnecessárias e prioriza avisos que possam
          ser úteis para sua organização financeira
          e sua experiência no app.
        </Text>
      </View>
    </ScrollView>
  );
}

type NotificationItemProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description: string;
  value: boolean;
  disabled?: boolean;
  onValueChange: (value: boolean) => void;
};

function NotificationItem({
  icon,
  title,
  description,
  value,
  disabled = false,
  onValueChange,
}: NotificationItemProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.notificationItem,
        disabled && styles.disabled,
      ]}
    >
      <View
        style={[
          styles.itemIcon,
          {
            backgroundColor:
              theme.colors.primarySoft,
          },
        ]}
      >
        <MaterialIcons
          name={icon}
          size={22}
          color={theme.colors.primary}
        />
      </View>

      <View style={styles.itemText}>
        <Text
          style={[
            styles.itemTitle,
            {
              color: theme.colors.text,
            },
          ]}
        >
          {title}
        </Text>

        <Text
          style={[
            styles.itemDescription,
            {
              color:
                theme.colors.textSecondary,
            },
          ]}
        >
          {description}
        </Text>
      </View>

      <Switch
        value={value}
        disabled={disabled}
        onValueChange={onValueChange}
        trackColor={{
          false: theme.colors.border,
          true: theme.colors.primary,
        }}
        thumbColor={
          value
            ? theme.colors.primary
            : "#F4F4F5"
        }
      />
    </View>
  );
}

function Divider() {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.divider,
        {
          backgroundColor:
            theme.colors.border,
        },
      ]}
    />
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
    paddingBottom: 50,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
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

  title: {
    fontSize: 29,
    fontWeight: "700",
    letterSpacing: -0.7,
  },

  mainCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 26,
  },

  mainIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  mainText: {
    flex: 1,
    paddingRight: 10,
  },

  mainTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 4,
  },

  mainDescription: {
    fontSize: 13,
    lineHeight: 18,
  },

  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.1,
    marginLeft: 4,
    marginBottom: 10,
  },

  specialSectionLabel: {
    marginTop: 24,
  },

  card: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },

  notificationItem: {
    minHeight: 98,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  disabled: {
    opacity: 0.45,
  },

  itemIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  itemText: {
    flex: 1,
    paddingRight: 10,
  },

  itemTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },

  itemDescription: {
    fontSize: 12,
    lineHeight: 17,
  },

  divider: {
    height: 1,
    marginLeft: 73,
  },

  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 16,
    padding: 15,
    marginTop: 20,
  },

  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
});