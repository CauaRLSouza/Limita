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
    await database.getFirstAsync<{
      id: number;
    }>(
      `
        SELECT id
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

  return cycle.id;
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
        AND date <= ?;
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

  const cycleId = await getOrCreateCycle(
    date.getFullYear(),
    date.getMonth() + 1
  );

  const status: TransactionStatus =
    isFutureDate(date)
      ? "scheduled"
      : "posted";

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
    cycleId,
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