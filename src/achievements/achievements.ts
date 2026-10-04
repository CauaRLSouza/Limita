export type AchievementId =
  | "spark"
  | "oasis"
  | "aurora"
  | "constellation";

export type AchievementDefinition = {
  id: AchievementId;
  requiredPositiveCycles: number;
  themeName: string;
  unlockTitle: string;
  unlockMessage: string;
};

export type AchievementAccess = {
  positiveCycles: number;
  grantedAchievements: AchievementId[];
};

export const achievements: AchievementDefinition[] = [
  {
    id: "spark",
    requiredPositiveCycles: 3,
    themeName: "Faísca",
    unlockTitle:
      "Você acendeu a primeira faísca ✨",
    unlockMessage:
      "Você concluiu 3 ciclos no positivo — o suficiente para acender algo novo. Seu progresso acaba de se transformar na primeira de muitas conquistas.",
  },
  {
    id: "oasis",
    requiredPositiveCycles: 6,
    themeName: "Oásis",
    unlockTitle:
      "De ciclo em ciclo, você construiu seu próprio Oásis 🌴",
    unlockMessage:
      "Você concluiu 6 ciclos no positivo — e o que começou como uma faísca agora encontrou espaço para crescer em algo maior. Seu progresso abriu espaço para algo novo.",
  },
  {
    id: "aurora",
    requiredPositiveCycles: 9,
    themeName: "Aurora",
    unlockTitle:
      "Seu progresso te revelou um novo horizonte para alcançar 🌅",
    unlockMessage:
      "Você concluiu 9 ciclos no positivo — e aquilo que começou pequeno agora revela uma mudança que dá para enxergar. Um novo horizonte acaba de se abrir no seu caminho.",
  },
  {
    id: "constellation",
    requiredPositiveCycles: 12,
    themeName: "Constelação",
    unlockTitle:
      "De ciclo em ciclo, você desenhou sua própria Constelação ✨",
    unlockMessage:
      "Você concluiu 12 ciclos no positivo — e cada conquista deixou um ponto nessa trajetória. Juntos, eles agora contam uma história que só você poderia ter construído.",
  },
];

export function getAchievementAccess(
  positiveCycles: number
): AchievementAccess {
  return {
    positiveCycles,
    grantedAchievements: achievements
      .filter(
        (achievement) =>
          positiveCycles >=
          achievement.requiredPositiveCycles
      )
      .map((achievement) => achievement.id),
  };
}

export function isAchievementUnlocked(
  achievementId: AchievementId,
  access: AchievementAccess
) {
  const achievement = achievements.find(
    (item) => item.id === achievementId
  );

  if (!achievement) {
    return false;
  }

  if (
    access.grantedAchievements.includes(
      achievementId
    )
  ) {
    return true;
  }

  return (
    access.positiveCycles >=
    achievement.requiredPositiveCycles
  );
}

export function getUnlockedAchievements(
  access: AchievementAccess
) {
  return achievements.filter((achievement) =>
    isAchievementUnlocked(
      achievement.id,
      access
    )
  );
}

export function getUnlockedAchievementIds(
  access: AchievementAccess
): AchievementId[] {
  return getUnlockedAchievements(access).map(
    (achievement) => achievement.id
  );
}

export function getAchievementProgress(
  achievementId: AchievementId,
  positiveCycles: number
) {
  const achievement = achievements.find(
    (item) => item.id === achievementId
  );

  if (!achievement) {
    return {
      current: 0,
      required: 0,
      remaining: 0,
      progress: 0,
    };
  }

  const current = Math.min(
    positiveCycles,
    achievement.requiredPositiveCycles
  );

  const remaining = Math.max(
    achievement.requiredPositiveCycles -
      positiveCycles,
    0
  );

  const progress = Math.min(
    positiveCycles /
      achievement.requiredPositiveCycles,
    1
  );

  return {
    current,
    required:
      achievement.requiredPositiveCycles,
    remaining,
    progress,
  };
}

export function getNewlyUnlockedAchievements(
  previousPositiveCycles: number,
  currentPositiveCycles: number
) {
  return achievements.filter(
    (achievement) =>
      previousPositiveCycles <
        achievement.requiredPositiveCycles &&
      currentPositiveCycles >=
        achievement.requiredPositiveCycles
  );
}