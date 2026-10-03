import { database } from "./database";

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

type CreateTransactionParams = {
  type: TransactionType;
  amountCents: number;
  date: Date;
  category?: string | null;
  description?: string | null;
  bucket?: TransactionBucket | null;
  transferFrom?: TransactionBucket | null;
  transferTo?: TransactionBucket | null;
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
};

type CycleRow = {
  id: number;
  status: "open" | "closed";
};

type MonthlyMoneyRow = {
  monthly_money_cents: number | null;
};

type CarryRow = {
  carry_cents: number | null;
};

function formatDateForDatabase(date: Date) {
  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isFutureDate(date: Date) {
  const today = new Date();

  const selectedDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const currentDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  return selectedDate > currentDate;
}

function mapTransaction(
  row: TransactionRow
): StoredTransaction {
  return {
    id: row.id,
    type: row.type,
    amountCents: row.amount_cents,
    date: row.date,
    category: row.category,
    description: row.description,
    bucket: row.bucket,
    status: row.status,
    transferFrom: row.transfer_from,
    transferTo: row.transfer_to,
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
  if (cycle.status === "closed") {
    throw new Error(
      "Não é possível registrar uma movimentação em um ciclo já fechado."
    );
  }
}

async function getMonthlyMoneyBalance(
  cycleId: number,
  year: number,
  month: number
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
          AND status = 'posted';
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
    previousMonthDate.getMonth() + 1;

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
    (carry?.carry_cents ?? 0)
  );
}

export async function postDueScheduledTransactions() {
  const today = formatDateForDatabase(
    new Date()
  );

  await database.runAsync(
    `
      UPDATE transactions
      SET status = 'posted'
      WHERE status = 'scheduled'
        AND date <= ?
        AND EXISTS (
          SELECT 1
          FROM cycles
          WHERE cycles.id = transactions.cycle_id
            AND cycles.status = 'open'
        );
    `,
    today
  );
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
}: CreateTransactionParams) {
  if (amountCents <= 0) {
    throw new Error(
      "O valor da movimentação deve ser maior que zero."
    );
  }

  if (
    type === "transfer" &&
    (
      !transferFrom ||
      !transferTo ||
      transferFrom === transferTo
    )
  ) {
    throw new Error(
      "A transferência precisa ter origem e destino diferentes."
    );
  }

  if (
    type !== "transfer" &&
    !bucket
  ) {
    throw new Error(
      "A movimentação precisa informar qual saldo será afetado."
    );
  }

  const year =
    date.getFullYear();

  const month =
    date.getMonth() + 1;

  const cycle =
    await getOrCreateCycle(
      year,
      month
    );

  validateOpenCycle(cycle);

  const status: TransactionStatus =
    isFutureDate(date)
      ? "scheduled"
      : "posted";

  if (
    status === "posted" &&
    type === "transfer" &&
    transferFrom === "monthly_money" &&
    transferTo === "vault"
  ) {
    const monthlyMoneyBalance =
      await getMonthlyMoneyBalance(
        cycle.id,
        year,
        month
      );

    if (
      amountCents >
      monthlyMoneyBalance
    ) {
      throw new Error(
        "Você só pode transferir para o Cofre o valor disponível no Dinheiro do mês."
      );
    }
  }

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
        transfer_to
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `,
    cycle.id,
    type,
    amountCents,
    formatDateForDatabase(date),
    category,
    description?.trim() || null,
    type === "transfer"
      ? null
      : bucket,
    status,
    type === "transfer"
      ? transferFrom
      : null,
    type === "transfer"
      ? transferTo
      : null
  );
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
          transfer_to
        FROM transactions
        WHERE status = 'posted'
        ORDER BY date DESC, id DESC;
      `
    );

  return rows.map(mapTransaction);
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
          transfer_to
        FROM transactions
        WHERE status = 'scheduled'
        ORDER BY date ASC, id ASC;
      `
    );

  return rows.map(mapTransaction);
}