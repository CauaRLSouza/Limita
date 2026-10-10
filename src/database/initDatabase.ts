import { database } from "./database";

type TableColumn = {
  name: string;
};

type TableDefinition = {
  sql: string | null;
};

type ColumnMigration = {
  name: string;
  definition: string;
};

async function columnExists(table: string, column: string) {
  const columns = await database.getAllAsync<TableColumn>(
    `PRAGMA table_info(${table});`
  );

  return columns.some((item) => item.name === column);
}

async function ensureColumns(
  table: string,
  columns: ColumnMigration[]
) {
  for (const column of columns) {
    if (!(await columnExists(table, column.name))) {
      await database.execAsync(
        `ALTER TABLE ${table} ADD COLUMN ${column.name} ${column.definition};`
      );
    }
  }
}

async function migrateTransactions() {
  const hasBucket = await columnExists("transactions", "bucket");

  await ensureColumns("transactions", [
    { name: "bucket", definition: "TEXT" },
    { name: "status", definition: "TEXT NOT NULL DEFAULT 'posted'" },
    { name: "recurring_income_id", definition: "INTEGER" },
    { name: "recurring_income_period", definition: "TEXT" },
    {
      name: "counts_toward_budget",
      definition: "INTEGER NOT NULL DEFAULT 1",
    },
  ]);

  if (!hasBucket) {
    await database.runAsync(`
      UPDATE transactions
      SET bucket = 'monthly_money'
      WHERE type IN ('income', 'expense')
        AND bucket IS NULL;
    `);
  }

  await database.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_transactions_status
      ON transactions(status);

    CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_recurring_income_period
      ON transactions(recurring_income_id, recurring_income_period)
      WHERE recurring_income_id IS NOT NULL
        AND recurring_income_period IS NOT NULL;
  `);
}

async function migrateCycles() {
  await ensureColumns("cycles", [
    { name: "closed_at", definition: "TEXT" },
    { name: "external_income_cents", definition: "INTEGER" },
    { name: "expense_cents", definition: "INTEGER" },
    { name: "result_cents", definition: "INTEGER" },
    { name: "preserved_rate", definition: "REAL" },
    { name: "qualified_achievement", definition: "INTEGER" },
    { name: "closing_stage", definition: "TEXT" },
    { name: "closing_decision", definition: "TEXT" },
    { name: "carry_cents", definition: "INTEGER NOT NULL DEFAULT 0" },
    {
      name: "vault_coverage_cents",
      definition: "INTEGER NOT NULL DEFAULT 0",
    },
    { name: "is_partial", definition: "INTEGER NOT NULL DEFAULT 0" },
    {
      name: "initial_monthly_balance_cents",
      definition: "INTEGER NOT NULL DEFAULT 0",
    },
  ]);
}

async function migrateBudgets() {
  const definition = await database.getFirstAsync<TableDefinition>(`
    SELECT sql
    FROM sqlite_master
    WHERE type = 'table'
      AND name = 'budgets';
  `);

  const supportsCustom = definition?.sql?.includes("'custom'") ?? false;
  const hasCustomDays = await columnExists("budgets", "custom_days");

  if (supportsCustom && hasCustomDays) return;

  await database.withExclusiveTransactionAsync(async (tx) => {
    await tx.execAsync(`
      CREATE TABLE budgets_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
        period TEXT NOT NULL CHECK (
          period IN ('daily', 'weekly', 'monthly', 'custom')
        ),
        custom_days INTEGER CHECK (
          custom_days IS NULL OR custom_days >= 1
        ),
        auto_repeat INTEGER NOT NULL DEFAULT 1 CHECK (
          auto_repeat IN (0, 1)
        ),
        start_date TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CHECK (
          (period = 'custom' AND custom_days IS NOT NULL)
          OR
          (period <> 'custom' AND custom_days IS NULL)
        )
      );
    `);

    await tx.execAsync(`
      INSERT INTO budgets_new (
        id, name, amount_cents, period, custom_days,
        auto_repeat, start_date, created_at, updated_at
      )
      SELECT
        id, name, amount_cents, period,
        ${hasCustomDays ? "custom_days" : "NULL"},
        auto_repeat, start_date, created_at, updated_at
      FROM budgets;

      DROP TABLE budgets;

      ALTER TABLE budgets_new RENAME TO budgets;

      CREATE INDEX IF NOT EXISTS idx_budgets_start_date
        ON budgets(start_date);
    `);
  });
}

async function migrateFinancialReadings() {
  await ensureColumns("financial_readings", [
    { name: "read_at", definition: "TEXT" },
  ]);

  await database.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_financial_readings_unread
      ON financial_readings(dismissed_at, read_at, priority, created_at);
  `);
}

async function migrateFinancialReadingStates() {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS financial_reading_states (
      rule_key TEXT NOT NULL,
      context_key TEXT NOT NULL,
      state TEXT NOT NULL CHECK (
        state IN ('neutral', 'positive', 'attention')
      ),
      event_count INTEGER NOT NULL DEFAULT 0 CHECK (event_count >= 0),
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (rule_key, context_key)
    );

    CREATE INDEX IF NOT EXISTS idx_financial_reading_states_updated
      ON financial_reading_states(updated_at);
  `);
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
      is_partial INTEGER NOT NULL DEFAULT 0 CHECK (is_partial IN (0, 1)),
      initial_monthly_balance_cents INTEGER NOT NULL DEFAULT 0 CHECK (
        initial_monthly_balance_cents >= 0
      ),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(year, month)
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cycle_id INTEGER NOT NULL,
      type TEXT NOT NULL CHECK (
        type IN ('income', 'expense', 'transfer')
      ),
      amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
      date TEXT NOT NULL,
      category TEXT,
      description TEXT,
      bucket TEXT CHECK (
        bucket IS NULL OR bucket IN ('monthly_money', 'vault')
      ),
      status TEXT NOT NULL DEFAULT 'posted' CHECK (
        status IN ('posted', 'scheduled')
      ),
      transfer_from TEXT CHECK (
        transfer_from IS NULL OR transfer_from IN ('monthly_money', 'vault')
      ),
      transfer_to TEXT CHECK (
        transfer_to IS NULL OR transfer_to IN ('monthly_money', 'vault')
      ),
      recurring_income_id INTEGER,
      recurring_income_period TEXT,
      counts_toward_budget INTEGER NOT NULL DEFAULT 1 CHECK (
        counts_toward_budget IN (0, 1)
      ),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cycle_id) REFERENCES cycles(id) ON DELETE RESTRICT,
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
      ),
      CHECK (
        (
          recurring_income_id IS NULL
          AND recurring_income_period IS NULL
        )
        OR
        (
          recurring_income_id IS NOT NULL
          AND recurring_income_period IS NOT NULL
        )
      )
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
      period TEXT NOT NULL CHECK (
        period IN ('daily', 'weekly', 'monthly', 'custom')
      ),
      custom_days INTEGER CHECK (
        custom_days IS NULL OR custom_days >= 1
      ),
      auto_repeat INTEGER NOT NULL DEFAULT 1 CHECK (
        auto_repeat IN (0, 1)
      ),
      start_date TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CHECK (
        (period = 'custom' AND custom_days IS NOT NULL)
        OR
        (period <> 'custom' AND custom_days IS NULL)
      )
    );

    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      name TEXT NOT NULL,
      no_occupation INTEGER NOT NULL DEFAULT 0 CHECK (
        no_occupation IN (0, 1)
      ),
      onboarding_completed INTEGER NOT NULL DEFAULT 0 CHECK (
        onboarding_completed IN (0, 1)
      ),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS professions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS recurring_incomes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
      receipt_type TEXT NOT NULL CHECK (
        receipt_type IN ('first_day', 'first_business_day', 'custom')
      ),
      custom_day INTEGER CHECK (
        custom_day IS NULL OR (custom_day >= 1 AND custom_day <= 31)
      ),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CHECK (
        (receipt_type = 'custom' AND custom_day IS NOT NULL)
        OR
        (receipt_type <> 'custom' AND custom_day IS NULL)
      )
    );

    CREATE TABLE IF NOT EXISTS financial_readings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rule_key TEXT NOT NULL,
      context_key TEXT NOT NULL,
      kind TEXT NOT NULL CHECK (
        kind IN ('positive', 'attention', 'informative')
      ),
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      detail TEXT NOT NULL,
      priority INTEGER NOT NULL DEFAULT 0,
      action_type TEXT,
      action_label TEXT,
      read_at TEXT,
      dismissed_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(rule_key, context_key)
    );

    CREATE TABLE IF NOT EXISTS financial_reading_states (
      rule_key TEXT NOT NULL,
      context_key TEXT NOT NULL,
      state TEXT NOT NULL CHECK (
        state IN ('neutral', 'positive', 'attention')
      ),
      event_count INTEGER NOT NULL DEFAULT 0 CHECK (event_count >= 0),
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (rule_key, context_key)
    );

    CREATE INDEX IF NOT EXISTS idx_transactions_cycle_id
      ON transactions(cycle_id);

    CREATE INDEX IF NOT EXISTS idx_transactions_date
      ON transactions(date);

    CREATE INDEX IF NOT EXISTS idx_budgets_start_date
      ON budgets(start_date);

    CREATE INDEX IF NOT EXISTS idx_financial_readings_active
      ON financial_readings(dismissed_at, priority, created_at);

    CREATE INDEX IF NOT EXISTS idx_financial_readings_unread
      ON financial_readings(dismissed_at, read_at, priority, created_at);

    CREATE INDEX IF NOT EXISTS idx_financial_reading_states_updated
      ON financial_reading_states(updated_at);
  `);

  await migrateTransactions();
  await migrateCycles();
  await migrateBudgets();
  await migrateFinancialReadings();
  await migrateFinancialReadingStates();

  const now = new Date();

  await database.runAsync(
    `
      INSERT OR IGNORE INTO cycles (year, month)
      VALUES (?, ?);
    `,
    now.getFullYear(),
    now.getMonth() + 1
  );
}