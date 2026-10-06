import {
  router,
  useFocusEffect,
} from "expo-router";
import {
  useCallback,
  useState,
} from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  getNewlyUnlockedAchievements,
} from "../../achievements/achievements";
import AchievementUnlock from "../../components/AchievementUnlock";
import TabHeader from "../../components/TabHeader";
import AnnualMilestoneCard from "../../components/home/AnnualMilestoneCard";
import ClosingCard from "../../components/home/ClosingCard";
import MilestoneCard from "../../components/home/MilestoneCard";
import MonthlyMoneyCard from "../../components/home/MonthlyMoneyCard";
import QuickActions from "../../components/home/QuickActions";
import ReadingCard from "../../components/home/ReadingCard";
import VaultCard from "../../components/home/VaultCard";
import {
  ClosingDecision,
  getCompletedCyclesCountThrough,
  getQualifiedCyclesCountThrough,
  prepareCycles,
  resolveCycleClosing,
  revealCycleClosing,
  saveClosingDecision,
  setClosingStage,
  StoredCycle,
} from "../../database/cycles";
import {
  FinancialSummary,
  getFinancialSummary,
} from "../../database/finance";
import {
  getMilestoneStats,
  MilestoneStats,
} from "../../database/milestones";
import {
  getProfile,
} from "../../database/profile";
import {
  dismissFinancialReading,
  FinancialReading,
  getActiveFinancialReadings,
  getUnreadFinancialReadingsCount,
  markFinancialReadingAsRead,
} from "../../database/readings";
import {
  evaluateFinancialReadings,
} from "../../insights/readings";
import { useTheme } from "../../theme/ThemeContext";

type EstadoHome =
  | "fechado"
  | "resultado"
  | "conquista"
  | "marco"
  | "resolvido";

type MarcoDisponivel =
  | 3
  | 6
  | 12;

const resumoInicial: FinancialSummary = {
  monthlyMoneyCents: 0,
  monthlyMoneyAvailableCents: 0,
  vaultCents: 0,
  currentCycleIncomeCents: 0,
  currentCycleExpenseCents: 0,
};

function formatarDataAtual() {
  const texto =
    new Intl.DateTimeFormat(
      "pt-BR",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    ).format(new Date());

  return (
    texto.charAt(0).toUpperCase() +
    texto.slice(1)
  );
}

function estadoDoCiclo(
  ciclo: StoredCycle | null
): EstadoHome {
  if (!ciclo) {
    return "resolvido";
  }

  switch (
    ciclo.closingStage
  ) {
    case "closed":
      return "fechado";

    case "result":
      return "resultado";

    case "achievement":
      return "conquista";

    case "milestone":
      return "marco";

    case "resolved":
    default:
      return "resolvido";
  }
}

function marcoDosCiclos(
  ciclosConcluidos: number
): MarcoDisponivel | null {
  if (
    ciclosConcluidos === 3
  ) {
    return 3;
  }

  if (
    ciclosConcluidos === 6
  ) {
    return 6;
  }

  if (
    ciclosConcluidos === 12
  ) {
    return 12;
  }

  return null;
}

export default function HomeScreen() {
  const {
    theme,
    activeSpecialTheme,
    setAchievementTheme,
  } = useTheme();

  const isPride =
    activeSpecialTheme ===
    "pride";

  const [
    nome,
    setNome,
  ] = useState("");

  const [
    estadoHome,
    setEstadoHome,
  ] =
    useState<EstadoHome>(
      "resolvido"
    );

  const [
    cicloPendente,
    setCicloPendente,
  ] =
    useState<StoredCycle | null>(
      null
    );

  const [
    resumo,
    setResumo,
  ] =
    useState<FinancialSummary>(
      resumoInicial
    );

  const [
    ciclosConcluidosAtePendente,
    setCiclosConcluidosAtePendente,
  ] = useState(0);

  const [
    ciclosQualificadosAtePendente,
    setCiclosQualificadosAtePendente,
  ] = useState(0);

  const [
    estatisticasMarco,
    setEstatisticasMarco,
  ] =
    useState<MilestoneStats | null>(
      null
    );

  const [
    leituras,
    setLeituras,
  ] =
    useState<FinancialReading[]>(
      []
    );

  const [
    leiturasNaoLidas,
    setLeiturasNaoLidas,
  ] = useState(0);

  const carregarLeituras =
    useCallback(async () => {
      const [
        ativas,
        naoLidas,
      ] = await Promise.all([
        getActiveFinancialReadings(),
        getUnreadFinancialReadingsCount(),
      ]);

      setLeituras(
        ativas
      );

      setLeiturasNaoLidas(
        naoLidas
      );
    }, []);

  const carregarHome =
    useCallback(async () => {
      try {
        const ciclo =
          await prepareCycles();

        await evaluateFinancialReadings();

        const [
          resumoFinanceiro,
          perfil,
          leiturasAtivas,
          totalLeiturasNaoLidas,
        ] = await Promise.all([
          getFinancialSummary(),
          getProfile(),
          getActiveFinancialReadings(),
          getUnreadFinancialReadingsCount(),
        ]);

        let totalConcluidosAtePendente =
          0;

        let totalQualificadosAtePendente =
          0;

        let stats:
          | MilestoneStats
          | null = null;

        if (ciclo) {
          [
            totalConcluidosAtePendente,
            totalQualificadosAtePendente,
          ] = await Promise.all([
            getCompletedCyclesCountThrough(
              ciclo
            ),
            getQualifiedCyclesCountThrough(
              ciclo
            ),
          ]);

          const marco =
            marcoDosCiclos(
              totalConcluidosAtePendente
            );

          if (marco) {
            stats =
              await getMilestoneStats(
                marco
              );
          }
        }

        setNome(
          perfil?.name ?? ""
        );

        setCicloPendente(
          ciclo
        );

        setResumo(
          resumoFinanceiro
        );

        setLeituras(
          leiturasAtivas
        );

        setLeiturasNaoLidas(
          totalLeiturasNaoLidas
        );

        setCiclosConcluidosAtePendente(
          totalConcluidosAtePendente
        );

        setCiclosQualificadosAtePendente(
          totalQualificadosAtePendente
        );

        setEstatisticasMarco(
          stats
        );

        setEstadoHome(
          estadoDoCiclo(ciclo)
        );
      } catch (error) {
        console.error(
          "Erro ao carregar Home:",
          error
        );
      }
    }, []);

  useFocusEffect(
    useCallback(() => {
      carregarHome();
    }, [carregarHome])
  );

  const qualificadosAntes =
    Math.max(
      0,
      ciclosQualificadosAtePendente -
        (cicloPendente
          ?.qualifiedAchievement
          ? 1
          : 0)
    );

  const novasConquistas =
    cicloPendente
      ?.qualifiedAchievement
      ? getNewlyUnlockedAchievements(
          qualificadosAntes,
          ciclosQualificadosAtePendente
        )
      : [];

  const conquistaAtual =
    novasConquistas[0] ??
    null;

  const marcoAtual =
    marcoDosCiclos(
      ciclosConcluidosAtePendente
    );

  async function atualizarResumo() {
    const novoResumo =
      await getFinancialSummary();

    setResumo(
      novoResumo
    );
  }

  async function abrirLeitura(
    leitura: FinancialReading
  ) {
    try {
      if (!leitura.readAt) {
        await markFinancialReadingAsRead(
          leitura.id
        );

        await carregarLeituras();
      }

      router.push({
        pathname:
          "/leitura",
        params: {
          id: String(
            leitura.id
          ),
        },
      });
    } catch (error) {
      console.error(
        "Erro ao abrir Leitura:",
        error
      );
    }
  }

  async function descartarLeitura(
    leitura: FinancialReading
  ) {
    try {
      await dismissFinancialReading(
        leitura.id
      );

      await carregarLeituras();
    } catch (error) {
      console.error(
        "Erro ao descartar Leitura:",
        error
      );
    }
  }

  async function revelarFechamento() {
    if (!cicloPendente) {
      return;
    }

    try {
      const ciclo =
        await revealCycleClosing(
          cicloPendente.id
        );

      if (!ciclo) {
        return;
      }

      setCicloPendente(
        ciclo
      );

      setEstadoHome(
        "resultado"
      );
    } catch (error) {
      console.error(
        "Erro ao revelar fechamento:",
        error
      );
    }
  }

  async function resolverFluxo() {
    if (!cicloPendente) {
      return;
    }

    const atualizado =
      await resolveCycleClosing(
        cicloPendente.id
      );

    if (atualizado) {
      setCicloPendente(
        atualizado
      );
    }

    setEstadoHome(
      "resolvido"
    );

    await atualizarResumo();
  }

  async function avancarDepoisDoResultado(
    ciclo: StoredCycle
  ) {
    if (conquistaAtual) {
      const atualizado =
        await setClosingStage(
          ciclo.id,
          "achievement"
        );

      if (atualizado) {
        setCicloPendente(
          atualizado
        );
      }

      setEstadoHome(
        "conquista"
      );

      return;
    }

    if (marcoAtual) {
      const atualizado =
        await setClosingStage(
          ciclo.id,
          "milestone"
        );

      if (atualizado) {
        setCicloPendente(
          atualizado
        );
      }

      setEstadoHome(
        "marco"
      );

      return;
    }

    const atualizado =
      await resolveCycleClosing(
        ciclo.id
      );

    if (atualizado) {
      setCicloPendente(
        atualizado
      );
    }

    setEstadoHome(
      "resolvido"
    );

    await atualizarResumo();
  }

  async function resolverFechamento(
    decision: ClosingDecision
  ) {
    if (!cicloPendente) {
      return;
    }

    try {
      const ciclo =
        await saveClosingDecision(
          cicloPendente.id,
          decision
        );

      if (!ciclo) {
        return;
      }

      setCicloPendente(
        ciclo
      );

      await avancarDepoisDoResultado(
        ciclo
      );
    } catch (error) {
      console.error(
        "Erro ao resolver fechamento:",
        error
      );
    }
  }

  async function continuarFechamentoNeutro() {
    if (
      !cicloPendente ||
      cicloPendente.resultCents !== 0
    ) {
      return;
    }

    try {
      await avancarDepoisDoResultado(
        cicloPendente
      );
    } catch (error) {
      console.error(
        "Erro ao continuar fechamento neutro:",
        error
      );
    }
  }

  async function avancarDepoisDaConquista() {
    if (!cicloPendente) {
      return;
    }

    if (marcoAtual) {
      const atualizado =
        await setClosingStage(
          cicloPendente.id,
          "milestone"
        );

      if (atualizado) {
        setCicloPendente(
          atualizado
        );
      }

      setEstadoHome(
        "marco"
      );

      return;
    }

    await resolverFluxo();
  }

  async function usarTemaConquista() {
    if (!conquistaAtual) {
      await avancarDepoisDaConquista();
      return;
    }

    try {
      await avancarDepoisDaConquista();

      setAchievementTheme(
        conquistaAtual.id
      );
    } catch (error) {
      console.error(
        "Erro ao usar tema da conquista:",
        error
      );
    }
  }

  async function manterTemaAtual() {
    try {
      await avancarDepoisDaConquista();
    } catch (error) {
      console.error(
        "Erro ao continuar conquista:",
        error
      );
    }
  }

  async function concluirMarco() {
    try {
      await resolverFluxo();
    } catch (error) {
      console.error(
        "Erro ao concluir marco:",
        error
      );
    }
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={
        styles.content
      }
      showsVerticalScrollIndicator={
        false
      }
    >
      <TabHeader />

      <View
        style={
          styles.greetingContainer
        }
      >
        <Text
          style={[
            styles.greeting,
            {
              color:
                theme.colors.text,
            },
          ]}
        >
          Olá{nome ? `, ${nome}` : ""}!{" "}
          {isPride
            ? "🏳️‍🌈"
            : "👋"}
        </Text>

        <Text
          style={[
            styles.date,
            {
              color:
                theme.colors
                  .textSecondary,
            },
          ]}
        >
          {formatarDataAtual()}
        </Text>
      </View>

      {estadoHome ===
        "fechado" &&
        cicloPendente && (
          <ClosingCard
            stage="fechado"
            cycle={
              cicloPendente
            }
            onReveal={
              revelarFechamento
            }
            onDecision={
              resolverFechamento
            }
            onNeutralContinue={
              continuarFechamentoNeutro
            }
          />
        )}

      {estadoHome ===
        "resultado" &&
        cicloPendente && (
          <ClosingCard
            stage="resultado"
            cycle={
              cicloPendente
            }
            onReveal={
              revelarFechamento
            }
            onDecision={
              resolverFechamento
            }
            onNeutralContinue={
              continuarFechamentoNeutro
            }
          />
        )}

      {estadoHome ===
        "conquista" &&
        conquistaAtual && (
          <AchievementUnlock
            achievement={
              conquistaAtual
            }
            onUseTheme={
              usarTemaConquista
            }
            onKeepTheme={
              manterTemaAtual
            }
          />
        )}

      {estadoHome ===
        "marco" &&
        marcoAtual === 3 &&
        estatisticasMarco && (
          <MilestoneCard
            milestone={3}
            stats={
              estatisticasMarco
            }
            onContinue={
              concluirMarco
            }
          />
        )}

      {estadoHome ===
        "marco" &&
        marcoAtual === 6 &&
        estatisticasMarco && (
          <MilestoneCard
            milestone={6}
            stats={
              estatisticasMarco
            }
            onContinue={
              concluirMarco
            }
          />
        )}

      {estadoHome ===
        "marco" &&
        marcoAtual === 12 &&
        estatisticasMarco && (
          <AnnualMilestoneCard
            stats={
              estatisticasMarco
            }
            onContinue={
              concluirMarco
            }
          />
        )}

      {estadoHome ===
        "resolvido" && (
          <>
            <VaultCard
              valueCents={
                resumo.vaultCents
              }
            />

            <MonthlyMoneyCard
              monthlyMoneyCents={
                resumo.monthlyMoneyCents
              }
              availableCents={
                resumo.monthlyMoneyAvailableCents
              }
            />

            <ReadingCard
              readings={
                leituras
              }
              unreadCount={
                leiturasNaoLidas
              }
              onOpen={
                abrirLeitura
              }
              onDismiss={
                descartarLeitura
              }
            />
          </>
        )}

      <QuickActions />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor:
      "transparent",
  },

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
});