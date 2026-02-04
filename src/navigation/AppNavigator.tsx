import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import RoleLoginScreen from "../screens/auth/RoleLoginScreen";
import OTPScreen from "../screens/auth/OTPScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import CHWRegistrationStep1 from "../screens/auth/CHWRegistrationStep1";
import CHWRegistrationStep2 from "../screens/auth/CHWRegistrationStep2";
import CHWRegistrationStep3 from "../screens/auth/CHWRegistrationStep3";
import CHWRegistrationStep4 from "../screens/auth/CHWRegistrationStep4"; // Add this import
import CHWDashboard from "../screens/chw/CHWDashboard";
import OutletDashboard from "../screens/outlet/OutletDashboard";
import VSLADashboard from "../screens/vsla/VSLADashboard";
import OutletRegistrationStep1 from "../screens/auth/OutletRegistrationStep1";
import OutletRegistrationStep2 from "../screens/auth/OutletRegistrationStep2";
import OutletRegistrationStep3 from "../screens/auth/OutletRegistrationStep3";
import OutletRegistrationStep4 from "../screens/auth/OutletRegistrationStep4";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AppTabs({ route }: any) {
  const role = route.params?.role;

  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      {role === "CHW" && <Tab.Screen name="CHWHome" component={CHWDashboard} />}
      {role === "Outlet" && (
        <Tab.Screen name="OutletHome" component={OutletDashboard} />
      )}
      {role === "VSLA" && (
        <Tab.Screen name="VSLAHome" component={VSLADashboard} />
      )}
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="Login" component={RoleLoginScreen} />
      <Stack.Screen name="OTP" component={OTPScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
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
      <Stack.Screen name="AppTabs" component={AppTabs} />

      <Stack.Screen
        name="OutletRegistrationStep1"
        component={OutletRegistrationStep1}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OutletRegistrationStep2"
        component={OutletRegistrationStep2}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OutletRegistrationStep3"
        component={OutletRegistrationStep3}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OutletRegistrationStep4"
        component={OutletRegistrationStep4}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
