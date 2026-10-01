import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import TabHeader from "../../components/TabHeader";
import { useTheme } from "../../theme/ThemeContext";

export default function HomeScreen() {
  const { theme } = useTheme();

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

      <View style={styles.greetingContainer}>
        <Text
          style={[
            styles.greeting,
            { color: theme.colors.text },
          ]}
        >
          Olá, Cacá! 👋
        </Text>

        <Text
          style={[
            styles.date,
            { color: theme.colors.textSecondary },
          ]}
        >
          Terça-feira, 14 de outubro de 2026
        </Text>
      </View>

      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Text
          style={[
            styles.cardTitle,
            { color: theme.colors.textSecondary },
          ]}
        >
          Saldo total
        </Text>

        <Text
          style={[
            styles.balance,
            { color: theme.colors.text },
          ]}
        >
          R$ 8.420,00
        </Text>

        <Text
          style={[
            styles.cardDescription,
            { color: theme.colors.textSecondary },
          ]}
        >
          Todo o seu dinheiro disponível
        </Text>
      </View>

      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Text
          style={[
            styles.monthTitle,
            { color: theme.colors.text },
          ]}
        >
          Dinheiro do mês
        </Text>

        <View style={styles.monthValues}>
          <Text
            style={[
              styles.monthBalance,
              { color: theme.colors.text },
            ]}
          >
            R$ 2.847,00
          </Text>

          <Text
            style={[
              styles.monthTotal,
              { color: theme.colors.textSecondary },
            ]}
          >
            de R$ 3.600,00
          </Text>
        </View>

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
                backgroundColor: theme.colors.primary,
                width: "79%",
              },
            ]}
          />
        </View>

        <Text
          style={[
            styles.remaining,
            { color: theme.colors.textSecondary },
          ]}
        >
          79% restante
        </Text>
      </View>

      <Text
        style={[
          styles.sectionTitle,
          { color: theme.colors.text },
        ]}
      >
        Ações rápidas
      </Text>

      <View style={styles.actions}>
        <Pressable
          onPress={() =>
            router.push("/registrar-movimentacao")
          }
          style={[
            styles.actionCard,
            {
              backgroundColor: theme.colors.primarySoft,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.actionIcon,
              {
                backgroundColor: theme.colors.primary,
              },
            ]}
          >
            <MaterialIcons
              name="swap-vert"
              size={27}
              color="#FFFFFF"
            />
          </View>

          <Text
            style={[
              styles.actionText,
              { color: theme.colors.text },
            ]}
          >
            Registrar{"\n"}movimentação
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/extrato")}
          style={[
            styles.actionCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.actionIcon,
              {
                backgroundColor:
                  theme.colors.surfaceSecondary,
              },
            ]}
          >
            <MaterialIcons
              name="receipt-long"
              size={27}
              color={theme.colors.primary}
            />
          </View>

          <Text
            style={[
              styles.actionText,
              { color: theme.colors.text },
            ]}
          >
            Ver{"\n"}extrato
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/orcamentos")}
          style={[
            styles.actionCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.actionIcon,
              {
                backgroundColor:
                  theme.colors.surfaceSecondary,
              },
            ]}
          >
            <MaterialIcons
              name="account-balance-wallet"
              size={27}
              color={theme.colors.primary}
            />
          </View>

          <Text
            style={[
              styles.actionText,
              { color: theme.colors.text },
            ]}
          >
            Orçamentos
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 32,
  },

  greetingContainer: {
    marginBottom: 28,
  },

  greeting: {
    fontSize: 30,
    fontWeight: "700",
    letterSpacing: -0.8,
  },

  date: {
    fontSize: 14,
    marginTop: 5,
  },

  card: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
  },

  balance: {
    fontSize: 36,
    fontWeight: "700",
    marginTop: 5,
    letterSpacing: -1,
  },

  cardDescription: {
    fontSize: 14,
    marginTop: 7,
  },

  monthTitle: {
    fontSize: 18,
    fontWeight: "700",
  },

  monthValues: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 14,
  },

  monthBalance: {
    fontSize: 30,
    fontWeight: "700",
    letterSpacing: -0.8,
  },

  monthTotal: {
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

  remaining: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "right",
    marginTop: 7,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 14,
    marginBottom: 14,
  },

  actions: {
    flexDirection: "row",
    gap: 10,
  },

  actionCard: {
    flex: 1,
    minHeight: 142,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  actionText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 19,
  },
});