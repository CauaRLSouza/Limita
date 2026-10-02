import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type NotificationPreferences = {
  notificacoesAtivas: boolean;
  orcamentos: boolean;
  movimentacoesAgendadas: boolean;
  cicloFinanceiro: boolean;
  lembretes: boolean;
  temasEspeciais: boolean;
};

type NotificationPreferencesContextData =
  NotificationPreferences & {
    setNotificacoesAtivas: (value: boolean) => void;
    setOrcamentos: (value: boolean) => void;
    setMovimentacoesAgendadas: (value: boolean) => void;
    setCicloFinanceiro: (value: boolean) => void;
    setLembretes: (value: boolean) => void;
    setTemasEspeciais: (value: boolean) => void;
    preferencesLoaded: boolean;
  };

const STORAGE_KEY =
  "@limita:notification-preferences";

const defaultPreferences: NotificationPreferences = {
  notificacoesAtivas: true,
  orcamentos: true,
  movimentacoesAgendadas: true,
  cicloFinanceiro: true,
  lembretes: true,
  temasEspeciais: true,
};

const NotificationPreferencesContext =
  createContext<
    NotificationPreferencesContextData | undefined
  >(undefined);

type NotificationPreferencesProviderProps = {
  children: ReactNode;
};

export function NotificationPreferencesProvider({
  children,
}: NotificationPreferencesProviderProps) {
  const [
    notificacoesAtivas,
    setNotificacoesAtivas,
  ] = useState(
    defaultPreferences.notificacoesAtivas
  );

  const [orcamentos, setOrcamentos] = useState(
    defaultPreferences.orcamentos
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

  const [lembretes, setLembretes] = useState(
    defaultPreferences.lembretes
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
        const stored =
          await AsyncStorage.getItem(STORAGE_KEY);

        if (stored) {
          const parsed = JSON.parse(
            stored
          ) as Partial<NotificationPreferences>;

          if (
            typeof parsed.notificacoesAtivas ===
            "boolean"
          ) {
            setNotificacoesAtivas(
              parsed.notificacoesAtivas
            );
          }

          if (
            typeof parsed.orcamentos === "boolean"
          ) {
            setOrcamentos(parsed.orcamentos);
          }

          if (
            typeof parsed.movimentacoesAgendadas ===
            "boolean"
          ) {
            setMovimentacoesAgendadas(
              parsed.movimentacoesAgendadas
            );
          }

          if (
            typeof parsed.cicloFinanceiro ===
            "boolean"
          ) {
            setCicloFinanceiro(
              parsed.cicloFinanceiro
            );
          }

          if (
            typeof parsed.lembretes === "boolean"
          ) {
            setLembretes(parsed.lembretes);
          }

          if (
            typeof parsed.temasEspeciais ===
            "boolean"
          ) {
            setTemasEspeciais(
              parsed.temasEspeciais
            );
          }
        }
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
        orcamentos,
        movimentacoesAgendadas,
        cicloFinanceiro,
        lembretes,
        temasEspeciais,
      };

      try {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(preferences)
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
    orcamentos,
    movimentacoesAgendadas,
    cicloFinanceiro,
    lembretes,
    temasEspeciais,
    preferencesLoaded,
  ]);

  return (
    <NotificationPreferencesContext.Provider
      value={{
        notificacoesAtivas,
        setNotificacoesAtivas,

        orcamentos,
        setOrcamentos,

        movimentacoesAgendadas,
        setMovimentacoesAgendadas,

        cicloFinanceiro,
        setCicloFinanceiro,

        lembretes,
        setLembretes,

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
  const context = useContext(
    NotificationPreferencesContext
  );

  if (!context) {
    throw new Error(
      "useNotificationPreferences deve ser usado dentro de NotificationPreferencesProvider"
    );
  }

  return context;
}