import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { colors } from "../../theme/colors";

type RootStackParamList = {
  Login: undefined;
  OTP: { phone: string; role: string };
  Register: undefined;
  CHWRegistrationStep1: undefined;
  // Add these when you create the screens:
  // ShopRegistrationStep1: undefined;
  // VSLARegistrationStep1: undefined;
  AppTabs: { role: string };
};

type RegisterScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Register"
>;

export default function RegisterScreen() {
  const navigation = useNavigation<RegisterScreenNavigationProp>();

  const handleBackPress = () => {
    navigation.goBack();
  };

  // Add these navigation functions:
  const handleRegisterCHW = () => {
    navigation.navigate("CHWRegistrationStep1");
  };

  const handleRegisterShop = () => {
    // TODO: Create and navigate to ShopRegistrationStep1
    console.log("Navigate to Shop Registration");
    // navigation.navigate("ShopRegistrationStep1");
  };

  const handleRegisterVSLA = () => {
    // TODO: Create and navigate to VSLARegistrationStep1
    console.log("Navigate to VSLA Registration");
    // navigation.navigate("VSLARegistrationStep1");
  };

  return (
    <View style={styles.screenContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Register Account</Text>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Subtitle */}
        <Text style={styles.subtitle}>Choose your account type</Text>

        {/* ===== CHW CARD ===== */}
        <View style={styles.roleCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="medical-outline" size={30} color="#2E7D32" />
            <Text style={styles.roleTitle}>Community Health Worker</Text>
          </View>

          <Text style={styles.roleSubtitle}>
            Register as a CHW to conduct vision screenings in your community
          </Text>

          <View style={styles.listRow}>
            <Ionicons name="checkmark-circle" size={18} color="#2E7D32" />
            <Text style={styles.listText}>Conduct near-vision screenings</Text>
          </View>

          <View style={styles.listRow}>
            <Ionicons name="checkmark-circle" size={18} color="#2E7D32" />
            <Text style={styles.listText}>Distribute reading glasses</Text>
          </View>

          <View style={styles.listRow}>
            <Ionicons name="checkmark-circle" size={18} color="#2E7D32" />
            <Text style={styles.listText}>Track hire-purchase payments</Text>
          </View>

          <View style={styles.listRow}>
            <Ionicons name="checkmark-circle" size={18} color="#2E7D32" />
            <Text style={styles.listText}>
              Make referrals for advanced care
            </Text>
          </View>

          {/* Updated: Added onPress to this button */}
          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegisterCHW}
          >
            <Text style={styles.registerButtonText}>Register as CHW</Text>
          </TouchableOpacity>
        </View>

        {/* ===== SHOP CARD ===== */}
        <View style={styles.roleCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="storefront-outline" size={30} color="#2E7D32" />
            <Text style={styles.roleTitle}>Retail Outlet / Shop</Text>
          </View>

          <Text style={styles.roleSubtitle}>
            Register your shop to sell reading glasses in partnership with Santé
          </Text>

          <View style={styles.listRow}>
            <Ionicons name="checkmark-circle" size={18} color="#2E7D32" />
            <Text style={styles.listText}>Sell Santé reading glasses</Text>
          </View>

          <View style={styles.listRow}>
            <Ionicons name="checkmark-circle" size={18} color="#2E7D32" />
            <Text style={styles.listText}>Manage inventory & stock</Text>
          </View>

          <View style={styles.listRow}>
            <Ionicons name="checkmark-circle" size={18} color="#2E7D32" />
            <Text style={styles.listText}>Track sales & revenue</Text>
          </View>

          <View style={styles.listRow}>
            <Ionicons name="checkmark-circle" size={18} color="#2E7D32" />
            <Text style={styles.listText}>Receive stock replenishments</Text>
          </View>

          {/* Updated: Added onPress to this button */}
          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegisterShop}
          >
            <Text style={styles.registerButtonText}>Register as Shop</Text>
          </TouchableOpacity>
        </View>

        {/* ===== VSLA CARD ===== */}
        <View style={styles.roleCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="people-outline" size={30} color="#2E7D32" />
            <Text style={styles.roleTitle}>VSLA / SACCO Group</Text>
          </View>

          <Text style={styles.roleSubtitle}>
            Register your community savings group to support member eye health
          </Text>

          <View style={styles.listRow}>
            <Ionicons name="checkmark-circle" size={18} color="#2E7D32" />
            <Text style={styles.listText}>
              Facilitate hire-purchase for members
            </Text>
          </View>

          <View style={styles.listRow}>
            <Ionicons name="checkmark-circle" size={18} color="#2E7D32" />
            <Text style={styles.listText}>Bulk purchase discounts</Text>
          </View>

          <View style={styles.listRow}>
            <Ionicons name="checkmark-circle" size={18} color="#2E7D32" />
            <Text style={styles.listText}>Earn group revenue from sales</Text>
          </View>

          <View style={styles.listRow}>
            <Ionicons name="checkmark-circle" size={18} color="#2E7D32" />
            <Text style={styles.listText}>Support community eye health</Text>
          </View>

          {/* Updated: Added onPress to this button */}
          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegisterVSLA}
          >
            <Text style={styles.registerButtonText}>Register as VSLA</Text>
          </TouchableOpacity>
        </View>

        {/* ===== PROCESS SECTION ===== */}
        <View style={styles.processSection}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text-outline" size={30} color="#2E7D32" />
            <Text style={styles.processTitle}>Registration Process</Text>
          </View>

          <Text style={styles.processItem}>1. Complete registration form</Text>
          <Text style={styles.processItem}>
            2. Submit documents for verification
          </Text>
          <Text style={styles.processItem}>
            3. Wait for administrator approval (24–48 hours)
          </Text>
          <Text style={styles.processItem}>
            4. Receive SMS confirmation when approved
          </Text>
          <Text style={styles.processItem}>
            5. Login and start helping your community
          </Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>Santé Initiative Uganda © 2026</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },

  backButton: {
    marginRight: 12,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },

  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },

  roleCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    elevation: 2,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  roleTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 10,
  },

  roleSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 14,
  },

  listRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  listText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#333",
    flex: 1,
  },

  registerButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },

  registerButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },

  processSection: {
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },

  processTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 10,
  },

  processItem: {
    fontSize: 14,
    marginBottom: 10,
    color: "#333",
  },

  footer: {
    textAlign: "center",
    fontSize: 12,
    color: "#999",
    marginBottom: 32,
  },
});
