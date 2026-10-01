import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import ThemeAccent from "../components/ThemeAccent";
import { useTheme } from "../theme/ThemeContext";

type Periodo =
  | "Diário"
  | "Semanal"
  | "Mensal"
  | "Personalizado";

const periodos: Periodo[] = [
  "Diário",
  "Semanal",
  "Mensal",
  "Personalizado",
];

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

export default function NovoOrcamentoScreen() {
  const {
    theme,
    activeSpecialTheme,
  } = useTheme();

  const isPride =
    activeSpecialTheme === "pride";

  const [nome, setNome] =
    useState("Gastos pessoais");

  const [valor, setValor] =
    useState("30,00");

  const [periodo, setPeriodo] =
    useState<Periodo>("Diário");

  const [
    mostrarPeriodos,
    setMostrarPeriodos,
  ] = useState(false);

  const [
    repetirAutomaticamente,
    setRepetirAutomaticamente,
  ] = useState(true);

  function selecionarPeriodo(
    novoPeriodo: Periodo
  ) {
    setPeriodo(novoPeriodo);
    setMostrarPeriodos(false);
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialIcons
            name="arrow-back"
            size={29}
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
          Novo orçamento
        </Text>
      </View>

      <Text
        style={[
          styles.label,
          {
            color: theme.colors.text,
          },
        ]}
      >
        Nome
      </Text>

      <TextInput
        value={nome}
        onChangeText={setNome}
        placeholder="Ex.: Gastos pessoais"
        placeholderTextColor={
          theme.colors.textSecondary
        }
        style={[
          styles.input,
          {
            backgroundColor:
              theme.colors.surface,
            borderColor: theme.colors.border,
            color: theme.colors.text,
          },
        ]}
      />

      <Text
        style={[
          styles.label,
          {
            color: theme.colors.text,
          },
        ]}
      >
        Valor
      </Text>

      <View
        style={[
          styles.valueInputContainer,
          {
            backgroundColor:
              theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Text
          style={[
            styles.currency,
            {
              color:
                theme.colors.textSecondary,
            },
          ]}
        >
          R$
        </Text>

        <TextInput
          value={valor}
          onChangeText={setValor}
          keyboardType="decimal-pad"
          placeholder="0,00"
          placeholderTextColor={
            theme.colors.textSecondary
          }
          style={[
            styles.valueInput,
            {
              color: theme.colors.text,
            },
          ]}
        />
      </View>

      <Text
        style={[
          styles.label,
          {
            color: theme.colors.text,
          },
        ]}
      >
        Período
      </Text>

      <Pressable
        onPress={() =>
          setMostrarPeriodos(
            (atual) => !atual
          )
        }
        style={[
          styles.select,
          {
            backgroundColor:
              theme.colors.surface,
            borderColor: isPride
              ? "#A855F7"
              : theme.colors.border,
          },
        ]}
      >
        <Text
          style={[
            styles.selectText,
            {
              color: theme.colors.text,
            },
          ]}
        >
          {periodo}
        </Text>

        <MaterialIcons
          name={
            mostrarPeriodos
              ? "keyboard-arrow-up"
              : "keyboard-arrow-down"
          }
          size={27}
          color={
            isPride
              ? "#A855F7"
              : theme.colors.textSecondary
          }
        />
      </Pressable>

      {mostrarPeriodos && (
        <View
          style={[
            styles.dropdown,
            {
              backgroundColor:
                theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          {periodos.map(
            (item, index) => (
              <Pressable
                key={item}
                onPress={() =>
                  selecionarPeriodo(item)
                }
                style={[
                  styles.dropdownItem,
                  index !==
                    periodos.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor:
                      theme.colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    {
                      color:
                        periodo === item
                          ? isPride
                            ? "#A855F7"
                            : theme.colors
                                .primary
                          : theme.colors.text,
                    },
                  ]}
                >
                  {item}
                </Text>

                {periodo === item && (
                  <MaterialIcons
                    name="check"
                    size={22}
                    color={
                      isPride
                        ? "#A855F7"
                        : theme.colors.primary
                    }
                  />
                )}
              </Pressable>
            )
          )}
        </View>
      )}

      <View style={styles.repeatRow}>
        <View
          style={styles.repeatTextContainer}
        >
          <Text
            style={[
              styles.repeatTitle,
              {
                color: theme.colors.text,
              },
            ]}
          >
            Repetir automaticamente
          </Text>

          <Text
            style={[
              styles.repeatDescription,
              {
                color:
                  theme.colors.textSecondary,
              },
            ]}
          >
            Cria um novo período quando o atual
            terminar
          </Text>
        </View>

        <BudgetSwitch
          value={repetirAutomaticamente}
          onValueChange={
            setRepetirAutomaticamente
          }
        />
      </View>

      <Text
        style={[
          styles.label,
          {
            color: theme.colors.text,
          },
        ]}
      >
        Data de início
      </Text>

      <Pressable
        style={[
          styles.dateField,
          {
            backgroundColor:
              theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <View style={styles.dateLeft}>
          <MaterialIcons
            name="calendar-today"
            size={22}
            color={
              isPride
                ? "#168AF2"
                : theme.colors.textSecondary
            }
          />

          <Text
            style={[
              styles.dateText,
              {
                color: theme.colors.text,
              },
            ]}
          >
            Hoje
          </Text>
        </View>

        <Text
          style={[
            styles.dateValue,
            {
              color:
                theme.colors.textSecondary,
            },
          ]}
        >
          14/10/2026
        </Text>

        <MaterialIcons
          name="chevron-right"
          size={25}
          color={
            theme.colors.textSecondary
          }
        />
      </Pressable>

      <View
        style={[
          styles.summaryCard,
          {
            backgroundColor:
              theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <MaterialIcons
          name="info-outline"
          size={22}
          color={
            isPride
              ? "#7C3AED"
              : theme.colors.primary
          }
        />

        <View style={styles.summaryContent}>
          <Text
            style={[
              styles.summaryTitle,
              {
                color: theme.colors.text,
              },
            ]}
          >
            Seu orçamento
          </Text>

          <Text
            style={[
              styles.summaryText,
              {
                color:
                  theme.colors.textSecondary,
              },
            ]}
          >
            R$ {valor || "0,00"} •{" "}
            {periodo.toLowerCase()}
            {repetirAutomaticamente
              ? " • renovação automática"
              : ""}
          </Text>
        </View>
      </View>

      {isPride ? (
        <Pressable
          onPress={() => router.back()}
          style={styles.savePressable}
        >
          <ThemeAccent
            style={styles.saveButtonPride}
          >
            <Text
              style={styles.saveButtonText}
            >
              Salvar orçamento
            </Text>
          </ThemeAccent>
        </Pressable>
      ) : (
        <Pressable
          onPress={() => router.back()}
          style={[
            styles.saveButton,
            {
              backgroundColor:
                theme.colors.primary,
            },
          ]}
        >
          <Text
            style={styles.saveButtonText}
          >
            Salvar orçamento
          </Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

type BudgetSwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
};

function BudgetSwitch({
  value,
  onValueChange,
}: BudgetSwitchProps) {
  const {
    theme,
    activeSpecialTheme,
  } = useTheme();

  const isPride =
    activeSpecialTheme === "pride";

  if (isPride && value) {
    return (
      <Pressable
        onPress={() =>
          onValueChange(false)
        }
        style={styles.customSwitch}
      >
        <LinearGradient
          colors={prideColors}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.switchTrack}
        >
          <View
            style={[
              styles.switchThumb,
              styles.switchThumbOn,
            ]}
          />
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={() =>
        onValueChange(!value)
      }
      style={[
        styles.customSwitch,
        {
          backgroundColor: value
            ? theme.colors.primary
            : theme.colors.surfaceSecondary,
        },
      ]}
    >
      <View
        style={[
          styles.switchThumb,
          value
            ? styles.switchThumbOn
            : styles.switchThumbOff,
        ]}
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
    paddingTop: 54,
    paddingBottom: 110,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },

  backButton: {
    width: 44,
    height: 44,
    alignItems: "flex-start",
    justifyContent: "center",
  },

  title: {
    fontSize: 27,
    fontWeight: "700",
    letterSpacing: -0.5,
    marginLeft: 4,
  },

  label: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 9,
  },

  input: {
    height: 64,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 17,
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 22,
  },

  valueInputContainer: {
    height: 72,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 17,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
  },

  currency: {
    fontSize: 21,
    fontWeight: "700",
    marginRight: 8,
  },

  valueInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: "700",
    padding: 0,
  },

  select: {
    height: 64,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },

  selectText: {
    fontSize: 16,
    fontWeight: "600",
  },

  dropdown: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginTop: -14,
    marginBottom: 22,
  },

  dropdownItem: {
    height: 56,
    paddingHorizontal: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  dropdownText: {
    fontSize: 16,
    fontWeight: "600",
  },

  repeatRow: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },

  repeatTextContainer: {
    flex: 1,
    paddingRight: 16,
  },

  repeatTitle: {
    fontSize: 16,
    fontWeight: "700",
  },

  repeatDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 5,
  },

  customSwitch: {
    width: 52,
    height: 30,
    borderRadius: 15,
    overflow: "hidden",
    justifyContent: "center",
  },

  switchTrack: {
    flex: 1,
    borderRadius: 15,
    justifyContent: "center",
  },

  switchThumb: {
    position: "absolute",
    top: 3,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },

  switchThumbOn: {
    right: 3,
  },

  switchThumbOff: {
    left: 3,
  },

  dateField: {
    minHeight: 64,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },

  dateLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },

  dateText: {
    fontSize: 16,
    fontWeight: "600",
  },

  dateValue: {
    fontSize: 14,
    marginRight: 5,
  },

  summaryCard: {
    borderRadius: 17,
    borderWidth: 1,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  summaryContent: {
    flex: 1,
  },

  summaryTitle: {
    fontSize: 15,
    fontWeight: "700",
  },

  summaryText: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },

  savePressable: {
    marginTop: 28,
    borderRadius: 17,
    overflow: "hidden",
  },

  saveButtonPride: {
    height: 60,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  saveButton: {
    height: 60,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
    overflow: "hidden",
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
});