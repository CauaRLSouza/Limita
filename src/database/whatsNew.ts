import { database } from "./database";

export const CURRENT_WHATS_NEW_RELEASE =
  "update_2026_10_grandes";

type WhatsNewStateRow = {
  release_key: string;
  seen_at: string;
};

async function ensureWhatsNewTable() {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS whats_new_state (
      release_key TEXT PRIMARY KEY NOT NULL,
      seen_at TEXT NOT NULL
    );
  `);
}

export async function hasSeenWhatsNew(
  releaseKey = CURRENT_WHATS_NEW_RELEASE
) {
  await ensureWhatsNewTable();

  const row =
    await database.getFirstAsync<WhatsNewStateRow>(
      `
        SELECT
          release_key,
          seen_at
        FROM whats_new_state
        WHERE release_key = ?
        LIMIT 1
      `,
      [releaseKey]
    );

  return Boolean(row);
}

export async function markWhatsNewAsSeen(
  releaseKey = CURRENT_WHATS_NEW_RELEASE
) {
  await ensureWhatsNewTable();

  await database.runAsync(
    `
      INSERT OR REPLACE INTO whats_new_state (
        release_key,
        seen_at
      )
      VALUES (?, ?)
    `,
    [
      releaseKey,
      new Date().toISOString(),
    ]
  );
}

export async function shouldShowWhatsNew() {
  return !(await hasSeenWhatsNew());
}