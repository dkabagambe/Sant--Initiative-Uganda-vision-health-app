import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AccessibilityScreen() {
  const navigation = useNavigation<any>();
  const [settings, setSettings] = useState({
    highContrast: false,
    largeText: false,
    screenReader: true,
    audioFeedback: false,
    reducedMotion: false,
    textSize: 16,
  });

  const handleToggle = async (key: string, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    try {
      await AsyncStorage.setItem("accessibilitySettings", JSON.stringify(newSettings));
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  const handleTextSizeChange = async (value: number) => {
    const newSettings = { ...settings, textSize: value };
    setSettings(newSettings);
    
    try {
      await AsyncStorage.setItem("accessibilitySettings", JSON.stringify(newSettings));
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#1E40AF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Accessibility</Text>
          <View style={styles.placeholder} />
        </View>

        <Text style={styles.subtitle}>Customize app accessibility features</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visual</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="contrast-outline" size={20} color="#1E40AF" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>High Contrast Mode</Text>
                <Text style={styles.settingDescription}>Increase color contrast</Text>
              </View>
            </View>
            <Switch
              value={settings.highContrast}
              onValueChange={(value) => handleToggle("highContrast", value)}
              trackColor={{ false: "#E5E7EB", true: "#1E40AF" }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="text-outline" size={20} color="#1E40AF" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Large Text</Text>
                <Text style={styles.settingDescription}>Use larger font sizes</Text>
              </View>
            </View>
            <Switch
              value={settings.largeText}
              onValueChange={(value) => handleToggle("largeText", value)}
              trackColor={{ false: "#E5E7EB", true: "#1E40AF" }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.textSizeContainer}>
            <View style={styles.textSizeHeader}>
              <Ionicons name="text-outline" size={20} color="#1E40AF" />
              <Text style={styles.settingTitle}>Text Size</Text>
            </View>
            <View style={styles.textSizeButtons}>
              <TouchableOpacity
                style={[styles.sizeButton, settings.textSize === 12 && styles.sizeButtonActive]}
                onPress={() => handleTextSizeChange(12)}
              >
                <Text style={[styles.sizeButtonText, settings.textSize === 12 && styles.sizeButtonTextActive]}>Small</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sizeButton, settings.textSize === 16 && styles.sizeButtonActive]}
                onPress={() => handleTextSizeChange(16)}
              >
                <Text style={[styles.sizeButtonText, settings.textSize === 16 && styles.sizeButtonTextActive]}>Medium</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sizeButton, settings.textSize === 20 && styles.sizeButtonActive]}
                onPress={() => handleTextSizeChange(20)}
              >
                <Text style={[styles.sizeButtonText, settings.textSize === 20 && styles.sizeButtonTextActive]}>Large</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sizeButton, settings.textSize === 24 && styles.sizeButtonActive]}
                onPress={() => handleTextSizeChange(24)}
              >
                <Text style={[styles.sizeButtonText, settings.textSize === 24 && styles.sizeButtonTextActive]}>X-Large</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audio & Motion</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="volume-high-outline" size={20} color="#1E40AF" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Screen Reader Support</Text>
                <Text style={styles.settingDescription}>Compatible with TalkBack/VoiceOver</Text>
              </View>
            </View>
            <Switch
              value={settings.screenReader}
              onValueChange={(value) => handleToggle("screenReader", value)}
              trackColor={{ false: "#E5E7EB", true: "#1E40AF" }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="musical-notes-outline" size={20} color="#1E40AF" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Audio Feedback</Text>
                <Text style={styles.settingDescription}>Sound effects for actions</Text>
              </View>
            </View>
            <Switch
              value={settings.audioFeedback}
              onValueChange={(value) => handleToggle("audioFeedback", value)}
              trackColor={{ false: "#E5E7EB", true: "#1E40AF" }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="speedometer-outline" size={20} color="#1E40AF" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Reduced Motion</Text>
                <Text style={styles.settingDescription}>Minimize animations</Text>
              </View>
            </View>
            <Switch
              value={settings.reducedMotion}
              onValueChange={(value) => handleToggle("reducedMotion", value)}
              trackColor={{ false: "#E5E7EB", true: "#1E40AF" }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#1E40AF" />
          <Text style={styles.infoText}>
            These settings work alongside your device's accessibility features. 
            For best results, enable system accessibility settings as well.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FFF8",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  placeholder: {
    width: 24,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: "#6B7280",
  },
  textSizeContainer: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  textSizeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  textSizeButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  sizeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  sizeButtonActive: {
    backgroundColor: "#1E40AF",
    borderColor: "#1E40AF",
  },
  sizeButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  sizeButtonTextActive: {
    color: "#FFFFFF",
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#EFF6FF",
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#1E40AF",
    marginLeft: 12,
    lineHeight: 18,
  },
});
