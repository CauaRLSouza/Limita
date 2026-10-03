import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useTheme } from "../../theme/ThemeContext";

type VaultCardProps = {
  valueCents: number;
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

export default function VaultCard({
  valueCents,
}: VaultCardProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={() =>
        router.push("/cofre")
      }
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor:
            theme.colors.surface,
          borderColor:
            theme.colors.border,
          opacity: pressed
            ? 0.82
            : 1,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.text}>
          <Text
            style={[
              styles.title,
              {
                color:
                  theme.colors
                    .textSecondary,
              },
            ]}
          >
            Cofre
          </Text>

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
              valueCents
            )}
          </Text>

          <Text
            style={[
              styles.description,
              {
                color:
                  theme.colors
                    .textSecondary,
              },
            ]}
          >
            O que você já conquistou
          </Text>
        </View>

        <MaterialIcons
          name="chevron-right"
          size={28}
          color={
            theme.colors
              .textSecondary
          }
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
    overflow: "hidden",
  },

  content: {
    flexDirection: "row",
    alignItems: "center",
  },

  text: {
    flex: 1,
  },

  title: {
    fontSize: 15,
    fontWeight: "600",
  },

  balance: {
    fontSize: 36,
    fontWeight: "700",
    marginTop: 5,
    letterSpacing: -1,
  },

  description: {
    fontSize: 14,
    marginTop: 7,
  },
});