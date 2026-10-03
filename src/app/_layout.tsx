import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";

import ThemeBackground from "../components/ThemeBackground";
import { initDatabase } from "../database/initDatabase";
import { NotificationPreferencesProvider } from "../notifications/NotificationPreferencesContext";
import SpecialThemeNotificationSync from "../notifications/SpecialThemeNotificationSync";
import { configurarNotificacoes } from "../notifications/notifications";
import {
  ThemeProvider,
  useTheme,
} from "../theme/ThemeContext";

SplashScreen.preventAutoHideAsync();

function AppNavigation() {
  const {
    activeSpecialTheme,
    resolvedThemeName,
    preferencesLoaded,
  } = useTheme();

  const [databaseLoaded, setDatabaseLoaded] = useState(false);

  useEffect(() => {
    initDatabase()
      .then(() => {
        setDatabaseLoaded(true);
      })
      .catch((error) => {
        console.error(
          "Erro ao inicializar banco de dados:",
          error
        );
      });
  }, []);

  useEffect(() => {
    configurarNotificacoes().catch((error) => {
      console.error(
        "Erro ao configurar notificações:",
        error
      );
    });
  }, []);

  useEffect(() => {
    if (!preferencesLoaded || !databaseLoaded) {
      return;
    }

    SplashScreen.hide();
  }, [preferencesLoaded, databaseLoaded]);

  if (!preferencesLoaded || !databaseLoaded) {
    return null;
  }

  const statusBarStyle =
    activeSpecialTheme === "meanGirls"
      ? "dark"
      : resolvedThemeName === "dark"
        ? "light"
        : "dark";

  return (
    <ThemeBackground>
      <SpecialThemeNotificationSync />

      <StatusBar style={statusBarStyle} />

      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: "transparent",
          },
        }}
      />
    </ThemeBackground>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <NotificationPreferencesProvider>
        <AppNavigation />
      </NotificationPreferencesProvider>
    </ThemeProvider>
  );
}