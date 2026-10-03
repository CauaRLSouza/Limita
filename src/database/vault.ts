import { database } from "./database";

export type VaultMovementType =
  | "sobra"
  | "transferencia"
  | "entrada"
  | "retirada";

export type VaultMovement = {
  id: string;
  type: VaultMovementType;
  title: string;
  description: string;
  amountCents: number;
  date: string;
};

export type VaultEvolutionPoint = {
  year: number;
  month: number;
  balanceCents: number;
};

export type VaultOrigin = {
  type: "surplus" | "transfer" | "income";
  amountCents: number;
};

export type VaultStats = {
  positiveCycles: number;
  completedCycles: number;
  periodGrowthCents: number;
  periodIntervals: number;
  largestCycleGrowthCents: number;
  averageCycleGrowthCents: number;
};

export type VaultOverview = {
  balanceCents: number;
  evolution: VaultEvolutionPoint[];
  origins: VaultOrigin[];
  movements: VaultMovement[];
  stats: VaultStats;
};

type TransactionRow = {
  id: number;
  type: "income" | "expense" | "transfer";
  amount_cents: number;
  date: string;
  description: string | null;
  bucket: "monthly_money" | "vault" | null;
  transfer_from: "monthly_money" | "vault" | null;
  transfer_to: "monthly_money" | "vault" | null;
};

type CycleRow = {
  id: number;
  year: number;
  month: number;
  status: "open" | "closed";
  result_cents: number | null;
  closing_decision: string | null;
  vault_coverage_cents: number;
};

type PositiveCycleStatsRow = {
  completed_cycles: number;
  positive_cycles: number;
};

function monthKey(year: number, month: number) {
  return year * 12 + (month - 1);
}

function lastDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 0).getDate();

  return `${year}-${String(month).padStart(
    2,
    "0"
  )}-${String(day).padStart(2, "0")}`;
}

function capitalize(text: string) {
  if (!text) {
    return text;
  }

  return (
    text.charAt(0).toUpperCase() +
    text.slice(1)
  );
}

function cycleName(
  year: number,
  month: number
) {
  const date = new Date(
    year,
    month - 1,
    1
  );

  return capitalize(
    new Intl.DateTimeFormat(
      "pt-BR",
      {
        month: "long",
      }
    ).format(date)
  );
}

function transactionDelta(
  row: TransactionRow
) {
  if (
    row.type === "income" &&
    row.bucket === "vault"
  ) {
    return row.amount_cents;
  }

  if (
    row.type === "expense" &&
    row.bucket === "vault"
  ) {
    return -row.amount_cents;
  }

  if (
    row.type === "transfer" &&
    row.transfer_from ===
      "monthly_money" &&
    row.transfer_to === "vault"
  ) {
    return row.amount_cents;
  }

  if (
    row.type === "transfer" &&
    row.transfer_from === "vault" &&
    row.transfer_to ===
      "monthly_money"
  ) {
    return -row.amount_cents;
  }

  return 0;
}

function cycleDelta(row: CycleRow) {
  let delta = 0;

  if (
    row.result_cents !== null &&
    row.result_cents > 0 &&
    row.closing_decision ===
      "positive_to_vault"
  ) {
    delta += row.result_cents;
  }

  if (
    row.vault_coverage_cents > 0
  ) {
    delta -=
      row.vault_coverage_cents;
  }

  return delta;
}

function createTransactionMovement(
  row: TransactionRow
): VaultMovement | null {
  const delta =
    transactionDelta(row);

  if (delta === 0) {
    return null;
  }

  if (row.type === "income") {
    return {
      id: `transaction-${row.id}`,
      type: "entrada",
      title:
        row.description?.trim() ||
        "Entrada direta",
      description:
        "Adicionada ao Cofre",
      amountCents: row.amount_cents,
      date: row.date,
    };
  }

  if (row.type === "expense") {
    return {
      id: `transaction-${row.id}`,
      type: "retirada",
      title:
        row.description?.trim() ||
        "Retirada do Cofre",
      description:
        "Gasto descontado do Cofre",
      amountCents:
        -row.amount_cents,
      date: row.date,
    };
  }

  if (delta > 0) {
    return {
      id: `transaction-${row.id}`,
      type: "transferencia",
      title: "Transferência",
      description:
        "Do dinheiro do mês",
      amountCents: row.amount_cents,
      date: row.date,
    };
  }

  return {
    id: `transaction-${row.id}`,
    type: "transferencia",
    title: "Transferência",
    description:
      "Para o dinheiro do mês",
    amountCents:
      -row.amount_cents,
    date: row.date,
  };
}

function createCycleMovements(
  row: CycleRow
) {
  const movements: VaultMovement[] =
    [];

  const date = lastDayOfMonth(
    row.year,
    row.month
  );

  const name = cycleName(
    row.year,
    row.month
  );

  if (
    row.result_cents !== null &&
    row.result_cents > 0 &&
    row.closing_decision ===
      "positive_to_vault"
  ) {
    movements.push({
      id: `cycle-surplus-${row.id}`,
      type: "sobra",
      title: "Sobra do ciclo",
      description: `Fechamento de ${name.toLowerCase()}`,
      amountCents:
        row.result_cents,
      date,
    });
  }

  if (
    row.vault_coverage_cents > 0
  ) {
    movements.push({
      id: `cycle-coverage-${row.id}`,
      type: "retirada",
      title: "Cobertura do ciclo",
      description: `Déficit de ${name.toLowerCase()}`,
      amountCents:
        -row.vault_coverage_cents,
      date,
    });
  }

  return movements;
}

function distributeCurrentOrigins(
  currentBalanceCents: number,
  grossOrigins: VaultOrigin[]
) {
  if (currentBalanceCents <= 0) {
    return grossOrigins.map(
      (origin) => ({
        ...origin,
        amountCents: 0,
      })
    );
  }

  const totalGross =
    grossOrigins.reduce(
      (sum, origin) =>
        sum + origin.amountCents,
      0
    );

  if (totalGross <= 0) {
    return grossOrigins.map(
      (origin) => ({
        ...origin,
        amountCents: 0,
      })
    );
  }

  let distributed = 0;

  return grossOrigins.map(
    (origin, index) => {
      if (
        index ===
        grossOrigins.length - 1
      ) {
        return {
          ...origin,
          amountCents: Math.max(
            0,
            currentBalanceCents -
              distributed
          ),
        };
      }

      const amountCents =
        Math.round(
          (origin.amountCents /
            totalGross) *
            currentBalanceCents
        );

      distributed += amountCents;

      return {
        ...origin,
        amountCents,
      };
    }
  );
}

export async function getVaultOverview(): Promise<VaultOverview> {
  const [
    transactions,
    cycles,
    cycleStats,
  ] = await Promise.all([
    database.getAllAsync<TransactionRow>(`
      SELECT
        id,
        type,
        amount_cents,
        date,
        description,
        bucket,
        transfer_from,
        transfer_to
      FROM transactions
      WHERE status = 'posted'
        AND (
          bucket = 'vault'
          OR transfer_from = 'vault'
          OR transfer_to = 'vault'
        )
      ORDER BY date ASC, id ASC;
    `),

    database.getAllAsync<CycleRow>(`
      SELECT
        id,
        year,
        month,
        status,
        result_cents,
        closing_decision,
        vault_coverage_cents
      FROM cycles
      ORDER BY
        year ASC,
        month ASC,
        id ASC;
    `),

    database.getFirstAsync<PositiveCycleStatsRow>(`
      SELECT
        COUNT(*) AS completed_cycles,
        COALESCE(
          SUM(
            CASE
              WHEN result_cents > 0
                THEN 1
              ELSE 0
            END
          ),
          0
        ) AS positive_cycles
      FROM cycles
      WHERE status = 'closed'
        AND result_cents IS NOT NULL;
    `),
  ]);

  const movements: VaultMovement[] =
    [];

  const monthlyDeltas =
    new Map<number, number>();

  let grossSurplusCents = 0;
  let grossTransferCents = 0;
  let grossIncomeCents = 0;

  for (
    const transaction of
    transactions
  ) {
    const delta =
      transactionDelta(
        transaction
      );

    if (delta === 0) {
      continue;
    }

    const [year, month] =
      transaction.date
        .split("-")
        .slice(0, 2)
        .map(Number);

    const key = monthKey(
      year,
      month
    );

    monthlyDeltas.set(
      key,
      (monthlyDeltas.get(key) ??
        0) + delta
    );

    const movement =
      createTransactionMovement(
        transaction
      );

    if (movement) {
      movements.push(movement);
    }

    if (
      transaction.type ===
        "income" &&
      delta > 0
    ) {
      grossIncomeCents += delta;
    }

    if (
      transaction.type ===
        "transfer" &&
      delta > 0
    ) {
      grossTransferCents += delta;
    }
  }

  for (const cycle of cycles) {
    const delta =
      cycleDelta(cycle);

    const key = monthKey(
      cycle.year,
      cycle.month
    );

    if (delta !== 0) {
      monthlyDeltas.set(
        key,
        (monthlyDeltas.get(key) ??
          0) + delta
      );
    }

    if (
      cycle.result_cents !== null &&
      cycle.result_cents > 0 &&
      cycle.closing_decision ===
        "positive_to_vault"
    ) {
      grossSurplusCents +=
        cycle.result_cents;
    }

    movements.push(
      ...createCycleMovements(cycle)
    );
  }

  movements.sort((a, b) => {
    const dateComparison =
      b.date.localeCompare(a.date);

    if (dateComparison !== 0) {
      return dateComparison;
    }

    return b.id.localeCompare(a.id);
  });

  const allCycleKeys =
    cycles.map((cycle) =>
      monthKey(
        cycle.year,
        cycle.month
      )
    );

  const transactionKeys =
    transactions.map(
      (transaction) => {
        const [year, month] =
          transaction.date
            .split("-")
            .slice(0, 2)
            .map(Number);

        return monthKey(
          year,
          month
        );
      }
    );

  const keys = Array.from(
    new Set([
      ...allCycleKeys,
      ...transactionKeys,
    ])
  ).sort((a, b) => a - b);

  let runningBalanceCents = 0;

  const fullEvolution: VaultEvolutionPoint[] =
    keys.map((key) => {
      runningBalanceCents +=
        monthlyDeltas.get(key) ??
        0;

      const year =
        Math.floor(key / 12);

      const month =
        (key % 12) + 1;

      return {
        year,
        month,
        balanceCents: Math.max(
          0,
          runningBalanceCents
        ),
      };
    });

  const evolution =
    fullEvolution.slice(-5);

  const balanceCents = Math.max(
    0,
    runningBalanceCents
  );

  const grossOrigins: VaultOrigin[] =
    [
      {
        type: "surplus",
        amountCents:
          grossSurplusCents,
      },
      {
        type: "transfer",
        amountCents:
          grossTransferCents,
      },
      {
        type: "income",
        amountCents:
          grossIncomeCents,
      },
    ];

  const origins =
    distributeCurrentOrigins(
      balanceCents,
      grossOrigins
    );

  const periodIntervals =
    Math.max(
      0,
      evolution.length - 1
    );

  const periodGrowthCents =
    evolution.length >= 2
      ? evolution[
          evolution.length - 1
        ].balanceCents -
        evolution[0].balanceCents
      : 0;

  let largestCycleGrowthCents =
    0;

  for (
    let index = 1;
    index < evolution.length;
    index += 1
  ) {
    const growth =
      evolution[index]
        .balanceCents -
      evolution[index - 1]
        .balanceCents;

    if (
      growth >
      largestCycleGrowthCents
    ) {
      largestCycleGrowthCents =
        growth;
    }
  }

  const averageCycleGrowthCents =
    periodIntervals > 0
      ? Math.round(
          periodGrowthCents /
            periodIntervals
        )
      : 0;

  return {
    balanceCents,
    evolution,
    origins,
    movements,
    stats: {
      positiveCycles:
        cycleStats
          ?.positive_cycles ?? 0,

      completedCycles:
        cycleStats
          ?.completed_cycles ?? 0,

      periodGrowthCents,
      periodIntervals,
      largestCycleGrowthCents,
      averageCycleGrowthCents,
    },
  };
}