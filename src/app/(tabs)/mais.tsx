import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import TabHeader from "../../components/TabHeader";
import ThemeAccent from "../../components/ThemeAccent";
import { useTheme } from "../../theme/ThemeContext";

type TipoRecebimento =
  | "primeiro-dia"
  | "primeiro-dia-util"
  | "personalizado";

const prideColors = [
  "#FF2D55",
  "#FF8A00",
  "#FFD60A",
  "#22C55E",
  "#06B6D4",
  "#2563EB",
  "#7C3AED",
  "#D946EF",
] as const;

export default function PerfilScreen() {
  const {
    theme,
    activeSpecialTheme,
  } = useTheme();

  const isMeanGirls =
    activeSpecialTheme === "meanGirls";

  const isPride =
    activeSpecialTheme === "pride";

  const [nome, setNome] = useState("Cacá");
  const [profissao, setProfissao] = useState("");
  const [semOcupacao, setSemOcupacao] =
    useState(false);

  const [rendimentoAtivo, setRendimentoAtivo] =
    useState(true);

  const [rendimento, setRendimento] =
    useState("3.600,00");

  const [tipoRecebimento, setTipoRecebimento] =
    useState<TipoRecebimento>(
      "primeiro-dia-util"
    );

  const [
    mostrarRecebimentos,
    setMostrarRecebimentos,
  ] = useState(false);

  const [
    diaPersonalizado,
    setDiaPersonalizado,
  ] = useState("5");

  function textoRecebimento() {
    if (tipoRecebimento === "primeiro-dia") {
      return "1º dia do mês";
    }

    if (
      tipoRecebimento === "primeiro-dia-util"
    ) {
      return "1º dia útil do mês";
    }

    return "Personalizado";
  }

  function selecionarRecebimento(
    tipo: TipoRecebimento
  ) {
    setTipoRecebimento(tipo);
    setMostrarRecebimentos(false);
  }

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: isMeanGirls
          ? "transparent"
          : theme.colors.background,
      }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <TabHeader />

      <Text
        style={[
          styles.title,
          {
            color: theme.colors.text,
          },
        ]}
      >
        Perfil
      </Text>

      <View
        style={[
          styles.profileCard,
          {
            backgroundColor:
              theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        {isPride ? (
          <LinearGradient
            colors={prideColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarPrideBorder}
          >
            <View
              style={[
                styles.avatarPrideInner,
                {
                  backgroundColor:
                    theme.colors.surface,
                },
              ]}
            >
              <MaterialIcons
                name="person"
                size={43}
                color={theme.colors.text}
              />
            </View>
          </LinearGradient>
        ) : (
          <View
            style={[
              styles.avatar,
              {
                backgroundColor:
                  theme.colors.primarySoft,
              },
            ]}
          >
            <MaterialIcons
              name="person"
              size={46}
              color={theme.colors.primary}
            />
          </View>
        )}

        <View style={styles.profileInfo}>
          <Text
            style={[
              styles.profileName,
              {
                color: theme.colors.text,
              },
            ]}
          >
            {nome || "Seu nome"}
          </Text>

          <Text
            style={[
              styles.profileSubtitle,
              {
                color:
                  theme.colors.textSecondary,
              },
            ]}
          >
            Seu perfil financeiro
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.card,
          {
            backgroundColor:
              theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Text
          style={[
            styles.sectionTitle,
            {
              color: theme.colors.text,
            },
          ]}
        >
          Informações pessoais
        </Text>

        <Text
          style={[
            styles.label,
            {
              color:
                theme.colors.textSecondary,
            },
          ]}
        >
          Nome
        </Text>

        <TextInput
          value={nome}
          onChangeText={setNome}
          placeholder="Seu nome"
          placeholderTextColor={
            theme.colors.textSecondary
          }
          style={[
            styles.input,
            {
              backgroundColor:
                theme.colors.surfaceSecondary,
              borderColor:
                theme.colors.border,
              color: theme.colors.text,
            },
          ]}
        />

        <Text
          style={[
            styles.label,
            {
              color:
                theme.colors.textSecondary,
            },
          ]}
        >
          Profissão
        </Text>

        <TextInput
          value={profissao}
          onChangeText={setProfissao}
          editable={!semOcupacao}
          placeholder={
            semOcupacao
              ? "Sem ocupação profissional atual"
              : "Ex.: Professor"
          }
          placeholderTextColor={
            theme.colors.textSecondary
          }
          style={[
            styles.input,
            {
              backgroundColor:
                theme.colors.surfaceSecondary,
              borderColor:
                theme.colors.border,
              color: theme.colors.text,
              opacity: semOcupacao
                ? 0.55
                : 1,
            },
          ]}
        />

        <Pressable
          onPress={() =>
            setSemOcupacao(
              (atual) => !atual
            )
          }
          style={styles.checkRow}
        >
          {semOcupacao && isPride ? (
            <ThemeAccent
              style={styles.checkboxPride}
            >
              <MaterialIcons
                name="check"
                size={18}
                color="#FFFFFF"
              />
            </ThemeAccent>
          ) : (
            <View
              style={[
                styles.checkbox,
                {
                  borderColor: semOcupacao
                    ? theme.colors.primary
                    : theme.colors
                        .textSecondary,
                  backgroundColor:
                    semOcupacao
                      ? theme.colors.primary
                      : "transparent",
                },
              ]}
            >
              {semOcupacao && (
                <MaterialIcons
                  name="check"
                  size={18}
                  color="#FFFFFF"
                />
              )}
            </View>
          )}

          <Text
            style={[
              styles.checkText,
              {
                color: theme.colors.text,
              },
            ]}
          >
            Sem ocupação profissional atual
          </Text>
        </Pressable>
      </View>

      <View
        style={[
          styles.card,
          {
            backgroundColor:
              theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <View style={styles.sectionHeader}>
          <View
            style={styles.sectionHeaderText}
          >
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: theme.colors.text,
                },
              ]}
            >
              Rendimento mensal
            </Text>

            <Text
              style={[
                styles.sectionDescription,
                {
                  color:
                    theme.colors
                      .textSecondary,
                },
              ]}
            >
              Valor recorrente recebido mensalmente
            </Text>
          </View>

          <Switch
            value={rendimentoAtivo}
            onValueChange={setRendimentoAtivo}
            trackColor={{
              false:
                theme.colors
                  .surfaceSecondary,
              true: isPride
                ? "#D946EF"
                : theme.colors.primary,
            }}
            thumbColor="#FFFFFF"
          />
        </View>

        {rendimentoAtivo && (
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
              Valor mensal
            </Text>

            <View
              style={[
                styles.moneyInput,
                {
                  backgroundColor:
                    theme.colors
                      .surfaceSecondary,
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
                value={rendimento}
                onChangeText={setRendimento}
                keyboardType="decimal-pad"
                placeholder="0,00"
                placeholderTextColor={
                  theme.colors
                    .textSecondary
                }
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
                setMostrarRecebimentos(
                  (atual) => !atual
                )
              }
              style={[
                styles.select,
                {
                  backgroundColor:
                    theme.colors
                      .surfaceSecondary,
                  borderColor:
                    isPride
                      ? "#A855F7"
                      : theme.colors.border,
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
                    isPride
                      ? "#A855F7"
                      : theme.colors.primary
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
                  {textoRecebimento()}
                </Text>
              </View>

              <MaterialIcons
                name={
                  mostrarRecebimentos
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

            {mostrarRecebimentos && (
              <View
                style={[
                  styles.dropdown,
                  {
                    backgroundColor:
                      theme.colors
                        .surfaceSecondary,
                    borderColor:
                      theme.colors.border,
                  },
                ]}
              >
                <Option
                  text="1º dia do mês"
                  selected={
                    tipoRecebimento ===
                    "primeiro-dia"
                  }
                  onPress={() =>
                    selecionarRecebimento(
                      "primeiro-dia"
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

                <Option
                  text="1º dia útil do mês"
                  selected={
                    tipoRecebimento ===
                    "primeiro-dia-util"
                  }
                  onPress={() =>
                    selecionarRecebimento(
                      "primeiro-dia-util"
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

                <Option
                  text="Personalizado"
                  selected={
                    tipoRecebimento ===
                    "personalizado"
                  }
                  onPress={() =>
                    selecionarRecebimento(
                      "personalizado"
                    )
                  }
                />
              </View>
            )}

            {tipoRecebimento ===
              "personalizado" && (
              <>
                <Text
                  style={[
                    styles.label,
                    styles.customDayLabel,
                    {
                      color:
                        theme.colors
                          .textSecondary,
                    },
                  ]}
                >
                  Dia do recebimento
                </Text>

                <View
                  style={[
                    styles.customDayInput,
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
                    name="calendar-today"
                    size={21}
                    color={
                      theme.colors
                        .textSecondary
                    }
                  />

                  <TextInput
                    value={diaPersonalizado}
                    onChangeText={(texto) => {
                      const apenasNumeros =
                        texto.replace(
                          /\D/g,
                          ""
                        );

                      if (
                        apenasNumeros ===
                          "" ||
                        Number(
                          apenasNumeros
                        ) <= 31
                      ) {
                        setDiaPersonalizado(
                          apenasNumeros
                        );
                      }
                    }}
                    keyboardType="number-pad"
                    maxLength={2}
                    placeholder="1 a 31"
                    placeholderTextColor={
                      theme.colors
                        .textSecondary
                    }
                    style={[
                      styles.dayTextInput,
                      {
                        color:
                          theme.colors.text,
                      },
                    ]}
                  />
                </View>
              </>
            )}

            <View
              style={[
                styles.infoBox,
                {
                  backgroundColor:
                    theme.colors
                      .surfaceSecondary,
                },
              ]}
            >
              <MaterialIcons
                name="info-outline"
                size={20}
                color={
                  isPride
                    ? "#7C3AED"
                    : theme.colors.primary
                }
              />

              <Text
                style={[
                  styles.infoText,
                  {
                    color:
                      theme.colors
                        .textSecondary,
                  },
                ]}
              >
                O rendimento será adicionado
                automaticamente ao saldo total e
                ao dinheiro do mês na data
                definida.
              </Text>
            </View>
          </>
        )}
      </View>

      {isPride ? (
        <Pressable>
          <ThemeAccent
            style={styles.saveButton}
          >
            <MaterialIcons
              name="check"
              size={22}
              color="#FFFFFF"
            />

            <Text
              style={styles.saveButtonText}
            >
              Salvar alterações
            </Text>
          </ThemeAccent>
        </Pressable>
      ) : (
        <Pressable
          style={[
            styles.saveButton,
            {
              backgroundColor:
                theme.colors.primary,
            },
          ]}
        >
          <MaterialIcons
            name="check"
            size={22}
            color="#FFFFFF"
          />

          <Text
            style={styles.saveButtonText}
          >
            Salvar alterações
          </Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

type OptionProps = {
  text: string;
  selected: boolean;
  onPress: () => void;
};

function Option({
  text,
  selected,
  onPress,
}: OptionProps) {
  const {
    theme,
    activeSpecialTheme,
  } = useTheme();

  const isPride =
    activeSpecialTheme === "pride";

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
              ? isPride
                ? "#A855F7"
                : theme.colors.primary
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
            isPride
              ? "#A855F7"
              : theme.colors.primary
          }
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 40,
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -0.8,
    marginBottom: 24,
  },

  profileCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarPrideBorder: {
    width: 74,
    height: 74,
    borderRadius: 37,
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarPrideInner: {
    width: "100%",
    height: "100%",
    borderRadius: 33,
    alignItems: "center",
    justifyContent: "center",
  },

  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },

  profileName: {
    fontSize: 22,
    fontWeight: "700",
  },

  profileSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },

  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 22,
  },

  sectionHeaderText: {
    flex: 1,
    paddingRight: 12,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 5,
  },

  sectionDescription: {
    fontSize: 13,
    lineHeight: 18,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
  },

  input: {
    height: 58,
    borderRadius: 15,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },

  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
  },

  checkbox: {
    width: 25,
    height: 25,
    borderRadius: 7,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },

  checkboxPride: {
    width: 25,
    height: 25,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  checkText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 11,
  },

  moneyInput: {
    height: 62,
    borderRadius: 15,
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
    height: 60,
    borderRadius: 15,
    borderWidth: 1,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  selectLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  selectText: {
    fontSize: 15,
    fontWeight: "600",
  },

  dropdown: {
    borderRadius: 15,
    borderWidth: 1,
    overflow: "hidden",
    marginTop: 8,
  },

  option: {
    minHeight: 55,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  optionText: {
    fontSize: 15,
    fontWeight: "600",
  },

  divider: {
    height: 1,
  },

  customDayLabel: {
    marginTop: 18,
  },

  customDayInput: {
    height: 58,
    borderRadius: 15,
    borderWidth: 1,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  dayTextInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
  },

  infoBox: {
    borderRadius: 15,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 20,
  },

  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },

  saveButton: {
    height: 60,
    borderRadius: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
    overflow: "hidden",
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
});