import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import RoleLoginScreen from "../screens/auth/RoleLoginScreen";
import OTPScreen from "../screens/auth/OTPScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import CHWDashboard from "../screens/chw/CHWDashboard";
import OutletDashboard from "../screens/outlet/OutletDashboard";
import VSLADashboard from "../screens/vsla/VSLADashboard";

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
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={RoleLoginScreen} />
      <Stack.Screen name="OTP" component={OTPScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="AppTabs" component={AppTabs} />
    </Stack.Navigator>
  );
}
