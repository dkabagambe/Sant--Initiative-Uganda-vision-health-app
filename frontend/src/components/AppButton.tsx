import { Pressable, Text, StyleSheet } from "react-native";
import { colors } from "../theme/colors";

interface Props {
  title: string;
  onPress?: () => void;
  variant?: "primary" | "outline";
  disabled?: boolean;
}

export default function AppButton({
  title,
  onPress,
  variant = "primary",
  disabled = false,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.base,
        variant === "primary" && styles.primary,
        variant === "outline" && styles.outline,
        disabled && styles.disabled,
      ]}
    >
      <Text
        style={[
          styles.text,
          variant === "outline" && { color: colors.primary },
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 6,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  outline: {
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: "transparent",
  },
  disabled: {
    backgroundColor: "colors.disabled",
  },
  text: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
