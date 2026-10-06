import {
  CanISpendResult,
  FutureMoneyItem,
} from "./CanISpend";

export type CanISpendAnalysisTone =
  | "balanced"
  | "attention"
  | "strong_attention";

export type CanISpendAnalysisPoint = {
  key:
    | "budget"
    | "scheduled_outflow"
    | "future_income"
    | "spending_pace"
    | "cycle_time";
  title: string;
  text: string;
};

export type CanISpendAnalysis = {
  headline: string;
  summary: string;
  tone: CanISpendAnalysisTone;
  points: CanISpendAnalysisPoint[];
  consideration: string;
};

function formatCurrency(
  cents: number
) {
  return new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  ).format(cents / 100);
}

function formatDate(
  value: string
) {
  const [
    year,
    month,
    day,
  ] = value
    .split("-")
    .map(Number);

  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      day: "2-digit",
      month: "2-digit",
    }
  ).format(
    new Date(
      year,
      month - 1,
      day
    )
  );
}

function formatDays(
  days: number
) {
  if (days === 1) {
    return "1 dia";
  }

  return `${days} dias`;
}

function getTone(
  result: CanISpendResult
): CanISpendAnalysisTone {
  if (
    !result.fitsCurrentMoney ||
    result.budget.wouldExceedBudget ||
    result
      .moneyAfterSimulationAndScheduledOutflowsCents <
      0
  ) {
    return "strong_attention";
  }

  if (
    result.impact ===
      "attention" ||
    result.impact ===
      "tight"
  ) {
    return "attention";
  }

  return "balanced";
}

function getHeadline(
  result: CanISpendResult
) {
  if (
    !result.fitsCurrentMoney
  ) {
    return "O valor é maior que o seu Dinheiro do mês atual";
  }

  if (
    result.budget
      .wouldExceedBudget
  ) {
    return "O gasto cabe no mês, mas ultrapassaria seu orçamento";
  }

  if (
    result
      .moneyAfterSimulationAndScheduledOutflowsCents <
    0
  ) {
    return "O gasto cabe agora, mas há compromissos pela frente";
  }

  if (
    result.impact === "attention"
  ) {
    return "O gasto cabe, mas reduziria sua margem";
  }

  if (
    result.context.cycleNearEnd
  ) {
    return "O gasto cabe e o ciclo já está perto do fim";
  }

  return "O gasto cabe no seu Dinheiro do mês";
}

function getSummary(
  result: CanISpendResult
) {
  const current =
    formatCurrency(
      result.monthlyMoneyCents
    );

  const after =
    formatCurrency(
      result.monthlyMoneyAfterCents
    );

  if (
    !result.fitsCurrentMoney
  ) {
    const difference =
      Math.abs(
        result.monthlyMoneyAfterCents
      );

    return (
      `Hoje você tem ${current} no Dinheiro do mês. ` +
      `Um gasto de ${formatCurrency(
        result.simulatedAmountCents
      )} deixaria o saldo ${formatCurrency(
        difference
      )} abaixo de zero.`
    );
  }

  return (
    `Hoje você tem ${current} no Dinheiro do mês. ` +
    `Depois deste gasto, restariam ${after}.`
  );
}

function buildBudgetPoint(
  result: CanISpendResult
): CanISpendAnalysisPoint | null {
  const budget =
    result.budget;

  if (
    !budget.hasActiveBudget ||
    !budget.countsTowardBudget
  ) {
    return null;
  }

  const availableAfter =
    budget.availableAfterCents ??
    0;

  if (
    budget.wouldExceedBudget
  ) {
    return {
      key: "budget",
      title: "Orçamento",
      text:
        `Esse gasto ultrapassaria o orçamento ` +
        `"${budget.budgetName ?? "atual"}" em ${formatCurrency(
          Math.abs(
            availableAfter
          )
        )}.`,
    };
  }

  let text =
    `O orçamento "${
      budget.budgetName ??
      "atual"
    }" ficaria com ${formatCurrency(
      availableAfter
    )} disponíveis.`;

  if (
    budget.dailyPaceCents !==
      null &&
    budget.remainingDays !==
      null &&
    budget.remainingDays > 0
  ) {
    text +=
      ` O ritmo atual do orçamento é de até ${formatCurrency(
        budget.dailyPaceCents
      )} por dia.`;
  }

  return {
    key: "budget",
    title: "Orçamento",
    text,
  };
}

function buildScheduledOutflowPoint(
  result: CanISpendResult
): CanISpendAnalysisPoint | null {
  if (
    !result.context
      .hasScheduledOutflows
  ) {
    return null;
  }

  const closest =
    result.scheduledOutflows[0];

  const total =
    result.scheduledOutflowsCents;

  const count =
    result.scheduledOutflows.length;

  const afterCommitments =
    result
      .moneyAfterSimulationAndScheduledOutflowsCents;

  if (count === 1) {
    return {
      key:
        "scheduled_outflow",
      title:
        "Saída agendada",
      text:
        `Há ${formatCurrency(
          closest.amountCents
        )} agendados para sair em ${formatDate(
          closest.date
        )}. Considerando o gasto simulado e essa saída, sua margem ficaria em ${formatCurrency(
          afterCommitments
        )}.`,
    };
  }

  return {
    key:
      "scheduled_outflow",
    title:
      "Saídas agendadas",
    text:
      `Você tem ${formatCurrency(
        total
      )} em ${count} saídas agendadas até o fim do ciclo. ` +
      `Depois do gasto simulado e desses compromissos, sua margem ficaria em ${formatCurrency(
        afterCommitments
      )}.`,
  };
}

function getClosestFutureMoney(
  result: CanISpendResult
) {
  const items = [
    ...result.scheduledInflows,
    ...result.recurringIncomes,
  ];

  if (items.length === 0) {
    return null;
  }

  return items.reduce(
    (
      closest,
      current
    ) =>
      current.daysUntil <
      closest.daysUntil
        ? current
        : closest
  );
}

function describeFutureMoney(
  item: FutureMoneyItem
) {
  const value =
    formatCurrency(
      item.amountCents
    );

  const date =
    formatDate(
      item.date
    );

  if (
    item.proximity === "near"
  ) {
    return (
      `Há ${value} previstos para ${date}, ` +
      `um recebimento próximo. Esse valor ainda não faz parte do seu Dinheiro do mês atual.`
    );
  }

  if (
    item.proximity ===
    "intermediate"
  ) {
    return (
      `Há ${value} previstos para ${date}. ` +
      `Esse recebimento ainda está a alguns dias de distância e não foi considerado como dinheiro disponível agora.`
    );
  }

  return (
    `Há ${value} previstos para ${date}, mas esse recebimento ainda está distante. ` +
    `Por isso, ele aparece como contexto e não como saldo disponível para este gasto.`
  );
}

function buildFutureIncomePoint(
  result: CanISpendResult
): CanISpendAnalysisPoint | null {
  const closest =
    getClosestFutureMoney(
      result
    );

  if (!closest) {
    return null;
  }

  return {
    key: "future_income",
    title:
      "Próximo recebimento",
    text:
      describeFutureMoney(
        closest
      ),
  };
}

function buildSpendingPacePoint(
  result: CanISpendResult
): CanISpendAnalysisPoint | null {
  if (
    !result.spendingPaceAvailable ||
    result.averageDailySpendingCents ===
      null
  ) {
    return null;
  }

  const remainingDays =
    result.daysRemainingInCycle;

  if (
    remainingDays <= 0
  ) {
    return null;
  }

  const after =
    Math.max(
      0,
      result.monthlyMoneyAfterCents
    );

  const dailyMarginAfter =
    Math.floor(
      after /
        remainingDays
    );

  const currentPace =
    result
      .averageDailySpendingCents;

  if (
    !result.fitsCurrentMoney
  ) {
    return {
      key:
        "spending_pace",
      title:
        "Ritmo do ciclo",
      text:
        `Nos dias completos já observados, seus gastos tiveram um ritmo médio de ${formatCurrency(
          currentPace
        )} por dia. Como o gasto simulado ultrapassaria o saldo atual, não haveria margem para manter esse ritmo.`,
    };
  }

  if (
    currentPace >
    dailyMarginAfter
  ) {
    return {
      key:
        "spending_pace",
      title:
        "Ritmo do ciclo",
      text:
        `Nos dias completos já observados, você gastou em média ${formatCurrency(
          currentPace
        )} por dia. Depois da simulação, sua margem seria de cerca de ${formatCurrency(
          dailyMarginAfter
        )} por dia pelos ${formatDays(
          remainingDays
        )} restantes.`,
    };
  }

  return {
    key:
      "spending_pace",
    title:
      "Ritmo do ciclo",
    text:
      `Nos dias completos já observados, você gastou em média ${formatCurrency(
        currentPace
      )} por dia. Depois da simulação, ainda haveria cerca de ${formatCurrency(
        dailyMarginAfter
      )} por dia para os ${formatDays(
        remainingDays
      )} restantes.`,
  };
}

function buildCycleTimePoint(
  result: CanISpendResult
): CanISpendAnalysisPoint | null {
  const days =
    result.daysRemainingInCycle;

  if (days <= 0) {
    return null;
  }

  if (
    result.context.cycleEarly
  ) {
    return {
      key:
        "cycle_time",
      title:
        "Tempo de ciclo",
      text:
        `Ainda faltam ${formatDays(
          days
        )} para o fim do ciclo. Como ele está no começo, ainda há bastante tempo para novos gastos e imprevistos aparecerem.`,
    };
  }

  if (
    result.context.cycleNearEnd
  ) {
    return {
      key:
        "cycle_time",
      title:
        "Tempo de ciclo",
      text:
        `Faltam ${formatDays(
          days
        )} para o fim do ciclo. Como o período já está perto de terminar, há menos tempo restante para novos gastos surgirem.`,
    };
  }

  return null;
}

function getPointPriority(
  point: CanISpendAnalysisPoint,
  result: CanISpendResult
) {
  if (
    point.key === "budget" &&
    result.budget
      .wouldExceedBudget
  ) {
    return 100;
  }

  if (
    point.key ===
      "scheduled_outflow" &&
    result
      .moneyAfterSimulationAndScheduledOutflowsCents <
      0
  ) {
    return 95;
  }

  if (
    point.key ===
    "spending_pace"
  ) {
    return 80;
  }

  if (
    point.key ===
    "scheduled_outflow"
  ) {
    return 75;
  }

  if (
    point.key === "budget"
  ) {
    return 70;
  }

  if (
    point.key ===
    "future_income"
  ) {
    const closest =
      getClosestFutureMoney(
        result
      );

    if (
      closest?.proximity ===
      "near"
    ) {
      return 65;
    }

    return 45;
  }

  return 40;
}

function buildPoints(
  result: CanISpendResult
) {
  const candidates = [
    buildBudgetPoint(
      result
    ),
    buildScheduledOutflowPoint(
      result
    ),
    buildFutureIncomePoint(
      result
    ),
    buildSpendingPacePoint(
      result
    ),
    buildCycleTimePoint(
      result
    ),
  ].filter(
    (
      point
    ): point is CanISpendAnalysisPoint =>
      point !== null
  );

  return candidates
    .sort(
      (a, b) =>
        getPointPriority(
          b,
          result
        ) -
        getPointPriority(
          a,
          result
        )
    )
    .slice(0, 3);
}

function buildConsideration(
  result: CanISpendResult
) {
  if (
    !result.fitsCurrentMoney
  ) {
    return (
      "O valor ultrapassa o dinheiro disponível agora. " +
      "Recebimentos futuros podem mudar esse cenário quando realmente entrarem no ciclo."
    );
  }

  if (
    result.budget
      .wouldExceedBudget
  ) {
    return (
      "O gasto é possível com o saldo atual, mas ultrapassaria o limite que você definiu para este orçamento. " +
      "Vale considerar se essa exceção faz sentido para o seu planejamento."
    );
  }

  if (
    result
      .moneyAfterSimulationAndScheduledOutflowsCents <
    0
  ) {
    return (
      "O saldo cobre o gasto isoladamente, mas não cobre também as saídas já agendadas. " +
      "Considerar esses compromissos antes da decisão ajuda a evitar uma margem negativa mais adiante."
    );
  }

  const remainingDays =
    result.daysRemainingInCycle;

  if (
    result.spendingPaceAvailable &&
    result.averageDailySpendingCents !==
      null &&
    remainingDays > 0
  ) {
    const dailyMargin =
      Math.floor(
        Math.max(
          0,
          result.monthlyMoneyAfterCents
        ) /
          remainingDays
      );

    if (
      result
        .averageDailySpendingCents >
      dailyMargin
    ) {
      return (
        "O gasto cabe hoje, mas deixaria uma margem diária menor do que o ritmo observado nos dias completos deste ciclo. " +
        "Reduzir o ritmo depois da compra preservaria mais flexibilidade até o fim do período."
      );
    }
  }

  const closestIncome =
    getClosestFutureMoney(
      result
    );

  if (
    closestIncome?.proximity ===
      "near" &&
    result.impact !==
      "comfortable"
  ) {
    return (
      "Existe um recebimento próximo que pode melhorar sua margem, mas ele ainda não está disponível. " +
      "A análise considera primeiro o dinheiro que já está no ciclo."
    );
  }

  if (
    result.context.cycleEarly
  ) {
    return (
      "O gasto cabe na situação atual. Como ainda há bastante tempo de ciclo pela frente, preservar parte da margem pode dar mais espaço para despesas que ainda não apareceram."
    );
  }

  if (
    result.context.cycleNearEnd
  ) {
    return (
      "O gasto cabe na situação atual e o ciclo está próximo do fim. Ainda assim, vale considerar os compromissos restantes antes de registrar a despesa."
    );
  }

  if (
    !result.spendingPaceAvailable
  ) {
    return (
      "O gasto cabe na situação atual. Ainda não há histórico suficiente neste ciclo para usar seu ritmo de gastos como referência, então a análise considera apenas os dados já conhecidos."
    );
  }

  return (
    "O gasto cabe na situação atual sem criar um sinal relevante de pressão no ciclo. " +
    "A decisão continua dependendo das suas prioridades para o restante do período."
  );
}

export function buildCanISpendAnalysis(
  result: CanISpendResult
): CanISpendAnalysis {
  return {
    headline:
      getHeadline(
        result
      ),
    summary:
      getSummary(
        result
      ),
    tone:
      getTone(
        result
      ),
    points:
      buildPoints(
        result
      ),
    consideration:
      buildConsideration(
        result
      ),
  };
}