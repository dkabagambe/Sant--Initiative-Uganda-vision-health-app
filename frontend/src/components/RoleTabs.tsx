import { View, Pressable, Text, StyleSheet } from "react-native";
import { colors } from "../theme/colors";

interface Props {
  value: string;
  onChange: (role: string) => void;
}

const roles = ["CHW", "Outlet", "VSLA"];

export default function RoleTabs({ value, onChange }: Props) {
  return (
    <View style={styles.container}>
      {roles.map((role) => (
        <Pressable
          key={role}
          onPress={() => onChange(role)}
          style={[styles.tab, value === role && styles.activeTab]}
        >
          <Text style={[styles.text, value === role && styles.activeText]}>
            {role}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginVertical: 16,
  },
  tab: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.secondary,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  text: {
    textAlign: "center",
    color: "#1E40AF",
  },
  activeText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
