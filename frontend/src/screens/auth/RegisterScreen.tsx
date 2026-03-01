import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

type RootStackParamList = {
  Register: undefined;
  CHWRegistrationStep1: undefined;
  OutletRegistrationStep1: undefined;
  VSLARegistrationStep1: undefined; // Updated from VSLADashboard
  [key: string]: any;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const RegisterScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const handleRoleSelect = (role: string) => {
    switch (role) {
      case "CHW":
        navigation.navigate("CHWRegistrationStep1");
        break;
      case "RETAIL_OUTLET":
        navigation.navigate("OutletRegistrationStep1");
        break;
      case "VSLA":
        navigation.navigate("VSLARegistrationStep1"); // Now goes to registration flow
        break;
      default:
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Register Account</Text>
          <Text style={styles.subtitle}>Choose your account type</Text>

          {/* Community Health Worker Card */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => handleRoleSelect("CHW")}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Community Health Worker</Text>
            </View>
            <Text style={styles.cardDescription}>
              Register as a CHW to conduct vision screenings in your community
            </Text>
            <View style={styles.featuresList}>
              <Text style={styles.feature}>
                • Conduct near-vision screenings
              </Text>
              <Text style={styles.feature}>• Distribute reading glasses</Text>
              <Text style={styles.feature}>• Track hire-purchase payments</Text>
              <Text style={styles.feature}>
                • Make referrals for advanced care
              </Text>
            </View>
            <View style={styles.cardFooter}>
              <Text style={styles.registerText}>Register as CHW →</Text>
            </View>
          </TouchableOpacity>

          {/* Retail Outlet Card */}
          <TouchableOpacity
            style={[styles.card, styles.outletCard]}
            onPress={() => handleRoleSelect("RETAIL_OUTLET")}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Retail Outlet / Shop</Text>
            </View>
            <Text style={styles.cardDescription}>
              Register your shop to sell reading glasses in partnership with
              Santé
            </Text>
            <View style={styles.featuresList}>
              <Text style={styles.feature}>• Sell Santé reading glasses</Text>
              <Text style={styles.feature}>• Manage inventory & stock</Text>
              <Text style={styles.feature}>• Track sales & revenue</Text>
              <Text style={styles.feature}>• Receive stock replenishments</Text>
            </View>
            <View style={styles.cardFooter}>
              <Text style={[styles.registerText, styles.outletRegisterText]}>
                Register Shop →
              </Text>
            </View>
          </TouchableOpacity>

          {/* VSLA Card */}
          <TouchableOpacity
            style={[styles.card, styles.vslaCard]}
            onPress={() => handleRoleSelect("VSLA")}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>VSLA / SACCO Group</Text>
            </View>
            <Text style={styles.cardDescription}>
              Register your community savings group to support member eye health
            </Text>
            <View style={styles.featuresList}>
              <Text style={styles.feature}>
                • Facilitate hire-purchase for members
              </Text>
              <Text style={styles.feature}>• Bulk purchase discounts</Text>
              <Text style={styles.feature}>
                • Earn group revenue from sales
              </Text>
              <Text style={styles.feature}>• Support community eye health</Text>
            </View>
            <View style={styles.cardFooter}>
              <Text style={[styles.registerText, styles.vslaRegisterText]}>
                Register Group →
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 80,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A1A1A",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 32,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  outletCard: {
    borderColor: "#4CAF50",
    borderWidth: 2,
  },
  vslaCard: {
    borderColor: "#FF9800",
    borderWidth: 2,
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  cardDescription: {
    fontSize: 15,
    color: "#666",
    marginBottom: 20,
    lineHeight: 22,
  },
  featuresList: {
    marginBottom: 24,
  },
  feature: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
    lineHeight: 20,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    paddingTop: 20,
    alignItems: "flex-end",
  },
  registerText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  outletRegisterText: {
    color: "#4CAF50",
  },
  vslaRegisterText: {
    color: "#FF9800",
  },
});

export default RegisterScreen;
