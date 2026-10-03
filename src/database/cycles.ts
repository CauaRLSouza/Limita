import { database } from "./database";
import {
  postDueScheduledTransactions,
} from "./transactions";

export type CycleStatus =
  | "open"
  | "closed";

export type ClosingStage =
  | "closed"
  | "result"
  | "achievement"
  | "milestone"
  | "resolved";

export type ClosingDecision =
  | "positive_to_vault"
  | "positive_keep_monthly"
  | "negative_from_vault"
  | "negative_carry";

export type StoredCycle = {
  id: number;
  year: number;
  month: number;
  status: CycleStatus;
  closedAt: string | null;
  externalIncomeCents: number | null;
  expenseCents: number | null;
  resultCents: number | null;
  preservedRate: number | null;
  qualifiedAchievement: boolean | null;
  closingStage: ClosingStage | null;
  closingDecision: ClosingDecision | null;
  carryCents: number;
  vaultCoverageCents: number;
  isPartial: boolean;
  initialMonthlyBalanceCents: number;
};

type CycleRow = {
  id: number;
  year: number;
  month: number;
  status: CycleStatus;
  closed_at: string | null;
  external_income_cents: number | null;
  expense_cents: number | null;
  result_cents: number | null;
  preserved_rate: number | null;
  qualified_achievement: number | null;
  closing_stage: ClosingStage | null;
  closing_decision: ClosingDecision | null;
  carry_cents: number;
  vault_coverage_cents: number;
  is_partial: number;
  initial_monthly_balance_cents: number;
};

type CycleTotalsRow = {
  external_income_cents: number | null;
  expense_cents: number | null;
};

type CountRow = {
  total: number;
};

type ActivityRow = {
  total: number;
};

type VaultBalanceRow = {
  vault_cents: number | null;
};

function mapCycle(
  row: CycleRow
): StoredCycle {
  return {
    id: row.id,
    year: row.year,
    month: row.month,
    status: row.status,
    closedAt: row.closed_at,
    externalIncomeCents:
      row.external_income_cents,
    expenseCents:
      row.expense_cents,
    resultCents:
      row.result_cents,
    preservedRate:
      row.preserved_rate,
    qualifiedAchievement:
      row.qualified_achievement === null
        ? null
        : row.qualified_achievement === 1,
    closingStage:
      row.closing_stage,
    closingDecision:
      row.closing_decision,
    carryCents:
      row.carry_cents,
    vaultCoverageCents:
      row.vault_coverage_cents,
    isPartial:
      row.is_partial === 1,
    initialMonthlyBalanceCents:
      row.initial_monthly_balance_cents,
  };
}

async function getVaultBalance() {
  const row =
    await database.getFirstAsync<VaultBalanceRow>(
      `
        SELECT
          COALESCE(
            (
              SELECT SUM(
                CASE
                  WHEN t.type = 'income'
                    AND t.bucket = 'vault'
                    THEN t.amount_cents

                  WHEN t.type = 'expense'
                    AND t.bucket = 'vault'
                    THEN -t.amount_cents

                  WHEN t.type = 'transfer'
                    AND t.transfer_to = 'vault'
                    THEN t.amount_cents

                  WHEN t.type = 'transfer'
                    AND t.transfer_from = 'vault'
                    THEN -t.amount_cents

                  ELSE 0
                END
              )
              FROM transactions t
              WHERE t.status = 'posted'
            ),
            0
          )
          +
          COALESCE(
            (
              SELECT SUM(
                CASE
                  WHEN c.closing_decision =
                    'positive_to_vault'
                    THEN c.result_cents

                  WHEN c.closing_decision =
                    'negative_from_vault'
                    THEN -c.vault_coverage_cents

                  ELSE 0
                END
              )
              FROM cycles c
              WHERE c.status = 'closed'
                AND c.closing_decision IN (
                  'positive_to_vault',
                  'negative_from_vault'
                )
            ),
            0
          ) AS vault_cents;
      `
    );

  return Math.max(
    0,
    row?.vault_cents ?? 0
  );
}

export async function getCycleById(
  cycleId: number
) {
  const row =
    await database.getFirstAsync<CycleRow>(
      `
        SELECT
          id,
          year,
          month,
          status,
          closed_at,
          external_income_cents,
          expense_cents,
          result_cents,
          preserved_rate,
          qualified_achievement,
          closing_stage,
          closing_decision,
          carry_cents,
          vault_coverage_cents,
          is_partial,
          initial_monthly_balance_cents
        FROM cycles
        WHERE id = ?;
      `,
      cycleId
    );

  return row
    ? mapCycle(row)
    : null;
}

export async function getCycle(
  year: number,
  month: number
) {
  const row =
    await database.getFirstAsync<CycleRow>(
      `
        SELECT
          id,
          year,
          month,
          status,
          closed_at,
          external_income_cents,
          expense_cents,
          result_cents,
          preserved_rate,
          qualified_achievement,
          closing_stage,
          closing_decision,
          carry_cents,
          vault_coverage_cents,
          is_partial,
          initial_monthly_balance_cents
        FROM cycles
        WHERE year = ?
          AND month = ?;
      `,
      year,
      month
    );

  return row
    ? mapCycle(row)
    : null;
}

export async function getOrCreateCycle(
  year: number,
  month: number
) {
  await database.runAsync(
    `
      INSERT OR IGNORE INTO cycles (
        year,
        month
      )
      VALUES (?, ?);
    `,
    year,
    month
  );

  const cycle =
    await getCycle(
      year,
      month
    );

  if (!cycle) {
    throw new Error(
      "Não foi possível localizar o ciclo."
    );
  }

  return cycle;
}

export async function getCurrentCycle() {
  const now = new Date();

  return getOrCreateCycle(
    now.getFullYear(),
    now.getMonth() + 1
  );
}

export async function getPreviousCycle() {
  const now = new Date();

  const previousMonth =
    new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );

  return getCycle(
    previousMonth.getFullYear(),
    previousMonth.getMonth() + 1
  );
}

export async function configureInitialCycle(
  initialMonthlyBalanceCents: number
) {
  if (
    !Number.isInteger(
      initialMonthlyBalanceCents
    ) ||
    initialMonthlyBalanceCents < 0
  ) {
    throw new Error(
      "O saldo inicial precisa ser um valor válido."
    );
  }

  const now = new Date();

  const cycle =
    await getOrCreateCycle(
      now.getFullYear(),
      now.getMonth() + 1
    );

  if (cycle.status !== "open") {
    throw new Error(
      "O ciclo inicial não está aberto."
    );
  }

  const isPartial =
    now.getDate() > 1;

  await database.runAsync(
    `
      UPDATE cycles
      SET
        is_partial = ?,
        initial_monthly_balance_cents = ?
      WHERE id = ?
        AND status = 'open';
    `,
    isPartial ? 1 : 0,
    initialMonthlyBalanceCents,
    cycle.id
  );

  const updatedCycle =
    await getCycleById(
      cycle.id
    );

  if (!updatedCycle) {
    throw new Error(
      "Não foi possível configurar o ciclo inicial."
    );
  }

  return updatedCycle;
}

export async function getPendingClosingCycle() {
  const row =
    await database.getFirstAsync<CycleRow>(
      `
        SELECT
          c.id,
          c.year,
          c.month,
          c.status,
          c.closed_at,
          c.external_income_cents,
          c.expense_cents,
          c.result_cents,
          c.preserved_rate,
          c.qualified_achievement,
          c.closing_stage,
          c.closing_decision,
          c.carry_cents,
          c.vault_coverage_cents,
          c.is_partial,
          c.initial_monthly_balance_cents
        FROM cycles c
        WHERE c.status = 'closed'
          AND c.closing_stage IS NOT NULL
          AND c.closing_stage <> 'resolved'
          AND EXISTS (
            SELECT 1
            FROM transactions t
            WHERE t.cycle_id = c.id
              AND t.status = 'posted'
          )
        ORDER BY
          c.year ASC,
          c.month ASC
        LIMIT 1;
      `
    );

  return row
    ? mapCycle(row)
    : null;
}

async function cycleHasActivity(
  cycleId: number
) {
  const row =
    await database.getFirstAsync<ActivityRow>(
      `
        SELECT COUNT(*) AS total
        FROM transactions
        WHERE cycle_id = ?
          AND status = 'posted';
      `,
      cycleId
    );

  return (row?.total ?? 0) > 0;
}

async function calculateCycleTotals(
  cycleId: number
) {
  const totals =
    await database.getFirstAsync<CycleTotalsRow>(
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
          ) AS expense_cents

        FROM transactions
        WHERE cycle_id = ?
          AND status = 'posted';
      `,
      cycleId
    );

  return {
    externalIncomeCents:
      totals?.external_income_cents ?? 0,
    expenseCents:
      totals?.expense_cents ?? 0,
  };
}

export async function closeCycle(
  cycleId: number
) {
  const cycle =
    await getCycleById(
      cycleId
    );

  if (!cycle) {
    throw new Error(
      "Ciclo não encontrado."
    );
  }

  if (
    cycle.status === "closed"
  ) {
    return cycle;
  }

  const hasActivity =
    await cycleHasActivity(
      cycleId
    );

  if (!hasActivity) {
    return cycle;
  }

  const {
    externalIncomeCents,
    expenseCents,
  } =
    await calculateCycleTotals(
      cycleId
    );

  const resultCents =
    externalIncomeCents -
    expenseCents;

  const preservedRate =
    externalIncomeCents > 0
      ? resultCents /
        externalIncomeCents
      : 0;

  const qualifiedAchievement =
    !cycle.isPartial &&
    externalIncomeCents > 0 &&
    expenseCents > 0 &&
    preservedRate >= 0.1;

  await database.runAsync(
    `
      UPDATE cycles
      SET
        status = 'closed',
        closed_at = CURRENT_TIMESTAMP,
        external_income_cents = ?,
        expense_cents = ?,
        result_cents = ?,
        preserved_rate = ?,
        qualified_achievement = ?,
        closing_stage = 'closed',
        closing_decision = NULL,
        carry_cents = 0,
        vault_coverage_cents = 0
      WHERE id = ?;
    `,
    externalIncomeCents,
    expenseCents,
    resultCents,
    preservedRate,
    qualifiedAchievement
      ? 1
      : 0,
    cycleId
  );

  const closedCycle =
    await getCycleById(
      cycleId
    );

  if (!closedCycle) {
    throw new Error(
      "Não foi possível recuperar o ciclo fechado."
    );
  }

  return closedCycle;
}

export async function prepareCycles() {
  await postDueScheduledTransactions();

  const now = new Date();

  const currentYear =
    now.getFullYear();

  const currentMonth =
    now.getMonth() + 1;

  await getOrCreateCycle(
    currentYear,
    currentMonth
  );

  const openPastCycles =
    await database.getAllAsync<{
      id: number;
    }>(
      `
        SELECT c.id
        FROM cycles c
        WHERE c.status = 'open'
          AND (
            c.year < ?
            OR (
              c.year = ?
              AND c.month < ?
            )
          )
          AND EXISTS (
            SELECT 1
            FROM transactions t
            WHERE t.cycle_id = c.id
              AND t.status = 'posted'
          )
        ORDER BY
          c.year ASC,
          c.month ASC;
      `,
      currentYear,
      currentYear,
      currentMonth
    );

  for (
    const cycle of
    openPastCycles
  ) {
    await closeCycle(
      cycle.id
    );
  }

  return getPendingClosingCycle();
}

export async function revealCycleClosing(
  cycleId: number
) {
  await database.runAsync(
    `
      UPDATE cycles
      SET closing_stage = 'result'
      WHERE id = ?
        AND status = 'closed'
        AND closing_stage = 'closed';
    `,
    cycleId
  );

  return getCycleById(
    cycleId
  );
}

export async function saveClosingDecision(
  cycleId: number,
  decision: ClosingDecision
) {
  const cycle =
    await getCycleById(
      cycleId
    );

  if (!cycle) {
    throw new Error(
      "Ciclo não encontrado."
    );
  }

  if (
    cycle.status !== "closed" ||
    cycle.resultCents === null
  ) {
    throw new Error(
      "O ciclo ainda não foi fechado."
    );
  }

  if (
    cycle.closingDecision
  ) {
    return cycle;
  }

  const resultCents =
    cycle.resultCents;

  if (resultCents === 0) {
    throw new Error(
      "Um ciclo neutro não possui decisão financeira."
    );
  }

  if (
    resultCents > 0 &&
    decision !==
      "positive_to_vault" &&
    decision !==
      "positive_keep_monthly"
  ) {
    throw new Error(
      "Decisão incompatível com um ciclo positivo."
    );
  }

  if (
    resultCents < 0 &&
    decision !==
      "negative_from_vault" &&
    decision !==
      "negative_carry"
  ) {
    throw new Error(
      "Decisão incompatível com um ciclo negativo."
    );
  }

  let carryCents = 0;
  let vaultCoverageCents = 0;

  if (
    decision ===
    "positive_keep_monthly"
  ) {
    carryCents =
      resultCents;
  }

  if (
    decision ===
    "negative_carry"
  ) {
    carryCents =
      resultCents;
  }

  if (
    decision ===
    "negative_from_vault"
  ) {
    const vaultBalance =
      await getVaultBalance();

    const deficitCents =
      Math.abs(
        resultCents
      );

    vaultCoverageCents =
      Math.min(
        deficitCents,
        vaultBalance
      );

    carryCents =
      resultCents +
      vaultCoverageCents;
  }

  await database.runAsync(
    `
      UPDATE cycles
      SET
        closing_decision = ?,
        carry_cents = ?,
        vault_coverage_cents = ?
      WHERE id = ?;
    `,
    decision,
    carryCents,
    vaultCoverageCents,
    cycleId
  );

  return getCycleById(
    cycleId
  );
}

export async function setClosingStage(
  cycleId: number,
  stage: ClosingStage
) {
  await database.runAsync(
    `
      UPDATE cycles
      SET closing_stage = ?
      WHERE id = ?
        AND status = 'closed';
    `,
    stage,
    cycleId
  );

  return getCycleById(
    cycleId
  );
}

export async function resolveCycleClosing(
  cycleId: number
) {
  const cycle =
    await getCycleById(
      cycleId
    );

  if (!cycle) {
    throw new Error(
      "Ciclo não encontrado."
    );
  }

  if (
    cycle.status !== "closed" ||
    cycle.resultCents === null
  ) {
    throw new Error(
      "O ciclo ainda não foi fechado."
    );
  }

  if (
    cycle.resultCents !== 0 &&
    !cycle.closingDecision
  ) {
    throw new Error(
      "O fechamento ainda não possui uma decisão financeira."
    );
  }

  await database.runAsync(
    `
      UPDATE cycles
      SET closing_stage = 'resolved'
      WHERE id = ?;
    `,
    cycleId
  );

  return getCycleById(
    cycleId
  );
}

export async function getCompletedCyclesCount() {
  const row =
    await database.getFirstAsync<CountRow>(
      `
        SELECT COUNT(*) AS total
        FROM cycles c
        WHERE c.status = 'closed'
          AND c.is_partial = 0
          AND EXISTS (
            SELECT 1
            FROM transactions t
            WHERE t.cycle_id = c.id
              AND t.status = 'posted'
          );
      `
    );

  return row?.total ?? 0;
}

export async function getCompletedCyclesCountThrough(
  cycle: StoredCycle
) {
  const row =
    await database.getFirstAsync<CountRow>(
      `
        SELECT COUNT(*) AS total
        FROM cycles c
        WHERE c.status = 'closed'
          AND c.is_partial = 0
          AND (
            c.year < ?
            OR (
              c.year = ?
              AND c.month <= ?
            )
          )
          AND EXISTS (
            SELECT 1
            FROM transactions t
            WHERE t.cycle_id = c.id
              AND t.status = 'posted'
          );
      `,
      cycle.year,
      cycle.year,
      cycle.month
    );

  return row?.total ?? 0;
}

export async function getQualifiedCyclesCount() {
  const row =
    await database.getFirstAsync<CountRow>(
      `
        SELECT COUNT(*) AS total
        FROM cycles
        WHERE status = 'closed'
          AND is_partial = 0
          AND qualified_achievement = 1;
      `
    );

  return row?.total ?? 0;
}

export async function getQualifiedCyclesCountThrough(
  cycle: StoredCycle
) {
  const row =
    await database.getFirstAsync<CountRow>(
      `
        SELECT COUNT(*) AS total
        FROM cycles
        WHERE status = 'closed'
          AND is_partial = 0
          AND qualified_achievement = 1
          AND (
            year < ?
            OR (
              year = ?
              AND month <= ?
            )
          );
      `,
      cycle.year,
      cycle.year,
      cycle.month
    );

  return row?.total ?? 0;
}