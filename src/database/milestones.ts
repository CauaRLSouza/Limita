import { database } from "./database";

export type MilestoneCycle = {
  id: number;
  year: number;
  month: number;
  resultCents: number;
  expenseCents: number;
};

export type MilestoneStats = {
  cycleCount: number;
  cycles: MilestoneCycle[];
  positiveCycles: number;
  negativeCycles: number;
  accumulatedBalanceCents: number;
  averageResultCents: number;
  bestCycle: MilestoneCycle | null;
  firstThreeAverageExpenseCents: number | null;
  lastThreeAverageExpenseCents: number | null;
  expenseDifferenceCents: number | null;
  expenseComparisonPercentage: number | null;
  topExpenseCategory: string | null;
  topExpenseCategoryCents: number;
  topExpenseCategoryPercentage: number | null;
  firstCycle: MilestoneCycle | null;
  lastCycle: MilestoneCycle | null;
};

type MilestoneCycleRow = {
  id: number;
  year: number;
  month: number;
  result_cents: number;
  expense_cents: number | null;
};

type CategoryRow = {
  category: string;
  total_cents: number;
};

function mapCycle(
  row: MilestoneCycleRow
): MilestoneCycle {
  return {
    id: row.id,
    year: row.year,
    month: row.month,
    resultCents: row.result_cents,
    expenseCents:
      row.expense_cents ?? 0,
  };
}

function calculateAverage(
  values: number[]
) {
  if (values.length === 0) {
    return 0;
  }

  const total = values.reduce(
    (sum, value) =>
      sum + value,
    0
  );

  return Math.round(
    total / values.length
  );
}

async function getCompletedCycles(
  limit: number
) {
  const rows =
    await database.getAllAsync<MilestoneCycleRow>(
      `
        SELECT
          c.id,
          c.year,
          c.month,
          c.result_cents,
          c.expense_cents
        FROM cycles c
        WHERE c.status = 'closed'
          AND c.result_cents IS NOT NULL
          AND EXISTS (
            SELECT 1
            FROM transactions t
            WHERE t.cycle_id = c.id
              AND t.status = 'posted'
          )
        ORDER BY
          c.year ASC,
          c.month ASC
        LIMIT ?;
      `,
      limit
    );

  return rows.map(mapCycle);
}

async function getTopExpenseCategory(
  cycleIds: number[]
) {
  if (cycleIds.length === 0) {
    return null;
  }

  const placeholders =
    cycleIds
      .map(() => "?")
      .join(", ");

  const row =
    await database.getFirstAsync<CategoryRow>(
      `
        SELECT
          COALESCE(
            category,
            'other'
          ) AS category,
          SUM(amount_cents) AS total_cents
        FROM transactions
        WHERE type = 'expense'
          AND status = 'posted'
          AND cycle_id IN (
            ${placeholders}
          )
        GROUP BY
          COALESCE(
            category,
            'other'
          )
        ORDER BY
          total_cents DESC
        LIMIT 1;
      `,
      ...cycleIds
    );

  return row ?? null;
}

export async function getMilestoneStats(
  milestone: 3 | 6 | 12
): Promise<MilestoneStats | null> {
  const cycles =
    await getCompletedCycles(
      milestone
    );

  if (
    cycles.length <
    milestone
  ) {
    return null;
  }

  const positiveCycles =
    cycles.filter(
      (cycle) =>
        cycle.resultCents > 0
    ).length;

  const negativeCycles =
    cycles.filter(
      (cycle) =>
        cycle.resultCents < 0
    ).length;

  const accumulatedBalanceCents =
    cycles.reduce(
      (sum, cycle) =>
        sum +
        cycle.resultCents,
      0
    );

  const averageResultCents =
    calculateAverage(
      cycles.map(
        (cycle) =>
          cycle.resultCents
      )
    );

  const bestCycle =
    cycles.reduce<MilestoneCycle | null>(
      (best, cycle) => {
        if (
          !best ||
          cycle.resultCents >
            best.resultCents
        ) {
          return cycle;
        }

        return best;
      },
      null
    );

  let firstThreeAverageExpenseCents:
    | number
    | null = null;

  let lastThreeAverageExpenseCents:
    | number
    | null = null;

  let expenseDifferenceCents:
    | number
    | null = null;

  let expenseComparisonPercentage:
    | number
    | null = null;

  if (milestone >= 6) {
    const firstThree =
      cycles.slice(0, 3);

    const lastThree =
      cycles.slice(-3);

    firstThreeAverageExpenseCents =
      calculateAverage(
        firstThree.map(
          (cycle) =>
            cycle.expenseCents
        )
      );

    lastThreeAverageExpenseCents =
      calculateAverage(
        lastThree.map(
          (cycle) =>
            cycle.expenseCents
        )
      );

    expenseDifferenceCents =
      lastThreeAverageExpenseCents -
      firstThreeAverageExpenseCents;

    if (
      firstThreeAverageExpenseCents >
      0
    ) {
      expenseComparisonPercentage =
        (
          expenseDifferenceCents /
          firstThreeAverageExpenseCents
        ) * 100;
    }
  }

  const totalExpenses =
    cycles.reduce(
      (sum, cycle) =>
        sum +
        cycle.expenseCents,
      0
    );

  const topCategory =
    await getTopExpenseCategory(
      cycles.map(
        (cycle) => cycle.id
      )
    );

  const topExpenseCategoryPercentage =
    topCategory &&
    totalExpenses > 0
      ? (
          topCategory.total_cents /
          totalExpenses
        ) * 100
      : null;

  return {
    cycleCount:
      cycles.length,
    cycles,
    positiveCycles,
    negativeCycles,
    accumulatedBalanceCents,
    averageResultCents,
    bestCycle,
    firstThreeAverageExpenseCents,
    lastThreeAverageExpenseCents,
    expenseDifferenceCents,
    expenseComparisonPercentage,
    topExpenseCategory:
      topCategory?.category ??
      null,
    topExpenseCategoryCents:
      topCategory?.total_cents ??
      0,
    topExpenseCategoryPercentage,
    firstCycle:
      cycles[0] ?? null,
    lastCycle:
      cycles[
        cycles.length - 1
      ] ?? null,
  };
}