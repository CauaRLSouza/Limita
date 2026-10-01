import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import { useTheme } from "../theme/ThemeContext";

type Periodo = "Diário" | "Semanal" | "Mensal" | "Personalizado";

const periodos: Periodo[] = [
  "Diário",
  "Semanal",
  "Mensal",
  "Personalizado",
];

export default function NovoOrcamentoScreen() {
  const { theme } = useTheme();

  const [nome, setNome] = useState("Gastos pessoais");
  const [valor, setValor] = useState("30,00");
  const [periodo, setPeriodo] = useState<Periodo>("Diário");
  const [mostrarPeriodos, setMostrarPeriodos] = useState(false);
  const [repetirAutomaticamente, setRepetirAutomaticamente] =
    useState(true);

  function selecionarPeriodo(novoPeriodo: Periodo) {
    setPeriodo(novoPeriodo);
    setMostrarPeriodos(false);
  }

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
      }}
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
            { color: theme.colors.text },
          ]}
        >
          Novo orçamento
        </Text>
      </View>

      <Text
        style={[
          styles.label,
          { color: theme.colors.text },
        ]}
      >
        Nome
      </Text>

      <TextInput
        value={nome}
        onChangeText={setNome}
        placeholder="Ex.: Gastos pessoais"
        placeholderTextColor={theme.colors.textSecondary}
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            color: theme.colors.text,
          },
        ]}
      />

      <Text
        style={[
          styles.label,
          { color: theme.colors.text },
        ]}
      >
        Valor
      </Text>

      <View
        style={[
          styles.valueInputContainer,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Text
          style={[
            styles.currency,
            { color: theme.colors.textSecondary },
          ]}
        >
          R$
        </Text>

        <TextInput
          value={valor}
          onChangeText={setValor}
          keyboardType="decimal-pad"
          placeholder="0,00"
          placeholderTextColor={theme.colors.textSecondary}
          style={[
            styles.valueInput,
            { color: theme.colors.text },
          ]}
        />
      </View>

      <Text
        style={[
          styles.label,
          { color: theme.colors.text },
        ]}
      >
        Período
      </Text>

      <Pressable
        onPress={() =>
          setMostrarPeriodos((atual) => !atual)
        }
        style={[
          styles.select,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Text
          style={[
            styles.selectText,
            { color: theme.colors.text },
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
          color={theme.colors.textSecondary}
        />
      </Pressable>

      {mostrarPeriodos && (
        <View
          style={[
            styles.dropdown,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          {periodos.map((item, index) => (
            <Pressable
              key={item}
              onPress={() => selecionarPeriodo(item)}
              style={[
                styles.dropdownItem,
                index !== periodos.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: theme.colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.dropdownText,
                  {
                    color:
                      periodo === item
                        ? theme.colors.primary
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
                  color={theme.colors.primary}
                />
              )}
            </Pressable>
          ))}
        </View>
      )}

      <View style={styles.repeatRow}>
        <View style={styles.repeatTextContainer}>
          <Text
            style={[
              styles.repeatTitle,
              { color: theme.colors.text },
            ]}
          >
            Repetir automaticamente
          </Text>

          <Text
            style={[
              styles.repeatDescription,
              { color: theme.colors.textSecondary },
            ]}
          >
            Cria um novo período quando o atual terminar
          </Text>
        </View>

        <Switch
          value={repetirAutomaticamente}
          onValueChange={setRepetirAutomaticamente}
          trackColor={{
            false: theme.colors.surfaceSecondary,
            true: theme.colors.primary,
          }}
          thumbColor="#FFFFFF"
        />
      </View>

      <Text
        style={[
          styles.label,
          { color: theme.colors.text },
        ]}
      >
        Data de início
      </Text>

      <Pressable
        style={[
          styles.dateField,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <View style={styles.dateLeft}>
          <MaterialIcons
            name="calendar-today"
            size={22}
            color={theme.colors.textSecondary}
          />

          <Text
            style={[
              styles.dateText,
              { color: theme.colors.text },
            ]}
          >
            Hoje
          </Text>
        </View>

        <Text
          style={[
            styles.dateValue,
            { color: theme.colors.textSecondary },
          ]}
        >
          14/10/2026
        </Text>

        <MaterialIcons
          name="chevron-right"
          size={25}
          color={theme.colors.textSecondary}
        />
      </Pressable>

      <View
        style={[
          styles.summaryCard,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <MaterialIcons
          name="info-outline"
          size={22}
          color={theme.colors.primary}
        />

        <View style={styles.summaryContent}>
          <Text
            style={[
              styles.summaryTitle,
              { color: theme.colors.text },
            ]}
          >
            Seu orçamento
          </Text>

          <Text
            style={[
              styles.summaryText,
              { color: theme.colors.textSecondary },
            ]}
          >
            R$ {valor || "0,00"} • {periodo.toLowerCase()}
            {repetirAutomaticamente
              ? " • renovação automática"
              : ""}
          </Text>
        </View>
      </View>

      <Pressable
        onPress={() => router.back()}
        style={[
          styles.saveButton,
          {
            backgroundColor: theme.colors.primary,
          },
        ]}
      >
        <Text style={styles.saveButtonText}>
          Salvar orçamento
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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

  saveButton: {
    height: 60,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
});