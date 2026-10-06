import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useTheme } from "../../theme/ThemeContext";
import ThemeAccent from "../ThemeAccent";

export default function QuickActions() {
  const {
    theme,
    activeSpecialTheme,
  } = useTheme();

  const isPride =
    activeSpecialTheme ===
    "pride";

  return (
    <>
      <Text
        style={[
          styles.sectionTitle,
          {
            color:
              theme.colors.text,
          },
        ]}
      >
        Ações rápidas
      </Text>

      <View style={styles.actions}>
        <Pressable
          onPress={() =>
            router.push(
              "/registrar-movimentacao"
            )
          }
          style={[
            styles.actionCard,
            {
              backgroundColor:
                theme.colors.surface,
              borderColor:
                theme.colors.border,
            },
          ]}
        >
          <ThemeAccent
            style={styles.actionIcon}
          >
            <MaterialIcons
              name="swap-vert"
              size={28}
              color="#FFFFFF"
            />
          </ThemeAccent>

          <Text
            style={[
              styles.actionText,
              {
                color:
                  theme.colors.text,
              },
            ]}
          >
            Registrar movimentação
          </Text>
        </Pressable>

        <Pressable
          onPress={() =>
            router.push(
              "../posso-gastar"
            )
          }
          style={[
            styles.actionCard,
            {
              backgroundColor:
                theme.colors.surface,
              borderColor:
                theme.colors.border,
            },
          ]}
        >
          {isPride ? (
            <ThemeAccent
              style={
                styles.actionIcon
              }
            >
              <MaterialIcons
                name="calculate"
                size={28}
                color="#FFFFFF"
              />
            </ThemeAccent>
          ) : (
            <View
              style={[
                styles.actionIcon,
                {
                  backgroundColor:
                    theme.colors
                      .surfaceSecondary,
                },
              ]}
            >
              <MaterialIcons
                name="calculate"
                size={28}
                color={
                  theme.colors.primary
                }
              />
            </View>
          )}

          <Text
            style={[
              styles.actionText,
              {
                color:
                  theme.colors.text,
              },
            ]}
          >
            Posso gastar?
          </Text>
        </Pressable>
      </View>
    </>
  );
}

const styles =
  StyleSheet.create({
    sectionTitle: {
      fontSize: 20,
      fontWeight: "700",
      marginTop: 14,
      marginBottom: 14,
    },

    actions: {
      flexDirection: "row",
      gap: 12,
    },

    actionCard: {
      flex: 1,
      minHeight: 132,
      borderRadius: 20,
      borderWidth: 1,
      paddingHorizontal: 16,
      paddingVertical: 18,
      alignItems: "center",
      justifyContent:
        "center",
    },

    actionIcon: {
      width: 50,
      height: 50,
      borderRadius: 16,
      alignItems: "center",
      justifyContent:
        "center",
      marginBottom: 12,
      overflow: "hidden",
    },

    actionText: {
      fontSize: 14,
      fontWeight: "600",
      textAlign: "center",
      lineHeight: 19,
    },
  });