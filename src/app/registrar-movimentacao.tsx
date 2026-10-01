import MaterialIcons from "@expo/vector-icons/MaterialIcons";
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

type TipoMovimentacao = "gasto" | "entrada";

type CheckboxRowProps = {
  label: string;
  checked: boolean;
  onPress: () => void;
};

export default function RegistrarMovimentacaoScreen() {
  const {
    theme,
    activeSpecialTheme,
  } = useTheme();

  const [tipo, setTipo] =
    useState<TipoMovimentacao>("gasto");

  const [valor, setValor] = useState("42,90");
  const [descricao, setDescricao] = useState("");

  const [afetaOrcamento, setAfetaOrcamento] =
    useState(true);

  const [afetaMes, setAfetaMes] =
    useState(true);

  const [afetaSaldo, setAfetaSaldo] =
    useState(true);

  const [adicionarSaldo, setAdicionarSaldo] =
    useState(true);

  const [contabilizarMes, setContabilizarMes] =
    useState(true);

  const [considerarSalario, setConsiderarSalario] =
    useState(false);

  const isGasto = tipo === "gasto";

  const isMeanGirls =
    activeSpecialTheme === "meanGirls";

  const isPride =
    activeSpecialTheme === "pride";

  function trocarTipo(
    novoTipo: TipoMovimentacao
  ) {
    setTipo(novoTipo);

    if (novoTipo === "gasto") {
      setValor("42,90");
    } else {
      setValor("500,00");
    }
  }

  function renderSegment(
    label: string,
    selected: boolean,
    onPress: () => void
  ) {
    if (selected && isPride) {
      return (
        <Pressable
          onPress={onPress}
          style={styles.segment}
        >
          <ThemeAccent style={styles.segmentAccent}>
            <Text
              style={[
                styles.segmentText,
                styles.selectedSegmentText,
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
          styles.segment,
          selected && {
            backgroundColor:
              theme.colors.primary,
          },
        ]}
      >
        <Text
          style={[
            styles.segmentText,
            {
              color: selected
                ? "#FFFFFF"
                : theme.colors.textSecondary,
            },
          ]}
        >
          {label}
        </Text>
      </Pressable>
    );
  }

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: isMeanGirls
          ? "transparent"
          : theme.colors.background,
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
            size={28}
            color={theme.colors.text}
          />
        </Pressable>

        <Text
          style={[
            styles.headerTitle,
            { color: theme.colors.text },
          ]}
        >
          Registrar movimentação
        </Text>
      </View>

      <View
        style={[
          styles.segmentedControl,
          {
            backgroundColor:
              theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        {renderSegment(
          "Gasto",
          isGasto,
          () => trocarTipo("gasto")
        )}

        {renderSegment(
          "Entrada",
          !isGasto,
          () => trocarTipo("entrada")
        )}
      </View>

      <View
        style={[
          styles.valueCard,
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
          { color: theme.colors.text },
        ]}
      >
        Data
      </Text>

      <Pressable
        style={[
          styles.field,
          {
            backgroundColor:
              theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <View style={styles.fieldLeft}>
          <MaterialIcons
            name="calendar-today"
            size={22}
            color={
              theme.colors.textSecondary
            }
          />

          <Text
            style={[
              styles.fieldText,
              {
                color: theme.colors.text,
              },
            ]}
          >
            14/10/2026
          </Text>
        </View>

        <View style={styles.fieldRight}>
          <Text
            style={[
              styles.fieldHint,
              {
                color:
                  theme.colors.textSecondary,
              },
            ]}
          >
            Hoje
          </Text>

          <MaterialIcons
            name="chevron-right"
            size={24}
            color={
              theme.colors.textSecondary
            }
          />
        </View>
      </Pressable>

      <Text
        style={[
          styles.label,
          { color: theme.colors.text },
        ]}
      >
        Categoria
      </Text>

      <Pressable
        style={[
          styles.field,
          {
            backgroundColor:
              theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <View style={styles.fieldLeft}>
          <View
            style={[
              styles.categoryIcon,
              {
                backgroundColor: isGasto
                  ? theme.colors.danger
                  : theme.colors.success,
              },
            ]}
          >
            <MaterialIcons
              name={
                isGasto
                  ? "restaurant"
                  : "payments"
              }
              size={19}
              color="#FFFFFF"
            />
          </View>

          <Text
            style={[
              styles.fieldText,
              {
                color: theme.colors.text,
              },
            ]}
          >
            {isGasto
              ? "Alimentação"
              : "Salário extra"}
          </Text>
        </View>

        <MaterialIcons
          name="chevron-right"
          size={24}
          color={theme.colors.textSecondary}
        />
      </Pressable>

      <Text
        style={[
          styles.label,
          { color: theme.colors.text },
        ]}
      >
        Descrição (opcional)
      </Text>

      <TextInput
        value={descricao}
        onChangeText={setDescricao}
        placeholder={
          isGasto
            ? "Ex.: Pizza"
            : "Ex.: Freelance"
        }
        placeholderTextColor={
          theme.colors.textSecondary
        }
        style={[
          styles.descriptionInput,
          {
            backgroundColor:
              theme.colors.surface,
            borderColor: theme.colors.border,
            color: theme.colors.text,
          },
        ]}
      />

      {isGasto ? (
        <>
          <Text
            style={[
              styles.optionsTitle,
              {
                color: theme.colors.text,
              },
            ]}
          >
            Afeta
          </Text>

          <CheckboxRow
            label="Orçamento atual"
            checked={afetaOrcamento}
            onPress={() =>
              setAfetaOrcamento(
                !afetaOrcamento
              )
            }
          />

          <CheckboxRow
            label="Dinheiro do mês"
            checked={afetaMes}
            onPress={() =>
              setAfetaMes(!afetaMes)
            }
          />

          <CheckboxRow
            label="Saldo total"
            checked={afetaSaldo}
            onPress={() =>
              setAfetaSaldo(!afetaSaldo)
            }
          />
        </>
      ) : (
        <>
          <Text
            style={[
              styles.optionsTitle,
              {
                color: theme.colors.text,
              },
            ]}
          >
            Contabilizar em
          </Text>

          <CheckboxRow
            label="Adicionar ao saldo total"
            checked={adicionarSaldo}
            onPress={() =>
              setAdicionarSaldo(
                !adicionarSaldo
              )
            }
          />

          <CheckboxRow
            label="Dinheiro deste mês"
            checked={contabilizarMes}
            onPress={() =>
              setContabilizarMes(
                !contabilizarMes
              )
            }
          />

          <CheckboxRow
            label="Considerar como salário"
            checked={considerarSalario}
            onPress={() =>
              setConsiderarSalario(
                !considerarSalario
              )
            }
          />
        </>
      )}

      {isPride ? (
        <Pressable>
          <ThemeAccent
            style={styles.saveButton}
          >
            <Text style={styles.saveButtonText}>
              Registrar movimentação
            </Text>
          </ThemeAccent>
        </Pressable>
      ) : (
        <Pressable
          style={[
            styles.saveButton,
            {
              backgroundColor:
                theme.colors.primary,
            },
          ]}
        >
          <Text style={styles.saveButtonText}>
            Registrar movimentação
          </Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

function CheckboxRow({
  label,
  checked,
  onPress,
}: CheckboxRowProps) {
  const {
    theme,
    activeSpecialTheme,
  } = useTheme();

  const isPride =
    activeSpecialTheme === "pride";

  return (
    <Pressable
      onPress={onPress}
      style={styles.checkboxRow}
    >
      {checked && isPride ? (
        <ThemeAccent style={styles.checkbox}>
          <MaterialIcons
            name="check"
            size={18}
            color="#FFFFFF"
          />
        </ThemeAccent>
      ) : (
        <View
          style={[
            styles.checkbox,
            {
              borderColor: checked
                ? theme.colors.primary
                : theme.colors.textSecondary,
              backgroundColor: checked
                ? theme.colors.primary
                : "transparent",
            },
          ]}
        >
          {checked && (
            <MaterialIcons
              name="check"
              size={18}
              color="#FFFFFF"
            />
          )}
        </View>
      )}

      <Text
        style={[
          styles.checkboxLabel,
          {
            color: theme.colors.text,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
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
    marginBottom: 24,
  },

  backButton: {
    width: 42,
    height: 42,
    justifyContent: "center",
  },

  headerTitle: {
    fontSize: 23,
    fontWeight: "700",
    marginLeft: 4,
  },

  segmentedControl: {
    flexDirection: "row",
    height: 54,
    borderRadius: 15,
    borderWidth: 1,
    padding: 3,
    marginBottom: 22,
  },

  segment: {
    flex: 1,
    borderRadius: 11,
    overflow: "hidden",
  },

  segmentAccent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
  },

  segmentText: {
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },

  selectedSegmentText: {
    color: "#FFFFFF",
  },

  valueCard: {
    height: 112,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
  },

  currency: {
    fontSize: 30,
    fontWeight: "600",
    marginRight: 10,
  },

  valueInput: {
    flex: 1,
    fontSize: 40,
    fontWeight: "600",
    padding: 0,
  },

  label: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 9,
  },

  field: {
    minHeight: 64,
    borderRadius: 15,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 19,
  },

  fieldLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },

  fieldRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  fieldText: {
    fontSize: 16,
    fontWeight: "600",
  },

  fieldHint: {
    fontSize: 14,
  },

  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  descriptionInput: {
    height: 62,
    borderRadius: 15,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 21,
  },

  optionsTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 13,
  },

  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 45,
  },

  checkbox: {
    width: 25,
    height: 25,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
    overflow: "hidden",
  },

  checkboxLabel: {
    fontSize: 16,
    fontWeight: "500",
  },

  saveButton: {
    height: 58,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    overflow: "hidden",
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
});