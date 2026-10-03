import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  configureInitialCycle,
} from "../database/cycles";
import {
  completeOnboarding,
  RecurringIncomeInput,
  ReceiptType,
  replaceRecurringIncomes,
  saveProfile,
} from "../database/profile";
import { useTheme } from "../theme/ThemeContext";

type Step =
  | "welcome"
  | "name"
  | "profession"
  | "income"
  | "currentMonth"
  | "finish";

type IncomeDraft = {
  id: string;
  amountCents: number;
  receiptType: ReceiptType;
  customDay: string;
};

type CurrentMonthIncome = {
  incomeId: string;
  received: boolean | null;
  remainingCents: number;
};

function createId() {
  return `${Date.now()}-${Math.random()}`;
}

function formatCents(cents: number) {
  return (cents / 100).toLocaleString(
    "pt-BR",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  );
}

function extractCents(text: string) {
  const numbers = text.replace(
    /\D/g,
    ""
  );

  if (!numbers) {
    return 0;
  }

  const value = Number(numbers);

  if (
    !Number.isFinite(value) ||
    value < 0
  ) {
    return 0;
  }

  return value;
}

function receiptText(
  type: ReceiptType,
  customDay: string
) {
  if (type === "first_day") {
    return "1º dia do mês";
  }

  if (
    type === "first_business_day"
  ) {
    return "1º dia útil do mês";
  }

  if (customDay) {
    return `Todo dia ${customDay}`;
  }

  return "Dia personalizado";
}

function getLastDayOfMonth(
  year: number,
  month: number
) {
  return new Date(
    year,
    month,
    0
  ).getDate();
}

function getFirstBusinessDay(
  year: number,
  month: number
) {
  const date = new Date(
    year,
    month - 1,
    1
  );

  while (
    date.getDay() === 0 ||
    date.getDay() === 6
  ) {
    date.setDate(
      date.getDate() + 1
    );
  }

  return date;
}

function getIncomeReceiptDate(
  income: IncomeDraft,
  year: number,
  month: number
) {
  if (
    income.receiptType ===
    "first_day"
  ) {
    return new Date(
      year,
      month - 1,
      1
    );
  }

  if (
    income.receiptType ===
    "first_business_day"
  ) {
    return getFirstBusinessDay(
      year,
      month
    );
  }

  const configuredDay =
    Number(income.customDay);

  const lastDay =
    getLastDayOfMonth(
      year,
      month
    );

  const effectiveDay =
    Math.min(
      configuredDay,
      lastDay
    );

  return new Date(
    year,
    month - 1,
    effectiveDay
  );
}

function startOfDay(
  date: Date
) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  const [step, setStep] =
    useState<Step>("welcome");

  const [name, setName] =
    useState("");

  const [professions, setProfessions] =
    useState<string[]>([]);

  const [
    newProfession,
    setNewProfession,
  ] = useState("");

  const [
    noOccupation,
    setNoOccupation,
  ] = useState(false);

  const [incomes, setIncomes] =
    useState<IncomeDraft[]>([]);

  const [
    editingIncome,
    setEditingIncome,
  ] =
    useState<IncomeDraft | null>(
      null
    );

  const [
    showReceiptOptions,
    setShowReceiptOptions,
  ] = useState(false);

  const [
    currentMonthIncomes,
    setCurrentMonthIncomes,
  ] = useState<
    CurrentMonthIncome[]
  >([]);

  const [error, setError] =
    useState<string | null>(null);

  const [saving, setSaving] =
    useState(false);

  const totalIncome = useMemo(
    () =>
      incomes.reduce(
        (total, income) =>
          total + income.amountCents,
        0
      ),
    [incomes]
  );

  const dueIncomes = useMemo(
    () => {
      const today =
        startOfDay(new Date());

      const year =
        today.getFullYear();

      const month =
        today.getMonth() + 1;

      return incomes.filter(
        (income) => {
          const receiptDate =
            getIncomeReceiptDate(
              income,
              year,
              month
            );

          return (
            startOfDay(
              receiptDate
            ) <= today
          );
        }
      );
    },
    [incomes]
  );

  const initialMonthlyBalanceCents =
    useMemo(
      () =>
        currentMonthIncomes.reduce(
          (total, item) =>
            item.received
              ? total +
                item.remainingCents
              : total,
          0
        ),
      [currentMonthIncomes]
    );

  function prepareCurrentMonth() {
    setCurrentMonthIncomes(
      dueIncomes.map(
        (income) => {
          const existing =
            currentMonthIncomes.find(
              (item) =>
                item.incomeId ===
                income.id
            );

          return (
            existing ?? {
              incomeId: income.id,
              received: null,
              remainingCents: 0,
            }
          );
        }
      )
    );
  }

  function goBack() {
    setError(null);

    if (editingIncome) {
      setEditingIncome(null);
      setShowReceiptOptions(false);
      return;
    }

    if (step === "name") {
      setStep("welcome");
      return;
    }

    if (step === "profession") {
      setStep("name");
      return;
    }

    if (step === "income") {
      setStep("profession");
      return;
    }

    if (step === "currentMonth") {
      setStep("income");
      return;
    }

    if (step === "finish") {
      if (dueIncomes.length > 0) {
        setStep("currentMonth");
      } else {
        setStep("income");
      }
    }
  }

  function addProfession() {
    const value =
      newProfession.trim();

    if (!value) {
      return;
    }

    setProfessions((current) => [
      ...current,
      value,
    ]);

    setNewProfession("");
    setNoOccupation(false);
  }

  function removeProfession(
    index: number
  ) {
    setProfessions((current) =>
      current.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );
  }

  function toggleNoOccupation() {
    setNoOccupation((current) => {
      const next = !current;

      if (next) {
        setProfessions([]);
        setNewProfession("");
      }

      return next;
    });
  }

  function continueName() {
    if (!name.trim()) {
      setError(
        "Conta pra gente como podemos te chamar."
      );
      return;
    }

    setError(null);
    setStep("profession");
  }

  function continueProfession() {
    const pending =
      newProfession.trim();

    let nextProfessions =
      professions;

    if (
      pending &&
      !noOccupation
    ) {
      nextProfessions = [
        ...professions,
        pending,
      ];

      setProfessions(
        nextProfessions
      );
      setNewProfession("");
    }

    if (
      !noOccupation &&
      nextProfessions.length === 0
    ) {
      setError(
        "Adicione pelo menos uma profissão ou marque que está sem ocupação profissional no momento."
      );
      return;
    }

    setError(null);
    setStep("income");
  }

  function openNewIncome() {
    setEditingIncome({
      id: createId(),
      amountCents: 0,
      receiptType:
        "first_business_day",
      customDay: "",
    });

    setShowReceiptOptions(false);
    setError(null);
  }

  function openIncome(
    income: IncomeDraft
  ) {
    setEditingIncome({
      ...income,
    });

    setShowReceiptOptions(false);
    setError(null);
  }

  function saveIncome() {
    if (!editingIncome) {
      return;
    }

    if (
      editingIncome.amountCents <= 0
    ) {
      setError(
        "Informe um valor mensal maior que zero."
      );
      return;
    }

    if (
      editingIncome.receiptType ===
      "custom"
    ) {
      const day = Number(
        editingIncome.customDay
      );

      if (
        !Number.isInteger(day) ||
        day < 1 ||
        day > 31
      ) {
        setError(
          "Informe um dia entre 1 e 31."
        );
        return;
      }
    }

    setIncomes((current) => {
      const exists = current.some(
        (income) =>
          income.id ===
          editingIncome.id
      );

      if (exists) {
        return current.map(
          (income) =>
            income.id ===
            editingIncome.id
              ? editingIncome
              : income
        );
      }

      return [
        ...current,
        editingIncome,
      ];
    });

    setEditingIncome(null);
    setShowReceiptOptions(false);
    setError(null);
  }

  function deleteIncome() {
    if (!editingIncome) {
      return;
    }

    setIncomes((current) =>
      current.filter(
        (income) =>
          income.id !==
          editingIncome.id
      )
    );

    setCurrentMonthIncomes(
      (current) =>
        current.filter(
          (item) =>
            item.incomeId !==
            editingIncome.id
        )
    );

    setEditingIncome(null);
    setShowReceiptOptions(false);
    setError(null);
  }

  function continueIncome() {
    setError(null);

    if (dueIncomes.length > 0) {
      prepareCurrentMonth();
      setStep("currentMonth");
      return;
    }

    setCurrentMonthIncomes([]);
    setStep("finish");
  }

  function setIncomeReceived(
    incomeId: string,
    received: boolean
  ) {
    setCurrentMonthIncomes(
      (current) =>
        current.map((item) =>
          item.incomeId ===
          incomeId
            ? {
                ...item,
                received,
                remainingCents:
                  received
                    ? item.remainingCents
                    : 0,
              }
            : item
        )
    );

    setError(null);
  }

  function setIncomeRemaining(
    incomeId: string,
    remainingCents: number
  ) {
    setCurrentMonthIncomes(
      (current) =>
        current.map((item) =>
          item.incomeId ===
          incomeId
            ? {
                ...item,
                remainingCents,
              }
            : item
        )
    );

    setError(null);
  }

  function continueCurrentMonth() {
    const unanswered =
      currentMonthIncomes.some(
        (item) =>
          item.received === null
      );

    if (unanswered) {
      setError(
        "Responda se você já recebeu cada rendimento deste mês."
      );
      return;
    }

    const invalidRemaining =
      currentMonthIncomes.some(
        (item) => {
          if (!item.received) {
            return false;
          }

          const income =
            incomes.find(
              (candidate) =>
                candidate.id ===
                item.incomeId
            );

          if (!income) {
            return true;
          }

          return (
            item.remainingCents >
            income.amountCents
          );
        }
      );

    if (invalidRemaining) {
      setError(
        "O valor que ainda resta não pode ser maior que o rendimento cadastrado."
      );
      return;
    }

    setError(null);
    setStep("finish");
  }

  async function finishOnboarding() {
    if (saving) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await saveProfile({
        name,
        noOccupation,
        professions,
      });

      const recurringIncomes: RecurringIncomeInput[] =
        incomes.map((income) => ({
          amountCents:
            income.amountCents,
          receiptType:
            income.receiptType,
          customDay:
            income.receiptType ===
            "custom"
              ? Number(
                  income.customDay
                )
              : null,
        }));

      await replaceRecurringIncomes(
        recurringIncomes
      );

      await configureInitialCycle(
        initialMonthlyBalanceCents
      );

      await completeOnboarding();

      router.replace("/(tabs)");
    } catch (caughtError) {
      console.error(
        "Erro ao concluir onboarding:",
        caughtError
      );

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Não foi possível concluir as boas-vindas."
      );
    } finally {
      setSaving(false);
    }
  }

  function renderProgress() {
    if (step === "welcome") {
      return null;
    }

    const hasCurrentMonthStep =
      dueIncomes.length > 0;

    const totalSteps =
      hasCurrentMonthStep
        ? 5
        : 4;

    const current =
      step === "name"
        ? 1
        : step === "profession"
          ? 2
          : step === "income"
            ? 3
            : step === "currentMonth"
              ? 4
              : totalSteps;

    return (
      <View style={styles.progress}>
        {Array.from(
          {
            length: totalSteps,
          },
          (_, index) => index + 1
        ).map((item) => (
          <View
            key={item}
            style={[
              styles.progressItem,
              {
                backgroundColor:
                  item <= current
                    ? theme.colors
                        .primary
                    : theme.colors
                        .border,
              },
            ]}
          />
        ))}
      </View>
    );
  }

  function renderBackButton() {
    if (step === "welcome") {
      return null;
    }

    return (
      <Pressable
        onPress={goBack}
        style={[
          styles.backButton,
          {
            backgroundColor:
              theme.colors.surface,
            borderColor:
              theme.colors.border,
          },
        ]}
      >
        <MaterialIcons
          name="arrow-back"
          size={22}
          color={theme.colors.text}
        />
      </Pressable>
    );
  }

  function renderError() {
    if (!error) {
      return null;
    }

    return (
      <View
        style={[
          styles.errorBox,
          {
            backgroundColor:
              theme.colors
                .surfaceSecondary,
            borderColor:
              theme.colors.border,
          },
        ]}
      >
        <MaterialIcons
          name="error-outline"
          size={20}
          color="#FF5A67"
        />

        <Text
          style={styles.errorText}
        >
          {error}
        </Text>
      </View>
    );
  }

  function renderPrimaryButton(
    text: string,
    onPress: () => void,
    disabled = false
  ) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={[
          styles.primaryButton,
          {
            backgroundColor:
              theme.colors.primary,
            opacity: disabled
              ? 0.6
              : 1,
          },
        ]}
      >
        <Text
          style={
            styles.primaryButtonText
          }
        >
          {text}
        </Text>

        <MaterialIcons
          name="arrow-forward"
          size={21}
          color="#FFFFFF"
        />
      </Pressable>
    );
  }

  function renderWelcome() {
    return (
      <View
        style={
          styles.welcomeContainer
        }
      >
        <View
          style={[
            styles.logo,
            {
              backgroundColor:
                theme.colors.primarySoft,
            },
          ]}
        >
          <MaterialIcons
            name="insights"
            size={48}
            color={
              theme.colors.primary
            }
          />
        </View>

        <Text
          style={[
            styles.brand,
            {
              color:
                theme.colors.primary,
            },
          ]}
        >
          Límita
        </Text>

        <Text
          style={[
            styles.welcomeTitle,
            {
              color: theme.colors.text,
            },
          ]}
        >
          Sua vida financeira começa
          por aqui.
        </Text>

        <Text
          style={[
            styles.welcomeDescription,
            {
              color:
                theme.colors
                  .textSecondary,
            },
          ]}
        >
          Antes de começar, vamos
          preparar o Límita para
          acompanhar seus ciclos do seu
          jeito.
        </Text>

        {renderPrimaryButton(
          "Começar",
          () => setStep("name")
        )}
      </View>
    );
  }

  function renderName() {
    return (
      <>
        <Text
          style={[
            styles.stepEyebrow,
            {
              color:
                theme.colors.primary,
            },
          ]}
        >
          SOBRE VOCÊ
        </Text>

        <Text
          style={[
            styles.stepTitle,
            {
              color: theme.colors.text,
            },
          ]}
        >
          Como podemos te chamar?
        </Text>

        <Text
          style={[
            styles.stepDescription,
            {
              color:
                theme.colors
                  .textSecondary,
            },
          ]}
        >
          Esse nome vai aparecer pelo
          Límita para deixar sua
          experiência mais pessoal.
        </Text>

        <Text
          style={[
            styles.label,
            {
              color:
                theme.colors
                  .textSecondary,
            },
          ]}
        >
          Nome
        </Text>

        <TextInput
          value={name}
          onChangeText={(value) => {
            setName(value);
            setError(null);
          }}
          autoFocus
          placeholder="Como você prefere ser chamado?"
          placeholderTextColor={
            theme.colors.textSecondary
          }
          returnKeyType="next"
          onSubmitEditing={
            continueName
          }
          style={[
            styles.input,
            {
              backgroundColor:
                theme.colors.surface,
              borderColor:
                theme.colors.border,
              color: theme.colors.text,
            },
          ]}
        />

        {renderError()}

        {renderPrimaryButton(
          "Continuar",
          continueName
        )}
      </>
    );
  }

  function renderProfession() {
    return (
      <>
        <Text
          style={[
            styles.stepEyebrow,
            {
              color:
                theme.colors.primary,
            },
          ]}
        >
          SUA ROTINA
        </Text>

        <Text
          style={[
            styles.stepTitle,
            {
              color: theme.colors.text,
            },
          ]}
        >
          E com o que você trabalha?
        </Text>

        <Text
          style={[
            styles.stepDescription,
            {
              color:
                theme.colors
                  .textSecondary,
            },
          ]}
        >
          Você pode adicionar mais de
          uma ocupação profissional.
        </Text>

        {!noOccupation &&
          professions.length > 0 && (
            <View
              style={
                styles.professionList
              }
            >
              {professions.map(
                (
                  profession,
                  index
                ) => (
                  <View
                    key={`${profession}-${index}`}
                    style={[
                      styles.professionItem,
                      {
                        backgroundColor:
                          theme.colors
                            .surface,
                        borderColor:
                          theme.colors
                            .border,
                      },
                    ]}
                  >
                    <MaterialIcons
                      name="work-outline"
                      size={20}
                      color={
                        theme.colors
                          .primary
                      }
                    />

                    <Text
                      style={[
                        styles.professionText,
                        {
                          color:
                            theme.colors
                              .text,
                        },
                      ]}
                    >
                      {profession}
                    </Text>

                    <Pressable
                      onPress={() =>
                        removeProfession(
                          index
                        )
                      }
                      hitSlop={10}
                    >
                      <MaterialIcons
                        name="close"
                        size={21}
                        color={
                          theme.colors
                            .textSecondary
                        }
                      />
                    </Pressable>
                  </View>
                )
              )}
            </View>
          )}

        {!noOccupation && (
          <View
            style={
              styles.professionInputRow
            }
          >
            <TextInput
              value={newProfession}
              onChangeText={(value) => {
                setNewProfession(
                  value
                );
                setError(null);
              }}
              onSubmitEditing={
                addProfession
              }
              placeholder="Ex.: Professor"
              placeholderTextColor={
                theme.colors
                  .textSecondary
              }
              returnKeyType="done"
              style={[
                styles.professionInput,
                {
                  backgroundColor:
                    theme.colors
                      .surface,
                  borderColor:
                    theme.colors
                      .border,
                  color:
                    theme.colors.text,
                },
              ]}
            />

            <Pressable
              onPress={addProfession}
              style={[
                styles.addButton,
                {
                  backgroundColor:
                    theme.colors
                      .primary,
                },
              ]}
            >
              <MaterialIcons
                name="add"
                size={26}
                color="#FFFFFF"
              />
            </Pressable>
          </View>
        )}

        <Pressable
          onPress={
            toggleNoOccupation
          }
          style={styles.checkRow}
        >
          <View
            style={[
              styles.checkbox,
              {
                borderColor:
                  noOccupation
                    ? theme.colors
                        .primary
                    : theme.colors
                        .textSecondary,
                backgroundColor:
                  noOccupation
                    ? theme.colors
                        .primary
                    : "transparent",
              },
            ]}
          >
            {noOccupation && (
              <MaterialIcons
                name="check"
                size={18}
                color="#FFFFFF"
              />
            )}
          </View>

          <Text
            style={[
              styles.checkText,
              {
                color:
                  theme.colors.text,
              },
            ]}
          >
            Sem ocupação profissional
            atual
          </Text>
        </Pressable>

        {renderError()}

        {renderPrimaryButton(
          "Continuar",
          continueProfession
        )}
      </>
    );
  }

  function renderIncomeEditor() {
    if (!editingIncome) {
      return null;
    }

    const alreadyExists =
      incomes.some(
        (income) =>
          income.id ===
          editingIncome.id
      );

    return (
      <>
        <Text
          style={[
            styles.stepEyebrow,
            {
              color:
                theme.colors.primary,
            },
          ]}
        >
          RENDIMENTO
        </Text>

        <Text
          style={[
            styles.stepTitle,
            {
              color: theme.colors.text,
            },
          ]}
        >
          {alreadyExists
            ? "Editar rendimento"
            : "Novo rendimento"}
        </Text>

        <Text
          style={[
            styles.stepDescription,
            {
              color:
                theme.colors
                  .textSecondary,
            },
          ]}
        >
          Informe apenas o valor e
          quando ele costuma entrar.
        </Text>

        <Text
          style={[
            styles.label,
            {
              color:
                theme.colors
                  .textSecondary,
            },
          ]}
        >
          Valor mensal
        </Text>

        <View
          style={[
            styles.moneyInput,
            {
              backgroundColor:
                theme.colors.surface,
              borderColor:
                theme.colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.currency,
              {
                color:
                  theme.colors
                    .textSecondary,
              },
            ]}
          >
            R$
          </Text>

          <TextInput
            value={formatCents(
              editingIncome.amountCents
            )}
            onChangeText={(text) => {
              setEditingIncome(
                (current) =>
                  current
                    ? {
                        ...current,
                        amountCents:
                          extractCents(
                            text
                          ),
                      }
                    : current
              );

              setError(null);
            }}
            keyboardType="number-pad"
            style={[
              styles.moneyTextInput,
              {
                color:
                  theme.colors.text,
              },
            ]}
          />
        </View>

        <Text
          style={[
            styles.label,
            {
              color:
                theme.colors
                  .textSecondary,
            },
          ]}
        >
          Recebimento
        </Text>

        <Pressable
          onPress={() =>
            setShowReceiptOptions(
              (current) => !current
            )
          }
          style={[
            styles.select,
            {
              backgroundColor:
                theme.colors.surface,
              borderColor:
                theme.colors.border,
            },
          ]}
        >
          <View
            style={styles.selectLeft}
          >
            <MaterialIcons
              name="event"
              size={22}
              color={
                theme.colors.primary
              }
            />

            <Text
              style={[
                styles.selectText,
                {
                  color:
                    theme.colors.text,
                },
              ]}
            >
              {receiptText(
                editingIncome.receiptType,
                editingIncome.customDay
              )}
            </Text>
          </View>

          <MaterialIcons
            name={
              showReceiptOptions
                ? "keyboard-arrow-up"
                : "keyboard-arrow-down"
            }
            size={27}
            color={
              theme.colors
                .textSecondary
            }
          />
        </Pressable>

        {showReceiptOptions && (
          <View
            style={[
              styles.dropdown,
              {
                backgroundColor:
                  theme.colors.surface,
                borderColor:
                  theme.colors.border,
              },
            ]}
          >
            <ReceiptOption
              text="1º dia do mês"
              selected={
                editingIncome.receiptType ===
                "first_day"
              }
              onPress={() => {
                setEditingIncome(
                  (current) =>
                    current
                      ? {
                          ...current,
                          receiptType:
                            "first_day",
                          customDay: "",
                        }
                      : current
                );

                setShowReceiptOptions(
                  false
                );
              }}
            />

            <View
              style={[
                styles.divider,
                {
                  backgroundColor:
                    theme.colors.border,
                },
              ]}
            />

            <ReceiptOption
              text="1º dia útil do mês"
              selected={
                editingIncome.receiptType ===
                "first_business_day"
              }
              onPress={() => {
                setEditingIncome(
                  (current) =>
                    current
                      ? {
                          ...current,
                          receiptType:
                            "first_business_day",
                          customDay: "",
                        }
                      : current
                );

                setShowReceiptOptions(
                  false
                );
              }}
            />

            <View
              style={[
                styles.divider,
                {
                  backgroundColor:
                    theme.colors.border,
                },
              ]}
            />

            <ReceiptOption
              text="Personalizado"
              selected={
                editingIncome.receiptType ===
                "custom"
              }
              onPress={() => {
                setEditingIncome(
                  (current) =>
                    current
                      ? {
                          ...current,
                          receiptType:
                            "custom",
                        }
                      : current
                );

                setShowReceiptOptions(
                  false
                );
              }}
            />
          </View>
        )}

        {editingIncome.receiptType ===
          "custom" && (
          <>
            <Text
              style={[
                styles.label,
                {
                  color:
                    theme.colors
                      .textSecondary,
                },
              ]}
            >
              Dia do recebimento
            </Text>

            <TextInput
              value={
                editingIncome.customDay
              }
              onChangeText={(text) => {
                const numbers =
                  text.replace(
                    /\D/g,
                    ""
                  );

                if (
                  numbers === "" ||
                  Number(numbers) <= 31
                ) {
                  setEditingIncome(
                    (current) =>
                      current
                        ? {
                            ...current,
                            customDay:
                              numbers,
                          }
                        : current
                  );
                }

                setError(null);
              }}
              keyboardType="number-pad"
              maxLength={2}
              placeholder="1 a 31"
              placeholderTextColor={
                theme.colors
                  .textSecondary
              }
              style={[
                styles.input,
                {
                  backgroundColor:
                    theme.colors
                      .surface,
                  borderColor:
                    theme.colors
                      .border,
                  color:
                    theme.colors.text,
                },
              ]}
            />
          </>
        )}

        {renderError()}

        <View
          style={styles.editorActions}
        >
          {alreadyExists && (
            <Pressable
              onPress={deleteIncome}
              style={[
                styles.deleteButton,
                {
                  borderColor:
                    theme.colors
                      .border,
                  backgroundColor:
                    theme.colors
                      .surface,
                },
              ]}
            >
              <MaterialIcons
                name="delete-outline"
                size={21}
                color="#FF5A67"
              />
            </Pressable>
          )}

          <View style={{ flex: 1 }}>
            {renderPrimaryButton(
              "Salvar rendimento",
              saveIncome
            )}
          </View>
        </View>
      </>
    );
  }

  function renderIncome() {
    if (editingIncome) {
      return renderIncomeEditor();
    }

    return (
      <>
        <Text
          style={[
            styles.stepEyebrow,
            {
              color:
                theme.colors.primary,
            },
          ]}
        >
          SEU DINHEIRO
        </Text>

        <Text
          style={[
            styles.stepTitle,
            {
              color: theme.colors.text,
            },
          ]}
        >
          Você recebe algum valor
          regularmente?
        </Text>

        <Text
          style={[
            styles.stepDescription,
            {
              color:
                theme.colors
                  .textSecondary,
            },
          ]}
        >
          Adicione os valores que entram
          regularmente. Se sua renda não
          é recorrente, pode seguir sem
          cadastrar nada.
        </Text>

        {incomes.length > 0 && (
          <View
            style={[
              styles.incomeSummary,
              {
                backgroundColor:
                  theme.colors.surface,
                borderColor:
                  theme.colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.summaryLabel,
                {
                  color:
                    theme.colors
                      .textSecondary,
                },
              ]}
            >
              Total recorrente mensal
            </Text>

            <Text
              style={[
                styles.summaryValue,
                {
                  color:
                    theme.colors.text,
                },
              ]}
            >
              R$ {formatCents(totalIncome)}
            </Text>

            <View
              style={
                styles.incomeList
              }
            >
              {incomes.map(
                (income) => (
                  <Pressable
                    key={income.id}
                    onPress={() =>
                      openIncome(income)
                    }
                    style={[
                      styles.incomeItem,
                      {
                        borderTopColor:
                          theme.colors
                            .border,
                      },
                    ]}
                  >
                    <View>
                      <Text
                        style={[
                          styles.incomeValue,
                          {
                            color:
                              theme.colors
                                .text,
                          },
                        ]}
                      >
                        R${" "}
                        {formatCents(
                          income.amountCents
                        )}
                      </Text>

                      <Text
                        style={[
                          styles.incomeDate,
                          {
                            color:
                              theme.colors
                                .textSecondary,
                          },
                        ]}
                      >
                        {receiptText(
                          income.receiptType,
                          income.customDay
                        )}
                      </Text>
                    </View>

                    <MaterialIcons
                      name="chevron-right"
                      size={23}
                      color={
                        theme.colors
                          .textSecondary
                      }
                    />
                  </Pressable>
                )
              )}
            </View>
          </View>
        )}

        <Pressable
          onPress={openNewIncome}
          style={[
            styles.secondaryButton,
            {
              backgroundColor:
                theme.colors.surface,
              borderColor:
                theme.colors.border,
            },
          ]}
        >
          <MaterialIcons
            name="add"
            size={22}
            color={
              theme.colors.primary
            }
          />

          <Text
            style={[
              styles.secondaryButtonText,
              {
                color:
                  theme.colors.primary,
              },
            ]}
          >
            Adicionar rendimento
          </Text>
        </Pressable>

        {renderPrimaryButton(
          incomes.length > 0
            ? "Continuar"
            : "Não tenho rendimento recorrente",
          continueIncome
        )}
      </>
    );
  }

  function renderCurrentMonth() {
    return (
      <>
        <Text
          style={[
            styles.stepEyebrow,
            {
              color:
                theme.colors.primary,
            },
          ]}
        >
          SEU MÊS ATUAL
        </Text>

        <Text
          style={[
            styles.stepTitle,
            {
              color: theme.colors.text,
            },
          ]}
        >
          Vamos começar de onde você
          está.
        </Text>

        <Text
          style={[
            styles.stepDescription,
            {
              color:
                theme.colors
                  .textSecondary,
            },
          ]}
        >
          Algumas datas de recebimento
          deste mês já chegaram. Só
          precisamos saber o que
          aconteceu até aqui.
        </Text>

        <View
          style={styles.currentMonthList}
        >
          {dueIncomes.map(
            (income) => {
              const state =
                currentMonthIncomes.find(
                  (item) =>
                    item.incomeId ===
                    income.id
                );

              const received =
                state?.received ?? null;

              const remainingCents =
                state?.remainingCents ??
                0;

              return (
                <View
                  key={income.id}
                  style={[
                    styles.currentMonthCard,
                    {
                      backgroundColor:
                        theme.colors
                          .surface,
                      borderColor:
                        theme.colors
                          .border,
                    },
                  ]}
                >
                  <View
                    style={
                      styles.currentMonthHeader
                    }
                  >
                    <View
                      style={[
                        styles.currentMonthIcon,
                        {
                          backgroundColor:
                            theme.colors
                              .primarySoft,
                        },
                      ]}
                    >
                      <MaterialIcons
                        name="payments"
                        size={22}
                        color={
                          theme.colors
                            .primary
                        }
                      />
                    </View>

                    <View
                      style={{ flex: 1 }}
                    >
                      <Text
                        style={[
                          styles.currentMonthValue,
                          {
                            color:
                              theme.colors
                                .text,
                          },
                        ]}
                      >
                        R${" "}
                        {formatCents(
                          income.amountCents
                        )}
                      </Text>

                      <Text
                        style={[
                          styles.currentMonthDate,
                          {
                            color:
                              theme.colors
                                .textSecondary,
                          },
                        ]}
                      >
                        {receiptText(
                          income.receiptType,
                          income.customDay
                        )}
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={[
                      styles.currentMonthQuestion,
                      {
                        color:
                          theme.colors
                            .text,
                      },
                    ]}
                  >
                    Você já recebeu este
                    rendimento neste mês?
                  </Text>

                  <View
                    style={
                      styles.choiceRow
                    }
                  >
                    <Pressable
                      onPress={() =>
                        setIncomeReceived(
                          income.id,
                          true
                        )
                      }
                      style={[
                        styles.choiceButton,
                        {
                          backgroundColor:
                            received ===
                            true
                              ? theme
                                  .colors
                                  .primarySoft
                              : theme
                                  .colors
                                  .surfaceSecondary,
                          borderColor:
                            received ===
                            true
                              ? theme
                                  .colors
                                  .primary
                              : theme
                                  .colors
                                  .border,
                        },
                      ]}
                    >
                      <MaterialIcons
                        name={
                          received ===
                          true
                            ? "check-circle"
                            : "radio-button-unchecked"
                        }
                        size={20}
                        color={
                          received ===
                          true
                            ? theme
                                .colors
                                .primary
                            : theme
                                .colors
                                .textSecondary
                        }
                      />

                      <Text
                        style={[
                          styles.choiceText,
                          {
                            color:
                              received ===
                              true
                                ? theme
                                    .colors
                                    .primary
                                : theme
                                    .colors
                                    .text,
                          },
                        ]}
                      >
                        Sim
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() =>
                        setIncomeReceived(
                          income.id,
                          false
                        )
                      }
                      style={[
                        styles.choiceButton,
                        {
                          backgroundColor:
                            received ===
                            false
                              ? theme
                                  .colors
                                  .primarySoft
                              : theme
                                  .colors
                                  .surfaceSecondary,
                          borderColor:
                            received ===
                            false
                              ? theme
                                  .colors
                                  .primary
                              : theme
                                  .colors
                                  .border,
                        },
                      ]}
                    >
                      <MaterialIcons
                        name={
                          received ===
                          false
                            ? "check-circle"
                            : "radio-button-unchecked"
                        }
                        size={20}
                        color={
                          received ===
                          false
                            ? theme
                                .colors
                                .primary
                            : theme
                                .colors
                                .textSecondary
                        }
                      />

                      <Text
                        style={[
                          styles.choiceText,
                          {
                            color:
                              received ===
                              false
                                ? theme
                                    .colors
                                    .primary
                                : theme
                                    .colors
                                    .text,
                          },
                        ]}
                      >
                        Ainda não
                      </Text>
                    </Pressable>
                  </View>

                  {received === true && (
                    <View
                      style={
                        styles.remainingArea
                      }
                    >
                      <Text
                        style={[
                          styles.remainingLabel,
                          {
                            color:
                              theme.colors
                                .text,
                          },
                        ]}
                      >
                        Quanto desse valor
                        ainda está
                        disponível?
                      </Text>

                      <Text
                        style={[
                          styles.remainingHint,
                          {
                            color:
                              theme.colors
                                .textSecondary,
                          },
                        ]}
                      >
                        Informe quanto
                        ainda resta hoje,
                        não quanto você
                        recebeu.
                      </Text>

                      <View
                        style={[
                          styles.moneyInput,
                          {
                            backgroundColor:
                              theme.colors
                                .surfaceSecondary,
                            borderColor:
                              theme.colors
                                .border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.currency,
                            {
                              color:
                                theme.colors
                                  .textSecondary,
                            },
                          ]}
                        >
                          R$
                        </Text>

                        <TextInput
                          value={formatCents(
                            remainingCents
                          )}
                          onChangeText={(
                            text
                          ) =>
                            setIncomeRemaining(
                              income.id,
                              extractCents(
                                text
                              )
                            )
                          }
                          keyboardType="number-pad"
                          style={[
                            styles.moneyTextInput,
                            {
                              color:
                                theme.colors
                                  .text,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  )}
                </View>
              );
            }
          )}
        </View>

        {initialMonthlyBalanceCents >
          0 && (
          <View
            style={[
              styles.initialBalanceBox,
              {
                backgroundColor:
                  theme.colors
                    .surfaceSecondary,
                borderColor:
                  theme.colors.border,
              },
            ]}
          >
            <View>
              <Text
                style={[
                  styles.initialBalanceLabel,
                  {
                    color:
                      theme.colors
                        .textSecondary,
                  },
                ]}
              >
                Saldo inicial do mês
              </Text>

              <Text
                style={[
                  styles.initialBalanceValue,
                  {
                    color:
                      theme.colors.text,
                  },
                ]}
              >
                R${" "}
                {formatCents(
                  initialMonthlyBalanceCents
                )}
              </Text>
            </View>

            <MaterialIcons
              name="account-balance-wallet"
              size={27}
              color={
                theme.colors.primary
              }
            />
          </View>
        )}

        {renderError()}

        {renderPrimaryButton(
          "Continuar",
          continueCurrentMonth
        )}
      </>
    );
  }

  function renderFinish() {
    return (
      <View>
        <View
          style={[
            styles.finishIcon,
            {
              backgroundColor:
                theme.colors.primarySoft,
            },
          ]}
        >
          <MaterialIcons
            name="check"
            size={42}
            color={
              theme.colors.primary
            }
          />
        </View>

        <Text
          style={[
            styles.stepTitle,
            {
              color: theme.colors.text,
            },
          ]}
        >
          Tudo certo, {name.trim()}.
        </Text>

        <Text
          style={[
            styles.stepDescription,
            {
              color:
                theme.colors
                  .textSecondary,
            },
          ]}
        >
          Seu perfil está pronto. A
          partir daqui, o Límita começa
          a acompanhar sua vida
          financeira por ciclos.
        </Text>

        <View
          style={[
            styles.finishCard,
            {
              backgroundColor:
                theme.colors.surface,
              borderColor:
                theme.colors.border,
            },
          ]}
        >
          <SummaryRow
            icon="person-outline"
            label="Nome"
            value={name.trim()}
          />

          <View
            style={[
              styles.divider,
              {
                backgroundColor:
                  theme.colors.border,
              },
            ]}
          />

          <SummaryRow
            icon="work-outline"
            label={
              professions.length === 1
                ? "Profissão"
                : "Profissões"
            }
            value={
              noOccupation
                ? "Sem ocupação profissional atual"
                : professions.join(
                    " · "
                  )
            }
          />

          <View
            style={[
              styles.divider,
              {
                backgroundColor:
                  theme.colors.border,
              },
            ]}
          />

          <SummaryRow
            icon="payments"
            label="Rendimentos recorrentes"
            value={
              incomes.length === 0
                ? "Nenhum"
                : incomes.length === 1
                  ? `1 · R$ ${formatCents(
                      totalIncome
                    )}/mês`
                  : `${incomes.length} · R$ ${formatCents(
                      totalIncome
                    )}/mês`
            }
          />

          {dueIncomes.length > 0 && (
            <>
              <View
                style={[
                  styles.divider,
                  {
                    backgroundColor:
                      theme.colors.border,
                  },
                ]}
              />

              <SummaryRow
                icon="account-balance-wallet"
                label="Saldo inicial do mês"
                value={`R$ ${formatCents(
                  initialMonthlyBalanceCents
                )}`}
              />
            </>
          )}
        </View>

        {renderError()}

        {renderPrimaryButton(
          saving
            ? "Preparando..."
            : "Começar a usar o Límita",
          finishOnboarding,
          saving
        )}
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          step === "welcome" &&
            styles.welcomeContent,
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={
          false
        }
      >
        {step !== "welcome" && (
          <View
            style={styles.topBar}
          >
            {renderBackButton()}

            <Text
              style={[
                styles.topBrand,
                {
                  color:
                    theme.colors
                      .primary,
                },
              ]}
            >
              Límita
            </Text>

            <View
              style={styles.topSpacer}
            />
          </View>
        )}

        {renderProgress()}

        {step === "welcome" &&
          renderWelcome()}

        {step === "name" &&
          renderName()}

        {step === "profession" &&
          renderProfession()}

        {step === "income" &&
          renderIncome()}

        {step === "currentMonth" &&
          renderCurrentMonth()}

        {step === "finish" &&
          renderFinish()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

type ReceiptOptionProps = {
  text: string;
  selected: boolean;
  onPress: () => void;
};

function ReceiptOption({
  text,
  selected,
  onPress,
}: ReceiptOptionProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={styles.option}
    >
      <Text
        style={[
          styles.optionText,
          {
            color: selected
              ? theme.colors.primary
              : theme.colors.text,
          },
        ]}
      >
        {text}
      </Text>

      {selected && (
        <MaterialIcons
          name="check"
          size={22}
          color={
            theme.colors.primary
          }
        />
      )}
    </Pressable>
  );
}

type SummaryRowProps = {
  icon:
    | "person-outline"
    | "work-outline"
    | "payments"
    | "account-balance-wallet";
  label: string;
  value: string;
};

function SummaryRow({
  icon,
  label,
  value,
}: SummaryRowProps) {
  const { theme } = useTheme();

  return (
    <View
      style={styles.summaryRow}
    >
      <View
        style={[
          styles.summaryIcon,
          {
            backgroundColor:
              theme.colors
                .surfaceSecondary,
          },
        ]}
      >
        <MaterialIcons
          name={icon}
          size={21}
          color={
            theme.colors.primary
          }
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={[
            styles.summaryRowLabel,
            {
              color:
                theme.colors
                  .textSecondary,
            },
          ]}
        >
          {label}
        </Text>

        <Text
          style={[
            styles.summaryRowValue,
            {
              color:
                theme.colors.text,
            },
          ]}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "transparent",
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 54,
    paddingBottom: 42,
  },

  welcomeContent: {
    justifyContent: "center",
  },

  welcomeContainer: {
    alignItems: "center",
  },

  logo: {
    width: 92,
    height: 92,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },

  brand: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 18,
  },

  welcomeTitle: {
    maxWidth: 340,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "800",
    letterSpacing: -1,
    textAlign: "center",
  },

  welcomeDescription: {
    maxWidth: 350,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    marginTop: 14,
    marginBottom: 34,
  },

  topBar: {
    height: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    marginBottom: 20,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  topBrand: {
    fontSize: 18,
    fontWeight: "800",
  },

  topSpacer: {
    width: 42,
    height: 42,
  },

  progress: {
    flexDirection: "row",
    gap: 7,
    marginBottom: 38,
  },

  progressItem: {
    flex: 1,
    height: 5,
    borderRadius: 999,
  },

  stepEyebrow: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.4,
    marginBottom: 10,
  },

  stepTitle: {
    fontSize: 31,
    lineHeight: 37,
    fontWeight: "800",
    letterSpacing: -0.8,
  },

  stepDescription: {
    fontSize: 15,
    lineHeight: 23,
    marginTop: 12,
    marginBottom: 24,
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 10,
  },

  input: {
    minHeight: 60,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },

  primaryButton: {
    minHeight: 60,
    borderRadius: 17,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 24,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  secondaryButton: {
    minHeight: 56,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 18,
  },

  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "800",
  },

  errorBox: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 13,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    marginTop: 16,
  },

  errorText: {
    flex: 1,
    color: "#FF5A67",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
  },

  professionList: {
    gap: 9,
    marginBottom: 12,
  },

  professionItem: {
    minHeight: 54,
    borderRadius: 15,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  professionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
  },

  professionInputRow: {
    flexDirection: "row",
    gap: 9,
  },

  professionInput: {
    flex: 1,
    height: 58,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 15,
  },

  addButton: {
    width: 58,
    height: 58,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },

  checkbox: {
    width: 25,
    height: 25,
    borderRadius: 7,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },

  checkText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "600",
    marginLeft: 11,
  },

  moneyInput: {
    height: 62,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },

  currency: {
    fontSize: 18,
    fontWeight: "700",
    marginRight: 7,
  },

  moneyTextInput: {
    flex: 1,
    fontSize: 19,
    fontWeight: "700",
    padding: 0,
  },

  select: {
    minHeight: 60,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
  },

  selectLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingRight: 8,
  },

  selectText: {
    flexShrink: 1,
    fontSize: 15,
    fontWeight: "600",
  },

  dropdown: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginTop: 8,
  },

  option: {
    minHeight: 55,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
  },

  optionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    paddingRight: 12,
  },

  divider: {
    height: 1,
  },

  editorActions: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-end",
  },

  deleteButton: {
    width: 60,
    height: 60,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },

  incomeSummary: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
  },

  summaryLabel: {
    fontSize: 12,
    fontWeight: "700",
  },

  summaryValue: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.6,
    marginTop: 5,
  },

  incomeList: {
    marginTop: 14,
  },

  incomeItem: {
    minHeight: 68,
    borderTopWidth: 1,
    paddingTop: 14,
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
  },

  incomeValue: {
    fontSize: 15,
    fontWeight: "800",
  },

  incomeDate: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },

  currentMonthList: {
    gap: 14,
  },

  currentMonthCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 17,
  },

  currentMonthHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 18,
  },

  currentMonthIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  currentMonthValue: {
    fontSize: 18,
    fontWeight: "800",
  },

  currentMonthDate: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 3,
  },

  currentMonthQuestion: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "700",
    marginBottom: 12,
  },

  choiceRow: {
    flexDirection: "row",
    gap: 9,
  },

  choiceButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingHorizontal: 10,
  },

  choiceText: {
    fontSize: 14,
    fontWeight: "800",
  },

  remainingArea: {
    marginTop: 18,
  },

  remainingLabel: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
  },

  remainingHint: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 10,
  },

  initialBalanceBox: {
    minHeight: 76,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 17,
    paddingVertical: 14,
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
  },

  initialBalanceLabel: {
    fontSize: 12,
    fontWeight: "700",
  },

  initialBalanceValue: {
    fontSize: 22,
    fontWeight: "800",
    marginTop: 3,
  },

  finishIcon: {
    width: 78,
    height: 78,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },

  finishCard: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 17,
    marginTop: 6,
  },

  summaryRow: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },

  summaryIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  summaryRowLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },

  summaryRowValue: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "700",
  },
});