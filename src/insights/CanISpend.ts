import { database } from "../database/database";
import {
  getBudgetsProgress,
  BudgetProgress,
} from "../database/budgets";
import {
  getFinancialSummary,
} from "../database/finance";

export type ReceiptProximity =
  | "near"
  | "intermediate"
  | "distant";

export type SpendingImpact =
  | "comfortable"
  | "attention"
  | "tight"
  | "insufficient";

export type FutureMoneyItem = {
  id: number;
  amountCents: number;
  date: string;
  daysUntil: number;
  proximity: ReceiptProximity;
  source:
    | "scheduled"
    | "recurring";
};

export type ScheduledOutflow = {
  id: number;
  amountCents: number;
  date: string;
  daysUntil: number;
};

export type CanISpendBudgetContext = {
  hasActiveBudget: boolean;
  countsTowardBudget: boolean;
  budgetId: number | null;
  budgetName: string | null;
  budgetAmountCents: number | null;
  usedCents: number | null;
  availableCents: number | null;
  availableAfterCents: number | null;
  wouldExceedBudget: boolean;
  dailyPaceCents: number | null;
  remainingDays: number | null;
};

export type CanISpendResult = {
  simulatedAmountCents: number;
  impact: SpendingImpact;

  monthlyMoneyCents: number;
  monthlyMoneyAfterCents: number;
  fitsCurrentMoney: boolean;

  daysRemainingInCycle: number;
  daysElapsedInCycle: number;
  completedDaysInCycle: number;
  totalDaysInCycle: number;

  spentSoFarCents: number;
  spendingPaceAvailable: boolean;
  averageDailySpendingCents: number | null;
  projectedSpendingForRemainingDaysCents: number | null;

  scheduledOutflows: ScheduledOutflow[];
  scheduledOutflowsCents: number;

  scheduledInflows: FutureMoneyItem[];
  scheduledInflowsCents: number;

  recurringIncomes: FutureMoneyItem[];
  recurringIncomesCents: number;

  moneyAfterScheduledOutflowsCents: number;
  moneyAfterSimulationAndScheduledOutflowsCents: number;

  budget: CanISpendBudgetContext;

  context: {
    hasScheduledOutflows: boolean;
    hasScheduledInflows: boolean;
    hasRecurringIncome: boolean;
    spendingAboveCurrentPace: boolean;
    spendingBelowCurrentPace: boolean;
    cycleNearEnd: boolean;
    cycleEarly: boolean;
  };
};

type ScheduledRow = {
  id: number;
  type:
    | "income"
    | "expense"
    | "transfer";
  amount_cents: number;
  date: string;
  bucket:
    | "monthly_money"
    | "vault"
    | null;
  transfer_from:
    | "monthly_money"
    | "vault"
    | null;
  transfer_to:
    | "monthly_money"
    | "vault"
    | null;
};

type RecurringIncomeRow = {
  id: number;
  amount_cents: number;
  receipt_type:
    | "first_day"
    | "first_business_day"
    | "custom";
  custom_day: number | null;
};

type SpendingPaceRow = {
  total_cents: number | null;
};

const MINIMUM_COMPLETED_DAYS_FOR_PACE =
  3;

function normalizeDate(
  date: Date
) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
}

function formatDateForDatabase(
  date: Date
) {
  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDatabaseDate(
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
    (endUtc - startUtc) /
      86400000
  );
}

function getReceiptProximity(
  daysUntil: number
): ReceiptProximity {
  if (daysUntil <= 3) {
    return "near";
  }

  if (daysUntil <= 10) {
    return "intermediate";
  }

  return "distant";
}

function getFirstBusinessDay(
  year: number,
  month: number
) {
  const date =
    new Date(
      year,
      month - 1,
      1
    );

  while (
    date.getDay() === 0 ||
    date.getDay() === 6
  ) {
    date.setDate(
      date.getDate() + 1
    );
  }

  return date;
}

function getRecurringReceiptDate(
  income: RecurringIncomeRow,
  year: number,
  month: number
) {
  if (
    income.receipt_type ===
    "first_day"
  ) {
    return new Date(
      year,
      month - 1,
      1
    );
  }

  if (
    income.receipt_type ===
    "first_business_day"
  ) {
    return getFirstBusinessDay(
      year,
      month
    );
  }

  const lastDay =
    new Date(
      year,
      month,
      0
    ).getDate();

  const configuredDay =
    income.custom_day ?? 1;

  return new Date(
    year,
    month - 1,
    Math.min(
      configuredDay,
      lastDay
    )
  );
}

function getCycleDates(
  referenceDate: Date
) {
  const today =
    normalizeDate(
      referenceDate
    );

  const year =
    today.getFullYear();

  const month =
    today.getMonth();

  const start =
    new Date(
      year,
      month,
      1
    );

  const end =
    new Date(
      year,
      month + 1,
      1
    );

  const totalDays =
    differenceInCalendarDays(
      start,
      end
    );

  const completedDays =
    differenceInCalendarDays(
      start,
      today
    );

  const daysElapsed =
    completedDays + 1;

  const daysRemaining =
    differenceInCalendarDays(
      today,
      end
    );

  return {
    today,
    start,
    end,
    totalDays,
    completedDays,
    daysElapsed,
    daysRemaining,
  };
}

async function getSpendingPaceContext(
  cycleStart: Date,
  today: Date,
  completedDays: number
) {
  if (
    completedDays <
    MINIMUM_COMPLETED_DAYS_FOR_PACE
  ) {
    return {
      available: false,
      spentCents: 0,
      averageDailyCents: null,
    };
  }

  const row =
    await database.getFirstAsync<SpendingPaceRow>(
      `
        SELECT
          COALESCE(
            SUM(amount_cents),
            0
          ) AS total_cents
        FROM transactions
        WHERE status = 'posted'
          AND type = 'expense'
          AND bucket = 'monthly_money'
          AND date >= ?
          AND date < ?;
      `,
      formatDateForDatabase(
        cycleStart
      ),
      formatDateForDatabase(
        today
      )
    );

  const spentCents =
    row?.total_cents ?? 0;

  if (spentCents <= 0) {
    return {
      available: false,
      spentCents,
      averageDailyCents: null,
    };
  }

  return {
    available: true,
    spentCents,
    averageDailyCents:
      Math.round(
        spentCents /
          completedDays
      ),
  };
}

async function getScheduledContext(
  today: Date,
  cycleEnd: Date
) {
  const rows =
    await database.getAllAsync<ScheduledRow>(
      `
        SELECT
          id,
          type,
          amount_cents,
          date,
          bucket,
          transfer_from,
          transfer_to
        FROM transactions
        WHERE status = 'scheduled'
          AND date > ?
          AND date < ?
        ORDER BY
          date ASC,
          id ASC;
      `,
      formatDateForDatabase(
        today
      ),
      formatDateForDatabase(
        cycleEnd
      )
    );

  const scheduledOutflows:
    ScheduledOutflow[] = [];

  const scheduledInflows:
    FutureMoneyItem[] = [];

  for (const row of rows) {
    const date =
      parseDatabaseDate(
        row.date
      );

    const daysUntil =
      differenceInCalendarDays(
        today,
        date
      );

    if (
      row.type === "expense" &&
      row.bucket ===
        "monthly_money"
    ) {
      scheduledOutflows.push({
        id: row.id,
        amountCents:
          row.amount_cents,
        date: row.date,
        daysUntil,
      });
    }

    if (
      row.type === "income" &&
      row.bucket ===
        "monthly_money"
    ) {
      scheduledInflows.push({
        id: row.id,
        amountCents:
          row.amount_cents,
        date: row.date,
        daysUntil,
        proximity:
          getReceiptProximity(
            daysUntil
          ),
        source:
          "scheduled",
      });
    }
  }

  return {
    scheduledOutflows,
    scheduledInflows,
  };
}

async function getRecurringIncomeContext(
  today: Date,
  cycleEnd: Date
) {
  const rows =
    await database.getAllAsync<RecurringIncomeRow>(
      `
        SELECT
          id,
          amount_cents,
          receipt_type,
          custom_day
        FROM recurring_incomes
        ORDER BY id ASC;
      `
    );

  const recurringIncomes:
    FutureMoneyItem[] = [];

  const year =
    today.getFullYear();

  const month =
    today.getMonth() + 1;

  for (const row of rows) {
    const receiptDate =
      getRecurringReceiptDate(
        row,
        year,
        month
      );

    if (
      receiptDate <= today ||
      receiptDate >= cycleEnd
    ) {
      continue;
    }

    const daysUntil =
      differenceInCalendarDays(
        today,
        receiptDate
      );

    recurringIncomes.push({
      id: row.id,
      amountCents:
        row.amount_cents,
      date:
        formatDateForDatabase(
          receiptDate
        ),
      daysUntil,
      proximity:
        getReceiptProximity(
          daysUntil
        ),
      source:
        "recurring",
    });
  }

  return recurringIncomes;
}

function getActiveBudget(
  progress:
    BudgetProgress[]
) {
  return (
    progress.find(
      (item) => item.active
    ) ?? null
  );
}

function buildBudgetContext(
  activeBudget:
    BudgetProgress | null,
  amountCents: number,
  countsTowardBudget: boolean
): CanISpendBudgetContext {
  if (!activeBudget) {
    return {
      hasActiveBudget: false,
      countsTowardBudget: false,
      budgetId: null,
      budgetName: null,
      budgetAmountCents: null,
      usedCents: null,
      availableCents: null,
      availableAfterCents: null,
      wouldExceedBudget: false,
      dailyPaceCents: null,
      remainingDays: null,
    };
  }

  const availableAfterCents =
    countsTowardBudget
      ? activeBudget.availableCents -
        amountCents
      : activeBudget.availableCents;

  return {
    hasActiveBudget: true,
    countsTowardBudget,
    budgetId:
      activeBudget.budget.id,
    budgetName:
      activeBudget.budget.name,
    budgetAmountCents:
      activeBudget.budget
        .amountCents,
    usedCents:
      activeBudget.usedCents,
    availableCents:
      activeBudget.availableCents,
    availableAfterCents,
    wouldExceedBudget:
      countsTowardBudget &&
      availableAfterCents < 0,
    dailyPaceCents:
      activeBudget.dailyPaceCents,
    remainingDays:
      activeBudget.remainingDays,
  };
}

function determineImpact(
  monthlyMoneyCents: number,
  monthlyMoneyAfterCents: number,
  moneyAfterSimulationAndScheduledOutflowsCents:
    number,
  amountCents: number,
  averageDailySpendingCents:
    number | null,
  daysRemaining: number,
  budget:
    CanISpendBudgetContext
): SpendingImpact {
  if (
    amountCents >
      monthlyMoneyCents ||
    monthlyMoneyAfterCents < 0
  ) {
    return "insufficient";
  }

  if (
    budget.wouldExceedBudget ||
    moneyAfterSimulationAndScheduledOutflowsCents <
      0
  ) {
    return "tight";
  }

  if (
    averageDailySpendingCents !==
    null
  ) {
    const expectedRemainingSpending =
      averageDailySpendingCents *
      daysRemaining;

    if (
      expectedRemainingSpending >
        0 &&
      monthlyMoneyAfterCents <
        expectedRemainingSpending
    ) {
      return "attention";
    }
  }

  return "comfortable";
}

export async function simulateCanISpend(
  amountCents: number,
  countsTowardBudget: boolean,
  referenceDate = new Date()
): Promise<CanISpendResult> {
  if (
    !Number.isInteger(
      amountCents
    ) ||
    amountCents <= 0
  ) {
    throw new Error(
      "Informe um valor maior que zero para a simulação."
    );
  }

  const {
    today,
    start,
    end,
    totalDays,
    completedDays,
    daysElapsed,
    daysRemaining,
  } =
    getCycleDates(
      referenceDate
    );

  const [
    financialSummary,
    budgetsProgress,
    scheduledContext,
    recurringIncomes,
    spendingPace,
  ] =
    await Promise.all([
      getFinancialSummary(),
      getBudgetsProgress(
        referenceDate
      ),
      getScheduledContext(
        today,
        end
      ),
      getRecurringIncomeContext(
        today,
        end
      ),
      getSpendingPaceContext(
        start,
        today,
        completedDays
      ),
    ]);

  const activeBudget =
    getActiveBudget(
      budgetsProgress
    );

  const budget =
    buildBudgetContext(
      activeBudget,
      amountCents,
      countsTowardBudget
    );

  const spentSoFarCents =
    spendingPace.spentCents;

  const averageDailySpendingCents =
    spendingPace.averageDailyCents;

  const projectedSpendingForRemainingDaysCents =
    averageDailySpendingCents !==
    null
      ? averageDailySpendingCents *
        daysRemaining
      : null;

  const scheduledOutflowsCents =
    scheduledContext
      .scheduledOutflows
      .reduce(
        (
          total,
          item
        ) =>
          total +
          item.amountCents,
        0
      );

  const scheduledInflowsCents =
    scheduledContext
      .scheduledInflows
      .reduce(
        (
          total,
          item
        ) =>
          total +
          item.amountCents,
        0
      );

  const recurringIncomesCents =
    recurringIncomes.reduce(
      (
        total,
        item
      ) =>
        total +
        item.amountCents,
      0
    );

  const monthlyMoneyCents =
    financialSummary
      .monthlyMoneyCents;

  const monthlyMoneyAfterCents =
    monthlyMoneyCents -
    amountCents;

  const moneyAfterScheduledOutflowsCents =
    monthlyMoneyCents -
    scheduledOutflowsCents;

  const moneyAfterSimulationAndScheduledOutflowsCents =
    monthlyMoneyAfterCents -
    scheduledOutflowsCents;

  const impact =
    determineImpact(
      monthlyMoneyCents,
      monthlyMoneyAfterCents,
      moneyAfterSimulationAndScheduledOutflowsCents,
      amountCents,
      averageDailySpendingCents,
      daysRemaining,
      budget
    );

  const spendingAboveCurrentPace =
    projectedSpendingForRemainingDaysCents !==
      null &&
    projectedSpendingForRemainingDaysCents >
      monthlyMoneyAfterCents;

  const spendingBelowCurrentPace =
    projectedSpendingForRemainingDaysCents !==
      null &&
    projectedSpendingForRemainingDaysCents <
      monthlyMoneyAfterCents;

  return {
    simulatedAmountCents:
      amountCents,

    impact,

    monthlyMoneyCents,

    monthlyMoneyAfterCents,

    fitsCurrentMoney:
      monthlyMoneyAfterCents >= 0,

    daysRemainingInCycle:
      daysRemaining,

    daysElapsedInCycle:
      daysElapsed,

    completedDaysInCycle:
      completedDays,

    totalDaysInCycle:
      totalDays,

    spentSoFarCents,

    spendingPaceAvailable:
      spendingPace.available,

    averageDailySpendingCents,

    projectedSpendingForRemainingDaysCents,

    scheduledOutflows:
      scheduledContext
        .scheduledOutflows,

    scheduledOutflowsCents,

    scheduledInflows:
      scheduledContext
        .scheduledInflows,

    scheduledInflowsCents,

    recurringIncomes,

    recurringIncomesCents,

    moneyAfterScheduledOutflowsCents,

    moneyAfterSimulationAndScheduledOutflowsCents,

    budget,

    context: {
      hasScheduledOutflows:
        scheduledContext
          .scheduledOutflows
          .length > 0,

      hasScheduledInflows:
        scheduledContext
          .scheduledInflows
          .length > 0,

      hasRecurringIncome:
        recurringIncomes.length >
        0,

      spendingAboveCurrentPace,

      spendingBelowCurrentPace,

      cycleNearEnd:
        daysRemaining <= 5,

      cycleEarly:
        daysElapsed <= 7,
    },
  };
}