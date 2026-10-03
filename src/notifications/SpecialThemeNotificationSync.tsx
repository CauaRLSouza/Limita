import { useEffect } from "react";

import { useTheme } from "../theme/ThemeContext";
import { useNotificationPreferences } from "./NotificationPreferencesContext";
import { sincronizarNotificacoesTemasEspeciais } from "./notifications";

export default function SpecialThemeNotificationSync() {
  const {
    specialTheme,
    meanGirlsMode,
    prideMode,
    preferencesLoaded:
      themePreferencesLoaded,
  } = useTheme();

  const {
    notificacoesAtivas,
    temasEspeciais,
    preferencesLoaded:
      notificationPreferencesLoaded,
  } = useNotificationPreferences();

  useEffect(() => {
    if (
      !themePreferencesLoaded ||
      !notificationPreferencesLoaded
    ) {
      return;
    }

    sincronizarNotificacoesTemasEspeciais({
      notificacoesAtivas,
      temasEspeciais,
      specialTheme,
      meanGirlsMode,
      prideMode,
    }).catch(
      (error) => {
        console.error(
          "Erro ao sincronizar notificações de temas especiais:",
          error
        );
      }
    );
  }, [
    notificacoesAtivas,
    temasEspeciais,
    specialTheme,
    meanGirlsMode,
    prideMode,
    themePreferencesLoaded,
    notificationPreferencesLoaded,
  ]);

  return null;
}