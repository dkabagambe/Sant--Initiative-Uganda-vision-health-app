import { NavigationContainer } from "@react-navigation/native";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./src/navigation/AppNavigator";
import { LanguageProvider } from "./src/context/LanguageContext";
import { ScreeningProvider } from "./src/context/ScreeningContext";

export default function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <ScreeningProvider>
          <PaperProvider>
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          </PaperProvider>
        </ScreeningProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
