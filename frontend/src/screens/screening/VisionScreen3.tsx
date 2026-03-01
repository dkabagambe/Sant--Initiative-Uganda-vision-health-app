import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { apiService } from "../../services/api";

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
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#F8FAFC" barStyle="dark-content" />

      {/* Top Header with Logo and Menu - Fixed at top */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.logoBox}>
            <Image
              source={require("../../../assets/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {userData?.fullName || userData?.full_name || "Santé Initiative Uganda"}
          </Text>
          <Text style={styles.headerSubtitle}>
            {userData?.district ? `VHT - ${userData.district} District` : ""}
          </Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
            <Ionicons name="menu" size={28} color="#1A4D8F" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Progress Section */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>Step 3 of 6</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: "50%" }]} />
          </View>
        </View>

        {/* Safety Information Section */}
        <View style={styles.safetySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}> ⚠️ </Text>
            <View>
              <Text style={styles.sectionTitle}>
                Important Safety Information
              </Text>
              <Text style={styles.sectionSubtitle}>
                Read these warnings before starting tests.
              </Text>
            </View>
          </View>

          <View style={styles.warningsContainer}>
            {warnings.map((warning, index) => (
              <View key={index} style={styles.warningItem}>
                <View style={styles.warningEmojiContainer}>
                  <Text style={styles.warningEmoji}>{warning.emoji}</Text>
                </View>
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

        {/* Remember Section */}
        <View style={styles.rememberSection}>
          <View style={styles.rememberHeader}>
            <Text style={styles.rememberIcon}>✅</Text>
            <Text style={styles.rememberTitle}>Remember:</Text>
          </View>

          <View style={styles.rememberList}>
            {reminders.map((reminder, index) => (
              <View key={index} style={styles.reminderItem}>
                <Text style={styles.reminderText}>{reminder.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Bottom Navigation Buttons */}
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.backButtonNav}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>👈 Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartTest}
            activeOpacity={0.8}
          >
            <View style={styles.startButtonContent}>
              <Text style={styles.startButtonEmoji}>🔦</Text>
              <Text style={styles.startButtonText}>Start Torch Light Test</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={{ height: 190 }} />
      </ScrollView>

    </SafeAreaView>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingTop: 44,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  headerLeft: {
    flex: 1,
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
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  headerRight: {
    flex: 1,
    alignItems: "flex-end",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerRightPlaceholder: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 150,
    paddingBottom: 140,
  },
  progressContainer: {
    marginBottom: 28,
  },
  progressText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A4D8F",
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#E8EAED",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#2E7D32",
    borderRadius: 3,
  },
  safetySection: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
  },
  sectionIcon: {
    fontSize: 28,
    marginRight: 12,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#3f1d1d",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#a11414",
    fontWeight: "500",
    lineHeight: 20,
    textAlign: "left",
  },
  warningsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FFE4E6",
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  warningItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F8FAFC",
  },
  warningItemLast: {
    marginBottom: 0,
    paddingBottom: 0,
    borderBottomWidth: 0,
  },
  warningEmojiContainer: {
    width: 36,
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  warningEmoji: {
    fontSize: 22,
  },
  warningText: {
    flex: 1,
    fontSize: 16,
    color: "#374151",
    lineHeight: 22,
    fontWeight: "500",
  },
  boldText: {
    fontWeight: "700",
    color: "#EF4444",
  },
  rememberSection: {
    backgroundColor: "#F0F9FF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E0F2FE",
    padding: 24,
    marginBottom: 20,
  },
  rememberHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  rememberIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  rememberTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0369A1",
    letterSpacing: -0.3,
  },
  rememberList: {
    paddingLeft: 4,
  },
  reminderItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  reminderEmoji: {
    fontSize: 20,
    marginRight: 12,
    width: 32,
  },
  reminderText: {
    flex: 1,
    fontSize: 16,
    color: "#0C4A6E",
    lineHeight: 22,
    fontWeight: "500",
  },
  spacer: {
    height: 20,
  },
  bottomNav: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  backButtonNav: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: "#E8EAED",
  },
  backButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#666666",
  },
  startButton: {
    flex: 2,
    backgroundColor: "#2E7D32",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    marginLeft: 12,
    shadowColor: "#1A4D8F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#0D3A6F",
  },
  startButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  startButtonEmoji: {
    fontSize: 18,
    marginRight: 10,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
