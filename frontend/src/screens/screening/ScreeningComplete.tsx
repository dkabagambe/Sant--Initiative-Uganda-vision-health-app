import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ScreeningCompleteProps {
  onRegisterAndSave: () => void;
  onReturnHome: () => void;
  needsGlasses?: boolean;
}

export default function ScreeningComplete({
  onRegisterAndSave,
  onReturnHome,
  needsGlasses = false,
}: ScreeningCompleteProps) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#10B981" barStyle="light-content" />

      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={120} color="#10B981" />
        </View>

        {/* Title */}
        <Text style={styles.title}>Screening Complete! 🎉</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          {needsGlasses 
            ? "All tests finished - Client needs reading glasses"
            : "All tests finished successfully"}
        </Text>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          {/* Register & Save Button */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onRegisterAndSave}
            activeOpacity={0.8}
          >
            <Ionicons name="save" size={24} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>
              Register Client & Save Record
            </Text>
          </TouchableOpacity>

          {/* Return Home Button */}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onReturnHome}
            activeOpacity={0.8}
          >
            <Ionicons name="home" size={24} color="#10B981" />
            <Text style={styles.secondaryButtonText}>Return to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  iconContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "400",
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 48,
  },
  buttonContainer: {
    width: "100%",
    gap: 16,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10B981",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 12,
    borderWidth: 2,
    borderColor: "#10B981",
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#10B981",
  },
});
