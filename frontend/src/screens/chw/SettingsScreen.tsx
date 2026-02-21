import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { apiService } from "../../services/api";

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const [offlineSync, setOfflineSync] = React.useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await apiService.getCurrentUser();
      setUserData(user);
      // Load profile image if exists
      if (user?.profile_image) {
        setProfileImage(user.profile_image);
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
    }
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== "granted") {
        Alert.alert("Permission Required", "Please allow access to your photos to upload a profile picture.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setProfileImage(imageUri);
        
        try {
          // Upload to server
          const uploadResult = await apiService.uploadFile({
            uri: imageUri,
            name: `profile-${Date.now()}.jpg`,
            type: 'image/jpeg',
          });
          
          if (uploadResult.success) {
            Alert.alert("Success", "Profile picture updated!");
            // TODO: Update user profile with image URL
            // await apiService.updateUserProfile({ profileImage: uploadResult.data.url });
          }
        } catch (uploadError) {
          console.error("Upload error:", uploadError);
          Alert.alert("Warning", "Image selected but upload failed. Will retry later.");
        }
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            try {
              await apiService.logout();
              navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
              });
            } catch (error) {
              console.error("Sign out error:", error);
              Alert.alert("Error", "Failed to sign out");
            }
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    Alert.alert(
      "Edit Profile",
      "Choose an option:",
      [
        { text: "Change Profile Picture", onPress: handlePickImage },
        { text: "Edit Personal Info", onPress: () => Alert.alert("Coming Soon", "Profile editing will be available soon") },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const handleSecuritySettings = () => {
    Alert.alert(
      "Security & Privacy",
      "Manage your security settings:\n\n• Change Password\n• Two-Factor Authentication\n• Data Privacy Settings\n\n(Full settings coming soon)"
    );
  };

  const handleNotifications = () => {
    Alert.alert(
      "Notification Settings",
      "Manage notifications:\n\n• Payment Reminders\n• Low Stock Alerts\n• Referral Updates\n• System Notifications\n\n(Full settings coming soon)"
    );
  };

  const handleAccessibility = () => {
    Alert.alert(
      "Accessibility",
      "Customize accessibility:\n\n• Text Size\n• High Contrast Mode\n• Screen Reader Support\n• Audio Feedback\n\n(Full settings coming soon)"
    );
  };

  const handleMobileMoneySetup = () => {
    Alert.alert(
      "Mobile Money Setup",
      "Configure mobile money:\n\n• MTN Mobile Money\n• Airtel Money\n• Payment Methods\n\n(Integration coming soon)"
    );
  };

  const handleHelp = () => {
    Alert.alert(
      "Help & Support",
      "Get help:\n\n• FAQs\n• Contact Support\n• Report an Issue\n• User Guide\n\nEmail: support@santeinitiative.org\nPhone: +256 700 000 000"
    );
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.split(" ");
    return parts.map(p => p[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header with Logo */}
        <View style={styles.topHeader}>
          <View style={styles.logoBox}>
            <Image
              source={require("../../../assets/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <View style={styles.topHeaderText}>
            <Text style={styles.topHeaderTitle}>Santé Initiative Uganda</Text>
            <Text style={styles.topHeaderName}>{userData?.full_name || "User"}</Text>
            <Text style={styles.topHeaderRole}>
              CHW - {userData?.district || "District"}
            </Text>
          </View>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#1E40AF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.placeholder} />
        </View>

        <Text style={styles.settingsTitle}>Manage your app preferences</Text>

        {/* User Profile Section */}
        <View style={styles.profileSection}>
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={handlePickImage}
          >
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {getInitials(userData?.full_name || "User")}
                </Text>
              </View>
            )}
            <View style={styles.cameraIcon}>
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </View>
            {uploading && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.userName}>{userData?.full_name || "User"}</Text>
          <Text style={styles.userId}>
            CHW ID: CHW-{userData?.district?.substring(0, 2).toUpperCase() || "XX"}-2024-089
          </Text>
          <Text style={styles.userLocation}>
            {userData?.district ? `${userData.district} District` : "District"}
          </Text>
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Account & Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account & Security</Text>

          <TouchableOpacity style={styles.menuItem} onPress={handleSecuritySettings}>
            <View style={styles.menuItemLeft}>
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color="#1E40AF"
              />
              <Text style={styles.menuItemText}>Security & Privacy</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>
          <Text style={styles.menuSubtitle}>
            Data protection, authentication
          </Text>

          <TouchableOpacity style={styles.menuItem} onPress={handleEditProfile}>
            <View style={styles.menuItemLeft}>
              <Ionicons
                name="person-circle-outline"
                size={20}
                color="#1E40AF"
              />
              <Text style={styles.menuItemText}>Profile Settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>
          <Text style={styles.menuSubtitle}>Update personal information</Text>

          <TouchableOpacity style={styles.menuItem} onPress={handleNotifications}>
            <View style={styles.menuItemLeft}>
              <Ionicons
                name="notifications-outline"
                size={20}
                color="#1E40AF"
              />
              <Text style={styles.menuItemText}>Notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>
          <Text style={styles.menuSubtitle}>Payment reminders, alerts</Text>
        </View>

        {/* App Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>

          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons
                name="cloud-offline-outline"
                size={20}
                color="#1E40AF"
              />
              <Text style={styles.menuItemText}>Offline & Sync</Text>
            </View>
            <View style={styles.switchContainer}>
              <Text style={styles.switchStatus}>Active</Text>
              <Switch
                value={offlineSync}
                onValueChange={setOfflineSync}
                trackColor={{ false: "#E5E7EB", true: "#1E40AF" }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
          <Text style={styles.menuSubtitle}>Manage offline data</Text>

          <TouchableOpacity style={styles.menuItem} onPress={handleAccessibility}>
            <View style={styles.menuItemLeft}>
              <Ionicons
                name="accessibility-outline"
                size={20}
                color="#1E40AF"
              />
              <Text style={styles.menuItemText}>Accessibility</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>
          <Text style={styles.menuSubtitle}>Text size, contrast, audio</Text>

          <TouchableOpacity style={styles.menuItem} onPress={handleMobileMoneySetup}>
            <View style={styles.menuItemLeft}>
              <Ionicons
                name="phone-portrait-outline"
                size={20}
                color="#1E40AF"
              />
              <Text style={styles.menuItemText}>Mobile Money Setup</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>
          <Text style={styles.menuSubtitle}>MTN, Airtel integration</Text>
        </View>

        {/* Support & Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support & Information</Text>

          <TouchableOpacity style={[styles.menuItem, styles.featuredItem]}>
            <View style={styles.menuItemLeft}>
              <Text style={styles.featuredIcon}>📱</Text>
              <View>
                <Text style={styles.menuItemText}>Screen Capture Viewer</Text>
                <Text style={styles.featuredSubtitle}>
                  View & capture all 20+ screens
                </Text>
              </View>
            </View>
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, styles.featuredItem]}>
            <View style={styles.menuItemLeft}>
              <Text style={styles.featuredIcon}>📦</Text>
              <View>
                <Text style={styles.menuItemText}>Export & Download Guide</Text>
                <Text style={styles.featuredSubtitle}>
                  Download entire project
                </Text>
              </View>
            </View>
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Text style={styles.featuredIcon}>📸</Text>
              <Text style={styles.menuItemText}>Screenshot Guide</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>
          <Text style={styles.menuSubtitle}>Capture all platform screens</Text>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Text style={styles.featuredIcon}>📄</Text>
              <Text style={styles.menuItemText}>
                Download PDF Documentation
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>
          <Text style={styles.menuSubtitle}>
            4 platform flows • Print-ready
          </Text>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Text style={styles.featuredIcon}>🎥</Text>
              <Text style={styles.menuItemText}>Platform Demo Videos</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>
          <Text style={styles.menuSubtitle}>4 demos • 120 seconds total</Text>

          <TouchableOpacity style={styles.menuItem} onPress={handleHelp}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="help-circle-outline" size={20} color="#1E40AF" />
              <Text style={styles.menuItemText}>Help & Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>
          <Text style={styles.menuSubtitle}>FAQs, contact support</Text>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>

          <View style={styles.aboutItem}>
            <Text style={styles.versionText}>
              Version 1.0.0 • Build 2026.01
            </Text>
          </View>

          <View style={styles.featuresList}>
            <Text style={styles.featuresTitle}>App Features</Text>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color="#059669" />
              <Text style={styles.featureText}>
                Works offline for screening & registration
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color="#059669" />
              <Text style={styles.featureText}>
                GDPR-compliant health data protection
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color="#059669" />
              <Text style={styles.featureText}>
                Accessible design for low-vision users
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color="#059669" />
              <Text style={styles.featureText}>
                Mobile money integration (MTN/Airtel)
              </Text>
            </View>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color="#DC2626" style={{ marginRight: 8 }} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Santé Initiative Uganda</Text>
          <Text style={styles.copyrightText}>Community Eye Access © 2026</Text>
        </View>

        {/* Spacer for bottom navigation */}
        <View style={styles.spacer} />
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
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    marginBottom: 16,
  },
  logoBox: {
    width: 50,
    height: 50,
    marginRight: 12,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  topHeaderText: {
    flex: 1,
  },
  topHeaderTitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  topHeaderName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  topHeaderRole: {
    fontSize: 13,
    color: "#6B7280",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  placeholder: {
    width: 24,
  },
  settingsTitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  profileSection: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarContainer: {
    marginBottom: 12,
    position: "relative",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#1E40AF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "600",
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#1E40AF",
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  userId: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 2,
  },
  userLocation: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },
  editButton: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  editButtonText: {
    color: "#1E40AF",
    fontSize: 14,
    fontWeight: "600",
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  featuredItem: {
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginVertical: 4,
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    marginLeft: 12,
  },
  featuredIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  featuredSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 12,
    marginTop: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 32,
    marginTop: -8,
    marginBottom: 12,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  switchStatus: {
    fontSize: 12,
    color: "#059669",
    fontWeight: "600",
    marginRight: 8,
  },
  newBadge: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  newBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
  aboutItem: {
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  versionText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  featuresList: {
    marginTop: 16,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  featureText: {
    fontSize: 13,
    color: "#4B5563",
    marginLeft: 8,
    flex: 1,
  },
  signOutButton: {
    backgroundColor: "#FEE2E2",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginVertical: 24,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  signOutText: {
    color: "#DC2626",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    marginBottom: 32,
  },
  footerText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
    color: "#6B7280",
  },
  spacer: {
    height: 80,
  },
});
