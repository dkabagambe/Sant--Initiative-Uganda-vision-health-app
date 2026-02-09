import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function SafetyInformationScreen() {
  const navigation = useNavigation<any>();

  const warnings = [
    {
      icon: "hand-left-outline",
      text: "DO NOT touch the client's eyes with your hands or any objects",
      color: "#DC2626",
    },
    {
      icon: "flashlight-outline",
      text: "DO NOT use phone flashlight - use only a small hand torch",
      color: "#DC2626",
    },
    {
      icon: "warning-outline",
      text: "If you see pus, blood, or serious injury - STOP and refer immediately",
      color: "#DC2626",
    },
    {
      icon: "medical-outline",
      text: "Do not try to treat any eye problems yourself - always refer",
      color: "#DC2626",
    },
  ];

  const reminders = [
    "You are screening, not treating",
    "When in doubt, refer to health facility",
    "Keep your tools clean",
    "Wash hands before and after",
  ];

  const handleStartTest = () => {
    navigation.navigate("VisionScreen4");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#F8FAFC" barStyle="dark-content" />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>VHT Eye Screening</Text>
        </View>

        <View style={styles.headerRightPlaceholder} />
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

        {/* Divider */}
        <View style={styles.divider} />

        {/* Safety Information Section */}
        <View style={styles.safetySection}>
          <Text style={styles.sectionTitle}>Important Safety Information</Text>
          <Text style={styles.sectionSubtitle}>
            Read these warnings before starting tests.
          </Text>

          <View style={styles.warningsContainer}>
            {warnings.map((warning, index) => (
              <View key={index} style={styles.warningItem}>
                <View style={styles.warningIconContainer}>
                  <Ionicons
                    name={warning.icon as any}
                    size={22}
                    color={warning.color}
                  />
                </View>
                <Text style={styles.warningText}>
                  <Text style={styles.boldText}>
                    {warning.text.split(" - ")[0]}
                    {warning.text.includes(" - ") ? " - " : ""}
                  </Text>
                  {warning.text.split(" - ")[1] ? (
                    <Text>{warning.text.split(" - ")[1]}</Text>
                  ) : null}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Remember Section */}
        <View style={styles.rememberSection}>
          <View style={styles.rememberTitleContainer}>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            <Text style={styles.rememberTitle}>Remember:</Text>
          </View>

          <View style={styles.rememberList}>
            {reminders.map((reminder, index) => (
              <View key={index} style={styles.reminderItem}>
                <View style={styles.bulletPoint}>
                  <Text style={styles.bulletText}>•</Text>
                </View>
                <Text style={styles.reminderText}>{reminder}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Spacer for bottom buttons */}
        <View style={styles.spacer} />
      </ScrollView>

      {/* Bottom Navigation Buttons */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.backButtonNav}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartTest}
          activeOpacity={0.8}
        >
          <View style={styles.startButtonContent}>
            <Ionicons name="flashlight" size={22} color="#FFFFFF" />
            <Text style={styles.startButtonText}>Start Torch Light Test</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        {[
          { icon: "home-outline", label: "Home" },
          { icon: "phone-portrait-outline", label: "Screenshot" },
          { icon: "cube-outline", label: "Stock" },
          { icon: "cash-outline", label: "Payments" },
          { icon: "share-social-outline", label: "Referrals" },
        ].map((tab, index) => (
          <TouchableOpacity
            key={index}
            style={styles.tabItem}
            activeOpacity={0.7}
            onPress={() => {
              if (index === 1) return; // Current screen
              // Add navigation for other tabs
            }}
          >
            <Ionicons
              name={tab.icon as any}
              size={22}
              color={index === 1 ? "#1A4D8F" : "#6B7280"}
            />
            <Text
              style={[styles.tabLabel, index === 1 && styles.tabLabelActive]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    letterSpacing: 0.5,
  },
  headerRightPlaceholder: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 140,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A4D8F",
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#1A4D8F",
    borderRadius: 3,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginBottom: 24,
  },
  safetySection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 24,
    lineHeight: 24,
    fontWeight: "500",
  },
  warningsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  warningItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  warningIconContainer: {
    width: 30,
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  warningText: {
    flex: 1,
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
    fontWeight: "500",
  },
  boldText: {
    fontWeight: "700",
    color: "#DC2626",
  },
  rememberSection: {
    backgroundColor: "#F0F9FF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0F2FE",
    padding: 20,
    marginBottom: 20,
  },
  rememberTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  rememberTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0369A1",
    marginLeft: 10,
    letterSpacing: 0.5,
  },
  rememberList: {
    paddingLeft: 4,
  },
  reminderItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  bulletPoint: {
    width: 24,
    alignItems: "center",
    marginTop: 2,
  },
  bulletText: {
    fontSize: 18,
    color: "#0369A1",
    fontWeight: "700",
  },
  reminderText: {
    flex: 1,
    fontSize: 15,
    color: "#0C4A6E",
    lineHeight: 22,
    fontWeight: "500",
  },
  spacer: {
    height: 20,
  },
  bottomNav: {
    position: "absolute",
    bottom: 70,
    left: 0,
    right: 0,
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  backButtonNav: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  backButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#4B5563",
    letterSpacing: 0.5,
  },
  startButton: {
    flex: 2,
    backgroundColor: "#1A4D8F",
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    marginLeft: 12,
    shadowColor: "#1A4D8F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  startButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  startButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
    marginLeft: 10,
    letterSpacing: 0.5,
  },
  tabBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
  tabLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 4,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  tabLabelActive: {
    color: "#1A4D8F",
    fontWeight: "700",
  },
});
