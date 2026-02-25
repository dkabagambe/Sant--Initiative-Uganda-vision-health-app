import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

interface AppHeaderProps {
  userName?: string;
  userRole?: string;
  district?: string;
}

export default function AppHeader({ userName, userRole, district }: AppHeaderProps) {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View>
          <Text style={styles.organization}>Santé Initiative Uganda</Text>
          <Text style={styles.userName}>{userName || "User"}</Text>
          <View style={styles.divider} />
          <Text style={styles.userRole}>
            {userRole || "CHW"} - {district || "District"}
          </Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
          <Ionicons name="menu" size={28} color="#1A4D8F" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    // Force header lower to avoid overlap on affected devices
    paddingTop: 100,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  organization: {
    fontSize: 14,
    color: "#2E7D32",
    fontWeight: "600",
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 6,
  },
  userRole: {
    fontSize: 14,
    color: "#6B7280",
  },
});
