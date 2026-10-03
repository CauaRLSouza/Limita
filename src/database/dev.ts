import { database } from "./database";

export async function resetDevelopmentData() {
  if (!__DEV__) {
    throw new Error(
      "O reset de dados só pode ser usado em desenvolvimento."
    );
  }

  await database.withTransactionAsync(
    async () => {
      await database.runAsync(
        `DELETE FROM transactions;`
      );

      await database.runAsync(
        `DELETE FROM budgets;`
      );

      await database.runAsync(
        `DELETE FROM cycles;`
      );
    }
  );

  const now = new Date();

  await database.runAsync(
    `
      INSERT INTO cycles (
        year,
        month
      )
      VALUES (?, ?);
    `,
    now.getFullYear(),
    now.getMonth() + 1
  );
}