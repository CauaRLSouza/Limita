import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import {
  createNotificationHistory,
  NotificationHistoryType,
} from "../database/NotificationHistory";
import {
  MeanGirlsMode,
  PrideMode,
  SpecialThemeName,
} from "../theme/themes";
import { getStoredNotificationPreferences } from "./NotificationPreferencesContext";

export const LIMiTA_NOTIFICATION_CHANNEL_ID =
  "limita-geral";

const MEAN_GIRLS_NOTIFICATION_ID =
  "limita-special-theme-mean-girls";

const PRIDE_NOTIFICATION_ID =
  "limita-special-theme-pride";

type SincronizarTemasEspeciaisParams = {
  notificacoesAtivas: boolean;
  temasEspeciais: boolean;
  specialTheme: SpecialThemeName;
  meanGirlsMode: MeanGirlsMode;
  prideMode: PrideMode;
};

type EmitNotificationParams = {
  eventKey: string;
  type: NotificationHistoryType;
  title: string;
  body: string;
  enabled: boolean;
  notificationDate?: Date | null;
};

type DevNotificationTest = {
  type: NotificationHistoryType;
  title: string;
  body: string;
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function configurarNotificacoes() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(
      LIMiTA_NOTIFICATION_CHANNEL_ID,
      {
        name: "Notificações do Límita",
        description:
          "Avisos financeiros, lembretes e experiências do Límita.",
        importance:
          Notifications.AndroidImportance.DEFAULT,
        enableVibrate: true,
      }
    );
  }
}

export async function solicitarPermissaoNotificacoes() {
  await configurarNotificacoes();

  const permissaoAtual =
    await Notifications.getPermissionsAsync();

  if (permissaoAtual.granted) {
    return true;
  }

  const novaPermissao =
    await Notifications.requestPermissionsAsync();

  return novaPermissao.granted;
}

function getTodayAtNine() {
  const date =
    new Date();

  date.setHours(
    9,
    0,
    0,
    0
  );

  return date;
}

async function scheduleNativeNotification(
  identifier: string,
  title: string,
  body: string,
  date?: Date | null
) {
  const permission =
    await Notifications.getPermissionsAsync();

  if (!permission.granted) {
    return;
  }

  await configurarNotificacoes();

  if (
    date &&
    date.getTime() >
      Date.now()
  ) {
    await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title,
        body,
      },
      trigger: {
        type:
          Notifications.SchedulableTriggerInputTypes
            .DATE,
        date,
        channelId:
          LIMiTA_NOTIFICATION_CHANNEL_ID,
      },
    });

    return;
  }

  await Notifications.scheduleNotificationAsync({
    identifier,
    content: {
      title,
      body,
    },
    trigger: null,
  });
}

export async function emitLimitaNotification({
  eventKey,
  type,
  title,
  body,
  enabled,
  notificationDate = null,
}: EmitNotificationParams) {
  const preferences =
    await getStoredNotificationPreferences();

  if (
    !preferences.notificacoesAtivas ||
    !enabled
  ) {
    return false;
  }

  const occurredAt =
    notificationDate &&
    notificationDate.getTime() >
      Date.now()
      ? notificationDate
      : new Date();

  const created =
    await createNotificationHistory({
      eventKey,
      type,
      title,
      body,
      occurredAt,
    });

  if (!created) {
    return false;
  }

  try {
    await scheduleNativeNotification(
      eventKey,
      title,
      body,
      notificationDate
    );
  } catch (error) {
    console.error(
      "Erro ao emitir notificação do Límita:",
      error
    );
  }

  return true;
}

export async function notifyRecurringIncome(
  transactionId: number,
  amountCents: number,
  recurringIncomeId: number,
  period: string
) {
  const preferences =
    await getStoredNotificationPreferences();

  const amount =
    (amountCents / 100).toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL",
      }
    );

  const nine =
    getTodayAtNine();

  const notificationDate =
    Date.now() <
    nine.getTime()
      ? nine
      : null;

  return emitLimitaNotification({
    eventKey:
      `recurring-income:${recurringIncomeId}:${period}`,
    type: "recurring_income",
    title:
      "Rendimento adicionado 💰",
    body: `${amount} entrou no seu Dinheiro do mês.`,
    enabled:
      preferences.rendimentosRecorrentes,
    notificationDate,
  });
}

export async function notifyScheduledTransactionPosted(
  transaction: {
    id: number;
    type:
      | "income"
      | "expense"
      | "transfer";
    amountCents: number;
  }
) {
  const preferences =
    await getStoredNotificationPreferences();

  const amount =
    (
      transaction.amountCents /
      100
    ).toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL",
      }
    );

  let title =
    "Movimentação realizada";

  let body =
    `${amount} da sua movimentação agendada foi efetivado.`;

  if (
    transaction.type ===
    "income"
  ) {
    title =
      "Entrada agendada realizada";

    body =
      `${amount} da sua entrada agendada foi adicionado.`;
  }

  if (
    transaction.type ===
    "expense"
  ) {
    title =
      "Gasto agendado realizado";

    body =
      `${amount} do seu gasto agendado foi registrado.`;
  }

  if (
    transaction.type ===
    "transfer"
  ) {
    title =
      "Transferência agendada realizada";

    body =
      `Sua transferência agendada de ${amount} foi realizada.`;
  }

  return emitLimitaNotification({
    eventKey:
      `scheduled-transaction:${transaction.id}`,
    type:
      "scheduled_transaction",
    title,
    body,
    enabled:
      preferences.movimentacoesAgendadas,
  });
}

export async function notifyCycleClosing(
  cycleId: number,
  year: number,
  month: number
) {
  const preferences =
    await getStoredNotificationPreferences();

  const date =
    new Date(
      year,
      month - 1,
      1
    );

  const monthName =
    date.toLocaleDateString(
      "pt-BR",
      {
        month: "long",
      }
    );

  const nine =
    getTodayAtNine();

  const notificationDate =
    Date.now() <
    nine.getTime()
      ? nine
      : null;

  return emitLimitaNotification({
    eventKey:
      `cycle-closing:${cycleId}`,
    type: "cycle",
    title:
      "Seu ciclo está pronto ✨",
    body:
      `O ciclo de ${monthName} foi encerrado. Veja como ele terminou e escolha o que fazer a seguir.`,
    enabled:
      preferences.cicloFinanceiro,
    notificationDate,
  });
}

export async function notifyNewProgress(
  cycleId: number,
  kind:
    | "achievement"
    | "milestone"
) {
  const preferences =
    await getStoredNotificationPreferences();

  return emitLimitaNotification({
    eventKey:
      `progress:${kind}:${cycleId}`,
    type: "progress",
    title:
      "Tem novidade esperando por você ✨",
    body:
      "Seu progresso no Límita acabou de revelar algo novo. Abra o app para descobrir.",
    enabled:
      preferences.progresso,
  });
}

export async function testarNotificacoesDev() {
  if (!__DEV__) {
    return false;
  }

  const permitido =
    await solicitarPermissaoNotificacoes();

  if (!permitido) {
    return false;
  }

  const notificationDate =
    new Date(
      Date.now() + 5000
    );

  const testId =
    Date.now().toString();

  const notifications: DevNotificationTest[] = [
    {
      type:
        "scheduled_transaction",
      title:
        "Gasto agendado realizado",
      body:
        "R$ 12,34 do seu gasto agendado foi registrado.",
    },
    {
      type:
        "recurring_income",
      title:
        "Rendimento adicionado 💰",
      body:
        "R$ 3.600,00 entrou no seu Dinheiro do mês.",
    },
    {
      type:
        "cycle",
      title:
        "Seu ciclo está pronto ✨",
      body:
        "Seu ciclo foi encerrado. Veja como ele terminou e escolha o que fazer a seguir.",
    },
    {
      type:
        "progress",
      title:
        "Tem novidade esperando por você ✨",
      body:
        "Seu progresso no Límita acabou de revelar algo novo. Abra o app para descobrir.",
    },
    {
      type:
        "special_theme",
      title:
        "It's Wednesday 💅",
      body:
        "Você já sabe o que isso significa. O tema Mean Girls já está tá esperando no Límita💖",
    },
    {
      type:
        "special_theme",
      title:
        "Seu orgulho, suas cores🏳️‍🌈",
      body:
        "Junho chegou muito mais colorido. O tema Pride já está te esperando no Límita🌈",
    },
  ];

  await Promise.all(
    notifications.map(
      async (
        notification,
        index
      ) => {
        const eventKey =
          `dev-notification-test:${testId}:${index}`;

        await createNotificationHistory({
          eventKey,
          type:
            notification.type,
          title:
            notification.title,
          body:
            notification.body,
          occurredAt:
            notificationDate,
        });

        await scheduleNativeNotification(
          eventKey,
          notification.title,
          notification.body,
          notificationDate
        );
      }
    )
  );

  return true;
}

async function cancelarNotificacao(
  identifier: string
) {
  try {
    await Notifications.cancelScheduledNotificationAsync(
      identifier
    );
  } catch {}
}

async function cancelarNotificacoesTemasEspeciais() {
  await Promise.all([
    cancelarNotificacao(
      MEAN_GIRLS_NOTIFICATION_ID
    ),
    cancelarNotificacao(
      PRIDE_NOTIFICATION_ID
    ),
  ]);
}

function getNextWednesdayAtNine() {
  const now =
    new Date();

  const date =
    new Date(now);

  const daysUntilWednesday =
    (3 - now.getDay() + 7) %
    7;

  date.setDate(
    now.getDate() +
      daysUntilWednesday
  );

  date.setHours(
    9,
    0,
    0,
    0
  );

  if (
    date.getTime() <=
    now.getTime()
  ) {
    date.setDate(
      date.getDate() + 7
    );
  }

  return date;
}

function getNextPrideDate() {
  const now =
    new Date();

  let year =
    now.getFullYear();

  let date =
    new Date(
      year,
      5,
      1,
      9,
      0,
      0,
      0
    );

  if (
    date.getTime() <=
    now.getTime()
  ) {
    year += 1;

    date =
      new Date(
        year,
        5,
        1,
        9,
        0,
        0,
        0
      );
  }

  return date;
}

async function agendarNotificacaoQuarta() {
  await Notifications.scheduleNotificationAsync({
    identifier:
      MEAN_GIRLS_NOTIFICATION_ID,

    content: {
      title:
        "It's Wednesday 💅",
      body:
        "Você já sabe o que isso significa. O tema Mean Girls já está tá esperando no Límita💖",
    },

    trigger: {
      type:
        Notifications.SchedulableTriggerInputTypes
          .WEEKLY,
      weekday: 4,
      hour: 9,
      minute: 0,
      channelId:
        LIMiTA_NOTIFICATION_CHANNEL_ID,
    },
  });

  const nextDate =
    getNextWednesdayAtNine();

  await createNotificationHistory({
    eventKey:
      `special:mean-girls:${nextDate
        .toISOString()
        .slice(0, 10)}`,
    type:
      "special_theme",
    title:
      "It's Wednesday 💅",
    body:
      "Você já sabe o que isso significa. O tema Mean Girls já está tá esperando no Límita💖",
    occurredAt:
      nextDate,
  });
}

async function agendarNotificacaoPride() {
  await Notifications.scheduleNotificationAsync({
    identifier:
      PRIDE_NOTIFICATION_ID,

    content: {
      title:
        "Seu orgulho, suas cores🏳️‍🌈",
      body:
        "Junho chegou muito mais colorido. O tema Pride já está te esperando no Límita🌈",
    },

    trigger: {
      type:
        Notifications.SchedulableTriggerInputTypes
          .YEARLY,
      month: 6,
      day: 1,
      hour: 9,
      minute: 0,
      channelId:
        LIMiTA_NOTIFICATION_CHANNEL_ID,
    },
  });

  const nextDate =
    getNextPrideDate();

  await createNotificationHistory({
    eventKey:
      `special:pride:${nextDate.getFullYear()}`,
    type:
      "special_theme",
    title:
      "Seu orgulho, suas cores🏳️‍🌈",
    body:
      "Junho chegou muito mais colorido. O tema Pride já está te esperando no Límita🌈",
    occurredAt:
      nextDate,
  });
}

export async function sincronizarNotificacoesTemasEspeciais({
  notificacoesAtivas,
  temasEspeciais,
  specialTheme,
  meanGirlsMode,
  prideMode,
}: SincronizarTemasEspeciaisParams) {
  await configurarNotificacoes();

  await cancelarNotificacoesTemasEspeciais();

  if (
    !notificacoesAtivas ||
    !temasEspeciais
  ) {
    return;
  }

  const permissao =
    await Notifications.getPermissionsAsync();

  if (!permissao.granted) {
    return;
  }

  if (
    specialTheme ===
      "meanGirls" &&
    meanGirlsMode ===
      "wednesday"
  ) {
    await agendarNotificacaoQuarta();
  }

  if (
    specialTheme ===
      "pride" &&
    prideMode === "june"
  ) {
    await agendarNotificacaoPride();
  }
}