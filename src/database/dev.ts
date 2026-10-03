import { database } from "./database";

export async function resetDevelopmentData() {
  if (!__DEV__) {
    throw new Error(
      "O reset de dados só pode ser usado em desenvolvimento."
    );
  }

  await database.withTransactionAsync(
    async () => {
      await database.runAsync(`
        DELETE FROM transactions;
      `);

      await database.runAsync(`
        DELETE FROM budgets;
      `);

      await database.runAsync(`
        DELETE FROM cycles;
      `);
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

export async function resetDevelopmentApp() {
  if (!__DEV__) {
    throw new Error(
      "O reset total só pode ser usado em desenvolvimento."
    );
  }

  await database.withTransactionAsync(
    async () => {
      await database.runAsync(`
        DELETE FROM transactions;
      `);

      await database.runAsync(`
        DELETE FROM budgets;
      `);

      await database.runAsync(`
        DELETE FROM cycles;
      `);

      await database.runAsync(`
        DELETE FROM recurring_incomes;
      `);

      await database.runAsync(`
        DELETE FROM professions;
      `);

      await database.runAsync(`
        DELETE FROM profile;
      `);
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