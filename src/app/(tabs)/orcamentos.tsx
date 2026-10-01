import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import TabHeader from "../../components/TabHeader";
import ThemeAccent from "../../components/ThemeAccent";
import { useTheme } from "../../theme/ThemeContext";

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

const prideProjectionColors = [
  {
    background: "#FDE7F1",
    border: "#F9B8D4",
    text: "#EC1F7A",
  },
  {
    background: "#FFF4D8",
    border: "#FAD995",
    text: "#D98B00",
  },
  {
    background: "#E3F7EC",
    border: "#AEE4C4",
    text: "#16965E",
  },
  {
    background: "#F0E8FF",
    border: "#D3BCFF",
    text: "#7C3AED",
  },
];

export default function OrcamentosScreen() {
  const {
    theme,
    activeSpecialTheme,
  } = useTheme();

  const [ativo, setAtivo] = useState(true);

  const isMeanGirls =
    activeSpecialTheme === "meanGirls";

  const isPride =
    activeSpecialTheme === "pride";

  const valorDiario = 30;
  const disponivelHoje = 18.5;
  const utilizado =
    valorDiario - disponivelHoje;

  const percentualUtilizado = Math.round(
    (utilizado / valorDiario) * 100
  );

  const diasNoMes = 31;
  const diasNoAno = 365;

  const projecaoSemanal =
    valorDiario * 7;

  const projecaoMensal =
    valorDiario * diasNoMes;

  const projecaoAnual =
    valorDiario * diasNoAno;

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
    >
      <TabHeader />

      <View style={styles.header}>
        <Text
          style={[
            styles.title,
            {
              color: theme.colors.text,
            },
          ]}
        >
          Orçamentos
        </Text>

        <Pressable
          onPress={() =>
            router.push("/novo-orcamento")
          }
          style={styles.addButton}
        >
          <MaterialIcons
            name="add"
            size={34}
            color={
              isPride
                ? "#A855F7"
                : theme.colors.primary
            }
          />
        </Pressable>
      </View>

      <View
        style={[
          styles.budgetCard,
          {
            backgroundColor:
              theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <View style={styles.budgetHeader}>
          <Text
            style={[
              styles.budgetTitle,
              {
                color: theme.colors.text,
              },
            ]}
          >
            Orçamento principal
          </Text>

          <PrideSwitch
            value={ativo}
            onValueChange={setAtivo}
          />
        </View>

        <View style={styles.budgetValueRow}>
          <Text
            style={[
              styles.budgetValue,
              {
                color: theme.colors.text,
              },
            ]}
          >
            R$ 30,00
          </Text>

          <Text
            style={[
              styles.budgetPeriod,
              {
                color:
                  theme.colors.textSecondary,
              },
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
                ? isPride
                  ? "#F97316"
                  : theme.colors.primary
                : theme.colors.textSecondary,
            },
          ]}
        >
          R$ 18,50
          <Text
            style={[
              styles.availableLabel,
              {
                color:
                  theme.colors.textSecondary,
              },
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
                  theme.colors
                    .surfaceSecondary,
              },
            ]}
          >
            {isPride && ativo ? (
              <ThemeAccent
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(
                      percentualUtilizado,
                      100
                    )}%`,
                  },
                ]}
              />
            ) : (
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: ativo
                      ? theme.colors.primary
                      : theme.colors
                          .textSecondary,
                    width: `${Math.min(
                      percentualUtilizado,
                      100
                    )}%`,
                  },
                ]}
              />
            )}
          </View>

          <Text
            style={[
              styles.progressText,
              {
                color:
                  theme.colors.textSecondary,
              },
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
              {
                color:
                  theme.colors.textSecondary,
              },
            ]}
          >
            Próximo reset: amanhã, 15/10
          </Text>
        </View>
      </View>

      {isPride ? (
        <Pressable
          onPress={() =>
            router.push("/novo-orcamento")
          }
          style={styles.prideCreateWrapper}
        >
          <LinearGradient
            colors={prideColors}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.prideCreateBorder}
          >
            <View
              style={[
                styles.prideCreateInner,
                {
                  backgroundColor:
                    theme.colors.background,
                },
              ]}
            >
              <MaterialIcons
                name="add"
                size={24}
                color="#EC1F7A"
              />

              <Text
                style={styles.prideCreateText}
              >
                Criar orçamento
              </Text>
            </View>
          </LinearGradient>
        </Pressable>
      ) : (
        <Pressable
          onPress={() =>
            router.push("/novo-orcamento")
          }
          style={[
            styles.createButton,
            {
              borderColor:
                theme.colors.primary,
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
              {
                color:
                  theme.colors.primary,
              },
            ]}
          >
            Criar orçamento
          </Text>
        </Pressable>
      )}

      <View
        style={[
          styles.projectionCard,
          {
            backgroundColor:
              theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Text
          style={[
            styles.projectionTitle,
            {
              color: theme.colors.text,
            },
          ]}
        >
          Projeções deste orçamento
        </Text>

        <View style={styles.projectionGrid}>
          <ProjectionItem
            value="R$ 30,00"
            label="por dia"
            index={0}
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
            index={1}
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
            index={2}
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
            index={3}
          />
        </View>

        <View
          style={[
            styles.projectionInfo,
            {
              backgroundColor:
                theme.colors
                  .surfaceSecondary,
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
              {
                color:
                  theme.colors.textSecondary,
              },
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

type PrideSwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
};

function PrideSwitch({
  value,
  onValueChange,
}: PrideSwitchProps) {
  const {
    theme,
    activeSpecialTheme,
  } = useTheme();

  const isPride =
    activeSpecialTheme === "pride";

  if (!isPride) {
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

  return (
    <Pressable
      onPress={() =>
        onValueChange(!value)
      }
      style={styles.customSwitch}
    >
      {value ? (
        <LinearGradient
          colors={prideColors}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.switchGradient}
        >
          <View
            style={[
              styles.switchThumb,
              styles.switchThumbOn,
            ]}
          />
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.switchGradient,
            {
              backgroundColor:
                theme.colors
                  .surfaceSecondary,
            },
          ]}
        >
          <View
            style={[
              styles.switchThumb,
              styles.switchThumbOff,
            ]}
          />
        </View>
      )}
    </Pressable>
  );
}

type ProjectionItemProps = {
  value: string;
  label: string;
  index: number;
};

function ProjectionItem({
  value,
  label,
  index,
}: ProjectionItemProps) {
  const {
    theme,
    activeSpecialTheme,
  } = useTheme();

  const isPride =
    activeSpecialTheme === "pride";

  const prideStyle =
    prideProjectionColors[
      index %
        prideProjectionColors.length
    ];

  return (
    <View
      style={[
        styles.projectionItem,
        {
          backgroundColor: isPride
            ? prideStyle.background
            : theme.colors
                .surfaceSecondary,
          borderColor: isPride
            ? prideStyle.border
            : theme.colors.border,
        },
      ]}
    >
      <Text
        style={[
          styles.projectionValue,
          {
            color: isPride
              ? prideStyle.text
              : theme.colors.primary,
          },
        ]}
      >
        {value}
      </Text>

      <Text
        style={[
          styles.projectionLabel,
          {
            color: isPride
              ? prideStyle.text
              : theme.colors
                  .textSecondary,
          },
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

  customSwitch: {
    width: 52,
    height: 30,
    borderRadius: 15,
    overflow: "hidden",
  },

  switchGradient: {
    flex: 1,
    borderRadius: 15,
    justifyContent: "center",
  },

  switchThumb: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    top: 3,
  },

  switchThumbOn: {
    right: 3,
  },

  switchThumbOff: {
    left: 3,
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

  prideCreateWrapper: {
    height: 58,
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 17,
    overflow: "hidden",
  },

  prideCreateBorder: {
    flex: 1,
    padding: 2,
    borderRadius: 17,
  },

  prideCreateInner: {
    flex: 1,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  prideCreateText: {
    color: "#EC1F7A",
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