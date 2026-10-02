import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export const LIMiTA_NOTIFICATION_CHANNEL_ID =
  "limita-geral";

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
        sound: "default",
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