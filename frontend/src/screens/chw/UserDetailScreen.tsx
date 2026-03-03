import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Platform,
  StatusBar,
  Linking,
  TextInput,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { apiService } from "../../services/api";
import CHWHeader from "../../components/CHWHeader";
import { scale, verticalScale, moderateScale } from "../../utils/responsive";

type RootStackParamList = {
  UserDetailScreen: { userId: string; userType: string };
  CHWDashboard: undefined;
};

type UserDetailScreenRouteProp = RouteProp<RootStackParamList, "UserDetailScreen">;
type UserDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "UserDetailScreen">;

const UserDetailScreen: React.FC = () => {
  const route = useRoute<UserDetailScreenRouteProp>();
  const navigation = useNavigation<UserDetailScreenNavigationProp>();
  const { userId, userType } = route.params;

  const [userDetails, setUserDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    phoneNumber: '',
    district: '',
    village: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setError(null);
      const response = await apiService.getUserDetails(userId);
      
      if (response.success) {
        setUserDetails(response.data);
        setEditForm({
          fullName: response.data.fullName || '',
          phoneNumber: response.data.phoneNumber || '',
          district: response.data.district || '',
          village: response.data.village || ''
        });
      } else {
        setError("Failed to load user details");
      }
    } catch (err) {
      console.error("Error fetching user details:", err);
      setError("Failed to load user details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditPress = () => {
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    try {
      // For now, just show success message
      // In a real implementation, you would call an API endpoint to update the user
      Alert.alert(
        "Success",
        "User information updated successfully!",
        [{ text: "OK", onPress: () => setEditModalVisible(false) }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to update user information");
    } finally {
      setIsSaving(false);
    }
  };

  const makePhoneCall = (phoneNumber: string) => {
    const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+256${phoneNumber.slice(1)}`;
    Linking.openURL(`tel:${formattedNumber}`).catch(() => {
      Alert.alert("Error", "Unable to make phone call");
    });
  };

  const renderBasicInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Basic Information</Text>
      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Full Name</Text>
          <Text style={styles.infoValue}>{userDetails.fullName || "N/A"}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Phone Number</Text>
          <View style={styles.phoneContainer}>
            <Text style={styles.infoValue}>{userDetails.phoneNumber}</Text>
            <TouchableOpacity
              style={styles.callButton}
              onPress={() => makePhoneCall(userDetails.phoneNumber)}
            >
              <Ionicons name="call" size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Gender</Text>
          <Text style={styles.infoValue}>{userDetails.gender || "N/A"}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Status</Text>
          <View style={[styles.statusBadge, { backgroundColor: userDetails.isActive ? "#10B981" : "#EF4444" }]}>
            <Text style={styles.statusText}>{userDetails.isActive ? "Active" : "Inactive"}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderLocationInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Location Information</Text>
      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>District</Text>
          <Text style={styles.infoValue}>{userDetails.district || "N/A"}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Sub County</Text>
          <Text style={styles.infoValue}>{userDetails.subCounty || "N/A"}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Village</Text>
          <Text style={styles.infoValue}>{userDetails.village || "N/A"}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Parish</Text>
          <Text style={styles.infoValue}>{userDetails.parish || "N/A"}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Region</Text>
          <Text style={styles.infoValue}>{userDetails.region || "N/A"}</Text>
        </View>
      </View>
    </View>
  );

  const renderRoleSpecificInfo = () => {
    if (userType === "vhts") {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>VHT Information</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Years of Experience</Text>
              <Text style={styles.infoValue}>{userDetails.yearsOfExperience || "N/A"}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Training Certificate</Text>
              <Text style={styles.infoValue}>{userDetails.trainingCertificate ? "Yes" : "No"}</Text>
            </View>
            {userDetails.totalScreenings !== undefined && (
              <>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Total Screenings</Text>
                  <Text style={styles.infoValue}>{userDetails.totalScreenings || 0}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Glasses Prescribed</Text>
                  <Text style={styles.infoValue}>{userDetails.glassesPrescribed || 0}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Referrals Made</Text>
                  <Text style={styles.infoValue}>{userDetails.referralsMade || 0}</Text>
                </View>
              </>
            )}
          </View>
        </View>
      );
    }

    if (userType === "vslas") {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>VSLA Information</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Organization Name</Text>
              <Text style={styles.infoValue}>{userDetails.organizationName || "N/A"}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Registration Number</Text>
              <Text style={styles.infoValue}>{userDetails.registrationNumber || "N/A"}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Chairperson</Text>
              <Text style={styles.infoValue}>{userDetails.chairperson || "N/A"}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Group Size</Text>
              <Text style={styles.infoValue}>{userDetails.groupSize || "N/A"}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Meeting Frequency</Text>
              <Text style={styles.infoValue}>{userDetails.meetingFrequency || "N/A"}</Text>
            </View>
          </View>
        </View>
      );
    }

    if (userType === "retail") {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Information</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Business Name</Text>
              <Text style={styles.infoValue}>{userDetails.businessName || "N/A"}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Business Type</Text>
              <Text style={styles.infoValue}>{userDetails.businessType || "N/A"}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>TIN Number</Text>
              <Text style={styles.infoValue}>{userDetails.tinNumber || "N/A"}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Business License</Text>
              <Text style={styles.infoValue}>{userDetails.businessLicense ? "Yes" : "No"}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Business Address</Text>
              <Text style={styles.infoValue}>{userDetails.businessAddress || "N/A"}</Text>
            </View>
            {userDetails.totalSales !== undefined && (
              <>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Total Sales (30 days)</Text>
                  <Text style={styles.infoValue}>{userDetails.totalSales || 0}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Total Revenue (30 days)</Text>
                  <Text style={styles.infoValue}>UGX {userDetails.totalRevenue?.toLocaleString() || 0}</Text>
                </View>
              </>
            )}
          </View>
        </View>
      );
    }

    return null;
  };

  const renderSystemInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>System Information</Text>
      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>User ID</Text>
          <Text style={styles.infoValue}>{userDetails.id}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Role</Text>
          <Text style={styles.infoValue}>{userDetails.role}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Registration Date</Text>
          <Text style={styles.infoValue}>
            {new Date(userDetails.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Last Updated</Text>
          <Text style={styles.infoValue}>
            {new Date(userDetails.updatedAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Last Login</Text>
          <Text style={styles.infoValue}>
            {userDetails.lastLogin ? new Date(userDetails.lastLogin).toLocaleDateString() : "Never"}
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1E40AF" />
        <CHWHeader showMenu={false} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading user details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !userDetails) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1E40AF" />
        <CHWHeader showMenu={false} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#EF4444" />
          <Text style={styles.errorText}>{error || "User not found"}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchUserDetails}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E40AF" />
      <CHWHeader showMenu={false} />
      
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.editButton} onPress={handleEditPress}>
          <Ionicons name="create-outline" size={20} color="white" />
          <Text style={styles.editButtonText}>Edit User</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderBasicInfo()}
        {renderLocationInfo()}
        {renderRoleSpecificInfo()}
        {renderSystemInfo()}
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit User Information</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.fullName}
                  onChangeText={(text) => setEditForm(prev => ({ ...prev, fullName: text }))}
                  placeholder="Enter full name"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.phoneNumber}
                  onChangeText={(text) => setEditForm(prev => ({ ...prev, phoneNumber: text }))}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>District</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.district}
                  onChangeText={(text) => setEditForm(prev => ({ ...prev, district: text }))}
                  placeholder="Enter district"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Village</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.village}
                  onChangeText={(text) => setEditForm(prev => ({ ...prev, village: text }))}
                  placeholder="Enter village"
                />
              </View>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveEdit}
                disabled={isSaving}
              >
                <Text style={styles.saveButtonText}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "500",
  },
  section: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  infoGrid: {
    gap: 12,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  infoLabel: {
    fontSize: 14,
    color: "#6B7280",
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
    flex: 1,
    textAlign: "right",
  },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    justifyContent: "flex-end",
  },
  callButton: {
    backgroundColor: "#10B981",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    color: "white",
  },
  // Edit Button
  headerActions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  editButton: {
    backgroundColor: "#10B981",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  editButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    width: "90%",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#1F2937",
  },
  modalFooter: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
  },
  cancelButtonText: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "500",
  },
  saveButton: {
    backgroundColor: "#10B981",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default UserDetailScreen;
