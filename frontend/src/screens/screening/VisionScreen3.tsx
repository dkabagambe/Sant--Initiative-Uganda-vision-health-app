import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { apiService } from "../../services/api";
import { FormNavBar } from "../../components/FormNavBar";
import { KeyboardAwareFormLayout } from "../../components/KeyboardAwareFormLayout";

export default function SafetyInformationScreen() {
  const navigation = useNavigation<any>();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await apiService.getCurrentUser();
      if (user) setUserData(user);
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const warnings = [
    {
      emoji: "⛔",
      text: "DO NOT touch the client's eyes with your hands or any objects",
      color: "#EF4444",
    },
    {
      emoji: "🔦",
      text: "DO NOT use phone flashlight - use only a small hand torch",
      color: "#EF4444",
    },
    {
      emoji: "🚨",
      text: "If you see pus, blood, or serious injury - STOP and refer immediately",
      color: "#EF4444",
    },
    {
      emoji: "👨‍⚕️",
      text: "Do not try to treat any eye problems yourself - always refer",
      color: "#EF4444",
    },
  ];

  const reminders = [
    { text: "• You are screening, not treating" },
    { text: "• When in doubt, refer to health facility" },
    { text: "• Keep your tools clean" },
    { text: "• Wash hands before and after" },
  ];

  const handleStartTest = () => {
    navigation.navigate("VisionScreen4");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <Image
            source={require("../../../assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {userData?.fullName || userData?.full_name || "Santé Initiative Uganda"}
          </Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {userData?.district ? `VHT · ${userData.district} District` : ""}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
            <Ionicons name="menu" size={28} color="#1A4D8F" />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAwareFormLayout
        footer={
          <FormNavBar
            onPrev={() => navigation.goBack()}
            onNext={handleStartTest}
            nextLabel="🔦 Start Torch Light Test"
          />
        }
      >
        {/* Progress */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>Step 3 of 6</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: "50%" }]} />
          </View>
        </View>

        {/* Safety warnings */}
        <View>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>⚠️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Important Safety Information</Text>
              <Text style={styles.sectionSubtitle}>Read these warnings before starting tests.</Text>
            </View>
          </View>

          <View style={styles.warningsContainer}>
            {warnings.map((warning, index) => (
              <View
                key={index}
                style={[
                  styles.warningItem,
                  index === warnings.length - 1 && styles.warningItemLast,
                ]}
              >
                <Text style={styles.warningEmoji}>{warning.emoji}</Text>
                <Text style={styles.warningText}>
                  <Text style={styles.boldText}>
                    {warning.text.split(" - ")[0]}
                    {warning.text.includes(" - ") ? " - " : ""}
                  </Text>
                  {warning.text.split(" - ")[1] && (
                    <Text>{warning.text.split(" - ")[1]}</Text>
                  )}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Reminders */}
        <View style={styles.rememberSection}>
          <View style={styles.rememberHeader}>
            <Text style={styles.rememberIcon}>✅</Text>
            <Text style={styles.rememberTitle}>Remember:</Text>
          </View>
          {reminders.map((reminder, index) => (
            <View key={index} style={styles.reminderItem}>
              <Text style={styles.reminderText}>{reminder.text}</Text>
            </View>
          ))}
        </View>
      </KeyboardAwareFormLayout>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },

  /* Header */
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    height: 72,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  headerLeft: { width: 44, alignItems: "flex-start", justifyContent: "center" },
  logo: { width: 38, height: 38 },
  headerCenter: { flex: 1, alignItems: "center", paddingHorizontal: 8 },
  headerTitle: { fontSize: 15, fontWeight: "700", color: "#1A1A1A" },
  headerSubtitle: { fontSize: 12, color: "#6B7280", marginTop: 1 },
  headerRight: { width: 44, alignItems: "flex-end", justifyContent: "center" },

  /* Progress */
  progressContainer: { marginBottom: 4 },
  progressText: { fontSize: 15, fontWeight: "700", color: "#1A4D8F", marginBottom: 8 },
  progressBar: {
    height: 6,
    backgroundColor: "#E8EAED",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: "#2E7D32", borderRadius: 3 },

  /* Safety section */
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    gap: 10,
  },
  sectionIcon: { fontSize: 26, marginTop: 2 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#3f1d1d",
    marginBottom: 2,
  },
  sectionSubtitle: { fontSize: 14, color: "#a11414", fontWeight: "500", lineHeight: 20 },

  warningsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FFE4E6",
    padding: 20,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  warningItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F8FAFC",
  },
  warningItemLast: { marginBottom: 0, paddingBottom: 0, borderBottomWidth: 0 },
  warningEmoji: { fontSize: 22, width: 28, textAlign: "center" },
  warningText: { flex: 1, fontSize: 15, color: "#374151", lineHeight: 22, fontWeight: "500" },
  boldText: { fontWeight: "700", color: "#EF4444" },

  /* Reminders */
  rememberSection: {
    backgroundColor: "#F0F9FF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E0F2FE",
    padding: 20,
  },
  rememberHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 10 },
  rememberIcon: { fontSize: 22 },
  rememberTitle: { fontSize: 18, fontWeight: "700", color: "#0369A1" },
  reminderItem: { marginBottom: 12 },
  reminderText: { fontSize: 15, color: "#0C4A6E", lineHeight: 22, fontWeight: "500" },
});
