import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

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

  const nomeTemaAtual =
    specialTheme === "meanGirls"
      ? activeSpecialTheme === "meanGirls"
        ? "Mean Girls"
        : `${nomeBase} · Mean Girls nas quartas`
      : specialTheme === "pride"
        ? `Pride · ${nomeBase}`
        : nomeBase;

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
              borderColor: theme.colors.border,
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
            color: theme.colors.textSecondary,
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
            borderColor: theme.colors.border,
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

        <Divider />

        <SettingItem
          icon="format-size"
          title="Aparência"
          description="Preferências visuais do aplicativo"
          onPress={() => {}}
          prideColor="purple"
        />
      </View>

      <Text
        style={[
          styles.sectionLabel,
          {
            color: theme.colors.textSecondary,
          },
        ]}
      >
        ORGANIZAÇÃO
      </Text>

      <View
        style={[
          styles.card,
          {
            backgroundColor:
              theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <SettingItem
          icon="category"
          title="Categorias"
          description="Gerencie suas categorias"
          onPress={() => {}}
          prideColor="orange"
        />
      </View>

      <Text
        style={[
          styles.sectionLabel,
          {
            color: theme.colors.textSecondary,
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
            borderColor: theme.colors.border,
          },
        ]}
      >
        <SettingItem
          icon="notifications-none"
          title="Notificações"
          description="Lembretes e avisos do Límita"
          onPress={() => {}}
          prideColor="pink"
        />
      </View>

      <Text
        style={[
          styles.sectionLabel,
          {
            color: theme.colors.textSecondary,
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
            borderColor: theme.colors.border,
          },
        ]}
      >
        <SettingItem
          icon="info-outline"
          title="Sobre o Límita"
          description="Versão 1.0.0"
          onPress={() => {}}
          prideColor="green"
        />
      </View>

      <Text
        style={[
          styles.footer,
          {
            color: theme.colors.textSecondary,
          },
        ]}
      >
        Límita
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
};

function SettingItem({
  icon,
  title,
  description,
  onPress,
  prideRainbow = false,
  prideColor = "blue",
}: SettingItemProps) {
  const {
    theme,
    activeSpecialTheme,
  } = useTheme();

  const isPride =
    activeSpecialTheme === "pride";

  const pridePalette =
    prideIconColors[prideColor];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingItem,
        pressed && styles.pressed,
      ]}
    >
      {isPride && prideRainbow ? (
        <LinearGradient
          colors={prideColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.rainbowIconContainer}
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
              backgroundColor: isPride
                ? pridePalette.background
                : theme.colors.primarySoft,
            },
          ]}
        >
          <MaterialIcons
            name={icon}
            size={23}
            color={
              isPride
                ? pridePalette.foreground
                : theme.colors.primary
            }
          />
        </View>
      )}

      <View style={styles.settingText}>
        <Text
          style={[
            styles.settingTitle,
            {
              color: theme.colors.text,
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
                theme.colors.textSecondary,
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
          isPride && prideRainbow
            ? "#A855F7"
            : theme.colors.textSecondary
        }
      />
    </Pressable>
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

  divider: {
    height: 1,
    marginLeft: 76,
  },

  footer: {
    textAlign: "center",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 12,
    opacity: 0.7,
  },
});