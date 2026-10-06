import { database } from "./database";

export type BudgetPeriod =
  | "daily"
  | "weekly"
  | "monthly";

export type Budget = {
  id: number;
  name: string;
  amountCents: number;
  period: BudgetPeriod;
  autoRepeat: boolean;
  startDate: string;
  createdAt: string;
  updatedAt: string;
};

export type BudgetProgress = {
  budget: Budget;
  periodStart: string;
  periodEnd: string;
  nextResetDate: string | null;
  usedCents: number;
  availableCents: number;
  usedPercentage: number;
  active: boolean;
  finished: boolean;
  dailyPaceCents: number | null;
  remainingDays: number | null;
};

export type CreateBudgetInput = {
  name: string;
  amountCents: number;
  period: BudgetPeriod;
  autoRepeat: boolean;
  startDate: string;
};

export type UpdateBudgetInput = {
  name: string;
  amountCents: number;
  period: BudgetPeriod;
  autoRepeat: boolean;
  startDate: string;
};

type BudgetRow = {
  id: number;
  name: string;
  amount_cents: number;
  period: BudgetPeriod;
  auto_repeat: number;
  start_date: string;
  created_at: string;
  updated_at: string;
};

type TotalRow = {
  total: number | null;
};

function mapBudget(
  row: BudgetRow
): Budget {
  return {
    id: row.id,
    name: row.name,
    amountCents:
      row.amount_cents,
    period: row.period,
    autoRepeat:
      row.auto_repeat === 1,
    startDate: row.start_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function validateBudget(
  input:
    | CreateBudgetInput
    | UpdateBudgetInput
) {
  const name =
    input.name.trim();

  if (!name) {
    throw new Error(
      "O orçamento precisa de um nome."
    );
  }

  if (
    !Number.isInteger(
      input.amountCents
    ) ||
    input.amountCents <= 0
  ) {
    throw new Error(
      "O orçamento precisa ter um valor maior que zero."
    );
  }

  if (
    input.period !== "daily" &&
    input.period !== "weekly" &&
    input.period !== "monthly"
  ) {
    throw new Error(
      "O período do orçamento é inválido."
    );
  }

  if (!input.startDate) {
    throw new Error(
      "O orçamento precisa de uma data de início."
    );
  }

  return {
    ...input,
    name,
  };
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

function addDays(
  date: Date,
  days: number
) {
  const result =
    new Date(date);

  result.setDate(
    result.getDate() + days
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
    (endUtc - startUtc) /
      86400000
  );
}

function getAnchoredMonthDate(
  originalStart: Date,
  monthsFromStart: number
) {
  const anchorDay =
    originalStart.getDate();

  const targetMonth =
    new Date(
      originalStart.getFullYear(),
      originalStart.getMonth() +
        monthsFromStart,
      1
    );

  const lastDay =
    new Date(
      targetMonth.getFullYear(),
      targetMonth.getMonth() + 1,
      0
    ).getDate();

  targetMonth.setDate(
    Math.min(
      anchorDay,
      lastDay
    )
  );

  return normalizeDate(
    targetMonth
  );
}

function getPeriodByIndex(
  originalStart: Date,
  period: BudgetPeriod,
  index: number
) {
  if (
    period === "daily"
  ) {
    return {
      start: addDays(
        originalStart,
        index
      ),
      end: addDays(
        originalStart,
        index + 1
      ),
    };
  }

  if (
    period === "weekly"
  ) {
    return {
      start: addDays(
        originalStart,
        index * 7
      ),
      end: addDays(
        originalStart,
        (index + 1) * 7
      ),
    };
  }

  return {
    start:
      getAnchoredMonthDate(
        originalStart,
        index
      ),
    end:
      getAnchoredMonthDate(
        originalStart,
        index + 1
      ),
  };
}

function getCurrentPeriod(
  budget: Budget,
  referenceDate = new Date()
) {
  const today =
    normalizeDate(
      referenceDate
    );

  const originalStart =
    parseDate(
      budget.startDate
    );

  const firstPeriod =
    getPeriodByIndex(
      originalStart,
      budget.period,
      0
    );

  if (
    today.getTime() <
    originalStart.getTime()
  ) {
    return {
      start:
        firstPeriod.start,
      end:
        firstPeriod.end,
      active: false,
      finished: false,
    };
  }

  if (
    !budget.autoRepeat
  ) {
    const finished =
      today.getTime() >=
      firstPeriod.end.getTime();

    return {
      start:
        firstPeriod.start,
      end:
        firstPeriod.end,
      active: !finished,
      finished,
    };
  }

  let index = 0;
  let current =
    firstPeriod;

  while (
    today.getTime() >=
    current.end.getTime()
  ) {
    index += 1;

    current =
      getPeriodByIndex(
        originalStart,
        budget.period,
        index
      );
  }

  return {
    start: current.start,
    end: current.end,
    active: true,
    finished: false,
  };
}

function budgetBlocksNewBudget(
  budget: Budget,
  referenceDate = new Date()
) {
  const period =
    getCurrentPeriod(
      budget,
      referenceDate
    );

  return !period.finished;
}

async function ensureCanCreateBudget() {
  const budgets =
    await getBudgets();

  const hasCurrentOrFutureBudget =
    budgets.some(
      (budget) =>
        budgetBlocksNewBudget(
          budget
        )
    );

  if (
    hasCurrentOrFutureBudget
  ) {
    throw new Error(
      "Você já possui um orçamento ativo ou agendado."
    );
  }
}

export async function createBudget(
  input: CreateBudgetInput
) {
  const validated =
    validateBudget(input);

  await ensureCanCreateBudget();

  const result =
    await database.runAsync(
      `
        INSERT INTO budgets (
          name,
          amount_cents,
          period,
          auto_repeat,
          start_date,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP);
      `,
      validated.name,
      validated.amountCents,
      validated.period,
      validated.autoRepeat
        ? 1
        : 0,
      validated.startDate
    );

  const budget =
    await getBudgetById(
      result.lastInsertRowId
    );

  if (!budget) {
    throw new Error(
      "Não foi possível carregar o orçamento criado."
    );
  }

  return budget;
}

export async function getBudgetById(
  id: number
) {
  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    return null;
  }

  const row =
    await database.getFirstAsync<BudgetRow>(
      `
        SELECT
          id,
          name,
          amount_cents,
          period,
          auto_repeat,
          start_date,
          created_at,
          updated_at
        FROM budgets
        WHERE id = ?
        LIMIT 1;
      `,
      id
    );

  return row
    ? mapBudget(row)
    : null;
}

export async function getBudgets() {
  const rows =
    await database.getAllAsync<BudgetRow>(
      `
        SELECT
          id,
          name,
          amount_cents,
          period,
          auto_repeat,
          start_date,
          created_at,
          updated_at
        FROM budgets
        ORDER BY
          start_date ASC,
          id ASC;
      `
    );

  return rows.map(
    mapBudget
  );
}

export async function updateBudget(
  id: number,
  input: UpdateBudgetInput
) {
  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    throw new Error(
      "Orçamento inválido."
    );
  }

  const existing =
    await getBudgetById(id);

  if (!existing) {
    throw new Error(
      "Orçamento não encontrado."
    );
  }

  const validated =
    validateBudget(input);

  await database.runAsync(
    `
      UPDATE budgets
      SET
        name = ?,
        amount_cents = ?,
        period = ?,
        auto_repeat = ?,
        start_date = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?;
    `,
    validated.name,
    validated.amountCents,
    validated.period,
    validated.autoRepeat
      ? 1
      : 0,
    validated.startDate,
    id
  );

  const budget =
    await getBudgetById(id);

  if (!budget) {
    throw new Error(
      "Não foi possível carregar o orçamento atualizado."
    );
  }

  return budget;
}

export async function deleteBudget(
  id: number
) {
  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    throw new Error(
      "Orçamento inválido."
    );
  }

  await database.runAsync(
    `
      DELETE FROM budgets
      WHERE id = ?;
    `,
    id
  );
}

export async function getBudgetProgress(
  budget: Budget,
  referenceDate = new Date()
): Promise<BudgetProgress> {
  const today =
    normalizeDate(
      referenceDate
    );

  const period =
    getCurrentPeriod(
      budget,
      today
    );

  const periodStart =
    formatDateForDatabase(
      period.start
    );

  const periodEnd =
    formatDateForDatabase(
      period.end
    );

  const todayDatabase =
    formatDateForDatabase(
      today
    );

  let usedCents = 0;
  let usedBeforeTodayCents = 0;

  if (
    period.active ||
    period.finished
  ) {
    const row =
      await database.getFirstAsync<TotalRow>(
        `
          SELECT
            COALESCE(
              SUM(amount_cents),
              0
            ) AS total
          FROM transactions
          WHERE type = 'expense'
            AND status = 'posted'
            AND counts_toward_budget = 1
            AND date >= ?
            AND date < ?;
        `,
        periodStart,
        periodEnd
      );

    usedCents =
      row?.total ?? 0;

    if (
      period.active &&
      budget.period !==
        "daily"
    ) {
      const beforeTodayRow =
        await database.getFirstAsync<TotalRow>(
          `
            SELECT
              COALESCE(
                SUM(amount_cents),
                0
              ) AS total
            FROM transactions
            WHERE type = 'expense'
              AND status = 'posted'
              AND counts_toward_budget = 1
              AND date >= ?
              AND date < ?
              AND date < ?;
          `,
          periodStart,
          periodEnd,
          todayDatabase
        );

      usedBeforeTodayCents =
        beforeTodayRow?.total ??
        0;
    }
  }

  const availableCents =
    budget.amountCents -
    usedCents;

  const usedPercentage =
    budget.amountCents > 0
      ? Math.round(
          (
            usedCents /
            budget.amountCents
          ) * 100
        )
      : 0;

  let dailyPaceCents:
    | number
    | null = null;

  let remainingDays:
    | number
    | null = null;

  if (
    period.active &&
    budget.period !== "daily"
  ) {
    remainingDays =
      differenceInCalendarDays(
        today,
        period.end
      );

    if (
      remainingDays > 0
    ) {
      const availableAtStartOfDay =
        budget.amountCents -
        usedBeforeTodayCents;

      dailyPaceCents =
        Math.max(
          0,
          Math.floor(
            availableAtStartOfDay /
              remainingDays
          )
        );
    }
  }

  return {
    budget,
    periodStart,
    periodEnd,
    nextResetDate:
      budget.autoRepeat &&
      period.active
        ? periodEnd
        : null,
    usedCents,
    availableCents,
    usedPercentage,
    active:
      period.active,
    finished:
      period.finished,
    dailyPaceCents,
    remainingDays,
  };
}

export async function getBudgetsProgress(
  referenceDate = new Date()
) {
  const budgets =
    await getBudgets();

  return Promise.all(
    budgets.map(
      (budget) =>
        getBudgetProgress(
          budget,
          referenceDate
        )
    )
  );
}

export async function hasApplicableBudget(
  referenceDate = new Date()
) {
  const progress =
    await getBudgetsProgress(
      referenceDate
    );

  return progress.some(
    (item) => item.active
  );
}