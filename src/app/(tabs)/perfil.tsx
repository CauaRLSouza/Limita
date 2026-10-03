import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
import {
  useCallback,
  useState,
} from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import TabHeader from "../../components/TabHeader";
import ThemeAccent from "../../components/ThemeAccent";
import {
  addRecurringIncome,
  deleteRecurringIncome,
  getProfile,
  ReceiptType,
  saveProfile,
  updateRecurringIncome,
} from "../../database/profile";
import { useTheme } from "../../theme/ThemeContext";

type TipoRecebimento =
  | "primeiro-dia"
  | "primeiro-dia-util"
  | "personalizado";

type Profissao = {
  id: string;
  nome: string;
};

type Rendimento = {
  id: string;
  valorCentavos: number;
  tipoRecebimento: TipoRecebimento;
  diaPersonalizado: string;
};

type PerfilSnapshot = {
  nome: string;
  profissoes: Profissao[];
  semOcupacao: boolean;
};

type RendimentoDraft = {
  id: string | null;
  valorCentavos: number;
  tipoRecebimento: TipoRecebimento;
  diaPersonalizado: string;
};

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

function formatarCentavos(
  centavos: number
) {
  return (centavos / 100).toLocaleString(
    "pt-BR",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  );
}

function extrairCentavos(
  texto: string
) {
  const numeros = texto.replace(
    /\D/g,
    ""
  );

  if (!numeros) {
    return 0;
  }

  const valor = Number(numeros);

  if (
    !Number.isFinite(valor) ||
    valor < 0
  ) {
    return 0;
  }

  return valor;
}

function criarId() {
  return `${Date.now()}-${Math.random()}`;
}

function textoRecebimento(
  tipo: TipoRecebimento,
  diaPersonalizado: string
) {
  if (tipo === "primeiro-dia") {
    return "1º dia do mês";
  }

  if (
    tipo === "primeiro-dia-util"
  ) {
    return "1º dia útil do mês";
  }

  if (diaPersonalizado) {
    return `Todo dia ${diaPersonalizado}`;
  }

  return "Dia personalizado";
}

function tipoBancoParaTela(
  tipo: ReceiptType
): TipoRecebimento {
  if (tipo === "first_day") {
    return "primeiro-dia";
  }

  if (
    tipo === "first_business_day"
  ) {
    return "primeiro-dia-util";
  }

  return "personalizado";
}

function tipoTelaParaBanco(
  tipo: TipoRecebimento
): ReceiptType {
  if (tipo === "primeiro-dia") {
    return "first_day";
  }

  if (
    tipo === "primeiro-dia-util"
  ) {
    return "first_business_day";
  }

  return "custom";
}

export default function PerfilScreen() {
  const {
    theme,
    activeSpecialTheme,
  } = useTheme();

  const isPride =
    activeSpecialTheme === "pride";

  const useGradientPrimary =
    theme.visuals.useGradientPrimary;

  const [editando, setEditando] =
    useState(false);

  const [
    editandoRendimento,
    setEditandoRendimento,
  ] = useState(false);

  const [nome, setNome] =
    useState("");

  const [
    semOcupacao,
    setSemOcupacao,
  ] = useState(false);

  const [
    profissoes,
    setProfissoes,
  ] = useState<Profissao[]>([]);

  const [
    novaProfissao,
    setNovaProfissao,
  ] = useState("");

  const [
    rendimentos,
    setRendimentos,
  ] = useState<Rendimento[]>([]);

  const [
    snapshot,
    setSnapshot,
  ] =
    useState<PerfilSnapshot | null>(
      null
    );

  const [
    rendimentoDraft,
    setRendimentoDraft,
  ] =
    useState<RendimentoDraft | null>(
      null
    );

  const [
    mostrarRecebimentos,
    setMostrarRecebimentos,
  ] = useState(false);

  const carregarPerfil =
    useCallback(async () => {
      try {
        const perfil =
          await getProfile();

        if (!perfil) {
          return;
        }

        setNome(perfil.name);
        setSemOcupacao(
          perfil.noOccupation
        );

        setProfissoes(
          perfil.professions.map(
            (profissao) => ({
              id: String(
                profissao.id
              ),
              nome: profissao.name,
            })
          )
        );

        setRendimentos(
          perfil.recurringIncomes.map(
            (rendimento) => ({
              id: String(
                rendimento.id
              ),
              valorCentavos:
                rendimento.amountCents,
              tipoRecebimento:
                tipoBancoParaTela(
                  rendimento.receiptType
                ),
              diaPersonalizado:
                rendimento.customDay !==
                null
                  ? String(
                      rendimento.customDay
                    )
                  : "",
            })
          )
        );
      } catch (error) {
        console.error(
          "Erro ao carregar perfil:",
          error
        );

        Alert.alert(
          "Não foi possível carregar o perfil",
          "Tente novamente."
        );
      }
    }, []);

  useFocusEffect(
    useCallback(() => {
      carregarPerfil();
    }, [carregarPerfil])
  );

  const totalRendimentos =
    rendimentos.reduce(
      (total, rendimento) =>
        total +
        rendimento.valorCentavos,
      0
    );

  function iniciarEdicao() {
    setSnapshot({
      nome,
      profissoes: profissoes.map(
        (profissao) => ({
          ...profissao,
        })
      ),
      semOcupacao,
    });

    setNovaProfissao("");
    setEditando(true);
  }

  function cancelarEdicao() {
    if (snapshot) {
      setNome(snapshot.nome);
      setProfissoes(
        snapshot.profissoes
      );
      setSemOcupacao(
        snapshot.semOcupacao
      );
    }

    setNovaProfissao("");
    setSnapshot(null);
    setEditando(false);
  }

  async function salvarAlteracoes() {
    const nomeLimpo = nome.trim();

    if (!nomeLimpo) {
      Alert.alert(
        "Nome",
        "Informe seu nome."
      );
      return;
    }

    let profissoesFinais =
      profissoes;

    const profissaoPendente =
      novaProfissao.trim();

    if (
      profissaoPendente &&
      !semOcupacao
    ) {
      profissoesFinais = [
        ...profissoes,
        {
          id: criarId(),
          nome: profissaoPendente,
        },
      ];
    }

    if (
      !semOcupacao &&
      profissoesFinais.length === 0
    ) {
      Alert.alert(
        "Profissão",
        "Adicione pelo menos uma profissão ou marque que está sem ocupação profissional atual."
      );
      return;
    }

    try {
      await saveProfile({
        name: nomeLimpo,
        noOccupation:
          semOcupacao,
        professions:
          profissoesFinais.map(
            (profissao) =>
              profissao.nome
          ),
      });

      setNovaProfissao("");
      setSnapshot(null);
      setEditando(false);

      await carregarPerfil();
    } catch (error) {
      console.error(
        "Erro ao salvar perfil:",
        error
      );

      Alert.alert(
        "Não foi possível salvar",
        error instanceof Error
          ? error.message
          : "Tente novamente."
      );
    }
  }

  function adicionarProfissao() {
    const valor =
      novaProfissao.trim();

    if (!valor) {
      return;
    }

    setProfissoes((atuais) => [
      ...atuais,
      {
        id: criarId(),
        nome: valor,
      },
    ]);

    setNovaProfissao("");
    setSemOcupacao(false);
  }

  function removerProfissao(
    id: string
  ) {
    setProfissoes((atuais) =>
      atuais.filter(
        (profissao) =>
          profissao.id !== id
      )
    );
  }

  function alternarSemOcupacao() {
    setSemOcupacao((atual) => {
      const novoValor = !atual;

      if (novoValor) {
        setProfissoes([]);
        setNovaProfissao("");
      }

      return novoValor;
    });
  }

  function abrirNovoRendimento() {
    setRendimentoDraft({
      id: null,
      valorCentavos: 0,
      tipoRecebimento:
        "primeiro-dia-util",
      diaPersonalizado: "",
    });

    setMostrarRecebimentos(false);
    setEditandoRendimento(true);
  }

  function abrirEditarRendimento(
    rendimento: Rendimento
  ) {
    setRendimentoDraft({
      ...rendimento,
    });

    setMostrarRecebimentos(false);
    setEditandoRendimento(true);
  }

  function cancelarRendimento() {
    setRendimentoDraft(null);
    setMostrarRecebimentos(false);
    setEditandoRendimento(false);
  }

  async function salvarRendimento() {
    if (!rendimentoDraft) {
      return;
    }

    if (
      rendimentoDraft.valorCentavos <=
      0
    ) {
      Alert.alert(
        "Valor do rendimento",
        "Informe um valor mensal maior que zero."
      );
      return;
    }

    let diaPersonalizado:
      | number
      | null = null;

    if (
      rendimentoDraft.tipoRecebimento ===
      "personalizado"
    ) {
      const dia = Number(
        rendimentoDraft.diaPersonalizado
      );

      if (
        !Number.isInteger(dia) ||
        dia < 1 ||
        dia > 31
      ) {
        Alert.alert(
          "Dia do recebimento",
          "Informe um dia entre 1 e 31."
        );
        return;
      }

      diaPersonalizado = dia;
    }

    try {
      const input = {
        amountCents:
          rendimentoDraft.valorCentavos,
        receiptType:
          tipoTelaParaBanco(
            rendimentoDraft.tipoRecebimento
          ),
        customDay:
          diaPersonalizado,
      };

      if (rendimentoDraft.id) {
        await updateRecurringIncome(
          Number(rendimentoDraft.id),
          input
        );
      } else {
        await addRecurringIncome(
          input
        );
      }

      cancelarRendimento();
      await carregarPerfil();
    } catch (error) {
      console.error(
        "Erro ao salvar rendimento:",
        error
      );

      Alert.alert(
        "Não foi possível salvar",
        error instanceof Error
          ? error.message
          : "Tente novamente."
      );
    }
  }

  function excluirRendimento() {
    if (!rendimentoDraft?.id) {
      return;
    }

    const id = Number(
      rendimentoDraft.id
    );

    Alert.alert(
      "Excluir rendimento",
      "Deseja excluir este rendimento recorrente?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteRecurringIncome(
                id
              );

              cancelarRendimento();
              await carregarPerfil();
            } catch (error) {
              console.error(
                "Erro ao excluir rendimento:",
                error
              );

              Alert.alert(
                "Não foi possível excluir",
                "Tente novamente."
              );
            }
          },
        },
      ]
    );
  }

  function renderBotaoPrincipal(
    texto: string,
    icon:
      | "add"
      | "check"
      | "edit",
    onPress: () => void
  ) {
    if (useGradientPrimary) {
      return (
        <Pressable
          onPress={onPress}
          style={
            styles.mainButtonPressable
          }
        >
          <ThemeAccent
            style={styles.mainButton}
          >
            <MaterialIcons
              name={icon}
              size={22}
              color="#FFFFFF"
            />

            <Text
              style={
                styles.mainButtonText
              }
            >
              {texto}
            </Text>
          </ThemeAccent>
        </Pressable>
      );
    }

    return (
      <Pressable
        onPress={onPress}
        style={[
          styles.mainButton,
          {
            backgroundColor:
              theme.colors.primary,
          },
        ]}
      >
        <MaterialIcons
          name={icon}
          size={22}
          color="#FFFFFF"
        />

        <Text
          style={
            styles.mainButtonText
          }
        >
          {texto}
        </Text>
      </Pressable>
    );
  }

  if (
    editandoRendimento &&
    rendimentoDraft
  ) {
    return (
      <ScrollView
        style={styles.screen}
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.titleRow}>
          <Pressable
            onPress={
              cancelarRendimento
            }
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
              color={
                theme.colors.text
              }
            />
          </Pressable>

          <Text
            style={[
              styles.formTitle,
              {
                color:
                  theme.colors.text,
              },
            ]}
          >
            {rendimentoDraft.id
              ? "Editar rendimento"
              : "Novo rendimento"}
          </Text>

          <View
            style={
              styles.backButtonSpacer
            }
          />
        </View>

        <View
          style={[
            styles.card,
            {
              backgroundColor:
                theme.colors.surface,
              borderColor:
                theme.colors.border,
            },
          ]}
        >
          <View
            style={
              styles.viewSectionHeader
            }
          >
            <View
              style={
                styles.sectionHeaderIcon
              }
            >
              <MaterialIcons
                name="payments"
                size={23}
                color={
                  isPride
                    ? "#7C3AED"
                    : theme.colors
                        .primary
                }
              />
            </View>

            <View
              style={
                styles.sectionHeaderText
              }
            >
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color:
                      theme.colors.text,
                  },
                ]}
              >
                Rendimento recorrente
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
                Defina o valor e quando
                ele entra no dinheiro do
                mês
              </Text>
            </View>
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
              value={formatarCentavos(
                rendimentoDraft.valorCentavos
              )}
              onChangeText={(texto) =>
                setRendimentoDraft(
                  (atual) =>
                    atual
                      ? {
                          ...atual,
                          valorCentavos:
                            extrairCentavos(
                              texto
                            ),
                        }
                      : atual
                )
              }
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
                    : theme.colors
                        .border,
              },
            ]}
          >
            <View
              style={
                styles.selectLeft
              }
            >
              <MaterialIcons
                name="event"
                size={22}
                color={
                  isPride
                    ? "#A855F7"
                    : theme.colors
                        .primary
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
                {textoRecebimento(
                  rendimentoDraft.tipoRecebimento,
                  rendimentoDraft.diaPersonalizado
                )}
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
                    theme.colors
                      .border,
                },
              ]}
            >
              <Option
                text="1º dia do mês"
                selected={
                  rendimentoDraft.tipoRecebimento ===
                  "primeiro-dia"
                }
                onPress={() => {
                  setRendimentoDraft(
                    (atual) =>
                      atual
                        ? {
                            ...atual,
                            tipoRecebimento:
                              "primeiro-dia",
                            diaPersonalizado:
                              "",
                          }
                        : atual
                  );

                  setMostrarRecebimentos(
                    false
                  );
                }}
              />

              <View
                style={[
                  styles.divider,
                  {
                    backgroundColor:
                      theme.colors
                        .border,
                  },
                ]}
              />

              <Option
                text="1º dia útil do mês"
                selected={
                  rendimentoDraft.tipoRecebimento ===
                  "primeiro-dia-util"
                }
                onPress={() => {
                  setRendimentoDraft(
                    (atual) =>
                      atual
                        ? {
                            ...atual,
                            tipoRecebimento:
                              "primeiro-dia-util",
                            diaPersonalizado:
                              "",
                          }
                        : atual
                  );

                  setMostrarRecebimentos(
                    false
                  );
                }}
              />

              <View
                style={[
                  styles.divider,
                  {
                    backgroundColor:
                      theme.colors
                        .border,
                  },
                ]}
              />

              <Option
                text="Personalizado"
                selected={
                  rendimentoDraft.tipoRecebimento ===
                  "personalizado"
                }
                onPress={() => {
                  setRendimentoDraft(
                    (atual) =>
                      atual
                        ? {
                            ...atual,
                            tipoRecebimento:
                              "personalizado",
                          }
                        : atual
                  );

                  setMostrarRecebimentos(
                    false
                  );
                }}
              />
            </View>
          )}

          {rendimentoDraft.tipoRecebimento ===
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
                      theme.colors
                        .border,
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
                  value={
                    rendimentoDraft.diaPersonalizado
                  }
                  onChangeText={(
                    texto
                  ) => {
                    const apenasNumeros =
                      texto.replace(
                        /\D/g,
                        ""
                      );

                    if (
                      apenasNumeros ===
                        "" ||
                      (Number(
                        apenasNumeros
                      ) >= 1 &&
                        Number(
                          apenasNumeros
                        ) <= 31)
                    ) {
                      setRendimentoDraft(
                        (atual) =>
                          atual
                            ? {
                                ...atual,
                                diaPersonalizado:
                                  apenasNumeros,
                              }
                            : atual
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
                        theme.colors
                          .text,
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
              Este rendimento será
              adicionado automaticamente
              ao dinheiro do mês na data
              definida.
            </Text>
          </View>
        </View>

        {rendimentoDraft.id && (
          <Pressable
            onPress={
              excluirRendimento
            }
            style={[
              styles.deleteButton,
              {
                borderColor:
                  theme.colors.border,
                backgroundColor:
                  theme.colors.surface,
              },
            ]}
          >
            <MaterialIcons
              name="delete-outline"
              size={21}
              color="#FF5A67"
            />

            <Text
              style={
                styles.deleteButtonText
              }
            >
              Excluir rendimento
            </Text>
          </Pressable>
        )}

        <View
          style={styles.editActions}
        >
          <Pressable
            onPress={
              cancelarRendimento
            }
            style={[
              styles.cancelButton,
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
                styles.cancelButtonText,
                {
                  color:
                    theme.colors.text,
                },
              ]}
            >
              Cancelar
            </Text>
          </Pressable>

          <View style={{ flex: 1 }}>
            {renderBotaoPrincipal(
              "Salvar",
              "check",
              salvarRendimento
            )}
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={
        styles.content
      }
      showsVerticalScrollIndicator={
        false
      }
      keyboardShouldPersistTaps="handled"
    >
      <TabHeader />

      <View style={styles.titleRow}>
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

        {!editando && (
          <Pressable
            onPress={iniciarEdicao}
            style={[
              styles.headerEditButton,
              {
                backgroundColor:
                  theme.colors.surface,
                borderColor:
                  theme.colors.border,
              },
            ]}
          >
            <MaterialIcons
              name="edit"
              size={19}
              color={
                isPride
                  ? "#A855F7"
                  : theme.colors.primary
              }
            />

            <Text
              style={[
                styles.headerEditText,
                {
                  color: isPride
                    ? "#A855F7"
                    : theme.colors
                        .primary,
                },
              ]}
            >
              Editar
            </Text>
          </Pressable>
        )}
      </View>

      <View
        style={[
          styles.profileCard,
          {
            backgroundColor:
              theme.colors.surface,
            borderColor:
              theme.colors.border,
          },
        ]}
      >
        {isPride ? (
          <LinearGradient
            colors={prideColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={
              styles.avatarPrideBorder
            }
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
                color={
                  theme.colors.text
                }
              />
            </View>
          </LinearGradient>
        ) : (
          <View
            style={[
              styles.avatar,
              {
                backgroundColor:
                  theme.colors
                    .primarySoft,
              },
            ]}
          >
            <MaterialIcons
              name="person"
              size={46}
              color={
                theme.colors.primary
              }
            />
          </View>
        )}

        <View
          style={styles.profileInfo}
        >
          <Text
            style={[
              styles.profileName,
              {
                color:
                  theme.colors.text,
              },
            ]}
          >
            {nome}
          </Text>

          <Text
            style={[
              styles.profileSubtitle,
              {
                color:
                  theme.colors
                    .textSecondary,
              },
            ]}
          >
            {semOcupacao
              ? "Sem ocupação profissional atual"
              : profissoes
                  .map(
                    (profissao) =>
                      profissao.nome
                  )
                  .join(" · ")}
          </Text>
        </View>
      </View>

      {!editando ? (
        <>
          <View
            style={[
              styles.card,
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
                styles.sectionTitle,
                {
                  color:
                    theme.colors.text,
                },
              ]}
            >
              Informações pessoais
            </Text>

            <ProfileInfoRow
              icon="person-outline"
              label="Nome"
              value={nome}
            />

            <View
              style={[
                styles.rowDivider,
                {
                  backgroundColor:
                    theme.colors.border,
                },
              ]}
            />

            <View
              style={
                styles.professionsView
              }
            >
              <View
                style={[
                  styles.profileInfoIcon,
                  {
                    backgroundColor:
                      theme.colors
                        .surfaceSecondary,
                  },
                ]}
              >
                <MaterialIcons
                  name="work-outline"
                  size={21}
                  color={
                    isPride
                      ? "#A855F7"
                      : theme.colors
                          .primary
                  }
                />
              </View>

              <View
                style={
                  styles.profileInfoText
                }
              >
                <Text
                  style={[
                    styles.profileInfoLabel,
                    {
                      color:
                        theme.colors
                          .textSecondary,
                    },
                  ]}
                >
                  {profissoes.length ===
                  1
                    ? "Profissão"
                    : "Profissões"}
                </Text>

                {semOcupacao ? (
                  <Text
                    style={[
                      styles.profileInfoValue,
                      {
                        color:
                          theme.colors
                            .text,
                      },
                    ]}
                  >
                    Sem ocupação
                    profissional atual
                  </Text>
                ) : (
                  <View
                    style={
                      styles.professionChips
                    }
                  >
                    {profissoes.map(
                      (profissao) => (
                        <View
                          key={
                            profissao.id
                          }
                          style={[
                            styles.professionChip,
                            {
                              backgroundColor:
                                theme.colors
                                  .surfaceSecondary,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.professionChipText,
                              {
                                color:
                                  theme.colors
                                    .text,
                              },
                            ]}
                          >
                            {
                              profissao.nome
                            }
                          </Text>
                        </View>
                      )
                    )}
                  </View>
                )}
              </View>
            </View>
          </View>

          <View
            style={[
              styles.card,
              {
                backgroundColor:
                  theme.colors.surface,
                borderColor:
                  theme.colors.border,
              },
            ]}
          >
            <View
              style={
                styles.viewSectionHeader
              }
            >
              <View
                style={
                  styles.sectionHeaderIcon
                }
              >
                <MaterialIcons
                  name="payments"
                  size={22}
                  color={
                    isPride
                      ? "#7C3AED"
                      : theme.colors
                          .primary
                  }
                />
              </View>

              <View
                style={
                  styles.sectionHeaderText
                }
              >
                <Text
                  style={[
                    styles.sectionTitle,
                    {
                      color:
                        theme.colors.text,
                    },
                  ]}
                >
                  Rendimentos recorrentes
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
                  Valores que entram
                  regularmente no seu
                  dinheiro do mês
                </Text>
              </View>
            </View>

            {rendimentos.length > 0 ? (
              <>
                <View
                  style={[
                    styles.totalIncomeBox,
                    {
                      backgroundColor:
                        theme.colors
                          .surfaceSecondary,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.totalIncomeLabel,
                      {
                        color:
                          theme.colors
                            .textSecondary,
                      },
                    ]}
                  >
                    Total mensal
                  </Text>

                  <Text
                    style={[
                      styles.totalIncomeValue,
                      {
                        color:
                          theme.colors
                            .text,
                      },
                    ]}
                  >
                    R${" "}
                    {formatarCentavos(
                      totalRendimentos
                    )}
                  </Text>

                  <Text
                    style={[
                      styles.totalIncomeCaption,
                      {
                        color:
                          theme.colors
                            .textSecondary,
                      },
                    ]}
                  >
                    {rendimentos.length ===
                    1
                      ? "1 rendimento recorrente"
                      : `${rendimentos.length} rendimentos recorrentes`}
                  </Text>
                </View>

                <View
                  style={
                    styles.incomeList
                  }
                >
                  {rendimentos.map(
                    (
                      rendimento,
                      index
                    ) => (
                      <View
                        key={
                          rendimento.id
                        }
                      >
                        {index > 0 && (
                          <View
                            style={[
                              styles.rowDivider,
                              {
                                backgroundColor:
                                  theme.colors
                                    .border,
                              },
                            ]}
                          />
                        )}

                        <Pressable
                          onPress={() =>
                            abrirEditarRendimento(
                              rendimento
                            )
                          }
                          style={
                            styles.incomeItem
                          }
                        >
                          <View
                            style={[
                              styles.incomeItemIcon,
                              {
                                backgroundColor:
                                  theme.colors
                                    .surfaceSecondary,
                              },
                            ]}
                          >
                            <MaterialIcons
                              name="payments"
                              size={22}
                              color={
                                isPride
                                  ? "#A855F7"
                                  : theme
                                      .colors
                                      .primary
                              }
                            />
                          </View>

                          <View
                            style={
                              styles.incomeItemContent
                            }
                          >
                            <Text
                              style={[
                                styles.incomeItemName,
                                {
                                  color:
                                    theme
                                      .colors
                                      .text,
                                },
                              ]}
                            >
                              Rendimento{" "}
                              {index + 1}
                            </Text>

                            <Text
                              style={[
                                styles.incomeItemDate,
                                {
                                  color:
                                    theme
                                      .colors
                                      .textSecondary,
                                },
                              ]}
                            >
                              {textoRecebimento(
                                rendimento.tipoRecebimento,
                                rendimento.diaPersonalizado
                              )}
                            </Text>
                          </View>

                          <View
                            style={
                              styles.incomeItemRight
                            }
                          >
                            <Text
                              style={[
                                styles.incomeItemValue,
                                {
                                  color:
                                    theme
                                      .colors
                                      .text,
                                },
                              ]}
                            >
                              R${" "}
                              {formatarCentavos(
                                rendimento.valorCentavos
                              )}
                            </Text>

                            <MaterialIcons
                              name="chevron-right"
                              size={22}
                              color={
                                theme.colors
                                  .textSecondary
                              }
                            />
                          </View>
                        </Pressable>
                      </View>
                    )
                  )}
                </View>

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
                        : theme.colors
                            .primary
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
                    Cada rendimento será
                    adicionado
                    automaticamente ao
                    dinheiro do mês na sua
                    própria data.
                  </Text>
                </View>
              </>
            ) : (
              <View
                style={
                  styles.noIncomeContainer
                }
              >
                <View
                  style={[
                    styles.noIncomeIcon,
                    {
                      backgroundColor:
                        theme.colors
                          .surfaceSecondary,
                    },
                  ]}
                >
                  <MaterialIcons
                    name="money-off"
                    size={26}
                    color={
                      theme.colors
                        .textSecondary
                    }
                  />
                </View>

                <View
                  style={
                    styles.noIncomeText
                  }
                >
                  <Text
                    style={[
                      styles.noIncomeTitle,
                      {
                        color:
                          theme.colors
                            .text,
                      },
                    ]}
                  >
                    Sem rendimentos
                    recorrentes
                  </Text>

                  <Text
                    style={[
                      styles.noIncomeDescription,
                      {
                        color:
                          theme.colors
                            .textSecondary,
                      },
                    ]}
                  >
                    Nenhum valor recorrente
                    está configurado.
                  </Text>
                </View>
              </View>
            )}

            {useGradientPrimary ? (
              <Pressable
                onPress={
                  abrirNovoRendimento
                }
                style={
                  styles.addIncomeGradientPressable
                }
              >
                <ThemeAccent
                  style={
                    styles.addIncomeGradient
                  }
                >
                  <MaterialIcons
                    name="add"
                    size={21}
                    color="#FFFFFF"
                  />

                  <Text
                    style={
                      styles.addIncomeGradientText
                    }
                  >
                    Adicionar rendimento
                  </Text>
                </ThemeAccent>
              </Pressable>
            ) : (
              <Pressable
                onPress={
                  abrirNovoRendimento
                }
                style={[
                  styles.addIncomeButton,
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
                  name="add"
                  size={21}
                  color={
                    theme.colors.primary
                  }
                />

                <Text
                  style={[
                    styles.addIncomeButtonText,
                    {
                      color:
                        theme.colors
                          .primary,
                    },
                  ]}
                >
                  Adicionar rendimento
                </Text>
              </Pressable>
            )}
          </View>

          {renderBotaoPrincipal(
            "Editar perfil",
            "edit",
            iniciarEdicao
          )}
        </>
      ) : (
        <>
          <View
            style={[
              styles.card,
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
                styles.sectionTitle,
                {
                  color:
                    theme.colors.text,
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
                    theme.colors
                      .textSecondary,
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
                theme.colors
                  .textSecondary
              }
              style={[
                styles.input,
                {
                  backgroundColor:
                    theme.colors
                      .surfaceSecondary,
                  borderColor:
                    theme.colors.border,
                  color:
                    theme.colors.text,
                },
              ]}
            />

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
              Profissões
            </Text>

            <Text
              style={[
                styles.fieldHint,
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

            {!semOcupacao &&
              profissoes.length > 0 && (
                <View
                  style={
                    styles.editProfessionList
                  }
                >
                  {profissoes.map(
                    (profissao) => (
                      <View
                        key={
                          profissao.id
                        }
                        style={[
                          styles.editProfessionItem,
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
                        <MaterialIcons
                          name="work-outline"
                          size={20}
                          color={
                            isPride
                              ? "#A855F7"
                              : theme
                                  .colors
                                  .primary
                          }
                        />

                        <Text
                          style={[
                            styles.editProfessionText,
                            {
                              color:
                                theme
                                  .colors
                                  .text,
                            },
                          ]}
                        >
                          {
                            profissao.nome
                          }
                        </Text>

                        <Pressable
                          onPress={() =>
                            removerProfissao(
                              profissao.id
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

            {!semOcupacao && (
              <View
                style={
                  styles.addProfessionRow
                }
              >
                <TextInput
                  value={
                    novaProfissao
                  }
                  onChangeText={
                    setNovaProfissao
                  }
                  onSubmitEditing={
                    adicionarProfissao
                  }
                  returnKeyType="done"
                  placeholder="Ex.: Professor"
                  placeholderTextColor={
                    theme.colors
                      .textSecondary
                  }
                  style={[
                    styles.professionInput,
                    {
                      backgroundColor:
                        theme.colors
                          .surfaceSecondary,
                      borderColor:
                        theme.colors
                          .border,
                      color:
                        theme.colors
                          .text,
                    },
                  ]}
                />

                {useGradientPrimary ? (
                  <Pressable
                    onPress={
                      adicionarProfissao
                    }
                    style={
                      styles.addProfessionGradientPressable
                    }
                  >
                    <ThemeAccent
                      style={
                        styles.addProfessionButton
                      }
                    >
                      <MaterialIcons
                        name="add"
                        size={25}
                        color="#FFFFFF"
                      />
                    </ThemeAccent>
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={
                      adicionarProfissao
                    }
                    style={[
                      styles.addProfessionButton,
                      {
                        backgroundColor:
                          theme.colors
                            .primary,
                      },
                    ]}
                  >
                    <MaterialIcons
                      name="add"
                      size={25}
                      color="#FFFFFF"
                    />
                  </Pressable>
                )}
              </View>
            )}

            <Pressable
              onPress={
                alternarSemOcupacao
              }
              style={styles.checkRow}
            >
              {semOcupacao &&
              useGradientPrimary ? (
                <ThemeAccent
                  style={
                    styles.checkboxGradient
                  }
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
                      borderColor:
                        semOcupacao
                          ? theme.colors
                              .primary
                          : theme.colors
                              .textSecondary,
                      backgroundColor:
                        semOcupacao
                          ? theme.colors
                              .primary
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
                    color:
                      theme.colors.text,
                  },
                ]}
              >
                Sem ocupação profissional
                atual
              </Text>
            </Pressable>
          </View>

          <View
            style={styles.editActions}
          >
            <Pressable
              onPress={
                cancelarEdicao
              }
              style={[
                styles.cancelButton,
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
                  styles.cancelButtonText,
                  {
                    color:
                      theme.colors.text,
                  },
                ]}
              >
                Cancelar
              </Text>
            </Pressable>

            <View style={{ flex: 1 }}>
              {renderBotaoPrincipal(
                "Salvar alterações",
                "check",
                salvarAlteracoes
              )}
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

type ProfileInfoRowProps = {
  icon:
    | "person-outline"
    | "work-outline";
  label: string;
  value: string;
};

function ProfileInfoRow({
  icon,
  label,
  value,
}: ProfileInfoRowProps) {
  const {
    theme,
    activeSpecialTheme,
  } = useTheme();

  const isPride =
    activeSpecialTheme === "pride";

  return (
    <View
      style={styles.profileInfoRow}
    >
      <View
        style={[
          styles.profileInfoIcon,
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
            isPride
              ? "#A855F7"
              : theme.colors.primary
          }
        />
      </View>

      <View
        style={styles.profileInfoText}
      >
        <Text
          style={[
            styles.profileInfoLabel,
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
            styles.profileInfoValue,
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
  screen: {
    flex: 1,
    backgroundColor: "transparent",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 40,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -0.8,
  },

  formTitle: {
    flex: 1,
    fontSize: 23,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -0.4,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  backButtonSpacer: {
    width: 42,
    height: 42,
  },

  headerEditButton: {
    height: 42,
    borderRadius: 13,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  headerEditText: {
    fontSize: 14,
    fontWeight: "700",
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
    lineHeight: 20,
    marginTop: 4,
  },

  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
  },

  viewSectionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 18,
  },

  sectionHeaderIcon: {
    width: 38,
    height: 38,
    alignItems: "flex-start",
    justifyContent: "center",
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

  profileInfoRow: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
  },

  professionsView: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "flex-start",
    paddingTop: 12,
    paddingBottom: 6,
  },

  profileInfoIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  profileInfoText: {
    flex: 1,
  },

  profileInfoLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
  },

  profileInfoValue: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "600",
  },

  professionChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 3,
  },

  professionChip: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  professionChipText: {
    fontSize: 13,
    fontWeight: "700",
  },

  rowDivider: {
    height: 1,
    marginVertical: 8,
  },

  totalIncomeBox: {
    borderRadius: 17,
    padding: 17,
  },

  totalIncomeLabel: {
    fontSize: 12,
    fontWeight: "700",
  },

  totalIncomeValue: {
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.7,
    marginTop: 5,
  },

  totalIncomeCaption: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },

  incomeList: {
    marginTop: 14,
  },

  incomeItem: {
    minHeight: 78,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },

  incomeItemIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  incomeItemContent: {
    flex: 1,
    paddingRight: 8,
  },

  incomeItemName: {
    fontSize: 15,
    fontWeight: "700",
  },

  incomeItemDate: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
    marginTop: 5,
  },

  incomeItemRight: {
    alignItems: "flex-end",
    gap: 5,
  },

  incomeItemValue: {
    fontSize: 15,
    fontWeight: "800",
  },

  addIncomeButton: {
    minHeight: 52,
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginTop: 16,
  },

  addIncomeButtonText: {
    fontSize: 14,
    fontWeight: "800",
  },

  addIncomeGradientPressable: {
    minHeight: 52,
    borderRadius: 15,
    overflow: "hidden",
    marginTop: 16,
  },

  addIncomeGradient: {
    minHeight: 52,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    overflow: "hidden",
  },

  addIncomeGradientText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  noIncomeContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },

  noIncomeIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  noIncomeText: {
    flex: 1,
  },

  noIncomeTitle: {
    fontSize: 16,
    fontWeight: "700",
  },

  noIncomeDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
  },

  fieldHint: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: -3,
    marginBottom: 9,
  },

  input: {
    minHeight: 58,
    borderRadius: 15,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },

  editProfessionList: {
    gap: 8,
    marginTop: 4,
  },

  editProfessionItem: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  editProfessionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
  },

  addProfessionRow: {
    flexDirection: "row",
    gap: 9,
  },

  professionInput: {
    flex: 1,
    height: 56,
    borderRadius: 15,
    borderWidth: 1,
    paddingHorizontal: 15,
    fontSize: 15,
  },

  addProfessionGradientPressable: {
    width: 56,
    height: 56,
    borderRadius: 15,
    overflow: "hidden",
  },

  addProfessionButton: {
    width: 56,
    height: 56,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
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

  checkboxGradient: {
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
    minHeight: 60,
    borderRadius: 15,
    borderWidth: 1,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    paddingRight: 12,
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

  mainButtonPressable: {
    borderRadius: 17,
    overflow: "hidden",
    marginTop: 4,
  },

  mainButton: {
    height: 60,
    borderRadius: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
    overflow: "hidden",
  },

  mainButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  editActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },

  cancelButton: {
    height: 60,
    paddingHorizontal: 20,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },

  deleteButton: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
  },

  deleteButtonText: {
    color: "#FF5A67",
    fontSize: 15,
    fontWeight: "700",
  },
});
