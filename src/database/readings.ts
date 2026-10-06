import { database } from "./database";

export type FinancialReadingKind =
  | "positive"
  | "attention"
  | "informative";

export type FinancialReadingAction =
  | "budget"
  | "statement"
  | "history"
  | null;

export type FinancialReading = {
  id: number;
  ruleKey: string;
  contextKey: string;
  kind: FinancialReadingKind;
  title: string;
  summary: string;
  detail: string;
  priority: number;
  actionType: FinancialReadingAction;
  actionLabel: string | null;
  readAt: string | null;
  dismissedAt: string | null;
  createdAt: string;
};

export type CreateFinancialReadingInput = {
  ruleKey: string;
  contextKey: string;
  kind: FinancialReadingKind;
  title: string;
  summary: string;
  detail: string;
  priority?: number;
  actionType?: FinancialReadingAction;
  actionLabel?: string | null;
};

type FinancialReadingRow = {
  id: number;
  rule_key: string;
  context_key: string;
  kind: FinancialReadingKind;
  title: string;
  summary: string;
  detail: string;
  priority: number;
  action_type: FinancialReadingAction;
  action_label: string | null;
  read_at: string | null;
  dismissed_at: string | null;
  created_at: string;
};

type CountRow = {
  total: number;
};

function mapFinancialReading(
  row: FinancialReadingRow
): FinancialReading {
  return {
    id: row.id,
    ruleKey: row.rule_key,
    contextKey: row.context_key,
    kind: row.kind,
    title: row.title,
    summary: row.summary,
    detail: row.detail,
    priority: row.priority,
    actionType: row.action_type,
    actionLabel: row.action_label,
    readAt: row.read_at,
    dismissedAt: row.dismissed_at,
    createdAt: row.created_at,
  };
}

export async function createFinancialReading(
  input: CreateFinancialReadingInput
) {
  const ruleKey =
    input.ruleKey.trim();

  const contextKey =
    input.contextKey.trim();

  const title =
    input.title.trim();

  const summary =
    input.summary.trim();

  const detail =
    input.detail.trim();

  if (
    !ruleKey ||
    !contextKey ||
    !title ||
    !summary ||
    !detail
  ) {
    throw new Error(
      "A Leitura do Límita possui dados inválidos."
    );
  }

  await database.runAsync(
    `
      INSERT OR IGNORE INTO financial_readings (
        rule_key,
        context_key,
        kind,
        title,
        summary,
        detail,
        priority,
        action_type,
        action_label
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    `,
    ruleKey,
    contextKey,
    input.kind,
    title,
    summary,
    detail,
    input.priority ?? 0,
    input.actionType ?? null,
    input.actionLabel?.trim() ||
      null
  );

  return getFinancialReadingByContext(
    ruleKey,
    contextKey
  );
}

export async function getFinancialReadingById(
  id: number
) {
  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    return null;
  }

  const row =
    await database.getFirstAsync<FinancialReadingRow>(
      `
        SELECT
          id,
          rule_key,
          context_key,
          kind,
          title,
          summary,
          detail,
          priority,
          action_type,
          action_label,
          read_at,
          dismissed_at,
          created_at
        FROM financial_readings
        WHERE id = ?
        LIMIT 1;
      `,
      id
    );

  return row
    ? mapFinancialReading(row)
    : null;
}

export async function getFinancialReadingByContext(
  ruleKey: string,
  contextKey: string
) {
  const row =
    await database.getFirstAsync<FinancialReadingRow>(
      `
        SELECT
          id,
          rule_key,
          context_key,
          kind,
          title,
          summary,
          detail,
          priority,
          action_type,
          action_label,
          read_at,
          dismissed_at,
          created_at
        FROM financial_readings
        WHERE rule_key = ?
          AND context_key = ?
        LIMIT 1;
      `,
      ruleKey,
      contextKey
    );

  return row
    ? mapFinancialReading(row)
    : null;
}

export async function getActiveFinancialReadings() {
  const rows =
    await database.getAllAsync<FinancialReadingRow>(
      `
        SELECT
          id,
          rule_key,
          context_key,
          kind,
          title,
          summary,
          detail,
          priority,
          action_type,
          action_label,
          read_at,
          dismissed_at,
          created_at
        FROM financial_readings
        WHERE dismissed_at IS NULL
        ORDER BY
          CASE
            WHEN read_at IS NULL
              THEN 0
            ELSE 1
          END ASC,
          priority DESC,
          created_at DESC,
          id DESC;
      `
    );

  return rows.map(
    mapFinancialReading
  );
}

export async function getUnreadFinancialReadingsCount() {
  const row =
    await database.getFirstAsync<CountRow>(
      `
        SELECT
          COUNT(*) AS total
        FROM financial_readings
        WHERE dismissed_at IS NULL
          AND read_at IS NULL;
      `
    );

  return row?.total ?? 0;
}

export async function markFinancialReadingAsRead(
  id: number
) {
  await database.runAsync(
    `
      UPDATE financial_readings
      SET read_at =
        COALESCE(
          read_at,
          CURRENT_TIMESTAMP
        )
      WHERE id = ?
        AND dismissed_at IS NULL;
    `,
    id
  );

  return getFinancialReadingById(
    id
  );
}

export async function dismissFinancialReading(
  id: number
) {
  await database.runAsync(
    `
      UPDATE financial_readings
      SET dismissed_at =
        COALESCE(
          dismissed_at,
          CURRENT_TIMESTAMP
        )
      WHERE id = ?;
    `,
    id
  );

  return getFinancialReadingById(
    id
  );
}