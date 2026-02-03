import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import RoleTabs from "../../components/RoleTabs";
import AppButton from "../../components/AppButton";
import { colors } from "../../theme/colors";

// Define the navigation types matching your AppNavigator
type RootStackParamList = {
  Login: undefined;
  OTP: { phone: string; role: string };
  Register: undefined;
  AppTabs: { role: string };
};

type RoleLoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Login"
>;

export default function RoleLoginScreen() {
  const [role, setRole] = useState<"CHW" | "Outlet" | "VSLA">("CHW");
  const [phone, setPhone] = useState("");

  const navigation = useNavigation<RoleLoginScreenNavigationProp>();

  const handleRoleChange = (newRole: string) => {
    if (newRole === "CHW" || newRole === "Outlet" || newRole === "VSLA") {
      setRole(newRole);
    }
  };

  const handleSendOTP = () => {
    if (phone.trim()) {
      // Navigate to OTP screen with phone and role as params
      navigation.navigate("OTP", {
        phone: phone.trim(),
        role: role,
      });
    }
  };

  const handleRegisterPress = () => {
    // Navigate to Register screen
    navigation.navigate("Register");
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoBox}>
        <Image
          source={require("../../../assets/logo.png")}
          style={styles.logo}
        />
      </View>

      {/* Title */}
      <Text style={styles.title}>Santé Initiative Uganda</Text>
      <Text style={styles.subtitle}>
        Bringing vision health services closer to communities
      </Text>

      {/* Role Tabs */}
      <RoleTabs value={role} onChange={handleRoleChange} />

      {/* Phone Number */}
      <Text style={styles.label}>Phone Number</Text>
      <View style={styles.phoneRow}>
        <View style={styles.phoneIconBox}>
          <Ionicons name="call-outline" size={18} color="#666" />
          <Text style={styles.countryCode}>+256</Text>
        </View>

        <TextInput
          style={styles.phoneInput}
          placeholder="700 123 456"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          maxLength={9}
        />
      </View>

      <Text style={styles.helperText}>Enter your registered mobile number</Text>

      {/* Buttons */}
      <AppButton
        title="Send OTP"
        disabled={!phone.trim()}
        onPress={handleSendOTP}
      />

      <AppButton
        title="Register as CHW/Outlet"
        variant="outline"
        onPress={handleRegisterPress}
      />

      {/* Info Card */}
      <View style={styles.infoCard}>
        <Ionicons name="eye-outline" size={18} color={colors.primary} />
        <Text style={styles.infoText}>
          For Community Health Workers{"\n"}
          Screen clients, sell reading glasses, and track payments using mobile
          money
        </Text>
      </View>

      {/* Divider */}
      <View style={styles.divider}>
        <Text style={styles.offlineText}>Works offline for screening</Text>
      </View>

      {/* Language Switch */}
      <View style={styles.languageRow}>
        <TouchableOpacity style={styles.langActive}>
          <Text style={styles.langActiveText}>English</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.langInactive}>
          <Text style={styles.langInactiveText}>Luganda</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <Text style={styles.footerText}>Santé Initiative Uganda © 2026</Text>
    </View>
  );
}

// Keep your existing styles exactly as they are
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    backgroundColor: "#F8FFF8",
  },

  logoBox: {
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  logo: {
    width: 80,
    height: 80,
    resizeMode: "cover",
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },

  subtitle: {
    textAlign: "center",
    color: "#666",
    marginTop: 4,
    marginBottom: 24,
  },

  label: {
    fontWeight: "600",
    marginBottom: 6,
  },

  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    backgroundColor: "#fff",
  },

  phoneIconBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderColor: "#EEE",
  },

  countryCode: {
    marginLeft: 6,
    color: "#333",
  },

  phoneInput: {
    flex: 1,
    padding: 14,
  },

  helperText: {
    fontSize: 12,
    color: "#777",
    marginTop: 6,
    marginBottom: 16,
  },

  infoCard: {
    flexDirection: "row",
    backgroundColor: "#EAF2FF",
    borderRadius: 10,
    padding: 12,
    marginTop: 16,
    gap: 8,
  },

  infoText: {
    fontSize: 12,
    color: "#1E40AF",
    flex: 1,
  },

  divider: {
    marginTop: 24,
    paddingVertical: 10,
    backgroundColor: "#F2F2F2",
    borderRadius: 8,
  },

  offlineText: {
    textAlign: "center",
    fontSize: 12,
    color: "#666",
  },

  languageRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
  },

  langActive: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },

  langActiveText: {
    color: "#fff",
    fontSize: 12,
  },

  langInactive: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },

  langInactiveText: {
    fontSize: 12,
    color: "#333",
  },

  footerText: {
    textAlign: "center",
    fontSize: 11,
    color: "#777",
    marginTop: 12,
  },
});
