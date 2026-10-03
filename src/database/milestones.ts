import { database } from "./database";

export type MilestoneCycle = {
  id: number;
  year: number;
  month: number;
  resultCents: number;
};

export type MilestoneStats = {
  cycleCount: number;
  cycles: MilestoneCycle[];
  positiveCycles: number;
  accumulatedBalanceCents: number;
  averageResultCents: number;
  bestCycle: MilestoneCycle | null;
  previousGroupAverageCents: number | null;
  recentGroupAverageCents: number | null;
  comparisonPercentage: number | null;
  firstCycle: MilestoneCycle | null;
  lastCycle: MilestoneCycle | null;
};

type MilestoneCycleRow = {
  id: number;
  year: number;
  month: number;
  result_cents: number;
};

function mapCycle(
  row: MilestoneCycleRow
): MilestoneCycle {
  return {
    id: row.id,
    year: row.year,
    month: row.month,
    resultCents:
      row.result_cents,
  };
}

function calculateAverage(
  cycles: MilestoneCycle[]
) {
  if (cycles.length === 0) {
    return 0;
  }

  const total =
    cycles.reduce(
      (sum, cycle) =>
        sum +
        cycle.resultCents,
      0
    );

  return Math.round(
    total / cycles.length
  );
}

function calculateComparisonPercentage(
  previousAverage: number,
  recentAverage: number
) {
  if (previousAverage === 0) {
    return null;
  }

  return (
    ((recentAverage -
      previousAverage) /
      Math.abs(
        previousAverage
      )) *
    100
  );
}

async function getCompletedCycles(
  limit: number
) {
  const rows =
    await database.getAllAsync<MilestoneCycleRow>(
      `
        SELECT
          c.id,
          c.year,
          c.month,
          c.result_cents
        FROM cycles c
        WHERE c.status = 'closed'
          AND c.result_cents IS NOT NULL
          AND EXISTS (
            SELECT 1
            FROM transactions t
            WHERE t.cycle_id = c.id
              AND t.status = 'posted'
          )
        ORDER BY
          c.year ASC,
          c.month ASC
        LIMIT ?;
      `,
      limit
    );

  return rows.map(
    mapCycle
  );
}

export async function getMilestoneStats(
  milestone: 3 | 6 | 12
): Promise<MilestoneStats | null> {
  const cycles =
    await getCompletedCycles(
      milestone
    );

  if (
    cycles.length <
    milestone
  ) {
    return null;
  }

  const positiveCycles =
    cycles.filter(
      (cycle) =>
        cycle.resultCents > 0
    ).length;

  const accumulatedBalanceCents =
    cycles.reduce(
      (sum, cycle) =>
        sum +
        cycle.resultCents,
      0
    );

  const averageResultCents =
    calculateAverage(cycles);

  const bestCycle =
    cycles.reduce<MilestoneCycle | null>(
      (best, cycle) => {
        if (
          !best ||
          cycle.resultCents >
            best.resultCents
        ) {
          return cycle;
        }

        return best;
      },
      null
    );

  let previousGroupAverageCents:
    | number
    | null = null;

  let recentGroupAverageCents:
    | number
    | null = null;

  let comparisonPercentage:
    | number
    | null = null;

  if (milestone === 6) {
    const previousGroup =
      cycles.slice(0, 3);

    const recentGroup =
      cycles.slice(3, 6);

    previousGroupAverageCents =
      calculateAverage(
        previousGroup
      );

    recentGroupAverageCents =
      calculateAverage(
        recentGroup
      );

    comparisonPercentage =
      calculateComparisonPercentage(
        previousGroupAverageCents,
        recentGroupAverageCents
      );
  }

  if (milestone === 12) {
    const previousGroup =
      cycles.slice(0, 6);

    const recentGroup =
      cycles.slice(6, 12);

    previousGroupAverageCents =
      calculateAverage(
        previousGroup
      );

    recentGroupAverageCents =
      calculateAverage(
        recentGroup
      );

    comparisonPercentage =
      calculateComparisonPercentage(
        previousGroupAverageCents,
        recentGroupAverageCents
      );
  }

  return {
    cycleCount:
      cycles.length,
    cycles,
    positiveCycles,
    accumulatedBalanceCents,
    averageResultCents,
    bestCycle,
    previousGroupAverageCents,
    recentGroupAverageCents,
    comparisonPercentage,
    firstCycle:
      cycles[0] ?? null,
    lastCycle:
      cycles[
        cycles.length - 1
      ] ?? null,
  };
}