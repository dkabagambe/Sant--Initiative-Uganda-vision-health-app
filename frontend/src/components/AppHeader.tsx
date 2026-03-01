import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface AppHeaderProps {
  userName?: string;
  userRole?: string;
  district?: string;
}

export default function AppHeader({ userName, userRole, district }: AppHeaderProps) {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  // Map database role to display name
  const getRoleDisplay = (role?: string) => {
    if (!role) return "CHW";
    const roleMap: { [key: string]: string } = {
      'health_worker': 'VHT',
      'chw': 'CHW',
      'vht': 'VHT',
      'outlet': 'Outlet Manager',
      'vsla': 'VSLA Coordinator',
    };
    return roleMap[role.toLowerCase()] || role.toUpperCase();
  };

  return (
    <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
      <View style={styles.headerContent}>
        <View>
          <Text style={styles.organization}>Santé Initiative Uganda</Text>
          <Text style={styles.userName}>{userName || "User"}</Text>
          <View style={styles.divider} />
          <Text style={styles.userRole}>
            {getRoleDisplay(userRole)} - {district || "District"}
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
