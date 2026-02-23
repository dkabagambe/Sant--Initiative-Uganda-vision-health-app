import { View, Pressable, Text, StyleSheet } from "react-native";

interface Props {
  value: string;
  onChange: (role: string) => void;
}

const roles = [
  { key: "CHW", label: "CHW", color: "#2E7D32" },
  { key: "Outlet", label: "Outlet", color: "#1976D2" },
  { key: "VSLA", label: "VSLA", color: "#FF9800" },
];

export default function RoleTabs({ value, onChange }: Props) {
  return (
    <View style={styles.container}>
      {roles.map((role) => {
        const isActive = value === role.key;
        return (
          <Pressable
            key={role.key}
            onPress={() => onChange(role.key)}
            style={[
              styles.tab,
              isActive && { backgroundColor: role.color, borderColor: role.color }
            ]}
          >
            <Text style={[styles.text, isActive && styles.activeText]}>
              {role.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginVertical: 14,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  activeText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
