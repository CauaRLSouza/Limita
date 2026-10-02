import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import {
  MeanGirlsMode,
  PrideMode,
  SpecialThemeName,
} from "../theme/themes";

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

async function agendarNotificacaoQuarta() {
  await Notifications.scheduleNotificationAsync({
    identifier: MEAN_GIRLS_NOTIFICATION_ID,

    content: {
      title: "It's Wednesday ✨",
      body: "Você já sabe o que isso significa. Seu tema rosa está te esperando no Límita. 💖",
    },

    trigger: {
      type:
        Notifications.SchedulableTriggerInputTypes
          .WEEKLY,
      weekday: 4,
      hour: 0,
      minute: 0,
      channelId:
        LIMiTA_NOTIFICATION_CHANNEL_ID,
    },
  });
}

async function agendarNotificacaoPride() {
  await Notifications.scheduleNotificationAsync({
    identifier: PRIDE_NOTIFICATION_ID,

    content: {
      title:
        "Seu orgulho, suas cores 🏳️‍🌈✨",
      body: "Junho chegou mais colorido. O tema Pride já está te esperando no Límita.",
    },

    trigger: {
      type:
        Notifications.SchedulableTriggerInputTypes
          .YEARLY,
      month: 6,
      day: 1,
      hour: 0,
      minute: 0,
      channelId:
        LIMiTA_NOTIFICATION_CHANNEL_ID,
    },
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
    specialTheme === "meanGirls" &&
    meanGirlsMode === "wednesday"
  ) {
    await agendarNotificacaoQuarta();
  }

  if (
    specialTheme === "pride" &&
    prideMode === "june"
  ) {
    await agendarNotificacaoPride();
  }
}