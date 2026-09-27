// react-native-gesture-handler MUST be the very first import
// in the entry file. Without this, PanGestureHandler / GestureHandlerRootView
// (used in VisionScreen5) will crash the app before the first screen renders.
import "react-native-gesture-handler";

import { registerRootComponent } from "expo";
import App from "./App";

registerRootComponent(App);
