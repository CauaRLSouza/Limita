import { database } from "./database";

export type NotificationHistoryType =
  | "special_theme"
  | "recurring_income"
  | "scheduled_transaction"
  | "cycle"
  | "progress";

export type StoredNotification = {
  id: number;
  eventKey: string;
  type: NotificationHistoryType;
  title: string;
  body: string;
  occurredAt: string;
  read: boolean;
};

type NotificationRow = {
  id: number;
  event_key: string;
  type: NotificationHistoryType;
  title: string;
  body: string;
  occurred_at: string;
  is_read: number;
};

type CreateNotificationParams = {
  eventKey: string;
  type: NotificationHistoryType;
  title: string;
  body: string;
  occurredAt?: Date;
};

function formatLocalDateTime(
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

  const hour = String(
    date.getHours()
  ).padStart(2, "0");

  const minute = String(
    date.getMinutes()
  ).padStart(2, "0");

  const second = String(
    date.getSeconds()
  ).padStart(2, "0");

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

function mapNotification(
  row: NotificationRow
): StoredNotification {
  return {
    id: row.id,
    eventKey: row.event_key,
    type: row.type,
    title: row.title,
    body: row.body,
    occurredAt: row.occurred_at,
    read: row.is_read === 1,
  };
}

export async function ensureNotificationHistoryTable() {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_key TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL CHECK (
        type IN (
          'special_theme',
          'recurring_income',
          'scheduled_transaction',
          'cycle',
          'progress'
        )
      ),
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      occurred_at TEXT NOT NULL,
      is_read INTEGER NOT NULL DEFAULT 0 CHECK (
        is_read IN (0, 1)
      ),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_notifications_occurred_at
    ON notifications(occurred_at);

    CREATE INDEX IF NOT EXISTS idx_notifications_is_read
    ON notifications(is_read);
  `);
}

export async function createNotificationHistory({
  eventKey,
  type,
  title,
  body,
  occurredAt = new Date(),
}: CreateNotificationParams) {
  await ensureNotificationHistoryTable();

  const result =
    await database.runAsync(
      `
        INSERT OR IGNORE INTO notifications (
          event_key,
          type,
          title,
          body,
          occurred_at,
          is_read
        )
        VALUES (?, ?, ?, ?, ?, 0);
      `,
      eventKey,
      type,
      title,
      body,
      formatLocalDateTime(
        occurredAt
      )
    );

  return result.changes > 0;
}

export async function getNotificationHistory() {
  await ensureNotificationHistoryTable();

  const now =
    formatLocalDateTime(
      new Date()
    );

  const rows =
    await database.getAllAsync<NotificationRow>(
      `
        SELECT
          id,
          event_key,
          type,
          title,
          body,
          occurred_at,
          is_read
        FROM notifications
        WHERE occurred_at <= ?
        ORDER BY
          occurred_at DESC,
          id DESC;
      `,
      now
    );

  return rows.map(
    mapNotification
  );
}

export async function markNotificationAsRead(
  id: number
) {
  await ensureNotificationHistoryTable();

  await database.runAsync(
    `
      UPDATE notifications
      SET is_read = 1
      WHERE id = ?;
    `,
    id
  );
}

export async function markNotificationAsUnread(
  id: number
) {
  await ensureNotificationHistoryTable();

  await database.runAsync(
    `
      UPDATE notifications
      SET is_read = 0
      WHERE id = ?;
    `,
    id
  );
}

export async function markAllNotificationsAsRead() {
  await ensureNotificationHistoryTable();

  await database.runAsync(
    `
      UPDATE notifications
      SET is_read = 1
      WHERE occurred_at <= ?;
    `,
    formatLocalDateTime(
      new Date()
    )
  );
}