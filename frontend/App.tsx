import { NavigationContainer } from "@react-navigation/native";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AppNavigator from "./src/navigation/AppNavigator";
import { LanguageProvider } from "./src/context/LanguageContext";
import { ScreeningProvider } from "./src/context/ScreeningContext";
import AppBootstrap from "./src/AppBootstrap";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <LanguageProvider>
          <ScreeningProvider>
            <PaperProvider>
              {/* Initialises SQLite, sync listener, initial Neon pull */}
              <AppBootstrap>
                <NavigationContainer>
                  <AppNavigator />
                </NavigationContainer>
              </AppBootstrap>
            </PaperProvider>
          </ScreeningProvider>
        </LanguageProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
