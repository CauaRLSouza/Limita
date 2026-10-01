import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { useTheme } from "../theme/ThemeContext";

export default function TabHeader() {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => router.push("/configuracoes")}
        style={[
          styles.button,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <MaterialIcons
          name="settings"
          size={24}
          color={theme.colors.text}
        />
      </Pressable>

      <Pressable
        style={[
          styles.button,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <MaterialIcons
          name="notifications-none"
          size={25}
          color={theme.colors.text}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },

  button: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});