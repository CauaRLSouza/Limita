import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import ThemeAccent from "../components/ThemeAccent";
import {
  BudgetPeriod,
  createBudget,
  getBudgetById,
  updateBudget,
} from "../database/budgets";
import { useTheme } from "../theme/ThemeContext";

type Periodo = "Diário" | "Semanal" | "Mensal" | "Personalizado";

type FeedbackState = {
  visible: boolean;
  title: string;
  message: string;
};

const periodos: Periodo[] = [
  "Diário",
  "Semanal",
  "Mensal",
  "Personalizado",
];

const periodoParaBanco: Record<Periodo, BudgetPeriod> = {
  Diário: "daily",
  Semanal: "weekly",
  Mensal: "monthly",
  Personalizado: "custom",
};

const periodoDoBanco: Record<BudgetPeriod, Periodo> = {
  daily: "Diário",
  weekly: "Semanal",
  monthly: "Mensal",
  custom: "Personalizado",
};

const nomesMeses = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const diasSemana = ["D", "S", "T", "Q", "Q", "S", "S"];

function normalizarData(data: Date) {
  return new Date(
    data.getFullYear(),
    data.getMonth(),
    data.getDate()
  );
}

function adicionarDias(data: Date, dias: number) {
  const resultado = normalizarData(data);
  resultado.setDate(resultado.getDate() + dias);
  return normalizarData(resultado);
}

function diferencaDias(inicio: Date, fim: Date) {
  const primeiro = Date.UTC(
    inicio.getFullYear(),
    inicio.getMonth(),
    inicio.getDate()
  );

  const ultimo = Date.UTC(
    fim.getFullYear(),
    fim.getMonth(),
    fim.getDate()
  );

  return Math.round((ultimo - primeiro) / 86400000);
}

function dataParaBanco(data: Date) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function dataDoBanco(value: string) {
  const [ano, mes, dia] = value.split("-").map(Number);
  return normalizarData(new Date(ano, mes - 1, dia));
}

function formatarData(data: Date) {
  return data.toLocaleDateString("pt-BR");
}

function mesmaData(primeira: Date, segunda: Date) {
  return (
    primeira.getFullYear() === segunda.getFullYear() &&
    primeira.getMonth() === segunda.getMonth() &&
    primeira.getDate() === segunda.getDate()
  );
}

function formatarCentavos(centavos: number) {
  return (centavos / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function extrairCentavos(texto: string) {
  const valor = Number(texto.replace(/\D/g, ""));
  return Number.isSafeInteger(valor) && valor >= 0 ? valor : 0;
}

function FieldLabel({ children }: { children: string }) {
  const { theme } = useTheme();

  return (
    <Text style={[styles.label, { color: theme.colors.text }]}>
      {children}
    </Text>
  );
}

type DateFieldProps = {
  icon: "calendar-today" | "event";
  label: string;
  date: Date;
  onPress: () => void;
  accentColor?: string;
};

function DateField({
  icon,
  label,
  date,
  onPress,
  accentColor,
}: DateFieldProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.dateField,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <View style={styles.dateLeft}>
        <MaterialIcons
          name={icon}
          size={22}
          color={accentColor ?? theme.colors.textSecondary}
        />

        <Text style={[styles.dateText, { color: theme.colors.text }]}>
          {label}
        </Text>
      </View>

      <Text
        style={[
          styles.dateValue,
          { color: theme.colors.textSecondary },
        ]}
      >
        {formatarData(date)}
      </Text>

      <MaterialIcons
        name="chevron-right"
        size={25}
        color={theme.colors.textSecondary}
      />
    </Pressable>
  );
}

type CalendarioTematicoProps = {
  visible: boolean;
  inicio: Date;
  selecionada: Date;
  onSelect: (data: Date) => void;
  onClose: () => void;
};

function CalendarioTematico({
  visible,
  inicio,
  selecionada,
  onSelect,
  onClose,
}: CalendarioTematicoProps) {
  const { theme, activeSpecialTheme } = useTheme();
  const isPride = activeSpecialTheme === "pride";
  const destaque = isPride ? "#A855F7" : theme.colors.primary;

  const [mesVisivel, setMesVisivel] = useState(
    () => new Date(selecionada.getFullYear(), selecionada.getMonth(), 1)
  );

  useEffect(() => {
    if (!visible) return;

    const base =
      selecionada.getTime() >= inicio.getTime()
        ? selecionada
        : inicio;

    setMesVisivel(
      new Date(base.getFullYear(), base.getMonth(), 1)
    );
  }, [visible, inicio, selecionada]);

  const primeiroDia = new Date(
    mesVisivel.getFullYear(),
    mesVisivel.getMonth(),
    1
  );

  const diasNoMes = new Date(
    mesVisivel.getFullYear(),
    mesVisivel.getMonth() + 1,
    0
  ).getDate();

  const quantidadeCelulas =
    Math.ceil((primeiroDia.getDay() + diasNoMes) / 7) * 7;

  const celulas = Array.from(
    { length: quantidadeCelulas },
    (_, index) => {
      const dia = index - primeiroDia.getDay() + 1;
      return dia >= 1 && dia <= diasNoMes ? dia : null;
    }
  );

  const ultimoDiaMesAnterior = new Date(
    mesVisivel.getFullYear(),
    mesVisivel.getMonth(),
    0
  );

  const anteriorPermitido =
    ultimoDiaMesAnterior.getTime() >= inicio.getTime();

  function mudarMes(quantidade: number) {
    setMesVisivel(
      (atual) =>
        new Date(
          atual.getFullYear(),
          atual.getMonth() + quantidade,
          1
        )
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View
          style={[
            styles.calendarCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.calendarTop}>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.calendarTitle,
                  { color: theme.colors.text },
                ]}
              >
                Data de término
              </Text>

              <Text
                style={[
                  styles.calendarSubtitle,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Escolha o último dia do orçamento
              </Text>
            </View>

            <Pressable onPress={onClose} style={styles.calendarClose}>
              <MaterialIcons
                name="close"
                size={24}
                color={theme.colors.textSecondary}
              />
            </Pressable>
          </View>

          <View style={styles.calendarMonthRow}>
            <Pressable
              disabled={!anteriorPermitido}
              onPress={() => mudarMes(-1)}
              style={styles.calendarArrow}
            >
              <MaterialIcons
                name="chevron-left"
                size={29}
                color={
                  anteriorPermitido
                    ? theme.colors.text
                    : theme.colors.border
                }
              />
            </Pressable>

            <Text
              style={[
                styles.calendarMonthTitle,
                { color: theme.colors.text },
              ]}
            >
              {nomesMeses[mesVisivel.getMonth()]}{" "}
              {mesVisivel.getFullYear()}
            </Text>

            <Pressable
              onPress={() => mudarMes(1)}
              style={styles.calendarArrow}
            >
              <MaterialIcons
                name="chevron-right"
                size={29}
                color={theme.colors.text}
              />
            </Pressable>
          </View>

          <View style={styles.calendarGrid}>
            {diasSemana.map((dia, index) => (
              <View
                key={`semana-${index}`}
                style={styles.calendarCell}
              >
                <Text
                  style={[
                    styles.weekdayText,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {dia}
                </Text>
              </View>
            ))}

            {celulas.map((dia, index) => {
              if (dia === null) {
                return (
                  <View
                    key={`vazio-${index}`}
                    style={styles.calendarCell}
                  />
                );
              }

              const data = new Date(
                mesVisivel.getFullYear(),
                mesVisivel.getMonth(),
                dia
              );

              const bloqueado = data.getTime() < inicio.getTime();
              const selecionado = mesmaData(data, selecionada);

              return (
                <View key={`dia-${dia}`} style={styles.calendarCell}>
                  <Pressable
                    disabled={bloqueado}
                    onPress={() => onSelect(data)}
                    style={[
                      styles.calendarDay,
                      selecionado && { backgroundColor: destaque },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: selecionado ? "800" : "600",
                        color: selecionado
                          ? "#FFFFFF"
                          : bloqueado
                            ? theme.colors.textSecondary
                            : theme.colors.text,
                        opacity: bloqueado ? 0.35 : 1,
                      }}
                    >
                      {dia}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>

          <View
            style={[
              styles.calendarFooter,
              { borderTopColor: theme.colors.border },
            ]}
          >
            <Text
              style={[
                styles.calendarFooterText,
                { color: theme.colors.textSecondary },
              ]}
            >
              Início: {formatarData(inicio)}
            </Text>

            <Text
              style={[
                styles.calendarFooterText,
                { color: destaque, fontWeight: "700" },
              ]}
            >
              Fim: {formatarData(selecionada)}
            </Text>
          </View>

          <Pressable
            onPress={onClose}
            style={styles.calendarConfirmPressable}
          >
            <ThemeAccent style={styles.calendarConfirm}>
              <Text style={styles.saveButtonText}>Confirmar</Text>
            </ThemeAccent>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

type BudgetSwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
};

function BudgetSwitch({ value, onValueChange }: BudgetSwitchProps) {
  const { theme } = useTheme();

  if (value && theme.visuals.useGradientPrimary) {
    return (
      <Pressable
        onPress={() => onValueChange(false)}
        style={styles.customSwitch}
      >
        <ThemeAccent style={styles.switchTrack}>
          <View
            style={[styles.switchThumb, styles.switchThumbOn]}
          />
        </ThemeAccent>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      style={[
        styles.customSwitch,
        {
          backgroundColor: value
            ? theme.colors.primary
            : theme.colors.surfaceSecondary,
        },
      ]}
    >
      <View
        style={[
          styles.switchThumb,
          value ? styles.switchThumbOn : styles.switchThumbOff,
        ]}
      />
    </Pressable>
  );
}

export default function NovoOrcamentoScreen() {
  const { theme, activeSpecialTheme } = useTheme();
  const params = useLocalSearchParams<{ id?: string | string[] }>();

  const idParam = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const budgetId = idParam ? Number(idParam) : null;

  const isEditing =
    budgetId !== null &&
    Number.isInteger(budgetId) &&
    budgetId > 0;

  const isPride = activeSpecialTheme === "pride";
  const useGradientPrimary = theme.visuals.useGradientPrimary;
  const hoje = normalizarData(new Date());

  const [nome, setNome] = useState("Gastos pessoais");
  const [valorCentavos, setValorCentavos] = useState(0);
  const [periodo, setPeriodo] = useState<Periodo>("Diário");
  const [mostrarPeriodos, setMostrarPeriodos] = useState(false);
  const [repetirAutomaticamente, setRepetirAutomaticamente] = useState(true);

  const [dataInicio, setDataInicio] = useState(
    () => normalizarData(new Date())
  );

  const [dataFim, setDataFim] = useState(
    () => adicionarDias(normalizarData(new Date()), 9)
  );

  const [mostrarDatePicker, setMostrarDatePicker] = useState(false);
  const [mostrarCalendarioFim, setMostrarCalendarioFim] = useState(false);
  const [carregando, setCarregando] = useState(isEditing);
  const [salvando, setSalvando] = useState(false);

  const [feedback, setFeedback] = useState<FeedbackState>({
    visible: false,
    title: "",
    message: "",
  });

  const valor = formatarCentavos(valorCentavos);
  const dataEhHoje = mesmaData(dataInicio, hoje);
  const duracaoPersonalizada = diferencaDias(dataInicio, dataFim) + 1;

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      if (!isEditing || budgetId === null) {
        setCarregando(false);
        return;
      }

      try {
        const budget = await getBudgetById(budgetId);

        if (!ativo) return;

        if (!budget) {
          mostrarFeedback(
            "Orçamento não encontrado",
            "Esse orçamento não existe mais."
          );
          return;
        }

        setNome(budget.name);
        setValorCentavos(budget.amountCents);
        setPeriodo(periodoDoBanco[budget.period]);
        setRepetirAutomaticamente(budget.autoRepeat);

        const inicio = dataDoBanco(budget.startDate);
        setDataInicio(inicio);
        setDataFim(adicionarDias(inicio, (budget.customDays ?? 10) - 1));
      } catch (error) {
        console.error("Erro ao carregar orçamento:", error);

        if (ativo) {
          mostrarFeedback(
            "Não foi possível carregar",
            "Ocorreu um erro ao carregar este orçamento."
          );
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregar();

    return () => {
      ativo = false;
    };
  }, [budgetId, isEditing]);

  function mostrarFeedback(title: string, message: string) {
    setFeedback({ visible: true, title, message });
  }

  function fecharFeedback() {
    setFeedback((atual) => ({ ...atual, visible: false }));
  }

  function selecionarPeriodo(novoPeriodo: Periodo) {
    setPeriodo(novoPeriodo);
    setMostrarPeriodos(false);

    if (
      novoPeriodo === "Personalizado" &&
      dataFim.getTime() < dataInicio.getTime()
    ) {
      setDataFim(adicionarDias(dataInicio, 9));
    }
  }

  function alterarData(
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) {
    if (Platform.OS === "android") {
      setMostrarDatePicker(false);
    }

    if (event.type === "dismissed" || !selectedDate) return;

    const novaData = normalizarData(selectedDate);

    if (!isEditing && novaData.getTime() < hoje.getTime()) return;

    const duracaoAtual = Math.max(
      1,
      diferencaDias(dataInicio, dataFim) + 1
    );

    setDataInicio(novaData);

    if (dataFim.getTime() < novaData.getTime()) {
      setDataFim(adicionarDias(novaData, duracaoAtual - 1));
    }
  }

  async function salvarOrcamento() {
    if (salvando) return;

    const nomeLimpo = nome.trim();

    if (!nomeLimpo) {
      mostrarFeedback("Nome obrigatório", "Dê um nome ao seu orçamento.");
      return;
    }

    if (valorCentavos <= 0) {
      mostrarFeedback("Valor inválido", "Informe um valor maior que zero.");
      return;
    }

    if (periodo === "Personalizado" && duracaoPersonalizada < 1) {
      mostrarFeedback(
        "Período inválido",
        "A data de término não pode ser anterior à data de início."
      );
      return;
    }

    setSalvando(true);

    try {
      const input = {
        name: nomeLimpo,
        amountCents: valorCentavos,
        period: periodoParaBanco[periodo],
        customDays:
          periodo === "Personalizado" ? duracaoPersonalizada : null,
        autoRepeat: repetirAutomaticamente,
        startDate: dataParaBanco(dataInicio),
      };

      if (isEditing && budgetId !== null) {
        await updateBudget(budgetId, input);
      } else {
        await createBudget(input);
      }

      router.back();
    } catch (error) {
      console.error("Erro ao salvar orçamento:", error);

      mostrarFeedback(
        "Não foi possível salvar",
        error instanceof Error
          ? error.message
          : "Ocorreu um erro ao salvar o orçamento."
      );
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={theme.colors.primary} />

        <Text
          style={[
            styles.loadingText,
            { color: theme.colors.textSecondary },
          ]}
        >
          Carregando orçamento...
        </Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons
              name="arrow-back"
              size={29}
              color={theme.colors.text}
            />
          </Pressable>

          <Text style={[styles.title, { color: theme.colors.text }]}>
            {isEditing ? "Editar orçamento" : "Novo orçamento"}
          </Text>
        </View>

        <FieldLabel>Nome</FieldLabel>

        <TextInput
          value={nome}
          onChangeText={setNome}
          placeholder="Ex.: Gastos pessoais"
          placeholderTextColor={theme.colors.textSecondary}
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              color: theme.colors.text,
            },
          ]}
        />

        <FieldLabel>Valor</FieldLabel>

        <View
          style={[
            styles.valueInputContainer,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.currency,
              { color: theme.colors.textSecondary },
            ]}
          >
            R$
          </Text>

          <TextInput
            value={valor}
            onChangeText={(texto) =>
              setValorCentavos(extrairCentavos(texto))
            }
            keyboardType="number-pad"
            selectTextOnFocus={false}
            style={[
              styles.valueInput,
              { color: theme.colors.text },
            ]}
          />
        </View>

        <FieldLabel>Período</FieldLabel>

        <Pressable
          onPress={() => setMostrarPeriodos((atual) => !atual)}
          style={[
            styles.select,
            {
              backgroundColor: theme.colors.surface,
              borderColor: isPride ? "#A855F7" : theme.colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.selectText,
              { color: theme.colors.text },
            ]}
          >
            {periodo}
          </Text>

          <MaterialIcons
            name={
              mostrarPeriodos
                ? "keyboard-arrow-up"
                : "keyboard-arrow-down"
            }
            size={27}
            color={
              isPride ? "#A855F7" : theme.colors.textSecondary
            }
          />
        </Pressable>

        {mostrarPeriodos && (
          <View
            style={[
              styles.dropdown,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            {periodos.map((item, index) => (
              <Pressable
                key={item}
                onPress={() => selecionarPeriodo(item)}
                style={[
                  styles.dropdownItem,
                  index !== periodos.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    {
                      color:
                        periodo === item
                          ? isPride
                            ? "#A855F7"
                            : theme.colors.primary
                          : theme.colors.text,
                    },
                  ]}
                >
                  {item}
                </Text>

                {periodo === item && (
                  <MaterialIcons
                    name="check"
                    size={22}
                    color={
                      isPride ? "#A855F7" : theme.colors.primary
                    }
                  />
                )}
              </Pressable>
            ))}
          </View>
        )}

        <View style={styles.repeatRow}>
          <View style={styles.repeatTextContainer}>
            <Text
              style={[
                styles.repeatTitle,
                { color: theme.colors.text },
              ]}
            >
              Repetir automaticamente
            </Text>

            <Text
              style={[
                styles.repeatDescription,
                { color: theme.colors.textSecondary },
              ]}
            >
              Cria um novo período quando o atual terminar
            </Text>
          </View>

          <BudgetSwitch
            value={repetirAutomaticamente}
            onValueChange={setRepetirAutomaticamente}
          />
        </View>

        <FieldLabel>Data de início</FieldLabel>

        <DateField
          icon="calendar-today"
          label={
            dataEhHoje
              ? "Hoje"
              : isEditing
                ? "Início"
                : "Agendado"
          }
          date={dataInicio}
          accentColor={isPride ? "#168AF2" : undefined}
          onPress={() => {
            setMostrarPeriodos(false);
            setMostrarDatePicker(true);
          }}
        />

        {mostrarDatePicker && (
          <DateTimePicker
            value={dataInicio}
            mode="date"
            display={Platform.OS === "ios" ? "inline" : "default"}
            minimumDate={isEditing ? undefined : hoje}
            onChange={alterarData}
          />
        )}

        {periodo === "Personalizado" && (
          <>
            <FieldLabel>Data de término</FieldLabel>

            <DateField
              icon="event"
              label="Término"
              date={dataFim}
              accentColor={isPride ? "#A855F7" : undefined}
              onPress={() => {
                setMostrarPeriodos(false);
                setMostrarCalendarioFim(true);
              }}
            />

            <Text
              style={[
                styles.durationText,
                { color: theme.colors.textSecondary },
              ]}
            >
              {duracaoPersonalizada}{" "}
              {duracaoPersonalizada === 1 ? "dia" : "dias"} de orçamento
              {repetirAutomaticamente
                ? " • repete pela mesma duração"
                : " • sem renovação"}
            </Text>
          </>
        )}

        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <MaterialIcons
            name="info-outline"
            size={22}
            color={isPride ? "#7C3AED" : theme.colors.primary}
          />

          <View style={styles.summaryContent}>
            <Text
              style={[
                styles.summaryTitle,
                { color: theme.colors.text },
              ]}
            >
              Seu orçamento
            </Text>

            <Text
              style={[
                styles.summaryText,
                { color: theme.colors.textSecondary },
              ]}
            >
              R$ {valor} • {periodo.toLowerCase()}
              {periodo === "Personalizado"
                ? ` (${duracaoPersonalizada} ${
                    duracaoPersonalizada === 1 ? "dia" : "dias"
                  })`
                : ""}
              {repetirAutomaticamente
                ? " • renovação automática"
                : ""}
              {periodo === "Personalizado"
                ? ` • ${formatarData(dataInicio)} a ${formatarData(dataFim)}`
                : !dataEhHoje
                  ? ` • começa em ${formatarData(dataInicio)}`
                  : ""}
            </Text>
          </View>
        </View>

        {useGradientPrimary ? (
          <Pressable
            onPress={salvarOrcamento}
            disabled={salvando}
            style={[
              styles.savePressable,
              { opacity: salvando ? 0.7 : 1 },
            ]}
          >
            <ThemeAccent style={styles.saveButtonGradient}>
              <Text style={styles.saveButtonText}>
                {salvando
                  ? "Salvando..."
                  : isEditing
                    ? "Salvar alterações"
                    : "Salvar orçamento"}
              </Text>
            </ThemeAccent>
          </Pressable>
        ) : (
          <Pressable
            onPress={salvarOrcamento}
            disabled={salvando}
            style={[
              styles.saveButton,
              {
                backgroundColor: theme.colors.primary,
                opacity: salvando ? 0.7 : 1,
              },
            ]}
          >
            <Text style={styles.saveButtonText}>
              {salvando
                ? "Salvando..."
                : isEditing
                  ? "Salvar alterações"
                  : "Salvar orçamento"}
            </Text>
          </Pressable>
        )}
      </ScrollView>

      <CalendarioTematico
        visible={mostrarCalendarioFim}
        inicio={dataInicio}
        selecionada={dataFim}
        onSelect={(data) => {
          setDataFim(data);
          setMostrarCalendarioFim(false);
        }}
        onClose={() => setMostrarCalendarioFim(false)}
      />

      <Modal
        visible={feedback.visible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={fecharFeedback}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.feedbackCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.feedbackIcon,
                { backgroundColor: `${theme.colors.primary}18` },
              ]}
            >
              <MaterialIcons
                name="info-outline"
                size={27}
                color={theme.colors.primary}
              />
            </View>

            <Text
              style={[
                styles.feedbackTitle,
                { color: theme.colors.text },
              ]}
            >
              {feedback.title}
            </Text>

            <Text
              style={[
                styles.feedbackMessage,
                { color: theme.colors.textSecondary },
              ]}
            >
              {feedback.message}
            </Text>

            <Pressable
              onPress={fecharFeedback}
              style={({ pressed }) => ({
                opacity: pressed ? 0.82 : 1,
                width: "100%",
              })}
            >
              <ThemeAccent style={styles.feedbackButton}>
                <Text style={styles.feedbackButtonText}>Entendi</Text>
              </ThemeAccent>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "transparent",
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 110,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  title: {
    fontSize: 27,
    fontWeight: "700",
    letterSpacing: -0.5,
    marginLeft: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 9,
  },
  input: {
    height: 64,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 17,
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 22,
  },
  valueInputContainer: {
    height: 72,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 17,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
  },
  currency: {
    fontSize: 21,
    fontWeight: "700",
    marginRight: 8,
  },
  valueInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: "700",
    padding: 0,
  },
  select: {
    height: 64,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },
  selectText: {
    fontSize: 16,
    fontWeight: "600",
  },
  dropdown: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginTop: -14,
    marginBottom: 22,
  },
  dropdownItem: {
    height: 56,
    paddingHorizontal: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownText: {
    fontSize: 16,
    fontWeight: "600",
  },
  repeatRow: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },
  repeatTextContainer: {
    flex: 1,
    paddingRight: 16,
  },
  repeatTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  repeatDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 5,
  },
  customSwitch: {
    width: 52,
    height: 30,
    borderRadius: 15,
    overflow: "hidden",
    justifyContent: "center",
  },
  switchTrack: {
    flex: 1,
    width: "100%",
    borderRadius: 15,
    justifyContent: "center",
  },
  switchThumb: {
    position: "absolute",
    top: 3,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  switchThumbOn: {
    right: 3,
  },
  switchThumbOff: {
    left: 3,
  },
  dateField: {
    minHeight: 64,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dateLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "600",
  },
  dateValue: {
    fontSize: 14,
    marginRight: 5,
  },
  durationText: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: -12,
    marginBottom: 24,
    paddingHorizontal: 2,
  },
  summaryCard: {
    borderRadius: 17,
    borderWidth: 1,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  summaryContent: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  summaryText: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  savePressable: {
    marginTop: 28,
    borderRadius: 17,
    overflow: "hidden",
  },
  saveButtonGradient: {
    height: 60,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  saveButton: {
    height: 60,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
    overflow: "hidden",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.62)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  feedbackCard: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 20,
    alignItems: "center",
  },
  feedbackIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  feedbackTitle: {
    fontSize: 21,
    fontWeight: "800",
    textAlign: "center",
  },
  feedbackMessage: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 22,
  },
  feedbackButton: {
    width: "100%",
    minHeight: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  feedbackButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  calendarCard: {
    width: "100%",
    maxWidth: 390,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 18,
  },
  calendarTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 5,
    gap: 8,
  },
  calendarTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  calendarSubtitle: {
    fontSize: 13,
    marginTop: 5,
  },
  calendarClose: {
    padding: 4,
  },
  calendarMonthRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 23,
    marginBottom: 10,
  },
  calendarArrow: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  calendarMonthTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  calendarCell: {
    width: "14.285714%",
    height: 43,
    alignItems: "center",
    justifyContent: "center",
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: "700",
  },
  calendarDay: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  calendarFooter: {
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 13,
    paddingHorizontal: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  calendarFooterText: {
    fontSize: 12,
  },
  calendarConfirmPressable: {
    marginTop: 18,
    borderRadius: 15,
    overflow: "hidden",
  },
  calendarConfirm: {
    height: 50,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
});