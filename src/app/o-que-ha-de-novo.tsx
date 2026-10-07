import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import {
  useRef,
  useState,
} from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import {
  markWhatsNewAsSeen,
} from "../database/whatsNew";
import { useTheme } from "../theme/ThemeContext";

const HORIZONTAL_PADDING = 20;

type Page = {
  eyebrow: string;
  title: string;
  description: string;
  icon:
    keyof typeof MaterialIcons.glyphMap;
  items: {
    icon:
      keyof typeof MaterialIcons.glyphMap;
    title: string;
    description: string;
  }[];
};

const pages: Page[] = [
  {
    eyebrow: "NOVA ATUALIZAÇÃO",
    title:
      "Mais clareza onde importa",
    description:
      "A partir dos primeiros testes do Límita, ajustamos partes importantes da experiência para destacar melhor o que importa, reduzir o excesso de informação e facilitar a navegação.",
    icon: "auto-awesome",
    items: [],
  },
  {
    eyebrow: "INÍCIO",
    title:
      "Seu dinheiro do mês em primeiro lugar",
    description:
      "A Home foi reorganizada para deixar mais clara a diferença entre o dinheiro disponível no ciclo atual e o que você já acumulou.",
    icon: "home",
    items: [
      {
        icon: "account-balance-wallet",
        title:
          "Dinheiro do mês em destaque",
        description:
          "O valor disponível para o ciclo atual agora ocupa a posição principal da Home e recebe mais destaque visual.",
      },
      {
        icon: "savings",
        title:
          "Cofre mais compacto",
        description:
          "O Cofre continua sempre à vista, mas agora aparece logo abaixo de forma mais compacta.",
      },
    ],
  },
  {
    eyebrow: "PERFIL E EXTRATO",
    title:
      "Menos excesso, mais agilidade",
    description:
      "Também refinamos o Perfil e a navegação pelo Extrato para deixar informações e períodos mais fáceis de consultar.",
    icon: "tune",
    items: [
      {
        icon: "unfold-less",
        title:
          "Rendimentos recolhíveis",
        description:
          "Rendimentos recorrentes agora começam recolhidos no Perfil, mostrando um resumo sem ocupar tanto espaço.",
      },
      {
        icon: "expand-more",
        title:
          "Detalhes quando precisar",
        description:
          "Expanda a seção para consultar, adicionar, editar ou excluir seus rendimentos recorrentes normalmente.",
      },
      {
        icon: "date-range",
        title:
          "Seleção rápida de período",
        description:
          "No Extrato, toque no mês e ano para escolher rapidamente outro período sem precisar navegar mês a mês pelas setas.",
      },
    ],
  },
];

export default function WhatsNewScreen() {
  const { theme } = useTheme();

  const { width: screenWidth } =
    useWindowDimensions();

  const scrollRef =
    useRef<ScrollView>(null);

  const [
    currentPage,
    setCurrentPage,
  ] = useState(0);

  const [
    closing,
    setClosing,
  ] = useState(false);

  function handleMomentumEnd(
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) {
    const offset =
      event.nativeEvent.contentOffset.x;

    const nextPage = Math.round(
      offset / screenWidth
    );

    setCurrentPage(
      Math.max(
        0,
        Math.min(
          pages.length - 1,
          nextPage
        )
      )
    );
  }

  function goToPage(index: number) {
    scrollRef.current?.scrollTo({
      x:
        index *
        screenWidth,
      animated: true,
    });

    setCurrentPage(index);
  }

  async function closeScreen() {
    if (closing) {
      return;
    }

    setClosing(true);

    try {
      await markWhatsNewAsSeen();

      if (router.canGoBack()) {
        router.back();
        return;
      }

      router.replace("/(tabs)");
    } catch (error) {
      console.error(
        "Erro ao concluir apresentação da atualização:",
        error
      );

      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/(tabs)");
      }
    } finally {
      setClosing(false);
    }
  }

  function nextPage() {
    if (
      currentPage <
      pages.length - 1
    ) {
      goToPage(
        currentPage + 1
      );

      return;
    }

    closeScreen();
  }

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor:
            theme.colors.background,
        },
      ]}
    >
      <View
        style={styles.topBar}
      >
        <View
          style={styles.topSpacer}
        />

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

        <Pressable
          onPress={closeScreen}
          disabled={closing}
          style={[
            styles.closeButton,
            {
              backgroundColor:
                theme.colors.surface,
              borderColor:
                theme.colors.border,
            },
          ]}
        >
          <MaterialIcons
            name="close"
            size={22}
            color={
              theme.colors.text
            }
          />
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={
          false
        }
        decelerationRate="fast"
        onMomentumScrollEnd={
          handleMomentumEnd
        }
      >
        {pages.map(
          (page, index) => (
            <View
              key={page.eyebrow}
              style={[
                styles.page,
                {
                  width:
                    screenWidth,
                },
              ]}
            >
              <ScrollView
                showsVerticalScrollIndicator={
                  false
                }
                contentContainerStyle={
                  styles.pageContent
                }
              >
                <View
                  style={[
                    styles.heroIcon,
                    {
                      backgroundColor:
                        theme.colors
                          .primarySoft,
                    },
                  ]}
                >
                  <MaterialIcons
                    name={page.icon}
                    size={34}
                    color={
                      theme.colors
                        .primary
                    }
                  />
                </View>

                <Text
                  style={[
                    styles.eyebrow,
                    {
                      color:
                        theme.colors
                          .primary,
                    },
                  ]}
                >
                  {page.eyebrow}
                </Text>

                <Text
                  style={[
                    styles.title,
                    {
                      color:
                        theme.colors
                          .text,
                    },
                  ]}
                >
                  {page.title}
                </Text>

                <Text
                  style={[
                    styles.description,
                    {
                      color:
                        theme.colors
                          .textSecondary,
                    },
                  ]}
                >
                  {page.description}
                </Text>

                {index === 0 ? (
                  <View
                    style={[
                      styles.updateSummary,
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
                        styles.summaryIcons
                      }
                    >
                      <View
                        style={[
                          styles.summaryIcon,
                          {
                            backgroundColor:
                              theme.colors
                                .primarySoft,
                          },
                        ]}
                      >
                        <MaterialIcons
                          name="home"
                          size={24}
                          color={
                            theme.colors
                              .primary
                          }
                        />
                      </View>

                      <MaterialIcons
                        name="arrow-forward"
                        size={19}
                        color={
                          theme.colors
                            .textSecondary
                        }
                      />

                      <View
                        style={[
                          styles.summaryIcon,
                          {
                            backgroundColor:
                              theme.colors
                                .primarySoft,
                          },
                        ]}
                      >
                        <MaterialIcons
                          name="person"
                          size={24}
                          color={
                            theme.colors
                              .primary
                          }
                        />
                      </View>

                      <MaterialIcons
                        name="arrow-forward"
                        size={19}
                        color={
                          theme.colors
                            .textSecondary
                        }
                      />

                      <View
                        style={[
                          styles.summaryIcon,
                          {
                            backgroundColor:
                              theme.colors
                                .primarySoft,
                          },
                        ]}
                      >
                        <MaterialIcons
                          name="date-range"
                          size={24}
                          color={
                            theme.colors
                              .primary
                          }
                        />
                      </View>
                    </View>

                    <Text
                      style={[
                        styles.summaryTitle,
                        {
                          color:
                            theme.colors
                              .text,
                        },
                      ]}
                    >
                      Mais clareza. Menos
                      excesso.
                    </Text>

                    <Text
                      style={[
                        styles.summaryDescription,
                        {
                          color:
                            theme.colors
                              .textSecondary,
                        },
                      ]}
                    >
                      Pequenos ajustes para
                      deixar as informações
                      certas em destaque e
                      tornar o Límita mais
                      fácil de consultar.
                    </Text>
                  </View>
                ) : (
                  <View
                    style={
                      styles.items
                    }
                  >
                    {page.items.map(
                      (item) => (
                        <View
                          key={
                            item.title
                          }
                          style={[
                            styles.item,
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
                            style={[
                              styles.itemIcon,
                              {
                                backgroundColor:
                                  theme.colors
                                    .primarySoft,
                              },
                            ]}
                          >
                            <MaterialIcons
                              name={
                                item.icon
                              }
                              size={23}
                              color={
                                theme.colors
                                  .primary
                              }
                            />
                          </View>

                          <View
                            style={
                              styles.itemText
                            }
                          >
                            <Text
                              style={[
                                styles.itemTitle,
                                {
                                  color:
                                    theme
                                      .colors
                                      .text,
                                },
                              ]}
                            >
                              {
                                item.title
                              }
                            </Text>

                            <Text
                              style={[
                                styles.itemDescription,
                                {
                                  color:
                                    theme
                                      .colors
                                      .textSecondary,
                                },
                              ]}
                            >
                              {
                                item.description
                              }
                            </Text>
                          </View>
                        </View>
                      )
                    )}
                  </View>
                )}
              </ScrollView>
            </View>
          )
        )}
      </ScrollView>

      <View
        style={[
          styles.bottomArea,
          {
            borderTopColor:
              theme.colors.border,
          },
        ]}
      >
        <View
          style={styles.dots}
        >
          {pages.map(
            (_, index) => (
              <Pressable
                key={index}
                onPress={() =>
                  goToPage(index)
                }
                hitSlop={10}
              >
                <View
                  style={[
                    styles.dot,
                    index ===
                    currentPage
                      ? styles.activeDot
                      : null,
                    {
                      backgroundColor:
                        index ===
                        currentPage
                          ? theme
                              .colors
                              .primary
                          : theme
                              .colors
                              .border,
                    },
                  ]}
                />
              </Pressable>
            )
          )}
        </View>

        <Pressable
          onPress={nextPage}
          disabled={closing}
          style={[
            styles.primaryButton,
            {
              backgroundColor:
                theme.colors.primary,
              opacity: closing
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
            {currentPage ===
            pages.length - 1
              ? "Continuar"
              : "Próximo"}
          </Text>

          <MaterialIcons
            name={
              currentPage ===
              pages.length - 1
                ? "check"
                : "arrow-forward"
            }
            size={21}
            color="#FFFFFF"
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingTop: 54,
  },

  topBar: {
    height: 46,
    paddingHorizontal:
      HORIZONTAL_PADDING,
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    marginBottom: 18,
  },

  topSpacer: {
    width: 42,
    height: 42,
  },

  brand: {
    fontSize: 18,
    fontWeight: "800",
  },

  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  page: {
    flex: 1,
  },

  pageContent: {
    paddingHorizontal:
      HORIZONTAL_PADDING,
    paddingBottom: 24,
  },

  heroIcon: {
    width: 66,
    height: 66,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },

  eyebrow: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.3,
    marginBottom: 9,
  },

  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "800",
    letterSpacing: -0.8,
  },

  description: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
    marginBottom: 22,
  },

  updateSummary: {
    borderRadius: 19,
    borderWidth: 1,
    padding: 20,
  },

  summaryIcons: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    gap: 10,
  },

  summaryIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  summaryTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "800",
    marginBottom: 8,
  },

  summaryDescription: {
    fontSize: 14,
    lineHeight: 21,
  },

  items: {
    gap: 11,
  },

  item: {
    minHeight: 96,
    borderRadius: 19,
    borderWidth: 1,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
  },

  itemIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  itemText: {
    flex: 1,
    paddingRight: 8,
  },

  itemTitle: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 4,
  },

  itemDescription: {
    fontSize: 13,
    lineHeight: 18,
  },

  bottomArea: {
    paddingHorizontal:
      HORIZONTAL_PADDING,
    paddingTop: 14,
    paddingBottom: 26,
    borderTopWidth: 1,
  },

  dots: {
    height: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginBottom: 10,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },

  activeDot: {
    width: 24,
  },

  primaryButton: {
    minHeight: 58,
    borderRadius: 17,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
});