import { database } from "./database";
import {
  agendarNotificacaoMovimentacaoAgendada,
  cancelarNotificacaoMovimentacaoAgendada,
  cancelarTodasNotificacoesMovimentacoesAgendadas,
  notifyScheduledTransactionPosted,
} from "../notifications/notifications";

export type TransactionType =
  | "income"
  | "expense"
  | "transfer";

export type TransactionBucket =
  | "monthly_money"
  | "vault";

export type TransactionStatus =
  | "posted"
  | "scheduled";

type TransactionDataParams = {
  type: TransactionType;
  amountCents: number;
  date: Date;
  category?: string | null;
  description?: string | null;
  bucket?: TransactionBucket | null;
  transferFrom?: TransactionBucket | null;
  transferTo?: TransactionBucket | null;
  countsTowardBudget?: boolean;
};

type CreateTransactionParams =
  TransactionDataParams;

type UpdateScheduledTransactionParams =
  TransactionDataParams & {
    id: number;
  };

type UpdatePostedTransactionParams =
  TransactionDataParams & {
    id: number;
  };

export type StoredTransaction = {
  id: number;
  type: TransactionType;
  amountCents: number;
  date: string;
  category: string | null;
  description: string | null;
  bucket: TransactionBucket | null;
  status: TransactionStatus;
  transferFrom: TransactionBucket | null;
  transferTo: TransactionBucket | null;
  countsTowardBudget: boolean;
};

type TransactionRow = {
  id: number;
  type: TransactionType;
  amount_cents: number;
  date: string;
  category: string | null;
  description: string | null;
  bucket: TransactionBucket | null;
  status: TransactionStatus;
  transfer_from: TransactionBucket | null;
  transfer_to: TransactionBucket | null;
  counts_toward_budget: number;
};

type TransactionWithCycleRow =
  TransactionRow & {
    cycle_id: number;
    cycle_year: number;
    cycle_month: number;
    cycle_status:
      | "open"
      | "closed";
  };

type ScheduledTransactionRow =
  TransactionRow & {
    cycle_id: number;
    cycle_year: number;
    cycle_month: number;
  };

type CycleRow = {
  id: number;
  status: "open" | "closed";
};

type MonthlyMoneyRow = {
  monthly_money_cents: number | null;
};

type InitialBalanceRow = {
  initial_monthly_balance_cents:
    | number
    | null;
};

type CarryRow = {
  carry_cents: number | null;
};

type VaultRow = {
  vault_cents: number | null;
};

const CLOSED_CYCLE_ERROR =
  "Não é possível registrar uma movimentação em um ciclo já fechado.";

const CLOSED_POSTED_TRANSACTION_ERROR =
  "Não é possível alterar uma movimentação de um ciclo já fechado.";

const NOT_POSTED_ERROR =
  "Esta movimentação não está mais disponível para edição.";

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

function isFutureDate(
  date: Date
) {
  const today =
    new Date();

  const selectedDate =
    new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

  const currentDate =
    new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

  return (
    selectedDate >
    currentDate
  );
}

function mapTransaction(
  row: TransactionRow
): StoredTransaction {
  return {
    id: row.id,
    type: row.type,
    amountCents:
      row.amount_cents,
    date: row.date,
    category:
      row.category,
    description:
      row.description,
    bucket:
      row.bucket,
    status:
      row.status,
    transferFrom:
      row.transfer_from,
    transferTo:
      row.transfer_to,
    countsTowardBudget:
      row.counts_toward_budget ===
      1,
  };
}

async function getOrCreateCycle(
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
    await database.getFirstAsync<CycleRow>(
      `
        SELECT
          id,
          status
        FROM cycles
        WHERE year = ?
          AND month = ?;
      `,
      year,
      month
    );

  if (!cycle) {
    throw new Error(
      "Não foi possível localizar o ciclo da movimentação."
    );
  }

  return cycle;
}

function validateOpenCycle(
  cycle: CycleRow
) {
  if (
    cycle.status === "closed"
  ) {
    throw new Error(
      CLOSED_CYCLE_ERROR
    );
  }
}

function validateTransactionData(
  params: TransactionDataParams
) {
  if (
    params.amountCents <= 0
  ) {
    throw new Error(
      "O valor da movimentação deve ser maior que zero."
    );
  }

  if (
    params.type === "transfer" &&
    (
      !params.transferFrom ||
      !params.transferTo ||
      params.transferFrom ===
        params.transferTo
    )
  ) {
    throw new Error(
      "A transferência precisa ter origem e destino diferentes."
    );
  }

  if (
    params.type !== "transfer" &&
    !params.bucket
  ) {
    throw new Error(
      "A movimentação precisa informar qual saldo será afetado."
    );
  }
}

async function getMonthlyMoneyBalance(
  cycleId: number,
  year: number,
  month: number,
  excludeTransactionId?: number
) {
  const totals =
    await database.getFirstAsync<MonthlyMoneyRow>(
      `
        SELECT
          COALESCE(
            SUM(
              CASE
                WHEN type = 'income'
                  AND bucket = 'monthly_money'
                  THEN amount_cents

                WHEN type = 'expense'
                  AND bucket = 'monthly_money'
                  THEN -amount_cents

                WHEN type = 'transfer'
                  AND transfer_to = 'monthly_money'
                  THEN amount_cents

                WHEN type = 'transfer'
                  AND transfer_from = 'monthly_money'
                  THEN -amount_cents

                ELSE 0
              END
            ),
            0
          ) AS monthly_money_cents
        FROM transactions
        WHERE cycle_id = ?
          AND status = 'posted'
          AND (
            ? IS NULL OR
            id <> ?
          );
      `,
      cycleId,
      excludeTransactionId ??
        null,
      excludeTransactionId ??
        null
    );

  const initialBalance =
    await database.getFirstAsync<InitialBalanceRow>(
      `
        SELECT
          COALESCE(
            initial_monthly_balance_cents,
            0
          ) AS initial_monthly_balance_cents
        FROM cycles
        WHERE id = ?
        LIMIT 1;
      `,
      cycleId
    );

  const previousMonthDate =
    new Date(
      year,
      month - 2,
      1
    );

  const previousYear =
    previousMonthDate.getFullYear();

  const previousMonth =
    previousMonthDate.getMonth() +
    1;

  const carry =
    await database.getFirstAsync<CarryRow>(
      `
        SELECT
          COALESCE(
            carry_cents,
            0
          ) AS carry_cents
        FROM cycles
        WHERE year = ?
          AND month = ?
          AND status = 'closed'
          AND closing_decision IS NOT NULL
        LIMIT 1;
      `,
      previousYear,
      previousMonth
    );

  return (
    (
      totals?.monthly_money_cents ??
      0
    ) +
    (
      initialBalance
        ?.initial_monthly_balance_cents ??
      0
    ) +
    (carry?.carry_cents ?? 0)
  );
}

async function getVaultBalance(
  excludeTransactionId?: number
) {
  const row =
    await database.getFirstAsync<VaultRow>(
      `
        SELECT
          (
            SELECT
              COALESCE(
                SUM(
                  CASE
                    WHEN type = 'income'
                      AND bucket = 'vault'
                      THEN amount_cents

                    WHEN type = 'expense'
                      AND bucket = 'vault'
                      THEN -amount_cents

                    WHEN type = 'transfer'
                      AND transfer_to = 'vault'
                      THEN amount_cents

                    WHEN type = 'transfer'
                      AND transfer_from = 'vault'
                      THEN -amount_cents

                    ELSE 0
                  END
                ),
                0
              )
            FROM transactions
            WHERE status = 'posted'
              AND (
                ? IS NULL OR
                id <> ?
              )
          )
          +
          (
            SELECT
              COALESCE(
                SUM(
                  CASE
                    WHEN closing_decision = 'positive_to_vault'
                      THEN COALESCE(result_cents, 0)

                    WHEN closing_decision = 'negative_from_vault'
                      THEN -COALESCE(vault_coverage_cents, 0)

                    ELSE 0
                  END
                ),
                0
              )
            FROM cycles
            WHERE status = 'closed'
          ) AS vault_cents;
      `,
      excludeTransactionId ??
        null,
      excludeTransactionId ??
        null
    );

  return Math.max(
    0,
    row?.vault_cents ?? 0
  );
}

function transactionUsesVault(
  transaction: {
    type: TransactionType;
    bucket: TransactionBucket | null;
    transfer_from: TransactionBucket | null;
  }
) {
  return (
    (
      transaction.type ===
        "expense" &&
      transaction.bucket ===
        "vault"
    ) ||
    (
      transaction.type ===
        "transfer" &&
      transaction.transfer_from ===
        "vault"
    )
  );
}

async function validatePostedBalance(
  params: TransactionDataParams,
  cycleId: number,
  year: number,
  month: number,
  excludeTransactionId?: number
) {
  if (
    params.type === "transfer" &&
    params.transferFrom ===
      "monthly_money" &&
    params.transferTo ===
      "vault"
  ) {
    const monthlyMoneyBalance =
      await getMonthlyMoneyBalance(
        cycleId,
        year,
        month,
        excludeTransactionId
      );

    if (
      params.amountCents >
      monthlyMoneyBalance
    ) {
      throw new Error(
        "Você só pode transferir para o Cofre o valor disponível no Dinheiro do mês."
      );
    }
  }

  const usesVault =
    (
      params.type === "expense" &&
      params.bucket === "vault"
    ) ||
    (
      params.type === "transfer" &&
      params.transferFrom ===
        "vault"
    );

  if (usesVault) {
    const vaultBalance =
      await getVaultBalance(
        excludeTransactionId
      );

    if (
      params.amountCents >
      vaultBalance
    ) {
      throw new Error(
        "O Cofre não possui saldo suficiente para esta movimentação."
      );
    }
  }
}

async function getTransactionWithCycle(
  id: number
) {
  return database.getFirstAsync<TransactionWithCycleRow>(
    `
      SELECT
        t.id,
        t.type,
        t.amount_cents,
        t.date,
        t.category,
        t.description,
        t.bucket,
        t.status,
        t.transfer_from,
        t.transfer_to,
        t.counts_toward_budget,
        t.cycle_id,
        c.year AS cycle_year,
        c.month AS cycle_month,
        c.status AS cycle_status
      FROM transactions t
      INNER JOIN cycles c
        ON c.id = t.cycle_id
      WHERE t.id = ?
      LIMIT 1;
    `,
    id
  );
}

export async function sincronizarNotificacoesMovimentacoesAgendadas() {
  await cancelarTodasNotificacoesMovimentacoesAgendadas();

  const rows =
    await database.getAllAsync<TransactionRow>(
      `
        SELECT
          id,
          type,
          amount_cents,
          date,
          category,
          description,
          bucket,
          status,
          transfer_from,
          transfer_to,
          counts_toward_budget
        FROM transactions
        WHERE status = 'scheduled'
        ORDER BY
          date ASC,
          id ASC;
      `
    );

  for (
    const transaction of
    rows
  ) {
    await agendarNotificacaoMovimentacaoAgendada({
      id:
        transaction.id,
      type:
        transaction.type,
      amountCents:
        transaction.amount_cents,
      date:
        transaction.date,
    });
  }
}

export async function cancelarNotificacoesMovimentacoesAgendadas() {
  await cancelarTodasNotificacoesMovimentacoesAgendadas();
}

export async function postDueScheduledTransactions() {
  const today =
    formatDateForDatabase(
      new Date()
    );

  const dueTransactions =
    await database.getAllAsync<ScheduledTransactionRow>(
      `
        SELECT
          t.id,
          t.type,
          t.amount_cents,
          t.date,
          t.category,
          t.description,
          t.bucket,
          t.status,
          t.transfer_from,
          t.transfer_to,
          t.counts_toward_budget,
          t.cycle_id,
          c.year AS cycle_year,
          c.month AS cycle_month
        FROM transactions t
        INNER JOIN cycles c
          ON c.id = t.cycle_id
        WHERE t.status = 'scheduled'
          AND t.date <= ?
          AND c.status = 'open'
        ORDER BY
          t.date ASC,
          t.id ASC;
      `,
      today
    );

  for (
    const transaction of
    dueTransactions
  ) {
    const isMonthlyToVaultTransfer =
      transaction.type ===
        "transfer" &&
      transaction.transfer_from ===
        "monthly_money" &&
      transaction.transfer_to ===
        "vault";

    if (
      isMonthlyToVaultTransfer
    ) {
      const monthlyMoneyBalance =
        await getMonthlyMoneyBalance(
          transaction.cycle_id,
          transaction.cycle_year,
          transaction.cycle_month
        );

      if (
        transaction.amount_cents >
        monthlyMoneyBalance
      ) {
        continue;
      }
    }

    if (
      transactionUsesVault(
        transaction
      )
    ) {
      const vaultBalance =
        await getVaultBalance();

      if (
        transaction.amount_cents >
        vaultBalance
      ) {
        continue;
      }
    }

    const result =
      await database.runAsync(
        `
          UPDATE transactions
          SET status = 'posted'
          WHERE id = ?
            AND status = 'scheduled';
        `,
        transaction.id
      );

    if (
      result.changes > 0
    ) {
      await notifyScheduledTransactionPosted({
        id: transaction.id,
        type: transaction.type,
        amountCents:
          transaction.amount_cents,
      });
    }
  }
}

export async function createTransaction({
  type,
  amountCents,
  date,
  category = null,
  description = null,
  bucket = null,
  transferFrom = null,
  transferTo = null,
  countsTowardBudget = true,
}: CreateTransactionParams) {
  const params: TransactionDataParams = {
    type,
    amountCents,
    date,
    category,
    description,
    bucket,
    transferFrom,
    transferTo,
    countsTowardBudget,
  };

  validateTransactionData(
    params
  );

  const year =
    date.getFullYear();

  const month =
    date.getMonth() + 1;

  const cycle =
    await getOrCreateCycle(
      year,
      month
    );

  validateOpenCycle(
    cycle
  );

  const status: TransactionStatus =
    isFutureDate(date)
      ? "scheduled"
      : "posted";

  if (
    status === "posted"
  ) {
    await validatePostedBalance(
      params,
      cycle.id,
      year,
      month
    );
  }

  const result =
    await database.runAsync(
      `
        INSERT INTO transactions (
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
          counts_toward_budget
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `,
      cycle.id,
      type,
      amountCents,
      formatDateForDatabase(
        date
      ),
      category,
      description?.trim() ||
        null,
      type === "transfer"
        ? null
        : bucket,
      status,
      type === "transfer"
        ? transferFrom
        : null,
      type === "transfer"
        ? transferTo
        : null,
      type === "expense" &&
      !countsTowardBudget
        ? 0
        : 1
    );

  if (
    status === "scheduled"
  ) {
    await agendarNotificacaoMovimentacaoAgendada({
      id:
        result.lastInsertRowId,
      type,
      amountCents,
      date:
        formatDateForDatabase(
          date
        ),
    });
  }
}

export async function getTransactions() {
  await postDueScheduledTransactions();

  const rows =
    await database.getAllAsync<TransactionRow>(
      `
        SELECT
          id,
          type,
          amount_cents,
          date,
          category,
          description,
          bucket,
          status,
          transfer_from,
          transfer_to,
          counts_toward_budget
        FROM transactions
        WHERE status = 'posted'
        ORDER BY
          date DESC,
          id DESC;
      `
    );

  return rows.map(
    mapTransaction
  );
}

export async function getPostedTransactionById(
  id: number
) {
  const row =
    await database.getFirstAsync<TransactionRow>(
      `
        SELECT
          id,
          type,
          amount_cents,
          date,
          category,
          description,
          bucket,
          status,
          transfer_from,
          transfer_to,
          counts_toward_budget
        FROM transactions
        WHERE id = ?
          AND status = 'posted'
        LIMIT 1;
      `,
      id
    );

  if (!row) {
    return null;
  }

  return mapTransaction(
    row
  );
}

export async function updatePostedTransaction({
  id,
  type,
  amountCents,
  date,
  category = null,
  description = null,
  bucket = null,
  transferFrom = null,
  transferTo = null,
  countsTowardBudget = true,
}: UpdatePostedTransactionParams) {
  const current =
    await getTransactionWithCycle(
      id
    );

  if (
    !current ||
    current.status !== "posted"
  ) {
    throw new Error(
      NOT_POSTED_ERROR
    );
  }

  if (
    current.cycle_status ===
    "closed"
  ) {
    throw new Error(
      CLOSED_POSTED_TRANSACTION_ERROR
    );
  }

  if (
    isFutureDate(date)
  ) {
    throw new Error(
      "Uma movimentação já registrada não pode ser movida para uma data futura."
    );
  }

  const params: TransactionDataParams = {
    type,
    amountCents,
    date,
    category,
    description,
    bucket,
    transferFrom,
    transferTo,
    countsTowardBudget,
  };

  validateTransactionData(
    params
  );

  const year =
    date.getFullYear();

  const month =
    date.getMonth() + 1;

  const destinationCycle =
    await getOrCreateCycle(
      year,
      month
    );

  if (
    destinationCycle.status ===
    "closed"
  ) {
    throw new Error(
      CLOSED_POSTED_TRANSACTION_ERROR
    );
  }

  await validatePostedBalance(
    params,
    destinationCycle.id,
    year,
    month,
    id
  );

  const result =
    await database.runAsync(
      `
        UPDATE transactions
        SET
          cycle_id = ?,
          type = ?,
          amount_cents = ?,
          date = ?,
          category = ?,
          description = ?,
          bucket = ?,
          status = 'posted',
          transfer_from = ?,
          transfer_to = ?,
          counts_toward_budget = ?
        WHERE id = ?
          AND status = 'posted';
      `,
      destinationCycle.id,
      type,
      amountCents,
      formatDateForDatabase(
        date
      ),
      category,
      description?.trim() ||
        null,
      type === "transfer"
        ? null
        : bucket,
      type === "transfer"
        ? transferFrom
        : null,
      type === "transfer"
        ? transferTo
        : null,
      type === "expense" &&
      !countsTowardBudget
        ? 0
        : 1,
      id
    );

  if (
    result.changes === 0
  ) {
    throw new Error(
      NOT_POSTED_ERROR
    );
  }
}

export async function deletePostedTransaction(
  id: number
) {
  const current =
    await getTransactionWithCycle(
      id
    );

  if (
    !current ||
    current.status !== "posted"
  ) {
    throw new Error(
      NOT_POSTED_ERROR
    );
  }

  if (
    current.cycle_status ===
    "closed"
  ) {
    throw new Error(
      CLOSED_POSTED_TRANSACTION_ERROR
    );
  }

  const result =
    await database.runAsync(
      `
        DELETE FROM transactions
        WHERE id = ?
          AND status = 'posted';
      `,
      id
    );

  if (
    result.changes === 0
  ) {
    throw new Error(
      NOT_POSTED_ERROR
    );
  }
}

export async function getScheduledTransactions() {
  await postDueScheduledTransactions();

  const rows =
    await database.getAllAsync<TransactionRow>(
      `
        SELECT
          id,
          type,
          amount_cents,
          date,
          category,
          description,
          bucket,
          status,
          transfer_from,
          transfer_to,
          counts_toward_budget
        FROM transactions
        WHERE status = 'scheduled'
        ORDER BY
          date ASC,
          id ASC;
      `
    );

  return rows.map(
    mapTransaction
  );
}

export async function getScheduledTransactionById(
  id: number
) {
  await postDueScheduledTransactions();

  const row =
    await database.getFirstAsync<TransactionRow>(
      `
        SELECT
          id,
          type,
          amount_cents,
          date,
          category,
          description,
          bucket,
          status,
          transfer_from,
          transfer_to,
          counts_toward_budget
        FROM transactions
        WHERE id = ?
          AND status = 'scheduled'
        LIMIT 1;
      `,
      id
    );

  if (!row) {
    return null;
  }

  return mapTransaction(
    row
  );
}

export async function updateScheduledTransaction({
  id,
  type,
  amountCents,
  date,
  category = null,
  description = null,
  bucket = null,
  transferFrom = null,
  transferTo = null,
  countsTowardBudget = true,
}: UpdateScheduledTransactionParams) {
  const current =
    await database.getFirstAsync<{
      id: number;
      status: TransactionStatus;
    }>(
      `
        SELECT
          id,
          status
        FROM transactions
        WHERE id = ?
        LIMIT 1;
      `,
      id
    );

  if (!current) {
    throw new Error(
      "Movimentação não encontrada."
    );
  }

  if (
    current.status !==
    "scheduled"
  ) {
    throw new Error(
      "Esta movimentação não está mais pendente."
    );
  }

  const params: TransactionDataParams = {
    type,
    amountCents,
    date,
    category,
    description,
    bucket,
    transferFrom,
    transferTo,
    countsTowardBudget,
  };

  validateTransactionData(
    params
  );

  const year =
    date.getFullYear();

  const month =
    date.getMonth() + 1;

  const cycle =
    await getOrCreateCycle(
      year,
      month
    );

  validateOpenCycle(
    cycle
  );

  const status: TransactionStatus =
    isFutureDate(date)
      ? "scheduled"
      : "posted";

  if (
    status === "posted"
  ) {
    await validatePostedBalance(
      params,
      cycle.id,
      year,
      month
    );
  }

  const result =
    await database.runAsync(
      `
        UPDATE transactions
        SET
          cycle_id = ?,
          type = ?,
          amount_cents = ?,
          date = ?,
          category = ?,
          description = ?,
          bucket = ?,
          status = ?,
          transfer_from = ?,
          transfer_to = ?,
          counts_toward_budget = ?
        WHERE id = ?
          AND status = 'scheduled';
      `,
      cycle.id,
      type,
      amountCents,
      formatDateForDatabase(
        date
      ),
      category,
      description?.trim() ||
        null,
      type === "transfer"
        ? null
        : bucket,
      status,
      type === "transfer"
        ? transferFrom
        : null,
      type === "transfer"
        ? transferTo
        : null,
      type === "expense" &&
      !countsTowardBudget
        ? 0
        : 1,
      id
    );

  if (
    result.changes === 0
  ) {
    throw new Error(
      "Esta movimentação não está mais pendente."
    );
  }

  await cancelarNotificacaoMovimentacaoAgendada(
    id
  );

  if (
    status === "scheduled"
  ) {
    await agendarNotificacaoMovimentacaoAgendada({
      id,
      type,
      amountCents,
      date:
        formatDateForDatabase(
          date
        ),
    });

    return;
  }

  await notifyScheduledTransactionPosted({
    id,
    type,
    amountCents,
  });
}

export async function cancelScheduledTransaction(
  id: number
) {
  const result =
    await database.runAsync(
      `
        DELETE FROM transactions
        WHERE id = ?
          AND status = 'scheduled';
      `,
      id
    );

  if (
    result.changes === 0
  ) {
    throw new Error(
      "Esta movimentação não está mais pendente."
    );
  }

  await cancelarNotificacaoMovimentacaoAgendada(
    id
  );
}