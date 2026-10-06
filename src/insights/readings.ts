import {
  Budget,
  BudgetProgress,
  getBudgets,
  getBudgetProgress,
  getLastFinishedBudgetPeriod,
} from "../database/budgets";
import {
  getCurrentCycle,
  getCycle,
  StoredCycle,
} from "../database/cycles";
import { database } from "../database/database";
import {
  getFinancialSummary,
} from "../database/finance";
import {
  createFinancialReading,
} from "../database/readings";

type CountRow = {
  total: number;
};

type ExpenseTotalRow = {
  total: number | null;
};

type CategoryComparisonRow = {
  category: string | null;
  amount_cents: number | null;
};

const NORMAL_BUDGET_GAP_POINTS =
  20;

const CATEGORY_CHANGE_POINTS =
  15;

const MARGIN_CHANGE_POINTS =
  15;

const MIN_CATEGORY_SHARE =
  10;

const MIN_ELAPSED_RATIO =
  0.4;

function normalizeDate(
  date: Date
) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
}

function parseDate(
  value: string
) {
  const [
    year,
    month,
    day,
  ] = value
    .split("-")
    .map(Number);

  return new Date(
    year,
    month - 1,
    day
  );
}

function formatDate(
  date: Date
) {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;
}

function addDays(
  date: Date,
  days: number
) {
  const result =
    new Date(date);

  result.setDate(
    result.getDate() +
      days
  );

  return normalizeDate(
    result
  );
}

function differenceInCalendarDays(
  start: Date,
  end: Date
) {
  const startUtc =
    Date.UTC(
      start.getFullYear(),
      start.getMonth(),
      start.getDate()
    );

  const endUtc =
    Date.UTC(
      end.getFullYear(),
      end.getMonth(),
      end.getDate()
    );

  return Math.round(
    (
      endUtc -
      startUtc
    ) /
      86400000
  );
}

function formatMoney(
  cents: number
) {
  return new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  ).format(
    cents / 100
  );
}

function percentage(
  value: number
) {
  return Math.round(
    value
  );
}

function getBudgetReadingLimit(
  budget: Budget
) {
  if (
    budget.period ===
    "weekly"
  ) {
    return 5;
  }

  if (
    budget.period ===
    "monthly"
  ) {
    return 2;
  }

  return 0;
}

function getBudgetPeriodDays(
  progress: BudgetProgress
) {
  return differenceInCalendarDays(
    parseDate(
      progress.periodStart
    ),
    parseDate(
      progress.periodEnd
    )
  );
}

function getCompletedBudgetDays(
  progress: BudgetProgress,
  referenceDate: Date
) {
  const start =
    parseDate(
      progress.periodStart
    );

  const today =
    normalizeDate(
      referenceDate
    );

  return Math.max(
    0,
    differenceInCalendarDays(
      start,
      today
    )
  );
}

async function countReadingsByPrefix(
  rulePrefix: string,
  contextPrefix: string
) {
  const row =
    await database.getFirstAsync<CountRow>(
      `
        SELECT
          COUNT(*) AS total
        FROM financial_readings
        WHERE rule_key LIKE ?
          AND context_key LIKE ?;
      `,
      `${rulePrefix}%`,
      `${contextPrefix}%`
    );

  return row?.total ?? 0;
}

async function evaluateBudgetOverrun(
  budget: Budget,
  progress: BudgetProgress,
  referenceDate: Date
) {
  if (
    !progress.active ||
    progress.usedCents <=
      budget.amountCents
  ) {
    return;
  }

  const exceededCents =
    progress.usedCents -
    budget.amountCents;

  const contextBase =
    `budget:${budget.id}:${progress.periodStart}`;

  if (
    budget.period ===
    "daily"
  ) {
    await createFinancialReading({
      ruleKey:
        "budget_daily_overrun",
      contextKey:
        `${contextBase}:overrun`,
      kind:
        "attention",
      title:
        "Seu orçamento diário passou do limite",
      summary:
        `Hoje você ultrapassou seu orçamento em ${formatMoney(
          exceededCents
        )}.`,
      detail:
        `Este gasto ficou acima do limite que você definiu para o período. Vale verificar se foi uma exceção ou se esse orçamento precisa ser ajustado à sua rotina.`,
      priority: 100,
      actionType:
        "budget",
      actionLabel:
        "Ver orçamento",
    });

    return;
  }

  const totalDays =
    getBudgetPeriodDays(
      progress
    );

  const completedDays =
    getCompletedBudgetDays(
      progress,
      referenceDate
    );

  const minimumDays =
    Math.ceil(
      totalDays *
        MIN_ELAPSED_RATIO
    );

  if (
    budget.period ===
      "weekly" &&
    completedDays >=
      minimumDays &&
    completedDays > 0
  ) {
    const averageDailyCents =
      Math.round(
        progress.usedCents /
          completedDays
      );

    const projectedCents =
      averageDailyCents *
      totalDays;

    const projectedOverrunCents =
      Math.max(
        0,
        projectedCents -
          budget.amountCents
      );

    await createFinancialReading({
      ruleKey:
        "budget_weekly_overrun_projection",
      contextKey:
        `${contextBase}:overrun`,
      kind:
        "attention",
      title:
        "Seu orçamento semanal passou do limite",
      summary:
        `Você ultrapassou o orçamento em ${formatMoney(
          exceededCents
        )}.`,
      detail:
        `Até agora, sua média foi de ${formatMoney(
          averageDailyCents
        )} por dia. Mantido esse ritmo, seus gastos chegariam a aproximadamente ${formatMoney(
          projectedCents
        )} até o fim deste período${
          projectedOverrunCents >
          0
            ? `, cerca de ${formatMoney(
                projectedOverrunCents
              )} acima do orçamento`
            : ""
        }. Essa projeção não é uma previsão: ela mostra o que aconteceria se o ritmo atual continuasse. Reduzir os gastos nos próximos dias pode diminuir essa diferença.`,
      priority: 100,
      actionType:
        "budget",
      actionLabel:
        "Ver orçamento",
    });

    return;
  }

  await createFinancialReading({
    ruleKey:
      "budget_overrun",
    contextKey:
      `${contextBase}:overrun`,
    kind:
      "attention",
    title:
      "Seu orçamento passou do limite",
    summary:
      `Você ultrapassou o orçamento em ${formatMoney(
        exceededCents
      )}.`,
    detail:
      `O limite definido para este período já foi ultrapassado. Vale verificar se isso veio de uma exceção ou se o valor do orçamento precisa acompanhar melhor sua rotina.`,
    priority: 100,
    actionType:
      "budget",
    actionLabel:
      "Ver orçamento",
  });
}

async function evaluateBudgetPace(
  budget: Budget,
  progress: BudgetProgress,
  referenceDate: Date
) {
  if (
    !progress.active ||
    budget.period ===
      "daily" ||
    progress.usedCents >
      budget.amountCents
  ) {
    return;
  }

  const totalDays =
    getBudgetPeriodDays(
      progress
    );

  const completedDays =
    getCompletedBudgetDays(
      progress,
      referenceDate
    );

  const minimumDays =
    Math.ceil(
      totalDays *
        MIN_ELAPSED_RATIO
    );

  if (
    completedDays <
      minimumDays ||
    totalDays <= 0
  ) {
    return;
  }

  const limit =
    getBudgetReadingLimit(
      budget
    );

  const contextBase =
    `budget:${budget.id}:${progress.periodStart}`;

  const normalCount =
    await countReadingsByPrefix(
      "budget_pace_",
      contextBase
    );

  if (
    normalCount >= limit
  ) {
    return;
  }

  const elapsedPercentage =
    (
      completedDays /
      totalDays
    ) *
    100;

  const usedPercentage =
    (
      progress.usedCents /
      budget.amountCents
    ) *
    100;

  const gap =
    usedPercentage -
    elapsedPercentage;

  const slot =
    normalCount + 1;

  if (
    gap >=
    NORMAL_BUDGET_GAP_POINTS
  ) {
    await createFinancialReading({
      ruleKey:
        `budget_pace_ahead_${slot}`,
      contextKey:
        `${contextBase}:pace:${slot}`,
      kind:
        "attention",
      title:
        "Seu orçamento está avançando mais rápido que o período",
      summary:
        `${percentage(
          elapsedPercentage
        )}% do período passou e você já utilizou ${percentage(
          usedPercentage
        )}% do orçamento.`,
      detail:
        `Seu gasto está avançando mais rápido que o tempo deste orçamento. O ritmo diário exibido pelo Límita mostra quanto ainda pode ser gasto por dia para permanecer dentro do limite. Isso não significa que um gasto específico esteja errado; serve para tornar a consequência do ritmo atual mais visível enquanto ainda há tempo para ajustar.`,
      priority: 70,
      actionType:
        "budget",
      actionLabel:
        "Ver ritmo",
    });

    return;
  }

  if (
    gap <=
    -NORMAL_BUDGET_GAP_POINTS
  ) {
    await createFinancialReading({
      ruleKey:
        `budget_pace_controlled_${slot}`,
      contextKey:
        `${contextBase}:pace:${slot}`,
      kind:
        "positive",
      title:
        "Seu orçamento está com margem",
      summary:
        `${percentage(
          elapsedPercentage
        )}% do período passou e você utilizou ${percentage(
          usedPercentage
        )}% do orçamento.`,
      detail:
        `Até aqui, o orçamento avançou mais devagar que o período. Essa margem pode ajudar a absorver gastos dos próximos dias sem exigir uma mudança brusca de comportamento. Manter atenção ao ritmo ajuda a preservar essa flexibilidade.`,
      priority: 45,
      actionType:
        "budget",
      actionLabel:
        "Ver orçamento",
    });
  }
}

async function evaluateFinishedBudget(
  budget: Budget,
  referenceDate: Date
) {
  if (
    budget.period ===
    "daily"
  ) {
    return;
  }

  const snapshot =
    await getLastFinishedBudgetPeriod(
      budget,
      referenceDate
    );

  if (!snapshot) {
    return;
  }

  if (
    snapshot.usedCents >
      budget.amountCents
  ) {
    return;
  }

  await createFinancialReading({
    ruleKey:
      "budget_period_finished_within_limit",
    contextKey:
      `budget:${budget.id}:${snapshot.periodStart}:finished`,
    kind:
      "positive",
    title:
      "Você terminou o período dentro do orçamento",
    summary:
      `Foram utilizados ${formatMoney(
        snapshot.usedCents
      )} de ${formatMoney(
        budget.amountCents
      )}.`,
    detail:
      `O período terminou sem ultrapassar o limite que você definiu. Esse resultado não exige repetir exatamente os mesmos gastos no próximo período, mas mostra que o limite funcionou como uma referência viável desta vez.`,
    priority: 55,
    actionType:
      "budget",
    actionLabel:
      "Ver orçamento",
  });
}

async function evaluateBudgets(
  referenceDate: Date
) {
  const budgets =
    await getBudgets();

  for (
    const budget of budgets
  ) {
    const progress =
      await getBudgetProgress(
        budget,
        referenceDate
      );

    await evaluateBudgetOverrun(
      budget,
      progress,
      referenceDate
    );

    await evaluateBudgetPace(
      budget,
      progress,
      referenceDate
    );

    await evaluateFinishedBudget(
      budget,
      referenceDate
    );
  }
}

async function evaluateMonthlyMoney(
  referenceDate: Date
) {
  const cycle =
    await getCurrentCycle();

  if (
    cycle.isPartial
  ) {
    return;
  }

  const summary =
    await getFinancialSummary();

  if (
    summary.monthlyMoneyAvailableCents <=
      0 ||
    summary.currentCycleExpenseCents <=
      0
  ) {
    return;
  }

  const totalDays =
    new Date(
      cycle.year,
      cycle.month,
      0
    ).getDate();

  const completedDays =
    Math.max(
      0,
      referenceDate.getDate() -
        1
    );

  const minimumDays =
    Math.ceil(
      totalDays *
        MIN_ELAPSED_RATIO
    );

  if (
    completedDays <
      minimumDays
  ) {
    return;
  }

  const contextBase =
    `cycle:${cycle.id}:monthly_money`;

  const count =
    await countReadingsByPrefix(
      "monthly_money_pace_",
      contextBase
    );

  if (count >= 2) {
    return;
  }

  const elapsedPercentage =
    (
      completedDays /
      totalDays
    ) *
    100;

  const consumedCents =
    summary.monthlyMoneyAvailableCents -
    summary.monthlyMoneyCents;

  const consumedPercentage =
    Math.max(
      0,
      (
        consumedCents /
        summary.monthlyMoneyAvailableCents
      ) *
        100
    );

  const gap =
    consumedPercentage -
    elapsedPercentage;

  const slot =
    count + 1;

  if (
    gap >=
    NORMAL_BUDGET_GAP_POINTS
  ) {
    await createFinancialReading({
      ruleKey:
        `monthly_money_pace_ahead_${slot}`,
      contextKey:
        `${contextBase}:${slot}`,
      kind:
        "attention",
      title:
        "Seu Dinheiro do mês está sendo usado mais rápido que o ciclo",
      summary:
        `${percentage(
          elapsedPercentage
        )}% do ciclo passou e cerca de ${percentage(
          consumedPercentage
        )}% do valor disponível já foi utilizado.`,
      detail:
        `O ritmo de saída está à frente do tempo do ciclo. Isso não significa que os gastos tenham sido errados: despesas podem se concentrar em determinados momentos do mês. A leitura serve para mostrar essa diferença enquanto ainda existe tempo para decidir se o ritmo faz sentido para o restante do ciclo.`,
      priority: 75,
      actionType:
        "statement",
      actionLabel:
        "Ver resumo do mês",
    });

    return;
  }

  if (
    gap <=
    -NORMAL_BUDGET_GAP_POINTS
  ) {
    await createFinancialReading({
      ruleKey:
        `monthly_money_pace_controlled_${slot}`,
      contextKey:
        `${contextBase}:${slot}`,
      kind:
        "positive",
      title:
        "Seu Dinheiro do mês mantém uma margem",
      summary:
        `${percentage(
          elapsedPercentage
        )}% do ciclo passou e cerca de ${percentage(
          consumedPercentage
        )}% do valor disponível foi utilizado.`,
      detail:
        `Até aqui, o dinheiro disponível está sendo consumido mais devagar que o avanço do ciclo. Essa margem aumenta sua flexibilidade para lidar com gastos que ainda podem aparecer. O objetivo não é gastar menos a qualquer custo, mas preservar espaço para decisões futuras.`,
      priority: 50,
      actionType:
        "statement",
      actionLabel:
        "Ver resumo do mês",
    });
  }
}

async function getExpenseTotalUntil(
  cycleId: number,
  endDateExclusive: string
) {
  const row =
    await database.getFirstAsync<ExpenseTotalRow>(
      `
        SELECT
          COALESCE(
            SUM(amount_cents),
            0
          ) AS total
        FROM transactions
        WHERE cycle_id = ?
          AND type = 'expense'
          AND status = 'posted'
          AND date < ?;
      `,
      cycleId,
      endDateExclusive
    );

  return row?.total ?? 0;
}

async function getCategoriesUntil(
  cycleId: number,
  endDateExclusive: string
) {
  return database.getAllAsync<CategoryComparisonRow>(
    `
      SELECT
        category,
        COALESCE(
          SUM(amount_cents),
          0
        ) AS amount_cents
      FROM transactions
      WHERE cycle_id = ?
        AND type = 'expense'
        AND status = 'posted'
        AND date < ?
      GROUP BY category;
    `,
    cycleId,
    endDateExclusive
  );
}

function categoryMap(
  rows: CategoryComparisonRow[]
) {
  const map =
    new Map<
      string,
      number
    >();

  for (
    const row of rows
  ) {
    map.set(
      row.category ??
        "Outros",
      row.amount_cents ??
        0
    );
  }

  return map;
}

async function evaluateCategoryComparison(
  referenceDate: Date
) {
  const current =
    await getCurrentCycle();

  if (
    current.isPartial
  ) {
    return;
  }

  const previousDate =
    new Date(
      current.year,
      current.month - 2,
      1
    );

  const previous =
    await getCycle(
      previousDate.getFullYear(),
      previousDate.getMonth() +
        1
    );

  if (
    !previous ||
    previous.isPartial
  ) {
    return;
  }

  const day =
    referenceDate.getDate();

  const currentEnd =
    addDays(
      new Date(
        current.year,
        current.month - 1,
        1
      ),
      day
    );

  const previousMonthDays =
    new Date(
      previous.year,
      previous.month,
      0
    ).getDate();

  const comparableDay =
    Math.min(
      day,
      previousMonthDays
    );

  const previousEnd =
    addDays(
      new Date(
        previous.year,
        previous.month - 1,
        1
      ),
      comparableDay
    );

  const [
    currentTotal,
    previousTotal,
    currentRows,
    previousRows,
  ] = await Promise.all([
    getExpenseTotalUntil(
      current.id,
      formatDate(
        currentEnd
      )
    ),
    getExpenseTotalUntil(
      previous.id,
      formatDate(
        previousEnd
      )
    ),
    getCategoriesUntil(
      current.id,
      formatDate(
        currentEnd
      )
    ),
    getCategoriesUntil(
      previous.id,
      formatDate(
        previousEnd
      )
    ),
  ]);

  if (
    currentTotal <= 0 ||
    previousTotal <= 0
  ) {
    return;
  }

  const currentCategories =
    categoryMap(
      currentRows
    );

  const previousCategories =
    categoryMap(
      previousRows
    );

  const names =
    new Set([
      ...currentCategories.keys(),
      ...previousCategories.keys(),
    ]);

  for (
    const name of names
  ) {
    const currentAmount =
      currentCategories.get(
        name
      ) ?? 0;

    const previousAmount =
      previousCategories.get(
        name
      ) ?? 0;

    const currentShare =
      (
        currentAmount /
        currentTotal
      ) *
      100;

    const previousShare =
      (
        previousAmount /
        previousTotal
      ) *
      100;

    const change =
      currentShare -
      previousShare;

    if (
      Math.max(
        currentShare,
        previousShare
      ) <
      MIN_CATEGORY_SHARE
    ) {
      continue;
    }

    if (
      Math.abs(change) <
      CATEGORY_CHANGE_POINTS
    ) {
      continue;
    }

    const direction =
      change > 0
        ? "increase"
        : "decrease";

    const contextKey =
      `cycle:${current.id}:category:${name}:${direction}`;

    if (change > 0) {
      await createFinancialReading({
        ruleKey:
          "category_share_increase",
        contextKey,
        kind:
          "informative",
        title:
          `${name} ganhou mais espaço nos seus gastos`,
        summary:
          `No mesmo ponto do ciclo anterior, essa categoria representava cerca de ${percentage(
            previousShare
          )}% dos gastos. Agora representa ${percentage(
            currentShare
          )}%.`,
        detail:
          `A participação de ${name} aumentou em relação ao mesmo momento do ciclo anterior. Isso não significa, por si só, que você esteja gastando demais: uma compra planejada ou uma mudança de rotina pode explicar a diferença. Vale apenas verificar se essa mudança foi intencional.`,
        priority: 60,
        actionType:
          "statement",
        actionLabel:
          "Ver gastos",
      });
    } else {
      await createFinancialReading({
        ruleKey:
          "category_share_decrease",
        contextKey,
        kind:
          "positive",
        title:
          `${name} ocupa menos dos seus gastos neste ciclo`,
        summary:
          `No mesmo ponto do ciclo anterior, essa categoria representava cerca de ${percentage(
            previousShare
          )}% dos gastos. Agora representa ${percentage(
            currentShare
          )}%.`,
        detail:
          `A participação de ${name} diminuiu em relação ao mesmo momento do ciclo anterior. A mudança pode refletir uma escolha consciente, uma necessidade diferente ou apenas uma alteração na composição dos seus gastos. O importante é entender se ela combina com o que você planejou para este ciclo.`,
        priority: 40,
        actionType:
          "statement",
        actionLabel:
          "Ver gastos",
      });
    }
  }
}

function isComparableClosedCycle(
  cycle: StoredCycle | null
): cycle is StoredCycle {
  return Boolean(
    cycle &&
      cycle.status ===
        "closed" &&
      !cycle.isPartial &&
      cycle.externalIncomeCents !==
        null &&
      cycle.externalIncomeCents >
        0 &&
      cycle.expenseCents !==
        null &&
      cycle.expenseCents >
        0 &&
      cycle.preservedRate !==
        null
  );
}

async function evaluateMarginChange() {
  const now =
    new Date();

  const lastMonthDate =
    new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );

  const previousMonthDate =
    new Date(
      now.getFullYear(),
      now.getMonth() - 2,
      1
    );

  const [
    latest,
    previous,
  ] = await Promise.all([
    getCycle(
      lastMonthDate.getFullYear(),
      lastMonthDate.getMonth() +
        1
    ),
    getCycle(
      previousMonthDate.getFullYear(),
      previousMonthDate.getMonth() +
        1
    ),
  ]);

  if (
    !isComparableClosedCycle(
      latest
    ) ||
    !isComparableClosedCycle(
      previous
    )
  ) {
    return;
  }

  const changePoints =
    (
      latest.preservedRate! -
      previous.preservedRate!
    ) *
    100;

  if (
    Math.abs(
      changePoints
    ) <
    MARGIN_CHANGE_POINTS
  ) {
    return;
  }

  if (
    changePoints > 0
  ) {
    await createFinancialReading({
      ruleKey:
        "cycle_margin_improved",
      contextKey:
        `cycle:${latest.id}:margin`,
      kind:
        "positive",
      title:
        "Seu último ciclo terminou com mais margem",
      summary:
        `A parcela da renda preservada aumentou cerca de ${percentage(
          Math.abs(
            changePoints
          )
        )} pontos percentuais em relação ao ciclo anterior.`,
      detail:
        `Essa mudança amplia a margem que ficou disponível depois dos gastos do ciclo. Ela não define sozinha sua saúde financeira, mas pode aumentar sua capacidade de absorver imprevistos e avançar em objetivos sem depender de uma regra fixa de distribuição da renda.`,
      priority: 65,
      actionType:
        "history",
      actionLabel:
        "Ver histórico",
    });

    return;
  }

  await createFinancialReading({
    ruleKey:
      "cycle_margin_decreased",
    contextKey:
      `cycle:${latest.id}:margin`,
    kind:
      "attention",
    title:
      "Seu último ciclo terminou com menos margem",
    summary:
      `A parcela da renda preservada caiu cerca de ${percentage(
        Math.abs(
          changePoints
        )
      )} pontos percentuais em relação ao ciclo anterior.`,
    detail:
      `Uma queda de margem pode acontecer por uma compra planejada, uma despesa excepcional ou uma mudança de rotina. O Límita não trata isso automaticamente como um problema. Vale observar o que mudou e se essa redução combina com as decisões que você tomou no período.`,
    priority: 70,
    actionType:
      "history",
    actionLabel:
      "Ver histórico",
  });
}

export async function evaluateFinancialReadings(
  referenceDate = new Date()
) {
  const today =
    normalizeDate(
      referenceDate
    );

  await evaluateMonthlyMoney(
    today
  );

  await evaluateBudgets(
    today
  );

  await evaluateCategoryComparison(
    today
  );

  await evaluateMarginChange();
}