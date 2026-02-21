import { View, Pressable, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { colors } from "../theme/colors";

interface Props {
  value: string;
  onChange: (role: string) => void;
}

const roles = ["CHW", "Outlet", "VSLA"];

const roleColors = {
  CHW: "#2E7D32",
  Outlet: "#1976D2",
  VSLA: "#FF9800",
};

export default function RoleTabs({ value, onChange }: Props) {
  const navigation = useNavigation<any>();

  const handleRolePress = (role: string) => {
    onChange(role);
    
    // Navigate directly to registration
    if (role === "CHW") {
      navigation.navigate("CHWRegistrationStep1");
    } else if (role === "Outlet") {
      navigation.navigate("OutletRegistrationStep1");
    } else if (role === "VSLA") {
      navigation.navigate("VSLARegistrationStep1");
    }
  };

  return (
    <View style={styles.container}>
      {roles.map((role) => (
        <Pressable
          key={role}
          onPress={() => handleRolePress(role)}
          style={[
            styles.tab,
            value === role && { backgroundColor: roleColors[role as keyof typeof roleColors] }
          ]}
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
