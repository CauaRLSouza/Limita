import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

import TabHeader from "../../components/TabHeader";
import { useTheme } from "../../theme/ThemeContext";

export default function OrcamentosScreen() {
  const { theme } = useTheme();
  const [ativo, setAtivo] = useState(true);

  const valorDiario = 30;
  const disponivelHoje = 18.5;
  const utilizado = valorDiario - disponivelHoje;
  const percentualUtilizado = Math.round(
    (utilizado / valorDiario) * 100
  );

  const diasNoMes = 31;
  const diasNoAno = 365;

  const projecaoSemanal = valorDiario * 7;
  const projecaoMensal = valorDiario * diasNoMes;
  const projecaoAnual = valorDiario * diasNoAno;

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
      }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <TabHeader />

      <View style={styles.header}>
        <Text
          style={[
            styles.title,
            { color: theme.colors.text },
          ]}
        >
          Orçamentos
        </Text>

        <Pressable
          onPress={() => router.push("/novo-orcamento")}
          style={styles.addButton}
        >
          <MaterialIcons
            name="add"
            size={34}
            color={theme.colors.primary}
          />
        </Pressable>
      </View>

      <View
        style={[
          styles.budgetCard,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <View style={styles.budgetHeader}>
          <Text
            style={[
              styles.budgetTitle,
              { color: theme.colors.text },
            ]}
          >
            Orçamento principal
          </Text>

          <Switch
            value={ativo}
            onValueChange={setAtivo}
            trackColor={{
              false: theme.colors.surfaceSecondary,
              true: theme.colors.primary,
            }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.budgetValueRow}>
          <Text
            style={[
              styles.budgetValue,
              { color: theme.colors.text },
            ]}
          >
            R$ 30,00
          </Text>

          <Text
            style={[
              styles.budgetPeriod,
              { color: theme.colors.textSecondary },
            ]}
          >
            por dia
          </Text>
        </View>

        <Text
          style={[
            styles.availableValue,
            {
              color: ativo
                ? theme.colors.primary
                : theme.colors.textSecondary,
            },
          ]}
        >
          R$ 18,50
          <Text
            style={[
              styles.availableLabel,
              { color: theme.colors.textSecondary },
            ]}
          >
            {" "}disponíveis hoje
          </Text>
        </Text>

        <View style={styles.progressRow}>
          <View
            style={[
              styles.progressTrack,
              {
                backgroundColor:
                  theme.colors.surfaceSecondary,
              },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: ativo
                    ? theme.colors.primary
                    : theme.colors.textSecondary,
                  width: `${Math.min(
                    percentualUtilizado,
                    100
                  )}%`,
                },
              ]}
            />
          </View>

          <Text
            style={[
              styles.progressText,
              { color: theme.colors.textSecondary },
            ]}
          >
            {percentualUtilizado}% utilizado
          </Text>
        </View>

        <View style={styles.resetRow}>
          <MaterialIcons
            name="refresh"
            size={19}
            color={theme.colors.textSecondary}
          />

          <Text
            style={[
              styles.resetText,
              { color: theme.colors.textSecondary },
            ]}
          >
            Próximo reset: amanhã, 15/10
          </Text>
        </View>
      </View>

      <Pressable
        onPress={() => router.push("/novo-orcamento")}
        style={[
          styles.createButton,
          {
            borderColor: theme.colors.primary,
          },
        ]}
      >
        <MaterialIcons
          name="add"
          size={24}
          color={theme.colors.primary}
        />

        <Text
          style={[
            styles.createButtonText,
            { color: theme.colors.primary },
          ]}
        >
          Criar orçamento
        </Text>
      </Pressable>

      <View
        style={[
          styles.projectionCard,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Text
          style={[
            styles.projectionTitle,
            { color: theme.colors.text },
          ]}
        >
          Projeções deste orçamento
        </Text>

        <View style={styles.projectionGrid}>
          <ProjectionItem
            value="R$ 30,00"
            label="por dia"
          />

          <ProjectionItem
            value={`R$ ${projecaoSemanal.toLocaleString(
              "pt-BR",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            )}`}
            label="por semana"
          />

          <ProjectionItem
            value={`R$ ${projecaoMensal.toLocaleString(
              "pt-BR",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            )}`}
            label={`em outubro (${diasNoMes} dias)`}
          />

          <ProjectionItem
            value={`R$ ${projecaoAnual.toLocaleString(
              "pt-BR",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            )}`}
            label={`por ano (${diasNoAno} dias)`}
          />
        </View>

        <View
          style={[
            styles.projectionInfo,
            {
              backgroundColor:
                theme.colors.surfaceSecondary,
            },
          ]}
        >
          <MaterialIcons
            name="info-outline"
            size={20}
            color={theme.colors.textSecondary}
          />

          <Text
            style={[
              styles.projectionInfoText,
              { color: theme.colors.textSecondary },
            ]}
          >
            Estes valores são projeções baseadas no seu
            orçamento diário de R$ 30,00.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

type ProjectionItemProps = {
  value: string;
  label: string;
};

function ProjectionItem({
  value,
  label,
}: ProjectionItemProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.projectionItem,
        {
          backgroundColor:
            theme.colors.surfaceSecondary,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <Text
        style={[
          styles.projectionValue,
          { color: theme.colors.primary },
        ]}
      >
        {value}
      </Text>

      <Text
        style={[
          styles.projectionLabel,
          { color: theme.colors.textSecondary },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    justifyContent: "center",
  },

  budgetCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 20,
  },

  budgetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  budgetTitle: {
    flex: 1,
    fontSize: 19,
    fontWeight: "700",
    marginRight: 12,
  },

  budgetValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
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

  resetRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 15,
  },

  resetText: {
    fontSize: 14,
    fontWeight: "500",
  },

  createButton: {
    height: 58,
    borderRadius: 17,
    borderWidth: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
    marginBottom: 16,
  },

  createButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },

  projectionCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 20,
  },

  projectionTitle: {
    fontSize: 19,
    fontWeight: "700",
    marginBottom: 16,
  },

  projectionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },

  projectionItem: {
    width: "48.5%",
    minHeight: 94,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    justifyContent: "center",
  },

  projectionValue: {
    fontSize: 19,
    fontWeight: "700",
  },

  projectionLabel: {
    fontSize: 13,
    fontWeight: "500",
    marginTop: 5,
    lineHeight: 18,
  },

  projectionInfo: {
    borderRadius: 15,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    marginTop: 16,
  },

  projectionInfoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
});