import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Auth Screens
import RoleLoginScreen from "../screens/auth/RoleLoginScreen";
import RoleSelectionScreen from "../screens/auth/RoleSelectionScreen";
import OTPScreen from "../screens/auth/OTPScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";

// Registration Screens
import CHWRegistrationStep1 from "../screens/auth/CHWRegistrationStep1";
import CHWRegistrationStep2 from "../screens/auth/CHWRegistrationStep2";
import CHWRegistrationStep3 from "../screens/auth/CHWRegistrationStep3";
import CHWRegistrationStep4 from "../screens/auth/CHWRegistrationStep4";
import OutletRegistrationStep1 from "../screens/auth/OutletRegistrationStep1";
import OutletRegistrationStep2 from "../screens/auth/OutletRegistrationStep2";
import OutletRegistrationStep3 from "../screens/auth/OutletRegistrationStep3";
import OutletRegistrationStep4 from "../screens/auth/OutletRegistrationStep4";
import VSLARegistrationStep1 from "../screens/auth/VSLARegistrationStep1";
import VSLARegistrationStep2 from "../screens/auth/VSLARegistrationStep2";
import VSLARegistrationStep3 from "../screens/auth/VSLARegistrationStep3";
import VSLARegistrationStep4 from "../screens/auth/VSLARegistrationStep4";

// Dashboard Screens
import CHWDashboard from "../screens/chw/CHWDashboard";
import OutletDashboard from "../screens/outlet/OutletDashboard";
import VSLADashboardScreen from "../screens/dashboard/VSLADashboardScreen";

// Vision Screening Screens
import VisionScreeningStep1 from "../screens/screening/VisionScreeningStep1";
import VisionScreeningStep2 from "../screens/screening/VisionScreeningStep2";

// CHW Feature Screens
import MyClientsScreen from "../screens/chw/MyClientsScreen";
import InventoryScreen from "../screens/chw/InventoryScreen";
import InventoryDetailsScreen from "../screens/chw/InventoryDetailsScreen";
import SalesDetailsScreen from "../screens/chw/SalesDetailsScreen";
import ReferralsScreen from "../screens/chw/ReferralsScreen";
import ReferralManagementScreen from "../screens/chw/ReferralManagementScreen";
import CreateReferralScreen from "../screens/chw/CreateReferralScreen";
import PaymentsScreen from "../screens/chw/PaymentsScreen";
import ReportsScreen from "../screens/chw/ReportsScreen";
import StartScreeningScreen from "../screens/chw/StartScreeningScreen";
import SettingsScreen from "../screens/chw/SettingsScreen";
import EditProfileScreen from "../screens/chw/EditProfileScreen";
import NotificationSettingsScreen from "../screens/chw/NotificationSettingsScreen";
import AccessibilityScreen from "../screens/chw/AccessibilityScreen";
import ChangePasswordScreen from "../screens/chw/ChangePasswordScreen";
import UserDirectoryScreen from "../screens/chw/UserDirectoryScreen";
import UserDetailScreen from "../screens/chw/UserDetailScreen";

// NEW Vision Screening Flow (7 Steps)
import VisionScreen1 from "../screens/screening/VisionScreen1";
import VisionScreen2 from "../screens/screening/VisionScreen2";
import VisionScreen3 from "../screens/screening/VisionScreen3";
import VisionScreen4 from "../screens/screening/VisionScreen4";
import VisionScreen5 from "../screens/screening/VisionScreen5";
import VisionScreen6Wrapper from "../screens/screening/VisionScreen6Wrapper";
import ReadingGlassesSelection from "../screens/screening/ReadingGlassesSelection";
import ScreeningComplete from "../screens/screening/ScreeningComplete";
import ClientRegistration from "../screens/screening/ClientRegistration";

// VHT Screening Workflow (with embedded instructions)
import VHTScreeningStep1 from "../screens/screening/VHTScreeningStep1";
import VHTScreeningStep2 from "../screens/screening/VHTScreeningStep2";
import VHTScreeningStep3 from "../screens/screening/VHTScreeningStep3";
import VHTScreeningStep4 from "../screens/screening/VHTScreeningStep4";
import VHTScreeningStep5 from "../screens/screening/VHTScreeningStep5";
import VHTScreeningStep6 from "../screens/screening/VHTScreeningStep6";
import VHTReferralScreen from "../screens/screening/VHTReferralScreen";
import VHTNormalFindingsScreen from "../screens/screening/VHTNormalFindingsScreen";
import VHTReadingGlassesScreen from "../screens/screening/VHTReadingGlassesScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Define types for Screening Stack
export type ScreeningStackParamList = {
  VHTScreeningStep1: undefined;
  VHTScreeningStep2: undefined;
  VHTScreeningStep3: undefined;
  VHTScreeningStep4: undefined;
  VHTScreeningStep5: undefined;
  VHTScreeningStep6: undefined;
  VHTReferral: undefined;
  VHTNormalFindings: undefined;
  VHTReadingGlasses: undefined;
  VisionScreen1: undefined;
  VisionScreen2: undefined;
  VisionScreen3: undefined;
  VisionScreen4: undefined;
  VisionScreen5: undefined;
  VisionScreen6: undefined;
  ReadingGlassesSelection: undefined;
  ScreeningComplete: { glassesDispensed?: boolean; glassesPower?: string };
  ClientRegistration: undefined;
};

// Create a separate stack for NEW Screening Flow (within the Screen tab)
function ScreeningStack() {
  return (
    <Stack.Navigator
      initialRouteName="VHTScreeningStep1"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      {/* VHT Workflow - Steps 1-6 with embedded instructions */}
      <Stack.Screen name="VHTScreeningStep1" component={VHTScreeningStep1} />
      <Stack.Screen name="VHTScreeningStep2" component={VHTScreeningStep2} />
      <Stack.Screen name="VHTScreeningStep3" component={VHTScreeningStep3} />
      <Stack.Screen name="VHTScreeningStep4" component={VHTScreeningStep4} />
      <Stack.Screen name="VHTScreeningStep5" component={VHTScreeningStep5} />
      <Stack.Screen name="VHTScreeningStep6" component={VHTScreeningStep6} />
      <Stack.Screen name="VHTReferral" component={VHTReferralScreen} />
      <Stack.Screen name="VHTNormalFindings" component={VHTNormalFindingsScreen} />
      <Stack.Screen name="VHTReadingGlasses" component={VHTReadingGlassesScreen} />

      {/* Vision Tests */}
      <Stack.Screen name="VisionScreen1" component={VisionScreen1} />
      <Stack.Screen name="VisionScreen2" component={VisionScreen2} />
      <Stack.Screen name="VisionScreen3" component={VisionScreen3} />
      <Stack.Screen name="VisionScreen4" component={VisionScreen4} />
      <Stack.Screen name="VisionScreen5" component={VisionScreen5} />
      <Stack.Screen name="VisionScreen6" component={VisionScreen6Wrapper} />
      <Stack.Screen name="ReadingGlassesSelection" component={ReadingGlassesSelection} />
      <Stack.Screen name="ScreeningComplete" component={ScreeningComplete} />
      <Stack.Screen name="ClientRegistration" component={ClientRegistration} />
    </Stack.Navigator>
  );
}

// Create a stack for CHW Home tab with all feature screens
function CHWHomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="CHWDashboard" component={CHWDashboard} />
      <Stack.Screen name="MyClients" component={MyClientsScreen} />
      <Stack.Screen name="Inventory" component={InventoryScreen} />
      <Stack.Screen name="Referrals" component={ReferralsScreen} />
      <Stack.Screen name="ReferralManagement" component={ReferralManagementScreen} />
      <Stack.Screen name="Payments" component={PaymentsScreen} />
      <Stack.Screen name="UserDirectoryScreen" component={UserDirectoryScreen} />
      <Stack.Screen name="UserDetailScreen" component={UserDetailScreen} />
      <Stack.Screen name="Reports" component={ReportsScreen} />
      <Stack.Screen name="StartScreening" component={StartScreeningScreen} />
    </Stack.Navigator>
  );
}

// CHW Tab Navigator (Green theme #2E7D32)
function CHWTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.chwTabBar,
        tabBarActiveTintColor: "#2E7D32",
        tabBarInactiveTintColor: "#6B7280",
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="CHWHome"
        component={CHWHomeStack}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size}
              color={color}
            />
          ),
          tabBarLabel: "Home",
        }}
      />
      <Tab.Screen
        name="Screen"
        component={ScreeningStack}
        options={({ route }) => {
          const focusedRoute = getFocusedRouteNameFromRoute(route) ?? "VHTScreeningStep1";

          return {
            tabBarStyle: focusedRoute ? styles.hiddenTabBar : styles.chwTabBar,
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "eye" : "eye-outline"}
                size={size}
                color={color}
              />
            ),
            tabBarLabel: "Screen",
          };
        }}
      />
      <Tab.Screen
        name="Stock"
        component={InventoryScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "cube" : "cube-outline"}
              size={size}
              color={color}
            />
          ),
          tabBarLabel: "Stock",
        }}
      />
      <Tab.Screen
        name="Payments"
        component={PaymentsScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "cash" : "cash-outline"}
              size={size}
              color={color}
            />
          ),
          tabBarLabel: "Payments",
        }}
      />
      <Tab.Screen
        name="Referrals"
        component={ReferralsScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "people" : "people-outline"}
              size={size}
              color={color}
            />
          ),
          tabBarLabel: "Referrals",
        }}
      />
    </Tab.Navigator>
  );
}

// Outlet Tab Navigator (Blue theme #1565C0)
function OutletTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.outletTabBar,
        tabBarActiveTintColor: "#1565C0",
        tabBarInactiveTintColor: "#6B7280",
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="OutletHome"
        component={OutletDashboard}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size}
              color={color}
            />
          ),
          tabBarLabel: "Home",
        }}
      />
      <Tab.Screen
        name="Inventory"
        component={OutletDashboard}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "cube" : "cube-outline"}
              size={size}
              color={color}
            />
          ),
          tabBarLabel: "Inventory",
        }}
      />
      <Tab.Screen
        name="Sales"
        component={OutletDashboard}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "cash" : "cash-outline"}
              size={size}
              color={color}
            />
          ),
          tabBarLabel: "Sales",
        }}
      />
      <Tab.Screen
        name="Reports"
        component={OutletDashboard}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "bar-chart" : "bar-chart-outline"}
              size={size}
              color={color}
            />
          ),
          tabBarLabel: "Reports",
        }}
      />
      <Tab.Screen
        name="More"
        component={OutletDashboard}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={
                focused ? "ellipsis-horizontal" : "ellipsis-horizontal-outline"
              }
              size={size}
              color={color}
            />
          ),
          tabBarLabel: "More",
        }}
      />
    </Tab.Navigator>
  );
}

// VSLA Tab Navigator (Orange theme #FF9800)
function VSLATabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.vslaTabBar,
        tabBarActiveTintColor: "#FF9800",
        tabBarInactiveTintColor: "#6B7280",
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="VSLAHome"
        component={VSLADashboardScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size}
              color={color}
            />
          ),
          tabBarLabel: "Home",
        }}
      />
      <Tab.Screen
        name="Stock"
        component={VSLADashboardScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "cube" : "cube-outline"}
              size={size}
              color={color}
            />
          ),
          tabBarLabel: "Stock",
        }}
      />
      <Tab.Screen
        name="Payments"
        component={VSLADashboardScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "cash" : "cash-outline"}
              size={size}
              color={color}
            />
          ),
          tabBarLabel: "Payments",
        }}
      />
      <Tab.Screen
        name="Reports"
        component={VSLADashboardScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "bar-chart" : "bar-chart-outline"}
              size={size}
              color={color}
            />
          ),
          tabBarLabel: "Reports",
        }}
      />
      <Tab.Screen
        name="More"
        component={VSLADashboardScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={
                focused ? "ellipsis-horizontal" : "ellipsis-horizontal-outline"
              }
              size={size}
              color={color}
            />
          ),
          tabBarLabel: "More",
        }}
      />
    </Tab.Navigator>
  );
}

// AppTabs component - Shows the appropriate dashboard based on role
function AppTabs({ route }: any) {
  const role = route.params?.role || "CHW";

  return (
    <>
      {role === "CHW" && <CHWTabs />}
      {role === "Outlet" && <OutletTabs />}
      {role === "VSLA" && <VSLATabs />}
    </>
  );
}

// Main AppNavigator
export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      {/* Auth Screens */}
      <Stack.Screen name="Login" component={RoleLoginScreen} />
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      <Stack.Screen name="OTP" component={OTPScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />

      {/* Registration Screens */}
      <Stack.Screen
        name="CHWRegistrationStep1"
        component={CHWRegistrationStep1}
      />
      <Stack.Screen
        name="CHWRegistrationStep2"
        component={CHWRegistrationStep2}
      />
      <Stack.Screen
        name="CHWRegistrationStep3"
        component={CHWRegistrationStep3}
      />
      <Stack.Screen
        name="CHWRegistrationStep4"
        component={CHWRegistrationStep4}
      />

      <Stack.Screen
        name="OutletRegistrationStep1"
        component={OutletRegistrationStep1}
      />
      <Stack.Screen
        name="OutletRegistrationStep2"
        component={OutletRegistrationStep2}
      />
      <Stack.Screen
        name="OutletRegistrationStep3"
        component={OutletRegistrationStep3}
      />
      <Stack.Screen
        name="OutletRegistrationStep4"
        component={OutletRegistrationStep4}
      />

      <Stack.Screen
        name="VSLARegistrationStep1"
        component={VSLARegistrationStep1}
      />
      <Stack.Screen
        name="VSLARegistrationStep2"
        component={VSLARegistrationStep2}
      />
      <Stack.Screen
        name="VSLARegistrationStep3"
        component={VSLARegistrationStep3}
      />
      <Stack.Screen
        name="VSLARegistrationStep4"
        component={VSLARegistrationStep4}
      />

      {/* Main App Tabs - Different dashboards based on role */}
      <Stack.Screen
        name="AppTabs"
        component={AppTabs}
        options={{ headerShown: false }}
      />

      {/* CHW Feature Screens */}
      <Stack.Screen name="ReferralManagementScreen" component={ReferralManagementScreen} />
      <Stack.Screen name="CreateReferralScreen" component={CreateReferralScreen} />
      <Stack.Screen name="InventoryScreen" component={InventoryScreen} />
      <Stack.Screen name="InventoryDetailsScreen" component={InventoryDetailsScreen} />
      <Stack.Screen name="SalesDetailsScreen" component={SalesDetailsScreen} />
      <Stack.Screen name="PaymentsScreen" component={PaymentsScreen} />
      <Stack.Screen name="VHTScreeningStep1" component={VHTScreeningStep1} />
      <Stack.Screen name="VHTScreeningStep2" component={VHTScreeningStep2} />
      <Stack.Screen name="VHTScreeningStep3" component={VHTScreeningStep3} />
      <Stack.Screen name="VHTScreeningStep4" component={VHTScreeningStep4} />
      <Stack.Screen name="VHTScreeningStep5" component={VHTScreeningStep5} />
      <Stack.Screen name="VHTScreeningStep6" component={VHTScreeningStep6} />
      <Stack.Screen name="VHTReferral" component={VHTReferralScreen} />
      <Stack.Screen name="VHTNormalFindings" component={VHTNormalFindingsScreen} />
      <Stack.Screen name="VHTReadingGlasses" component={VHTReadingGlassesScreen} />
      <Stack.Screen name="VisionScreen1" component={VisionScreen1} />
      <Stack.Screen name="VisionScreen2" component={VisionScreen2} />
      <Stack.Screen name="VisionScreen3" component={VisionScreen3} />
      <Stack.Screen name="VisionScreen4" component={VisionScreen4} />
      <Stack.Screen name="VisionScreen5" component={VisionScreen5} />
      <Stack.Screen name="VisionScreen6" component={VisionScreen6Wrapper} />
      <Stack.Screen name="ReadingGlassesSelection" component={ReadingGlassesSelection} />
      <Stack.Screen name="ScreeningComplete" component={ScreeningComplete} />
      <Stack.Screen name="ClientRegistration" component={ClientRegistration} />

      {/* Old screens for backward compatibility */}
      <Stack.Screen
        name="VisionScreeningStep1"
        component={VisionScreeningStep1}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="VisionScreeningStep2"
        component={VisionScreeningStep2}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen name="Accessibility" component={AccessibilityScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  // CHW Tab Bar (Green theme)
  chwTabBar: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    height: 100,
    paddingBottom: 20,
    paddingTop: 8,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  hiddenTabBar: {
    display: "none",
  },
  // Outlet Tab Bar (Blue theme)
  outletTabBar: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  // VSLA Tab Bar (Orange theme)
  vslaTabBar: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabBarLabel: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: "500",
  },
});
