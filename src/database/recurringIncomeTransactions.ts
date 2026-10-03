import { database } from "./database";
import { notifyRecurringIncome } from "../notifications/notifications";

type ReceiptType =
  | "first_day"
  | "first_business_day"
  | "custom";

type RecurringIncomeRow = {
  id: number;
  amount_cents: number;
  receipt_type: ReceiptType;
  custom_day: number | null;
  created_at: string;
};

type CycleRow = {
  id: number;
  status: "open" | "closed";
};

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

function formatPeriod(
  year: number,
  month: number
) {
  return `${year}-${String(
    month
  ).padStart(2, "0")}`;
}

function getLastDayOfMonth(
  year: number,
  month: number
) {
  return new Date(
    year,
    month,
    0
  ).getDate();
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

function getReceiptDate(
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
    getLastDayOfMonth(
      year,
      month
    );

  const configuredDay =
    income.custom_day ?? 1;

  const effectiveDay =
    Math.min(
      configuredDay,
      lastDay
    );

  return new Date(
    year,
    month - 1,
    effectiveDay
  );
}

function startOfDay(
  date: Date
) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
}

function getIncomeCreationDate(
  income: RecurringIncomeRow
) {
  const parsed =
    new Date(
      income.created_at.replace(
        " ",
        "T"
      ) + "Z"
    );

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return null;
  }

  return parsed;
}

function incomeExistedForPeriod(
  income: RecurringIncomeRow,
  year: number,
  month: number
) {
  const creationDate =
    getIncomeCreationDate(
      income
    );

  if (!creationDate) {
    return true;
  }

  const periodEnd =
    new Date(
      year,
      month,
      0,
      23,
      59,
      59,
      999
    );

  return (
    creationDate <=
    periodEnd
  );
}

function receiptCanBeMaterialized(
  income: RecurringIncomeRow,
  receiptDate: Date
) {
  const creationDate =
    getIncomeCreationDate(
      income
    );

  if (!creationDate) {
    return true;
  }

  const creationDay =
    startOfDay(
      creationDate
    );

  const receiptDay =
    startOfDay(
      receiptDate
    );

  const sameMonth =
    creationDay.getFullYear() ===
      receiptDay.getFullYear() &&
    creationDay.getMonth() ===
      receiptDay.getMonth();

  if (!sameMonth) {
    return true;
  }

  return (
    receiptDay >
    creationDay
  );
}

async function getCycle(
  year: number,
  month: number
) {
  return database.getFirstAsync<CycleRow>(
    `
      SELECT
        id,
        status
      FROM cycles
      WHERE year = ?
        AND month = ?
      LIMIT 1;
    `,
    year,
    month
  );
}

async function materializeIncomeForPeriod(
  income: RecurringIncomeRow,
  year: number,
  month: number,
  today: Date
) {
  if (
    !incomeExistedForPeriod(
      income,
      year,
      month
    )
  ) {
    return;
  }

  const receiptDate =
    getReceiptDate(
      income,
      year,
      month
    );

  if (
    !receiptCanBeMaterialized(
      income,
      receiptDate
    )
  ) {
    return;
  }

  if (
    startOfDay(receiptDate) >
    startOfDay(today)
  ) {
    return;
  }

  const cycle =
    await getCycle(
      year,
      month
    );

  if (
    !cycle ||
    cycle.status !== "open"
  ) {
    return;
  }

  const period =
    formatPeriod(
      year,
      month
    );

  const result =
    await database.runAsync(
      `
        INSERT OR IGNORE INTO transactions (
          cycle_id,
          type,
          amount_cents,
          date,
          category,
          description,
          bucket,
          status,
          transfer_from,
          transfer_to,
          recurring_income_id,
          recurring_income_period
        )
        VALUES (
          ?,
          'income',
          ?,
          ?,
          NULL,
          'Rendimento recorrente',
          'monthly_money',
          'posted',
          NULL,
          NULL,
          ?,
          ?
        );
      `,
      cycle.id,
      income.amount_cents,
      formatDateForDatabase(
        receiptDate
      ),
      income.id,
      period
    );

  if (
    result.changes === 0
  ) {
    return;
  }

  const transaction =
    await database.getFirstAsync<{
      id: number;
    }>(
      `
        SELECT id
        FROM transactions
        WHERE recurring_income_id = ?
          AND recurring_income_period = ?
        LIMIT 1;
      `,
      income.id,
      period
    );

  if (!transaction) {
    return;
  }

  await notifyRecurringIncome(
    transaction.id,
    income.amount_cents,
    income.id,
    period
  );
}

export async function postDueRecurringIncomes() {
  const incomes =
    await database.getAllAsync<RecurringIncomeRow>(
      `
        SELECT
          id,
          amount_cents,
          receipt_type,
          custom_day,
          created_at
        FROM recurring_incomes
        ORDER BY id ASC;
      `
    );

  if (
    incomes.length === 0
  ) {
    return;
  }

  const today =
    new Date();

  const year =
    today.getFullYear();

  const month =
    today.getMonth() + 1;

  for (
    const income of incomes
  ) {
    await materializeIncomeForPeriod(
      income,
      year,
      month,
      today
    );
  }
}