import { database } from "./database";
import {
  ClosingDecision,
  CycleStatus,
} from "./cycles";
import {
  postDueScheduledTransactions,
} from "./transactions";

export type StatementCategory = {
  id: string;
  name: string;
  amountCents: number;
  percentage: number;
};

export type StatementComparison = {
  year: number;
  month: number;
  expenseCents: number;
};

export type MonthlyStatement = {
  year: number;
  month: number;
  hasActivity: boolean;
  status: CycleStatus | null;

  externalIncomeCents: number;
  expenseCents: number;
  resultCents: number;

  averageDailyExpenseCents: number;
  remainingDays: number;

  categories: StatementCategory[];

  closingDecision: ClosingDecision | null;
  carryCents: number;
  vaultCoverageCents: number;

  previousMonth: StatementComparison | null;
};

type CycleRow = {
  id: number;
  status: CycleStatus;
  external_income_cents: number | null;
  expense_cents: number | null;
  result_cents: number | null;
  closing_decision: ClosingDecision | null;
  carry_cents: number;
  vault_coverage_cents: number;
  initial_monthly_balance_cents: number;
};

type TotalsRow = {
  external_income_cents: number | null;
  expense_cents: number | null;
  transaction_count: number;
};

type CategoryRow = {
  category: string | null;
  amount_cents: number | null;
};

type ExpenseRow = {
  expense_cents: number | null;
};

function getMonthBounds(
  year: number,
  month: number
) {
  const start =
    `${year}-${String(month).padStart(
      2,
      "0"
    )}-01`;

  const nextMonthDate =
    new Date(
      year,
      month,
      1
    );

  const end =
    `${nextMonthDate.getFullYear()}-${String(
      nextMonthDate.getMonth() + 1
    ).padStart(2, "0")}-01`;

  return {
    start,
    end,
  };
}

function getPreviousMonth(
  year: number,
  month: number
) {
  if (month === 1) {
    return {
      year: year - 1,
      month: 12,
    };
  }

  return {
    year,
    month: month - 1,
  };
}

function getRemainingDays(
  year: number,
  month: number
) {
  const now =
    new Date();

  if (
    now.getFullYear() !== year ||
    now.getMonth() + 1 !== month
  ) {
    return 0;
  }

  const lastDay =
    new Date(
      year,
      month,
      0
    ).getDate();

  return Math.max(
    0,
    lastDay - now.getDate()
  );
}

function getElapsedDays(
  year: number,
  month: number,
  closed: boolean
) {
  if (closed) {
    return new Date(
      year,
      month,
      0
    ).getDate();
  }

  const now =
    new Date();

  if (
    now.getFullYear() === year &&
    now.getMonth() + 1 === month
  ) {
    return Math.max(
      1,
      now.getDate()
    );
  }

  const monthDate =
    new Date(
      year,
      month - 1,
      1
    );

  if (monthDate < now) {
    return new Date(
      year,
      month,
      0
    ).getDate();
  }

  return 1;
}

async function getCycleForMonth(
  year: number,
  month: number
) {
  return database.getFirstAsync<CycleRow>(
    `
      SELECT
        id,
        status,
        external_income_cents,
        expense_cents,
        result_cents,
        closing_decision,
        carry_cents,
        vault_coverage_cents,
        initial_monthly_balance_cents
      FROM cycles
      WHERE year = ?
        AND month = ?;
    `,
    year,
    month
  );
}

async function getLiveTotals(
  year: number,
  month: number
) {
  const {
    start,
    end,
  } = getMonthBounds(
    year,
    month
  );

  const row =
    await database.getFirstAsync<TotalsRow>(
      `
        SELECT
          COALESCE(
            SUM(
              CASE
                WHEN type = 'income'
                  THEN amount_cents
                ELSE 0
              END
            ),
            0
          ) AS external_income_cents,

          COALESCE(
            SUM(
              CASE
                WHEN type = 'expense'
                  THEN amount_cents
                ELSE 0
              END
            ),
            0
          ) AS expense_cents,

          COUNT(*) AS transaction_count

        FROM transactions
        WHERE status = 'posted'
          AND date >= ?
          AND date < ?;
      `,
      start,
      end
    );

  return {
    externalIncomeCents:
      row?.external_income_cents ?? 0,
    expenseCents:
      row?.expense_cents ?? 0,
    transactionCount:
      row?.transaction_count ?? 0,
  };
}

async function getCategories(
  year: number,
  month: number,
  totalExpenseCents: number
) {
  const {
    start,
    end,
  } = getMonthBounds(
    year,
    month
  );

  const rows =
    await database.getAllAsync<CategoryRow>(
      `
        SELECT
          category,
          SUM(amount_cents) AS amount_cents
        FROM transactions
        WHERE type = 'expense'
          AND status = 'posted'
          AND date >= ?
          AND date < ?
        GROUP BY category
        ORDER BY
          amount_cents DESC,
          category ASC;
      `,
      start,
      end
    );

  return rows.map(
    (row) => {
      const amountCents =
        row.amount_cents ?? 0;

      const percentage =
        totalExpenseCents > 0
          ? (amountCents /
              totalExpenseCents) *
            100
          : 0;

      return {
        id:
          row.category ??
          "outros",
        name:
          row.category ??
          "Outros",
        amountCents,
        percentage,
      };
    }
  );
}

async function getPreviousMonthComparison(
  year: number,
  month: number
) {
  const previous =
    getPreviousMonth(
      year,
      month
    );

  const {
    start,
    end,
  } = getMonthBounds(
    previous.year,
    previous.month
  );

  const row =
    await database.getFirstAsync<ExpenseRow>(
      `
        SELECT
          COALESCE(
            SUM(amount_cents),
            0
          ) AS expense_cents
        FROM transactions
        WHERE type = 'expense'
          AND status = 'posted'
          AND date >= ?
          AND date < ?;
      `,
      start,
      end
    );

  const activity =
    await database.getFirstAsync<{
      total: number;
    }>(
      `
        SELECT COUNT(*) AS total
        FROM transactions
        WHERE status = 'posted'
          AND date >= ?
          AND date < ?;
      `,
      start,
      end
    );

  if (
    (activity?.total ?? 0) === 0
  ) {
    return null;
  }

  return {
    year: previous.year,
    month: previous.month,
    expenseCents:
      row?.expense_cents ?? 0,
  };
}

export async function getMonthlyStatement(
  year: number,
  month: number
): Promise<MonthlyStatement> {
  await postDueScheduledTransactions();

  const [
    cycle,
    liveTotals,
  ] = await Promise.all([
    getCycleForMonth(
      year,
      month
    ),
    getLiveTotals(
      year,
      month
    ),
  ]);

  const closed =
    cycle?.status === "closed";

  const externalIncomeCents =
    closed
      ? cycle.external_income_cents ??
        liveTotals.externalIncomeCents
      : liveTotals.externalIncomeCents;

  const expenseCents =
    closed
      ? cycle.expense_cents ??
        liveTotals.expenseCents
      : liveTotals.expenseCents;

  const initialMonthlyBalanceCents =
    cycle?.initial_monthly_balance_cents ??
    0;

  const resultCents =
    closed
      ? cycle.result_cents ??
        initialMonthlyBalanceCents +
          externalIncomeCents -
          expenseCents
      : initialMonthlyBalanceCents +
        externalIncomeCents -
        expenseCents;

  const hasActivity =
    liveTotals.transactionCount > 0;

  const [
    categories,
    previousMonth,
  ] = await Promise.all([
    getCategories(
      year,
      month,
      expenseCents
    ),
    getPreviousMonthComparison(
      year,
      month
    ),
  ]);

  const elapsedDays =
    getElapsedDays(
      year,
      month,
      closed
    );

  const averageDailyExpenseCents =
    expenseCents > 0
      ? Math.round(
          expenseCents /
            elapsedDays
        )
      : 0;

  return {
    year,
    month,
    hasActivity,
    status:
      cycle?.status ?? null,

    externalIncomeCents,
    expenseCents,
    resultCents,

    averageDailyExpenseCents,
    remainingDays:
      closed
        ? 0
        : getRemainingDays(
            year,
            month
          ),

    categories,

    closingDecision:
      cycle?.closing_decision ??
      null,

    carryCents:
      cycle?.carry_cents ?? 0,

    vaultCoverageCents:
      cycle?.vault_coverage_cents ??
      0,

    previousMonth,
  };
}