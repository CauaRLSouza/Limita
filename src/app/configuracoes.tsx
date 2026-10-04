import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { resetDevelopmentApp } from "../database/dev";
import { useTheme } from "../theme/ThemeContext";

const prideColors = [
  "#FF2D55",
  "#FF8A00",
  "#FFD60A",
  "#22C55E",
  "#06B6D4",
  "#2563EB",
  "#7C3AED",
  "#D946EF",
] as const;

type PrideIconColor =
  | "pink"
  | "orange"
  | "green"
  | "blue"
  | "purple";

const prideIconColors: Record<
  PrideIconColor,
  {
    background: string;
    foreground: string;
  }
> = {
  pink: {
    background: "#FCE7F3",
    foreground: "#EC4899",
  },
  orange: {
    background: "#FFF1DF",
    foreground: "#F97316",
  },
  green: {
    background: "#DCFCE7",
    foreground: "#16A36A",
  },
  blue: {
    background: "#DBEAFE",
    foreground: "#168AF2",
  },
  purple: {
    background: "#F3E8FF",
    foreground: "#9333EA",
  },
};

export default function ConfiguracoesScreen() {
  const {
    theme,
    themeName,
    resolvedThemeName,
    specialTheme,
    activeSpecialTheme,
    achievementTheme,
  } = useTheme();

  const nomeBase =
    themeName === "system"
      ? `Sistema · ${
          resolvedThemeName === "dark"
            ? "Escuro"
            : "Claro"
        }`
      : themeName === "dark"
        ? "Escuro"
        : "Claro";

  const nomeConquista =
    achievementTheme === "spark"
      ? "Faísca ✨"
      : achievementTheme === "oasis"
        ? "Oásis 🌴"
        : achievementTheme === "aurora"
          ? "Aurora 🌅"
          : achievementTheme === "constellation"
            ? "Constelação ✨"
            : null;

  const nomeTemaPrincipal =
    nomeConquista ?? nomeBase;

  const nomeTemaAtual =
    activeSpecialTheme === "meanGirls"
      ? "Mean Girls"
      : activeSpecialTheme === "pride"
        ? "Pride"
        : specialTheme === "meanGirls"
          ? `${nomeTemaPrincipal} · Mean Girls nas quartas`
          : specialTheme === "pride"
            ? `${nomeTemaPrincipal} · Pride em junho`
            : nomeTemaPrincipal;

  async function abrirEmailSuporte() {
    const email =
      "suporte.limita@outlook.com";

    const assunto =
      encodeURIComponent(
        "Contato — Límita"
      );

    const url =
      `mailto:${email}?subject=${assunto}`;

    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(
        "Não foi possível abrir o e-mail",
        `Entre em contato pelo endereço ${email}.`
      );
    }
  }

  function confirmarResetTotal() {
    Alert.alert(
      "Reiniciar aplicativo?",
      "Todos os dados de teste serão apagados, incluindo perfil, profissões, rendimentos, movimentações, orçamentos, ciclos, histórico e Cofre. O onboarding será exibido novamente.",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Reiniciar",
          style: "destructive",
          onPress: executarResetTotal,
        },
      ]
    );
  }

  async function executarResetTotal() {
    try {
      await resetDevelopmentApp();

      router.replace("/onboarding");
    } catch (error) {
      console.error(
        "Erro ao reiniciar aplicativo:",
        error
      );

      Alert.alert(
        "Não foi possível reiniciar",
        "Ocorreu um erro ao apagar os dados de desenvolvimento."
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
          Configurações
        </Text>
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
        APARÊNCIA
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
        <SettingItem
          icon="palette"
          title="Tema"
          description={nomeTemaAtual}
          onPress={() =>
            router.push("/temas")
          }
          prideRainbow
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
        NOTIFICAÇÕES
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
        <SettingItem
          icon="notifications-none"
          title="Notificações"
          description="Lembretes e avisos do Límita"
          onPress={() =>
            router.push(
              "/configurar-notificacoes"
            )
          }
          prideColor="pink"
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
        CONQUISTAS
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
        <SettingItem
          icon="emoji-events"
          title="Conquistas"
          description="Acompanhe seu progresso e recompensas"
          onPress={() =>
            router.push("/conquistas")
          }
          prideColor="orange"
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
        SUPORTE
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
        <SettingItem
          icon="mail-outline"
          title="Fale conosco"
          description="Dúvidas, sugestões ou feedback"
          onPress={abrirEmailSuporte}
          prideColor="blue"
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
        SOBRE
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
        <SettingItem
          icon="info-outline"
          title="Sobre o Límita"
          description="Conheça o propósito do app"
          onPress={() =>
            router.push("/sobre")
          }
          prideColor="green"
        />
      </View>

      {__DEV__ && (
        <>
          <Text
            style={[
              styles.sectionLabel,
              {
                color: "#FF5A67",
              },
            ]}
          >
            DESENVOLVIMENTO
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
            <SettingItem
              icon="restart-alt"
              title="Reiniciar aplicativo"
              description="Apaga todos os dados de teste e refaz o onboarding"
              onPress={
                confirmarResetTotal
              }
              danger
            />
          </View>
        </>
      )}

      <Text
        style={[
          styles.footer,
          {
            color:
              theme.colors.textSecondary,
          },
        ]}
      >
        Límita · Versão 1.0.0
      </Text>
    </ScrollView>
  );
}

type SettingItemProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description: string;
  onPress: () => void;
  prideRainbow?: boolean;
  prideColor?: PrideIconColor;
  danger?: boolean;
};

function SettingItem({
  icon,
  title,
  description,
  onPress,
  prideRainbow = false,
  prideColor = "blue",
  danger = false,
}: SettingItemProps) {
  const {
    theme,
    activeSpecialTheme,
  } = useTheme();

  const isPride =
    activeSpecialTheme === "pride";

  const pridePalette =
    prideIconColors[prideColor];

  const iconBackground =
    danger
      ? "#FEE2E2"
      : isPride
        ? pridePalette.background
        : theme.colors.primarySoft;

  const iconForeground =
    danger
      ? "#EF4444"
      : isPride
        ? pridePalette.foreground
        : theme.colors.primary;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingItem,
        pressed && styles.pressed,
      ]}
    >
      {isPride &&
      prideRainbow &&
      !danger ? (
        <LinearGradient
          colors={prideColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={
            styles.rainbowIconContainer
          }
        >
          <MaterialIcons
            name={icon}
            size={23}
            color="#FFFFFF"
          />
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor:
                iconBackground,
            },
          ]}
        >
          <MaterialIcons
            name={icon}
            size={23}
            color={iconForeground}
          />
        </View>
      )}

      <View style={styles.settingText}>
        <Text
          style={[
            styles.settingTitle,
            {
              color: danger
                ? "#EF4444"
                : theme.colors.text,
            },
          ]}
        >
          {title}
        </Text>

        <Text
          style={[
            styles.settingDescription,
            {
              color:
                theme.colors
                  .textSecondary,
            },
          ]}
        >
          {description}
        </Text>
      </View>

      <MaterialIcons
        name="chevron-right"
        size={26}
        color={
          danger
            ? "#EF4444"
            : isPride &&
                prideRainbow
              ? "#A855F7"
              : theme.colors
                  .textSecondary
        }
      />
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
    paddingBottom: 50,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
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

  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.1,
    marginLeft: 4,
    marginBottom: 10,
    marginTop: 10,
  },

  card: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 22,
  },

  settingItem: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  pressed: {
    opacity: 0.7,
  },

  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  rainbowIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  settingText: {
    flex: 1,
    paddingRight: 10,
  },

  settingTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },

  settingDescription: {
    fontSize: 13,
    lineHeight: 18,
  },

  footer: {
    textAlign: "center",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 12,
    opacity: 0.7,
  },
});