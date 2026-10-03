import { database } from "./database";

type TableColumn = {
  name: string;
};

async function columnExists(
  table: string,
  column: string
) {
  const columns =
    await database.getAllAsync<TableColumn>(
      `PRAGMA table_info(${table});`
    );

  return columns.some(
    (item) => item.name === column
  );
}

async function migrateTransactions() {
  const hasBucket =
    await columnExists(
      "transactions",
      "bucket"
    );

  if (!hasBucket) {
    await database.execAsync(`
      ALTER TABLE transactions
      ADD COLUMN bucket TEXT;
    `);

    await database.runAsync(`
      UPDATE transactions
      SET bucket = 'monthly_money'
      WHERE type IN ('income', 'expense')
        AND bucket IS NULL;
    `);
  }

  const hasStatus =
    await columnExists(
      "transactions",
      "status"
    );

  if (!hasStatus) {
    await database.execAsync(`
      ALTER TABLE transactions
      ADD COLUMN status TEXT NOT NULL DEFAULT 'posted';
    `);
  }

  await database.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_transactions_status
      ON transactions(status);
  `);
}

async function migrateCycles() {
  const hasClosedAt =
    await columnExists(
      "cycles",
      "closed_at"
    );

  if (!hasClosedAt) {
    await database.execAsync(`
      ALTER TABLE cycles
      ADD COLUMN closed_at TEXT;
    `);
  }

  const hasExternalIncomeCents =
    await columnExists(
      "cycles",
      "external_income_cents"
    );

  if (!hasExternalIncomeCents) {
    await database.execAsync(`
      ALTER TABLE cycles
      ADD COLUMN external_income_cents INTEGER;
    `);
  }

  const hasExpenseCents =
    await columnExists(
      "cycles",
      "expense_cents"
    );

  if (!hasExpenseCents) {
    await database.execAsync(`
      ALTER TABLE cycles
      ADD COLUMN expense_cents INTEGER;
    `);
  }

  const hasResultCents =
    await columnExists(
      "cycles",
      "result_cents"
    );

  if (!hasResultCents) {
    await database.execAsync(`
      ALTER TABLE cycles
      ADD COLUMN result_cents INTEGER;
    `);
  }

  const hasPreservedRate =
    await columnExists(
      "cycles",
      "preserved_rate"
    );

  if (!hasPreservedRate) {
    await database.execAsync(`
      ALTER TABLE cycles
      ADD COLUMN preserved_rate REAL;
    `);
  }

  const hasQualifiedAchievement =
    await columnExists(
      "cycles",
      "qualified_achievement"
    );

  if (!hasQualifiedAchievement) {
    await database.execAsync(`
      ALTER TABLE cycles
      ADD COLUMN qualified_achievement INTEGER;
    `);
  }

  const hasClosingStage =
    await columnExists(
      "cycles",
      "closing_stage"
    );

  if (!hasClosingStage) {
    await database.execAsync(`
      ALTER TABLE cycles
      ADD COLUMN closing_stage TEXT;
    `);
  }

  const hasClosingDecision =
    await columnExists(
      "cycles",
      "closing_decision"
    );

  if (!hasClosingDecision) {
    await database.execAsync(`
      ALTER TABLE cycles
      ADD COLUMN closing_decision TEXT;
    `);
  }

  const hasCarryCents =
    await columnExists(
      "cycles",
      "carry_cents"
    );

  if (!hasCarryCents) {
    await database.execAsync(`
      ALTER TABLE cycles
      ADD COLUMN carry_cents INTEGER NOT NULL DEFAULT 0;
    `);
  }

  const hasVaultCoverageCents =
    await columnExists(
      "cycles",
      "vault_coverage_cents"
    );

  if (!hasVaultCoverageCents) {
    await database.execAsync(`
      ALTER TABLE cycles
      ADD COLUMN vault_coverage_cents INTEGER NOT NULL DEFAULT 0;
    `);
  }
}

export async function initDatabase() {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS cycles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      year INTEGER NOT NULL,
      month INTEGER NOT NULL,

      status TEXT NOT NULL DEFAULT 'open',

      closed_at TEXT,

      external_income_cents INTEGER,
      expense_cents INTEGER,
      result_cents INTEGER,

      preserved_rate REAL,
      qualified_achievement INTEGER,

      closing_stage TEXT,
      closing_decision TEXT,

      carry_cents INTEGER NOT NULL DEFAULT 0,
      vault_coverage_cents INTEGER NOT NULL DEFAULT 0,

      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

      UNIQUE(year, month)
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cycle_id INTEGER NOT NULL,

      type TEXT NOT NULL CHECK (
        type IN ('income', 'expense', 'transfer')
      ),

      amount_cents INTEGER NOT NULL CHECK (
        amount_cents > 0
      ),

      date TEXT NOT NULL,
      category TEXT,
      description TEXT,

      bucket TEXT CHECK (
        bucket IS NULL OR
        bucket IN ('monthly_money', 'vault')
      ),

      status TEXT NOT NULL DEFAULT 'posted' CHECK (
        status IN ('posted', 'scheduled')
      ),

      transfer_from TEXT CHECK (
        transfer_from IS NULL OR
        transfer_from IN ('monthly_money', 'vault')
      ),

      transfer_to TEXT CHECK (
        transfer_to IS NULL OR
        transfer_to IN ('monthly_money', 'vault')
      ),

      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (cycle_id)
        REFERENCES cycles(id)
        ON DELETE RESTRICT,

      CHECK (
        (
          type = 'transfer'
          AND bucket IS NULL
          AND transfer_from IS NOT NULL
          AND transfer_to IS NOT NULL
          AND transfer_from <> transfer_to
        )
        OR
        (
          type <> 'transfer'
          AND bucket IS NOT NULL
          AND transfer_from IS NULL
          AND transfer_to IS NULL
        )
      )
    );

    CREATE INDEX IF NOT EXISTS idx_transactions_cycle_id
      ON transactions(cycle_id);

    CREATE INDEX IF NOT EXISTS idx_transactions_date
      ON transactions(date);
  `);

  await migrateTransactions();
  await migrateCycles();

  const now = new Date();
  const year =
    now.getFullYear();
  const month =
    now.getMonth() + 1;

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
}