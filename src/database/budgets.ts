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

export async function createBudget(
  input: CreateBudgetInput
) {
  const validated =
    validateBudget(input);

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

  return rows.map(mapBudget);
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