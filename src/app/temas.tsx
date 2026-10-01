import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useTheme } from "../theme/ThemeContext";

type ThemeCardProps = {
  title: string;
  description: string;
  colors: string[];
  selected?: boolean;
  badge?: string;
  onPress?: () => void;
  children?: React.ReactNode;
};

type SpecialTheme = "none" | "meanGirls" | "pride";
type MeanGirlsMode = "always" | "wednesday";

export default function TemasScreen() {
  const { theme, themeName } = useTheme();

  const [specialTheme, setSpecialTheme] =
    useState<SpecialTheme>("none");

  const [meanGirlsMode, setMeanGirlsMode] =
    useState<MeanGirlsMode>("wednesday");

  function selectSpecialTheme(newTheme: SpecialTheme) {
    setSpecialTheme(newTheme);
  }

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
      }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={[
            styles.backButton,
            {
              backgroundColor: theme.colors.surface,
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
            { color: theme.colors.text },
          ]}
        >
          Temas
        </Text>
      </View>

      <Text
        style={[
          styles.description,
          { color: theme.colors.textSecondary },
        ]}
      >
        Escolha como o Límita deve aparecer para você.
      </Text>

      <Text
        style={[
          styles.sectionLabel,
          { color: theme.colors.textSecondary },
        ]}
      >
        TEMA BASE
      </Text>

      <Text
        style={[
          styles.sectionDescription,
          { color: theme.colors.textSecondary },
        ]}
      >
        Define a aparência principal do aplicativo.
      </Text>

      <View style={styles.themeList}>
        <ThemeCard
          title="Claro"
          description="Visual claro e limpo"
          colors={[
            "#F7F9FC",
            "#FFFFFF",
            "#168AF2",
            "#111827",
          ]}
          selected={themeName === "light"}
        />

        <ThemeCard
          title="Escuro"
          description="Visual escuro com detalhes em azul"
          colors={[
            "#07111A",
            "#101D28",
            "#168AF2",
            "#F8FAFC",
          ]}
          selected={themeName === "dark"}
        />

        <ThemeCard
          title="Sistema"
          description="Segue o tema do seu dispositivo"
          colors={[
            "#F7F9FC",
            "#07111A",
            "#168AF2",
            "#94A3B8",
          ]}
          badge="Automático"
        />
      </View>

      <Text
        style={[
          styles.sectionLabel,
          { color: theme.colors.textSecondary },
        ]}
      >
        TEMAS ESPECIAIS
      </Text>

      <Text
        style={[
          styles.sectionDescription,
          { color: theme.colors.textSecondary },
        ]}
      >
        Combine um tema especial com o seu tema-base.
      </Text>

      <View style={styles.themeList}>
        <ThemeCard
          title="Nenhum"
          description="Manter somente o tema-base"
          colors={[
            theme.colors.background,
            theme.colors.surface,
            theme.colors.primary,
            theme.colors.text,
          ]}
          selected={specialTheme === "none"}
          onPress={() => selectSpecialTheme("none")}
        />

        <ThemeCard
          title="Mean Girls 💅"
          description="On Wednesdays, we wear pink."
          colors={[
            "#FFF0F6",
            "#F9A8D4",
            "#EC4899",
            "#831843",
          ]}
          selected={specialTheme === "meanGirls"}
          onPress={() =>
            selectSpecialTheme("meanGirls")
          }
        >
          {specialTheme === "meanGirls" && (
            <View
              style={[
                styles.specialOptions,
                {
                  borderTopColor: theme.colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.optionsTitle,
                  { color: theme.colors.text },
                ]}
              >
                Como você quer usar este tema?
              </Text>

              <SpecialOption
                title="Manter ativo"
                description="Usar o tema Mean Girls todos os dias."
                selected={meanGirlsMode === "always"}
                accentColor="#EC4899"
                onPress={() =>
                  setMeanGirlsMode("always")
                }
              />

              <SpecialOption
                title="Nas Quartas Usamos Rosa 💅"
                description="Ativar automaticamente toda quarta-feira."
                selected={
                  meanGirlsMode === "wednesday"
                }
                accentColor="#EC4899"
                onPress={() =>
                  setMeanGirlsMode("wednesday")
                }
              />
            </View>
          )}
        </ThemeCard>

        <ThemeCard
          title="Pride 🏳️‍🌈"
          description="Uma versão mais colorida do Límita"
          colors={[
            "#EF4444",
            "#F59E0B",
            "#22C55E",
            "#3B82F6",
            "#A855F7",
          ]}
          selected={specialTheme === "pride"}
          onPress={() => selectSpecialTheme("pride")}
        />
      </View>

      {/*
      <Text
        style={[
          styles.sectionLabel,
          { color: theme.colors.textSecondary },
        ]}
      >
        OUTROS
      </Text>

      <Text
        style={[
          styles.sectionDescription,
          { color: theme.colors.textSecondary },
        ]}
      >
        Outros estilos disponíveis para o Límita.
      </Text>

      <View style={styles.themeList}>
        <ThemeCard
          title="Bolsonaro"
          description="Verde, amarelo e azul"
          colors={[
            "#009C3B",
            "#FFDF00",
            "#002776",
            "#FFFFFF",
          ]}
        />

        <ThemeCard
          title="Petista"
          description="Vermelho e branco"
          colors={[
            "#CC0000",
            "#FFFFFF",
            "#E53935",
            "#7F0000",
          ]}
        />

        <ThemeCard
          title="Missão"
          description="Amarelo, preto e detalhes marcantes"
          colors={[
            "#F5C400",
            "#111111",
            "#D89B2B",
            "#F4E4B8",
          ]}
        />
      </View>
      */}
    </ScrollView>
  );
}

function SpecialOption({
  title,
  description,
  selected,
  accentColor,
  onPress,
}: {
  title: string;
  description: string;
  selected: boolean;
  accentColor: string;
  onPress: () => void;
}) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.specialOption,
        pressed && styles.pressed,
      ]}
    >
      <View
        style={[
          styles.radioOuter,
          {
            borderColor: selected
              ? accentColor
              : theme.colors.textSecondary,
          },
        ]}
      >
        {selected && (
          <View
            style={[
              styles.radioInner,
              {
                backgroundColor: accentColor,
              },
            ]}
          />
        )}
      </View>

      <View style={styles.optionText}>
        <Text
          style={[
            styles.optionTitle,
            { color: theme.colors.text },
          ]}
        >
          {title}
        </Text>

        <Text
          style={[
            styles.optionDescription,
            { color: theme.colors.textSecondary },
          ]}
        >
          {description}
        </Text>
      </View>
    </Pressable>
  );
}

function ThemeCard({
  title,
  description,
  colors,
  selected = false,
  badge,
  onPress,
  children,
}: ThemeCardProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.themeCard,
        {
          backgroundColor: theme.colors.surface,
          borderColor: selected
            ? theme.colors.primary
            : theme.colors.border,
          borderWidth: selected ? 2 : 1,
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        style={({ pressed }) => [
          styles.themeCardContent,
          pressed && onPress && styles.pressed,
        ]}
      >
        <View style={styles.palette}>
          {colors.map((color, index) => (
            <View
              key={`${title}-${color}-${index}`}
              style={[
                styles.colorCircle,
                {
                  backgroundColor: color,
                  borderColor: theme.colors.border,
                },
              ]}
            />
          ))}
        </View>

        <View style={styles.themeText}>
          <View style={styles.themeTitleRow}>
            <Text
              style={[
                styles.themeTitle,
                { color: theme.colors.text },
              ]}
            >
              {title}
            </Text>

            {badge && (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor:
                      theme.colors.primarySoft,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    { color: theme.colors.primary },
                  ]}
                >
                  {badge}
                </Text>
              </View>
            )}
          </View>

          <Text
            style={[
              styles.themeDescription,
              { color: theme.colors.textSecondary },
            ]}
          >
            {description}
          </Text>
        </View>

        <View
          style={[
            styles.radioOuter,
            {
              borderColor: selected
                ? theme.colors.primary
                : theme.colors.textSecondary,
            },
          ]}
        >
          {selected && (
            <View
              style={[
                styles.radioInner,
                {
                  backgroundColor:
                    theme.colors.primary,
                },
              ]}
            />
          )}
        </View>
      </Pressable>

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 50,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
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

  description: {
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 30,
  },

  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.1,
    marginLeft: 4,
    marginBottom: 5,
    marginTop: 8,
  },

  sectionDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginLeft: 4,
    marginBottom: 12,
  },

  themeList: {
    gap: 10,
    marginBottom: 28,
  },

  themeCard: {
    borderRadius: 19,
    overflow: "hidden",
  },

  themeCardContent: {
    minHeight: 92,
    paddingHorizontal: 16,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
  },

  palette: {
    width: 64,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginRight: 14,
  },

  colorCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
  },

  themeText: {
    flex: 1,
    paddingRight: 10,
  },

  themeTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 7,
  },

  themeTitle: {
    fontSize: 17,
    fontWeight: "700",
  },

  themeDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },

  badge: {
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },

  badgeText: {
    fontSize: 10,
    fontWeight: "700",
  },

  radioOuter: {
    width: 23,
    height: 23,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },

  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
  },

  specialOptions: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 17,
    paddingBottom: 12,
  },

  optionsTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },

  specialOption: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 64,
    paddingVertical: 8,
  },

  optionText: {
    flex: 1,
    marginLeft: 13,
  },

  optionTitle: {
    fontSize: 15,
    fontWeight: "700",
  },

  optionDescription: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },

  pressed: {
    opacity: 0.65,
  },
});