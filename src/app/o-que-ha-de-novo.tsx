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
    title: "O que há de novo no Límita",
    description:
      "Esta atualização amplia a forma como o Límita ajuda você a entender e planejar sua vida financeira.",
    icon: "auto-awesome",
    items: [
      {
        icon: "speed",
        title: "Ritmo de Orçamento",
        description:
          "Acompanhe quanto pode gastar por dia dentro dos seus orçamentos.",
      },
      {
        icon: "insights",
        title: "Leituras do Límita",
        description:
          "Entenda mudanças e padrões relevantes na sua vida financeira.",
      },
      {
        icon: "calculate",
        title: "Posso gastar?",
        description:
          "Veja o impacto de uma compra antes de decidir realizá-la.",
      },
    ],
  },
  {
    eyebrow: "NOVIDADES PRINCIPAIS",
    title: "Mais contexto para suas decisões",
    description:
      "Três novas ferramentas transformam seus dados em informações mais úteis para o dia a dia.",
    icon: "insights",
    items: [
      {
        icon: "speed",
        title: "Ritmo de Orçamento",
        description:
          "Orçamentos semanais e mensais agora mostram quanto você pode gastar por dia para permanecer dentro do limite.",
      },
      {
        icon: "auto-awesome",
        title: "Leituras do Límita",
        description:
          "O Límita identifica mudanças relevantes nos seus gastos, orçamentos, categorias e margem entre ciclos.",
      },
      {
        icon: "calculate",
        title: "Posso gastar?",
        description:
          "Simule uma compra e veja como ela afetaria seu Dinheiro do mês, orçamento e o restante do ciclo.",
      },
    ],
  },
  {
    eyebrow: "MELHORIAS",
    title: "Mais controle no dia a dia",
    description:
      "Também ajustamos partes importantes da experiência para deixar o Límita mais flexível.",
    icon: "tune",
    items: [
      {
        icon: "edit",
        title:
          "Edite e exclua movimentações",
        description:
          "Corrija ou exclua movimentações diretamente pelo Histórico.",
      },
      {
        icon: "playlist-remove",
        title:
          "Gastos fora do orçamento",
        description:
          "Marque despesas excepcionais para que elas não consumam seu orçamento ativo.",
      },
      {
        icon: "notifications-active",
        title:
          "Notificações desde o início",
        description:
          "Escolha durante os primeiros passos se deseja receber lembretes e avisos do Límita.",
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
                            {item.title}
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

                        {index ===
                          0 && (
                          <MaterialIcons
                            name="check-circle"
                            size={20}
                            color={
                              theme.colors
                                .primary
                            }
                          />
                        )}
                      </View>
                    )
                  )}
                </View>
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