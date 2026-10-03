import {
  StyleSheet,
  Text,
  View,
} from "react-native";
import type {
  DimensionValue,
} from "react-native";

import { useTheme } from "../../theme/ThemeContext";
import ThemeAccent from "../ThemeAccent";

type MonthlyMoneyCardProps = {
  monthlyMoneyCents: number;
  incomeCents: number;
  expenseCents: number;
};

function formatMoney(
  valueCents: number
) {
  return new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  ).format(valueCents / 100);
}

export default function MonthlyMoneyCard({
  monthlyMoneyCents,
  incomeCents,
  expenseCents,
}: MonthlyMoneyCardProps) {
  const { theme } = useTheme();

  const availablePercentage =
    incomeCents > 0
      ? Math.max(
          0,
          Math.min(
            100,
            Math.round(
              (
                monthlyMoneyCents /
                incomeCents
              ) * 100
            )
          )
        )
      : 0;

  const progressWidth: DimensionValue =
    `${availablePercentage}%`;

  return (
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
      <Text
        style={[
          styles.title,
          {
            color:
              theme.colors.text,
          },
        ]}
      >
        Dinheiro do mês
      </Text>

      <View style={styles.values}>
        <Text
          style={[
            styles.balance,
            {
              color:
                theme.colors.text,
            },
          ]}
        >
          {formatMoney(
            monthlyMoneyCents
          )}
        </Text>

        <Text
          style={[
            styles.total,
            {
              color:
                theme.colors
                  .textSecondary,
            },
          ]}
        >
          de{" "}
          {formatMoney(
            incomeCents
          )}
        </Text>
      </View>

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
        <ThemeAccent
          style={[
            styles.progressFill,
            {
              width: progressWidth,
            },
          ]}
        />
      </View>

      <View style={styles.summary}>
        <Text
          style={[
            styles.summaryText,
            {
              color:
                theme.colors
                  .textSecondary,
            },
          ]}
        >
          {formatMoney(
            expenseCents
          )}{" "}
          gastos
        </Text>

        <Text
          style={[
            styles.summaryText,
            {
              color:
                theme.colors
                  .textSecondary,
            },
          ]}
        >
          {availablePercentage}%
          disponível
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
  },

  values: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 14,
  },

  balance: {
    fontSize: 30,
    fontWeight: "700",
    letterSpacing: -0.8,
  },

  total: {
    fontSize: 14,
    marginBottom: 4,
  },

  progressTrack: {
    height: 10,
    borderRadius: 5,
    overflow: "hidden",
    marginTop: 18,
  },

  progressFill: {
    height: "100%",
    borderRadius: 5,
  },

  summary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },

  summaryText: {
    fontSize: 13,
    fontWeight: "600",
  },
});