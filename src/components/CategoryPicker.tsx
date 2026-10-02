import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useTheme } from "../theme/ThemeContext";

export type CategoriaGastoId =
  | "alimentacao"
  | "transporte"
  | "lazer"
  | "compras"
  | "contas"
  | "saude"
  | "educacao"
  | "viagem"
  | "outro";

export type CategoriaEntradaId =
  | "salario"
  | "freelance"
  | "venda"
  | "reembolso"
  | "presente"
  | "investimentos"
  | "outro";

export type CategoriaId =
  | CategoriaGastoId
  | CategoriaEntradaId;

export type Categoria = {
  id: CategoriaId;
  nome: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  cor: string;
};

export const categoriasGasto: Categoria[] = [
  {
    id: "alimentacao",
    nome: "Alimentação",
    icon: "restaurant",
    cor: "#EF4444",
  },
  {
    id: "transporte",
    nome: "Transporte",
    icon: "directions-car",
    cor: "#168AF2",
  },
  {
    id: "lazer",
    nome: "Lazer",
    icon: "sports-esports",
    cor: "#8B5CF6",
  },
  {
    id: "compras",
    nome: "Compras",
    icon: "shopping-bag",
    cor: "#F59E0B",
  },
  {
    id: "contas",
    nome: "Contas",
    icon: "receipt-long",
    cor: "#64748B",
  },
  {
    id: "saude",
    nome: "Saúde",
    icon: "medical-services",
    cor: "#EC4899",
  },
  {
    id: "educacao",
    nome: "Educação",
    icon: "school",
    cor: "#14B8A6",
  },
  {
    id: "viagem",
    nome: "Viagem",
    icon: "flight",
    cor: "#06B6D4",
  },
  {
    id: "outro",
    nome: "Outro",
    icon: "more-horiz",
    cor: "#94A3B8",
  },
];

export const categoriasEntrada: Categoria[] = [
  {
    id: "salario",
    nome: "Salário",
    icon: "payments",
    cor: "#16A36A",
  },
  {
    id: "freelance",
    nome: "Freelance",
    icon: "work",
    cor: "#168AF2",
  },
  {
    id: "venda",
    nome: "Venda",
    icon: "sell",
    cor: "#F59E0B",
  },
  {
    id: "reembolso",
    nome: "Reembolso",
    icon: "currency-exchange",
    cor: "#06B6D4",
  },
  {
    id: "presente",
    nome: "Presente",
    icon: "card-giftcard",
    cor: "#EC4899",
  },
  {
    id: "investimentos",
    nome: "Investimentos",
    icon: "trending-up",
    cor: "#8B5CF6",
  },
  {
    id: "outro",
    nome: "Outro",
    icon: "more-horiz",
    cor: "#94A3B8",
  },
];

type CategoryPickerProps = {
  visible: boolean;
  selectedId: CategoriaId;
  categories: Categoria[];
  onSelect: (categoria: Categoria) => void;
  onClose: () => void;
};

export default function CategoryPicker({
  visible,
  selectedId,
  categories,
  onSelect,
  onClose,
}: CategoryPickerProps) {
  const {
    theme,
    activeSpecialTheme,
  } = useTheme();

  const isPride =
    activeSpecialTheme === "pride";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.overlay}
        onPress={onClose}
      >
        <Pressable
          style={[
            styles.modal,
            {
              backgroundColor:
                theme.colors.surface,
              borderColor:
                theme.colors.border,
            },
          ]}
          onPress={() => {}}
        >
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text
                style={[
                  styles.title,
                  {
                    color:
                      theme.colors.text,
                  },
                ]}
              >
                Escolher categoria
              </Text>

              <Text
                style={[
                  styles.subtitle,
                  {
                    color:
                      theme.colors
                        .textSecondary,
                  },
                ]}
              >
                Selecione uma categoria
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              style={[
                styles.closeButton,
                {
                  backgroundColor:
                    theme.colors
                      .surfaceSecondary,
                },
              ]}
            >
              <MaterialIcons
                name="close"
                size={22}
                color={theme.colors.text}
              />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.categories
            }
          >
            {categories.map(
              (categoria) => {
                const selected =
                  categoria.id ===
                  selectedId;

                return (
                  <Pressable
                    key={categoria.id}
                    onPress={() =>
                      onSelect(categoria)
                    }
                    style={({ pressed }) => [
                      styles.categoryRow,
                      {
                        backgroundColor:
                          selected
                            ? isPride
                              ? theme.colors
                                  .surfaceSecondary
                              : theme.colors
                                  .primarySoft
                            : "transparent",
                        borderColor:
                          selected
                            ? isPride
                              ? categoria.cor
                              : theme.colors
                                  .primary
                            : theme.colors
                                .border,
                      },
                      pressed &&
                        styles.pressed,
                    ]}
                  >
                    <View
                      style={[
                        styles.icon,
                        {
                          backgroundColor:
                            categoria.cor,
                        },
                      ]}
                    >
                      <MaterialIcons
                        name={
                          categoria.icon
                        }
                        size={22}
                        color="#FFFFFF"
                      />
                    </View>

                    <Text
                      style={[
                        styles.categoryName,
                        {
                          color:
                            theme.colors
                              .text,
                        },
                      ]}
                    >
                      {categoria.nome}
                    </Text>

                    {selected ? (
                      <View
                        style={[
                          styles.selectedCircle,
                          {
                            backgroundColor:
                              isPride
                                ? categoria.cor
                                : theme.colors
                                    .primary,
                          },
                        ]}
                      >
                        <MaterialIcons
                          name="check"
                          size={17}
                          color="#FFFFFF"
                        />
                      </View>
                    ) : (
                      <MaterialIcons
                        name="chevron-right"
                        size={24}
                        color={
                          theme.colors
                            .textSecondary
                        }
                      />
                    )}
                  </Pressable>
                );
              }
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor:
      "rgba(0, 0, 0, 0.48)",
    justifyContent: "flex-end",
  },

  modal: {
    maxHeight: "82%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
  },

  handle: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#94A3B8",
    opacity: 0.5,
    alignSelf: "center",
    marginBottom: 20,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 23,
    fontWeight: "700",
    letterSpacing: -0.4,
  },

  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },

  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 15,
  },

  categories: {
    paddingBottom: 8,
  },

  categoryRow: {
    minHeight: 64,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  icon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  categoryName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
  },

  selectedCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  pressed: {
    opacity: 0.7,
  },
});