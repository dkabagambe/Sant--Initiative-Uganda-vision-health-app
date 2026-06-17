import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { apiService } from "../../services/api";
import CHWHeader from "../../components/CHWHeader";
import { scale, verticalScale, moderateScale } from "../../utils/responsive";

type RootStackParamList = {
  UserDirectoryScreen: undefined;
  UserDetailScreen: { userId: string; userType: string };
  CHWDashboard: undefined;
};

type UserDirectoryScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "UserDirectoryScreen"
>;

interface UserCardProps {
  user: any;
  userType: string;
  onPress: () => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, userType, onPress }) => {
  const getStatusColor = (isActive: boolean) => {
    return isActive ? "#10B981" : "#EF4444";
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? "Active" : "Inactive";
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "CHW":
      case "health_worker":
        return "medical";
      case "VSLA":
        return "people";
      case "outlet":
      case "retail":
        return "storefront";
      default:
        return "person";
    }
  };

  return (
    <TouchableOpacity style={styles.userCard} onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <View style={[styles.avatar, { backgroundColor: "#3B82F6" }]}>
            <Ionicons name={getRoleIcon(user.role)} size={24} color="white" />
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user.fullName || "N/A"}</Text>
            <Text style={styles.userPhone}>{user.phoneNumber}</Text>
            <Text style={styles.userLocation}>
              {user.district}, {user.village}
            </Text>
          </View>
        </View>
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(user.isActive) }]}>
            <Text style={styles.statusText}>{getStatusText(user.isActive)}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.cardFooter}>
        <Text style={styles.registrationDate}>
          Registered: {new Date(user.createdAt).toLocaleDateString()}
        </Text>
        {user.lastLogin && (
          <Text style={styles.lastLogin}>
            Last login: {new Date(user.lastLogin).toLocaleDateString()}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const UserDirectoryScreen: React.FC = () => {
  const navigation = useNavigation<UserDirectoryScreenNavigationProp>();
  const [activeTab, setActiveTab] = useState<"vhts" | "vslas" | "retail">("vhts");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tabs = [
    { id: "vhts" as const, label: "VHTs", icon: "medical" as const },
    { id: "vslas" as const, label: "VSLAs", icon: "people" as const },
    { id: "retail" as const, label: "Retail Sellers", icon: "storefront-outline" as const },
  ];

  const fetchUsers = async (tabType: string) => {
    try {
      setError(null);
      let response;

      switch (tabType) {
        case "vhts":
          response = await apiService.getVHTs();
          break;
        case "vslas":
          response = await apiService.getVSLAs();
          break;
        case "retail":
          response = await apiService.getRetailSellers();
          break;
        default:
          return;
      }

      if (response.success) {
        setUsers(response.data);
      } else {
        setError("Failed to load users");
      }
    } catch (err) {
      console.error(`Error fetching ${tabType}:`, err);
      setError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchUsers(activeTab);
  }, [activeTab]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers(activeTab);
  };

  const handleUserPress = (user: any) => {
    navigation.navigate("UserDetailScreen", {
      userId: user.id,
      userType: activeTab,
    });
  };

  const renderTabContent = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading users...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchUsers(activeTab)}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (users.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="people" size={48} color="#9CA3AF" />
          <Text style={styles.emptyText}>No {tabs.find(t => t.id === activeTab)?.label} found</Text>
          <Text style={styles.emptySubText}>
            Check back later or contact support if this seems incorrect.
          </Text>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.usersList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {users.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            userType={activeTab}
            onPress={() => handleUserPress(user)}
          />
        ))}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E40AF" />
      <CHWHeader showMenu={false} />
      
      <View style={styles.content}>
        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                activeTab === tab.id && styles.activeTab,
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons
                name={tab.icon}
                size={20}
                color={activeTab === tab.id ? "white" : "#6B7280"}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.id && styles.activeTabText,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          <View style={styles.tabHeader}>
            <Text style={styles.tabTitle}>
              {tabs.find((t) => t.id === activeTab)?.label}
            </Text>
            <Text style={styles.userCount}>
              {users.length} {users.length === 1 ? "user" : "users"}
            </Text>
          </View>
          
          {renderTabContent()}
        </View>
      </View>
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
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 6,
  },
  activeTab: {
    backgroundColor: "#3B82F6",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  activeTabText: {
    color: "white",
  },
  tabContent: {
    flex: 1,
    marginHorizontal: 16,
    marginTop: 16,
  },
  tabHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  tabTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
  },
  userCount: {
    fontSize: 14,
    color: "#6B7280",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#6B7280",
  },
  emptySubText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },
  usersList: {
    flex: 1,
  },
  userCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: "row",
    flex: 1,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 2,
  },
  userLocation: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  statusContainer: {
    alignItems: "flex-end",
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
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 12,
    gap: 4,
  },
  registrationDate: {
    fontSize: 12,
    color: "#6B7280",
  },
  lastLogin: {
    fontSize: 12,
    color: "#9CA3AF",
  },
});

export default UserDirectoryScreen;
