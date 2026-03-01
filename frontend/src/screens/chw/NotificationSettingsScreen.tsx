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

export default function NotificationSettingsScreen() {
  const navigation = useNavigation<any>();
  const [settings, setSettings] = useState({
    paymentReminders: true,
    lowStockAlerts: true,
    referralUpdates: true,
    systemNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
  });

  const handleToggle = async (key: string, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    try {
      await AsyncStorage.setItem("notificationSettings", JSON.stringify(newSettings));
      Alert.alert("Updated", `${key.replace(/([A-Z])/g, ' $1').trim()} ${value ? 'enabled' : 'disabled'}`);
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
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={styles.placeholder} />
        </View>

        <Text style={styles.subtitle}>Manage your notification preferences</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity Notifications</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="cash-outline" size={20} color="#1E40AF" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Payment Reminders</Text>
                <Text style={styles.settingDescription}>Get notified about pending payments</Text>
              </View>
            </View>
            <Switch
              value={settings.paymentReminders}
              onValueChange={(value) => handleToggle("paymentReminders", value)}
              trackColor={{ false: "#E5E7EB", true: "#1E40AF" }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="cube-outline" size={20} color="#1E40AF" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Low Stock Alerts</Text>
                <Text style={styles.settingDescription}>Alerts when inventory is running low</Text>
              </View>
            </View>
            <Switch
              value={settings.lowStockAlerts}
              onValueChange={(value) => handleToggle("lowStockAlerts", value)}
              trackColor={{ false: "#E5E7EB", true: "#1E40AF" }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="medical-outline" size={20} color="#1E40AF" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Referral Updates</Text>
                <Text style={styles.settingDescription}>Status changes on referrals</Text>
              </View>
            </View>
            <Switch
              value={settings.referralUpdates}
              onValueChange={(value) => handleToggle("referralUpdates", value)}
              trackColor={{ false: "#E5E7EB", true: "#1E40AF" }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={20} color="#1E40AF" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>System Notifications</Text>
                <Text style={styles.settingDescription}>App updates and announcements</Text>
              </View>
            </View>
            <Switch
              value={settings.systemNotifications}
              onValueChange={(value) => handleToggle("systemNotifications", value)}
              trackColor={{ false: "#E5E7EB", true: "#1E40AF" }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Methods</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="chatbubble-outline" size={20} color="#1E40AF" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>SMS Notifications</Text>
                <Text style={styles.settingDescription}>Receive SMS for important updates</Text>
              </View>
            </View>
            <Switch
              value={settings.smsNotifications}
              onValueChange={(value) => handleToggle("smsNotifications", value)}
              trackColor={{ false: "#E5E7EB", true: "#1E40AF" }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="phone-portrait-outline" size={20} color="#1E40AF" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Push Notifications</Text>
                <Text style={styles.settingDescription}>In-app push notifications</Text>
              </View>
            </View>
            <Switch
              value={settings.pushNotifications}
              onValueChange={(value) => handleToggle("pushNotifications", value)}
              trackColor={{ false: "#E5E7EB", true: "#1E40AF" }}
              thumbColor="#FFFFFF"
            />
          </View>
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
});
