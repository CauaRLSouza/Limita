import {
  Stack,
  useRootNavigationState,
  useRouter,
  useSegments,
} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import {
  useEffect,
  useState,
} from "react";

import ThemeBackground from "../components/ThemeBackground";
import { initDatabase } from "../database/initDatabase";
import { isOnboardingCompleted } from "../database/profile";
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

  const router = useRouter();
  const segments = useSegments();
  const navigationState =
    useRootNavigationState();

  const [
    databaseLoaded,
    setDatabaseLoaded,
  ] = useState(false);

  const [
    onboardingChecked,
    setOnboardingChecked,
  ] = useState(false);

  useEffect(() => {
    async function initialize() {
      try {
        await initDatabase();
        setDatabaseLoaded(true);
      } catch (error) {
        console.error(
          "Erro ao inicializar banco de dados:",
          error
        );
      }
    }

    initialize();
  }, []);

  useEffect(() => {
    configurarNotificacoes().catch(
      (error) => {
        console.error(
          "Erro ao configurar notificações:",
          error
        );
      }
    );
  }, []);

  useEffect(() => {
    if (
      !databaseLoaded ||
      !navigationState?.key
    ) {
      return;
    }

    let active = true;

    async function checkOnboarding() {
      try {
        const completed =
          await isOnboardingCompleted();

        if (!active) {
          return;
        }

        const isOnboarding =
          segments[0] === "onboarding";

        if (
          !completed &&
          !isOnboarding
        ) {
          router.replace(
            "/onboarding"
          );
        } else if (
          completed &&
          isOnboarding
        ) {
          router.replace("/(tabs)");
        }

        setOnboardingChecked(true);
      } catch (error) {
        console.error(
          "Erro ao verificar onboarding:",
          error
        );
      }
    }

    checkOnboarding();

    return () => {
      active = false;
    };
  }, [
    databaseLoaded,
    navigationState?.key,
    segments,
    router,
  ]);

  useEffect(() => {
    if (
      !preferencesLoaded ||
      !databaseLoaded ||
      !onboardingChecked ||
      !navigationState?.key
    ) {
      return;
    }

    SplashScreen.hide();
  }, [
    preferencesLoaded,
    databaseLoaded,
    onboardingChecked,
    navigationState?.key,
  ]);

  if (
    !preferencesLoaded ||
    !databaseLoaded
  ) {
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

      <StatusBar
        style={statusBarStyle}
      />

      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor:
              "transparent",
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