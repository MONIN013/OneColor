import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import {
  NotoSansJP_400Regular,
  NotoSansJP_700Bold,
  NotoSansJP_900Black,
} from "@expo-google-fonts/noto-sans-jp";
import {
  NotoSerifJP_700Bold,
  NotoSerifJP_900Black,
} from "@expo-google-fonts/noto-serif-jp";
import { AppStateProvider } from "../src/state/AppState";
import { colors } from "../src/theme";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    NotoSansJP_400Regular,
    NotoSansJP_700Bold,
    NotoSansJP_900Black,
    NotoSerifJP_700Bold,
    NotoSerifJP_900Black,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AppStateProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.paperElevated },
        }}
      />
    </AppStateProvider>
  );
}
