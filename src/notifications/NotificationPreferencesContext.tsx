import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export type NotificationPreferences = {
  notificacoesAtivas: boolean;
  movimentacoesAgendadas: boolean;
  cicloFinanceiro: boolean;
  rendimentosRecorrentes: boolean;
  progresso: boolean;
  temasEspeciais: boolean;
};

type NotificationPreferencesContextData =
  NotificationPreferences & {
    setNotificacoesAtivas: (value: boolean) => void;
    setMovimentacoesAgendadas: (value: boolean) => void;
    setCicloFinanceiro: (value: boolean) => void;
    setRendimentosRecorrentes: (value: boolean) => void;
    setProgresso: (value: boolean) => void;
    setTemasEspeciais: (value: boolean) => void;
    preferencesLoaded: boolean;
  };

export const NOTIFICATION_PREFERENCES_STORAGE_KEY =
  "@limita:notification-preferences";

const defaultPreferences: NotificationPreferences = {
  notificacoesAtivas: true,
  movimentacoesAgendadas: true,
  cicloFinanceiro: true,
  rendimentosRecorrentes: true,
  progresso: true,
  temasEspeciais: true,
};

const NotificationPreferencesContext =
  createContext<
    NotificationPreferencesContextData | undefined
  >(undefined);

type NotificationPreferencesProviderProps = {
  children: ReactNode;
};

export async function getStoredNotificationPreferences(): Promise<NotificationPreferences> {
  try {
    const stored =
      await AsyncStorage.getItem(
        NOTIFICATION_PREFERENCES_STORAGE_KEY
      );

    if (!stored) {
      return defaultPreferences;
    }

    const parsed =
      JSON.parse(
        stored
      ) as Partial<
        NotificationPreferences & {
          lembretes: boolean;
        }
      >;

    return {
      notificacoesAtivas:
        typeof parsed.notificacoesAtivas ===
        "boolean"
          ? parsed.notificacoesAtivas
          : defaultPreferences.notificacoesAtivas,

      movimentacoesAgendadas:
        typeof parsed.movimentacoesAgendadas ===
        "boolean"
          ? parsed.movimentacoesAgendadas
          : defaultPreferences.movimentacoesAgendadas,

      cicloFinanceiro:
        typeof parsed.cicloFinanceiro ===
        "boolean"
          ? parsed.cicloFinanceiro
          : defaultPreferences.cicloFinanceiro,

      rendimentosRecorrentes:
        typeof parsed.rendimentosRecorrentes ===
        "boolean"
          ? parsed.rendimentosRecorrentes
          : typeof parsed.lembretes ===
              "boolean"
            ? parsed.lembretes
            : defaultPreferences.rendimentosRecorrentes,

      progresso:
        typeof parsed.progresso ===
        "boolean"
          ? parsed.progresso
          : defaultPreferences.progresso,

      temasEspeciais:
        typeof parsed.temasEspeciais ===
        "boolean"
          ? parsed.temasEspeciais
          : defaultPreferences.temasEspeciais,
    };
  } catch {
    return defaultPreferences;
  }
}

export function NotificationPreferencesProvider({
  children,
}: NotificationPreferencesProviderProps) {
  const [
    notificacoesAtivas,
    setNotificacoesAtivas,
  ] = useState(
    defaultPreferences.notificacoesAtivas
  );

  const [
    movimentacoesAgendadas,
    setMovimentacoesAgendadas,
  ] = useState(
    defaultPreferences.movimentacoesAgendadas
  );

  const [
    cicloFinanceiro,
    setCicloFinanceiro,
  ] = useState(
    defaultPreferences.cicloFinanceiro
  );

  const [
    rendimentosRecorrentes,
    setRendimentosRecorrentes,
  ] = useState(
    defaultPreferences.rendimentosRecorrentes
  );

  const [
    progresso,
    setProgresso,
  ] = useState(
    defaultPreferences.progresso
  );

  const [
    temasEspeciais,
    setTemasEspeciais,
  ] = useState(
    defaultPreferences.temasEspeciais
  );

  const [
    preferencesLoaded,
    setPreferencesLoaded,
  ] = useState(false);

  useEffect(() => {
    async function loadPreferences() {
      try {
        const preferences =
          await getStoredNotificationPreferences();

        setNotificacoesAtivas(
          preferences.notificacoesAtivas
        );

        setMovimentacoesAgendadas(
          preferences.movimentacoesAgendadas
        );

        setCicloFinanceiro(
          preferences.cicloFinanceiro
        );

        setRendimentosRecorrentes(
          preferences.rendimentosRecorrentes
        );

        setProgresso(
          preferences.progresso
        );

        setTemasEspeciais(
          preferences.temasEspeciais
        );
      } catch (error) {
        console.error(
          "Erro ao carregar preferências de notificações:",
          error
        );
      } finally {
        setPreferencesLoaded(true);
      }
    }

    loadPreferences();
  }, []);

  useEffect(() => {
    if (!preferencesLoaded) {
      return;
    }

    async function savePreferences() {
      const preferences: NotificationPreferences = {
        notificacoesAtivas,
        movimentacoesAgendadas,
        cicloFinanceiro,
        rendimentosRecorrentes,
        progresso,
        temasEspeciais,
      };

      try {
        await AsyncStorage.setItem(
          NOTIFICATION_PREFERENCES_STORAGE_KEY,
          JSON.stringify(
            preferences
          )
        );
      } catch (error) {
        console.error(
          "Erro ao salvar preferências de notificações:",
          error
        );
      }
    }

    savePreferences();
  }, [
    notificacoesAtivas,
    movimentacoesAgendadas,
    cicloFinanceiro,
    rendimentosRecorrentes,
    progresso,
    temasEspeciais,
    preferencesLoaded,
  ]);

  return (
    <NotificationPreferencesContext.Provider
      value={{
        notificacoesAtivas,
        setNotificacoesAtivas,

        movimentacoesAgendadas,
        setMovimentacoesAgendadas,

        cicloFinanceiro,
        setCicloFinanceiro,

        rendimentosRecorrentes,
        setRendimentosRecorrentes,

        progresso,
        setProgresso,

        temasEspeciais,
        setTemasEspeciais,

        preferencesLoaded,
      }}
    >
      {children}
    </NotificationPreferencesContext.Provider>
  );
}

export function useNotificationPreferences() {
  const context =
    useContext(
      NotificationPreferencesContext
    );

  if (!context) {
    throw new Error(
      "useNotificationPreferences deve ser usado dentro de NotificationPreferencesProvider"
    );
  }

  return context;
}