import { NavigationContainer } from "@react-navigation/native";
import { PaperProvider } from "react-native-paper";
import AppNavigator from "./src/navigation/AppNavigator";
import { LanguageProvider } from "./src/context/LanguageContext";
import { ScreeningProvider } from "./src/context/ScreeningContext";

export default function App() {
  return (
    <LanguageProvider>
      <ScreeningProvider>
        <PaperProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </PaperProvider>
      </ScreeningProvider>
    </LanguageProvider>
  );
}
