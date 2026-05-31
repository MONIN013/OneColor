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
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
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
    return (
      <View style={styles.loading}>
        <ActivityIndicator accessibilityLabel="読み込み中" color={colors.ink} />
        <Text style={styles.loadingText}>読み込み中</Text>
      </View>
    );
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

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: colors.paperElevated,
  },
  loadingText: {
    color: colors.inkSubtle,
    fontSize: 13,
    fontWeight: "700",
  },
});
