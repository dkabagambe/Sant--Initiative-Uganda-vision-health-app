import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {
  Login: undefined;
  RoleSelection: undefined;
  CHWRegistrationStep1: undefined;
  OutletRegistrationStep1: undefined;
  VSLARegistrationStep1: undefined;
};

type RoleSelectionScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "RoleSelection"
>;

export default function RoleSelectionScreen() {
  const navigation = useNavigation<RoleSelectionScreenNavigationProp>();

  const handleRoleSelect = (role: "CHW" | "Outlet" | "VSLA") => {
    if (role === "CHW") {
      navigation.navigate("CHWRegistrationStep1");
    } else if (role === "Outlet") {
      navigation.navigate("OutletRegistrationStep1");
    } else if (role === "VSLA") {
      navigation.navigate("VSLARegistrationStep1");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>

        <Text style={styles.title}>Register Account</Text>
        <Text style={styles.subtitle}>Choose your account type</Text>

        {/* CHW Card */}
        <TouchableOpacity
          style={[styles.roleCard, styles.chwCard]}
          onPress={() => handleRoleSelect("CHW")}
        >
          <View style={styles.roleHeader}>
            <Ionicons name="medical" size={32} color="#2E7D32" />
            <View style={styles.roleHeaderText}>
              <Text style={styles.roleTitle}>Community Health Worker</Text>
              <Text style={styles.roleSubtitle}>
                Register as a CHW to conduct vision screenings in your community
              </Text>
            </View>
          </View>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#2E7D32" />
              <Text style={styles.featureText}>Conduct near-vision screenings</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#2E7D32" />
              <Text style={styles.featureText}>Distribute reading glasses</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#2E7D32" />
              <Text style={styles.featureText}>Track hire-purchase payments</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#2E7D32" />
              <Text style={styles.featureText}>Make referrals for advanced care</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Outlet Card */}
        <TouchableOpacity
          style={[styles.roleCard, styles.outletCard]}
          onPress={() => handleRoleSelect("Outlet")}
        >
          <View style={styles.roleHeader}>
            <Ionicons name="storefront" size={32} color="#1976D2" />
            <View style={styles.roleHeaderText}>
              <Text style={styles.roleTitle}>Retail Outlet / Shop</Text>
              <Text style={styles.roleSubtitle}>
                Register your shop to sell reading glasses in partnership with Santé
              </Text>
            </View>
          </View>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#1976D2" />
              <Text style={styles.featureText}>Sell Santé reading glasses</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#1976D2" />
              <Text style={styles.featureText}>Manage inventory & stock</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#1976D2" />
              <Text style={styles.featureText}>Track sales & revenue</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#1976D2" />
              <Text style={styles.featureText}>Receive stock replenishments</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* VSLA Card */}
        <TouchableOpacity
          style={[styles.roleCard, styles.vslaCard]}
          onPress={() => handleRoleSelect("VSLA")}
        >
          <View style={styles.roleHeader}>
            <Ionicons name="people" size={32} color="#FF9800" />
            <View style={styles.roleHeaderText}>
              <Text style={styles.roleTitle}>VSLA / SACCO Group</Text>
              <Text style={styles.roleSubtitle}>
                Register your community savings group to support member eye health
              </Text>
            </View>
          </View>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#FF9800" />
              <Text style={styles.featureText}>Facilitate hire-purchase for members</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#FF9800" />
              <Text style={styles.featureText}>Bulk purchase discounts</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#FF9800" />
              <Text style={styles.featureText}>Earn group revenue from sales</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#FF9800" />
              <Text style={styles.featureText}>Support community eye health</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Registration Process */}
        <View style={styles.processCard}>
          <Text style={styles.processTitle}>Registration Process</Text>
          <View style={styles.processList}>
            <View style={styles.processItem}>
              <View style={styles.processNumber}>
                <Text style={styles.processNumberText}>1</Text>
              </View>
              <Text style={styles.processText}>Complete registration form</Text>
            </View>
            <View style={styles.processItem}>
              <View style={styles.processNumber}>
                <Text style={styles.processNumberText}>2</Text>
              </View>
              <Text style={styles.processText}>Submit documents for verification</Text>
            </View>
            <View style={styles.processItem}>
              <View style={styles.processNumber}>
                <Text style={styles.processNumberText}>3</Text>
              </View>
              <Text style={styles.processText}>Wait for administrator approval (24-48 hours)</Text>
            </View>
            <View style={styles.processItem}>
              <View style={styles.processNumber}>
                <Text style={styles.processNumberText}>4</Text>
              </View>
              <Text style={styles.processText}>Receive SMS confirmation when approved</Text>
            </View>
            <View style={styles.processItem}>
              <View style={styles.processNumber}>
                <Text style={styles.processNumberText}>5</Text>
              </View>
              <Text style={styles.processText}>Login and start helping your community</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footerText}>Santé Initiative Uganda © 2026</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  backButton: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 24,
  },
  roleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  chwCard: {
    borderColor: "#2E7D32",
    backgroundColor: "#F1F8F4",
  },
  outletCard: {
    borderColor: "#1976D2",
    backgroundColor: "#F0F7FF",
  },
  vslaCard: {
    borderColor: "#FF9800",
    backgroundColor: "#FFF8F0",
  },
  roleHeader: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 12,
    alignItems: "flex-start",
  },
  roleHeaderText: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  roleSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
  featureList: {
    gap: 8,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
  },
  processCard: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  processTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  processList: {
    gap: 10,
  },
  processItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  processNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#2E7D32",
    justifyContent: "center",
    alignItems: "center",
  },
  processNumberText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  processText: {
    fontSize: 13,
    color: "#374151",
    flex: 1,
    lineHeight: 18,
    paddingTop: 3,
  },
  footerText: {
    textAlign: "center",
    fontSize: 13,
    color: "#6B7280",
    marginTop: 8,
  },
});
