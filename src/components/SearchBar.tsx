import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { useTheme } from "../theme/ThemeContext";

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClose?: () => void;
  autoFocus?: boolean;
};

export default function SearchBar({
  value,
  onChangeText,
  placeholder = "Pesquisar...",
  onClose,
  autoFocus = false,
}: SearchBarProps) {
  const { theme } = useTheme();

  function limparOuFechar() {
    if (value.length > 0) {
      onChangeText("");
      return;
    }

    onClose?.();
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <MaterialIcons
        name="search"
        size={23}
        color={theme.colors.textSecondary}
      />

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSecondary}
        autoFocus={autoFocus}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        style={[
          styles.input,
          {
            color: theme.colors.text,
          },
        ]}
      />

      {(value.length > 0 || onClose) && (
        <Pressable
          onPress={limparOuFechar}
          hitSlop={10}
          style={styles.clearButton}
        >
          <MaterialIcons
            name="close"
            size={22}
            color={theme.colors.textSecondary}
          />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 54,
    borderRadius: 15,
    borderWidth: 1,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
  },

  input: {
    flex: 1,
    height: "100%",
    marginLeft: 10,
    paddingVertical: 0,
    fontSize: 16,
    fontWeight: "500",
  },

  clearButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
});