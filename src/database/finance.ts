import { database } from "./database";
import {
  postDueScheduledTransactions,
} from "./transactions";

export type FinancialSummary = {
  monthlyMoneyCents: number;
  vaultCents: number;
  currentCycleIncomeCents: number;
  currentCycleExpenseCents: number;
};

type CurrentCycleTotalsRow = {
  monthly_money_cents: number | null;
  income_cents: number | null;
  expense_cents: number | null;
};

type VaultRow = {
  vault_cents: number | null;
};

type CarryRow = {
  carry_cents: number | null;
};

export async function getFinancialSummary(): Promise<FinancialSummary> {
  await postDueScheduledTransactions();

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const currentCycle =
    await database.getFirstAsync<CurrentCycleTotalsRow>(
      `
        SELECT
          COALESCE(
            SUM(
              CASE
                WHEN t.type = 'income'
                  AND t.bucket = 'monthly_money'
                  THEN t.amount_cents

                WHEN t.type = 'expense'
                  AND t.bucket = 'monthly_money'
                  THEN -t.amount_cents

                WHEN t.type = 'transfer'
                  AND t.transfer_to = 'monthly_money'
                  THEN t.amount_cents

                WHEN t.type = 'transfer'
                  AND t.transfer_from = 'monthly_money'
                  THEN -t.amount_cents

                ELSE 0
              END
            ),
            0
          ) AS monthly_money_cents,

          COALESCE(
            SUM(
              CASE
                WHEN t.type = 'income'
                  THEN t.amount_cents
                ELSE 0
              END
            ),
            0
          ) AS income_cents,

          COALESCE(
            SUM(
              CASE
                WHEN t.type = 'expense'
                  THEN t.amount_cents
                ELSE 0
              END
            ),
            0
          ) AS expense_cents

        FROM transactions t
        INNER JOIN cycles c
          ON c.id = t.cycle_id

        WHERE t.status = 'posted'
          AND c.year = ?
          AND c.month = ?;
      `,
      year,
      month
    );

  const vault =
    await database.getFirstAsync<VaultRow>(
      `
        SELECT
          COALESCE(
            SUM(
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
            ),
            0
          )
          +
          COALESCE(
            (
              SELECT SUM(
                CASE
                  WHEN c2.closing_decision =
                    'positive_to_vault'
                    THEN c2.result_cents

                  WHEN c2.closing_decision =
                    'negative_from_vault'
                    THEN c2.result_cents

                  ELSE 0
                END
              )
              FROM cycles c2
              WHERE c2.status = 'closed'
                AND c2.closing_decision IN (
                  'positive_to_vault',
                  'negative_from_vault'
                )
            ),
            0
          ) AS vault_cents

        FROM transactions t
        WHERE t.status = 'posted';
      `
    );

  const carry =
    await database.getFirstAsync<CarryRow>(
      `
        SELECT COALESCE(
          (
            SELECT carry_cents
            FROM cycles
            WHERE status = 'closed'
              AND closing_decision IS NOT NULL
              AND (
                year < ?
                OR (
                  year = ?
                  AND month < ?
                )
              )
            ORDER BY year DESC, month DESC
            LIMIT 1
          ),
          0
        ) AS carry_cents;
      `,
      year,
      year,
      month
    );

  return {
    monthlyMoneyCents:
      (
        currentCycle
          ?.monthly_money_cents ??
        0
      ) +
      (carry?.carry_cents ?? 0),

    vaultCents:
      vault?.vault_cents ?? 0,

    currentCycleIncomeCents:
      currentCycle?.income_cents ??
      0,

    currentCycleExpenseCents:
      currentCycle?.expense_cents ??
      0,
  };
}