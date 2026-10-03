import { database } from "./database";

export type ReceiptType =
  | "first_day"
  | "first_business_day"
  | "custom";

export type Profession = {
  id: number;
  name: string;
};

export type RecurringIncome = {
  id: number;
  amountCents: number;
  receiptType: ReceiptType;
  customDay: number | null;
};

export type Profile = {
  name: string;
  noOccupation: boolean;
  onboardingCompleted: boolean;
  professions: Profession[];
  recurringIncomes: RecurringIncome[];
};

export type ProfileInput = {
  name: string;
  noOccupation: boolean;
  professions: string[];
};

export type RecurringIncomeInput = {
  amountCents: number;
  receiptType: ReceiptType;
  customDay: number | null;
};

type ProfileRow = {
  name: string;
  no_occupation: number;
  onboarding_completed: number;
};

type ProfessionRow = {
  id: number;
  name: string;
};

type RecurringIncomeRow = {
  id: number;
  amount_cents: number;
  receipt_type: ReceiptType;
  custom_day: number | null;
};

function normalizeName(name: string) {
  return name.trim();
}

function normalizeProfessions(
  professions: string[]
) {
  return professions
    .map((profession) =>
      profession.trim()
    )
    .filter(
      (profession) =>
        profession.length > 0
    );
}

function validateRecurringIncome(
  input: RecurringIncomeInput
) {
  if (
    !Number.isInteger(
      input.amountCents
    ) ||
    input.amountCents <= 0
  ) {
    throw new Error(
      "O rendimento deve ser maior que zero."
    );
  }

  if (
    input.receiptType === "custom"
  ) {
    if (
      input.customDay === null ||
      !Number.isInteger(
        input.customDay
      ) ||
      input.customDay < 1 ||
      input.customDay > 31
    ) {
      throw new Error(
        "O dia do rendimento deve estar entre 1 e 31."
      );
    }

    return;
  }

  if (input.customDay !== null) {
    throw new Error(
      "Somente rendimentos personalizados podem possuir um dia específico."
    );
  }
}

export async function getProfile(): Promise<Profile | null> {
  const profile =
    await database.getFirstAsync<ProfileRow>(
      `
        SELECT
          name,
          no_occupation,
          onboarding_completed
        FROM profile
        WHERE id = 1;
      `
    );

  if (!profile) {
    return null;
  }

  const professionRows =
    await database.getAllAsync<ProfessionRow>(
      `
        SELECT
          id,
          name
        FROM professions
        ORDER BY id ASC;
      `
    );

  const incomeRows =
    await database.getAllAsync<RecurringIncomeRow>(
      `
        SELECT
          id,
          amount_cents,
          receipt_type,
          custom_day
        FROM recurring_incomes
        ORDER BY id ASC;
      `
    );

  return {
    name: profile.name,
    noOccupation:
      profile.no_occupation === 1,
    onboardingCompleted:
      profile.onboarding_completed ===
      1,
    professions:
      professionRows.map(
        (profession) => ({
          id: profession.id,
          name: profession.name,
        })
      ),
    recurringIncomes:
      incomeRows.map((income) => ({
        id: income.id,
        amountCents:
          income.amount_cents,
        receiptType:
          income.receipt_type,
        customDay:
          income.custom_day,
      })),
  };
}

export async function isOnboardingCompleted() {
  const row =
    await database.getFirstAsync<{
      onboarding_completed: number;
    }>(
      `
        SELECT onboarding_completed
        FROM profile
        WHERE id = 1;
      `
    );

  return (
    row?.onboarding_completed === 1
  );
}

export async function saveProfile(
  input: ProfileInput
) {
  const name =
    normalizeName(input.name);

  if (!name) {
    throw new Error(
      "Informe seu nome."
    );
  }

  const professions =
    input.noOccupation
      ? []
      : normalizeProfessions(
          input.professions
        );

  await database.withTransactionAsync(
    async () => {
      await database.runAsync(
        `
          INSERT INTO profile (
            id,
            name,
            no_occupation,
            onboarding_completed,
            updated_at
          )
          VALUES (
            1,
            ?,
            ?,
            0,
            CURRENT_TIMESTAMP
          )
          ON CONFLICT(id)
          DO UPDATE SET
            name = excluded.name,
            no_occupation =
              excluded.no_occupation,
            updated_at =
              CURRENT_TIMESTAMP;
        `,
        name,
        input.noOccupation ? 1 : 0
      );

      await database.runAsync(`
        DELETE FROM professions;
      `);

      for (const profession of professions) {
        await database.runAsync(
          `
            INSERT INTO professions (
              name
            )
            VALUES (?);
          `,
          profession
        );
      }
    }
  );
}

export async function addRecurringIncome(
  input: RecurringIncomeInput
) {
  validateRecurringIncome(input);

  const result =
    await database.runAsync(
      `
        INSERT INTO recurring_incomes (
          amount_cents,
          receipt_type,
          custom_day,
          updated_at
        )
        VALUES (?, ?, ?, CURRENT_TIMESTAMP);
      `,
      input.amountCents,
      input.receiptType,
      input.receiptType === "custom"
        ? input.customDay
        : null
    );

  return result.lastInsertRowId;
}

export async function updateRecurringIncome(
  id: number,
  input: RecurringIncomeInput
) {
  validateRecurringIncome(input);

  await database.runAsync(
    `
      UPDATE recurring_incomes
      SET
        amount_cents = ?,
        receipt_type = ?,
        custom_day = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?;
    `,
    input.amountCents,
    input.receiptType,
    input.receiptType === "custom"
      ? input.customDay
      : null,
    id
  );
}

export async function deleteRecurringIncome(
  id: number
) {
  await database.runAsync(
    `
      DELETE FROM recurring_incomes
      WHERE id = ?;
    `,
    id
  );
}

export async function replaceRecurringIncomes(
  incomes: RecurringIncomeInput[]
) {
  for (const income of incomes) {
    validateRecurringIncome(income);
  }

  await database.withTransactionAsync(
    async () => {
      await database.runAsync(`
        DELETE FROM recurring_incomes;
      `);

      for (const income of incomes) {
        await database.runAsync(
          `
            INSERT INTO recurring_incomes (
              amount_cents,
              receipt_type,
              custom_day,
              updated_at
            )
            VALUES (?, ?, ?, CURRENT_TIMESTAMP);
          `,
          income.amountCents,
          income.receiptType,
          income.receiptType ===
          "custom"
            ? income.customDay
            : null
        );
      }
    }
  );
}

export async function completeOnboarding() {
  const profile =
    await database.getFirstAsync<{
      name: string;
    }>(
      `
        SELECT name
        FROM profile
        WHERE id = 1;
      `
    );

  if (!profile?.name.trim()) {
    throw new Error(
      "O perfil precisa ser preenchido antes de concluir as boas-vindas."
    );
  }

  await database.runAsync(`
    UPDATE profile
    SET
      onboarding_completed = 1,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = 1;
  `);
}