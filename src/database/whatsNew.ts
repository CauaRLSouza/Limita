import { database } from "./database";

export const WHATS_NEW_RELEASES = {
  TEST_DRIVE:
    "update_2026_10_test_drive",
  GRANDES_EXTRAS:
    "update_2026_10_grandes_extras",
} as const;

export const CURRENT_WHATS_NEW_RELEASE =
  WHATS_NEW_RELEASES.TEST_DRIVE;

export type WhatsNewReleaseKey =
  (typeof WHATS_NEW_RELEASES)[keyof typeof WHATS_NEW_RELEASES];

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

export async function shouldShowWhatsNew(
  releaseKey = CURRENT_WHATS_NEW_RELEASE
) {
  return !(
    await hasSeenWhatsNew(
      releaseKey
    )
  );
}