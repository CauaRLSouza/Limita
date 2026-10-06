import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useTheme } from "../theme/ThemeContext";

export default function SobreScreen() {
  const { theme } = useTheme();

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
              borderColor:
                theme.colors.border,
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
          Sobre o Límita
        </Text>
      </View>

      <View style={styles.hero}>
        <View
          style={[
            styles.logo,
            {
              backgroundColor:
                theme.colors.primary,
            },
          ]}
        >
          <MaterialIcons
            name="account-balance-wallet"
            size={38}
            color="#FFFFFF"
          />
        </View>

        <Text
          style={[
            styles.appName,
            {
              color: theme.colors.text,
            },
          ]}
        >
          Límita
        </Text>

        <Text
          style={[
            styles.version,
            {
              color:
                theme.colors.textSecondary,
            },
          ]}
        >
          Versão 2.0.0
        </Text>
      </View>

      <AboutCard
        icon="lightbulb-outline"
        title="Por que o Límita existe?"
      >
        Organizar a vida financeira não deveria
        significar encarar planilhas complicadas,
        dezenas de números ou uma experiência que
        parece ter sido feita apenas para quem já
        entende de finanças.
        {"\n\n"}
        O Límita nasceu para tornar esse processo
        mais simples, visual e próximo da vida real.
      </AboutCard>

      <AboutCard
        icon="track-changes"
        title="Nosso propósito"
      >
        O objetivo do Límita é ajudar você a
        entender melhor para onde seu dinheiro está
        indo, quanto ainda está disponível e o que
        você está conseguindo construir ao longo do
        tempo.
        {"\n\n"}
        Tudo isso sem transformar organização
        financeira em uma cobrança constante. A
        ideia é oferecer informação clara para que
        você possa tomar suas próprias decisões.
      </AboutCard>

      <AboutCard
        icon="favorite-border"
        title="Uma experiência que dá vontade de usar"
      >
        Finanças não precisam ter cara de planilha.
        Por isso, o Límita também foi pensado para
        ser agradável, fluido e personalizável.
        {"\n\n"}
        Temas, elementos visuais e uma interface
        mais leve fazem parte da proposta de criar
        um aplicativo financeiro que possa fazer
        parte da rotina sem parecer uma obrigação.
      </AboutCard>

      <AboutCard
        icon="forum"
        title="O Límita também é construído com você"
      >
        Nenhum aplicativo nasce perfeito. Sugestões,
        críticas e ideias são sempre bem-vindas.
        {"\n\n"}
        O feedback de quem usa o Límita ajuda a
        descobrir o que pode ser mais simples, mais
        fluido, mais útil e também mais atrativo para
        quem está começando a cuidar melhor da própria
        vida financeira.
      </AboutCard>

      <View
        style={[
          styles.finalCard,
          {
            backgroundColor:
              theme.colors.primarySoft,
          },
        ]}
      >
        <MaterialIcons
          name="auto-awesome"
          size={24}
          color={theme.colors.primary}
        />

        <Text
          style={[
            styles.finalText,
            {
              color: theme.colors.text,
            },
          ]}
        >
          O Límita continuará evoluindo com um
          objetivo simples: tornar uma relação mais
          saudável e consciente com o dinheiro mais
          fácil de construir.
        </Text>
      </View>

      <Text
        style={[
          styles.footer,
          {
            color:
              theme.colors.textSecondary,
          },
        ]}
      >
        Límita · Versão 1.0.0
      </Text>
    </ScrollView>
  );
}

type AboutCardProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  children: React.ReactNode;
};

function AboutCard({
  icon,
  title,
  children,
}: AboutCardProps) {
  const { theme } = useTheme();

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
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.cardIcon,
            {
              backgroundColor:
                theme.colors.primarySoft,
            },
          ]}
        >
          <MaterialIcons
            name={icon}
            size={22}
            color={theme.colors.primary}
          />
        </View>

        <Text
          style={[
            styles.cardTitle,
            {
              color: theme.colors.text,
            },
          ]}
        >
          {title}
        </Text>
      </View>

      <Text
        style={[
          styles.cardText,
          {
            color:
              theme.colors.textSecondary,
          },
        ]}
      >
        {children}
      </Text>
    </View>
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
    marginBottom: 30,
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

  hero: {
    alignItems: "center",
    marginBottom: 28,
  },

  logo: {
    width: 74,
    height: 74,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  appName: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.7,
  },

  version: {
    fontSize: 13,
    marginTop: 4,
  },

  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginBottom: 14,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  cardIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  cardTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    lineHeight: 22,
  },

  cardText: {
    fontSize: 14,
    lineHeight: 21,
  },

  finalCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderRadius: 18,
    padding: 17,
    marginTop: 4,
  },

  finalText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "500",
  },

  footer: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 26,
    opacity: 0.65,
  },
});