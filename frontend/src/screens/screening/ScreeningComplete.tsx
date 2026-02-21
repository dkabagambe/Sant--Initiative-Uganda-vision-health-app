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
import { useNavigation, useRoute } from "@react-navigation/native";
import { useScreening } from "../../context/ScreeningContext";

export default function ScreeningComplete() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { resetScreeningData } = useScreening();
  
  const glassesDispensed = route.params?.glassesDispensed || false;
  const glassesPower = route.params?.glassesPower || "";

  const handleRegisterAndSave = () => {
    navigation.navigate("ClientRegistration");
  };

  const handleReturnHome = () => {
    resetScreeningData();
    navigation.reset({
      index: 0,
      routes: [{ name: "CHWTabs" }],
    });
  };

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
          {glassesDispensed 
            ? `Reading glasses ${glassesPower} dispensed successfully`
            : "All tests finished successfully"}
        </Text>

        {glassesDispensed && (
          <View style={styles.infoCard}>
            <Ionicons name="glasses" size={32} color="#2E7D32" />
            <Text style={styles.infoText}>
              Glasses power: {glassesPower}
            </Text>
            <Text style={styles.infoSubtext}>
              Inventory has been updated
            </Text>
          </View>
        )}

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          {/* Register & Save Button */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleRegisterAndSave}
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
            onPress={handleReturnHome}
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
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: "#E8F5E9",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 32,
    width: "100%",
  },
  infoText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E7D32",
    marginTop: 8,
  },
  infoSubtext: {
    fontSize: 14,
    color: "#4B5563",
    marginTop: 4,
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
    borderWidth: 2,
    borderColor: "#10B981",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 12,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#10B981",
  },
});
