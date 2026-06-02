import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useAppState } from "../src/state/AppState";
import { colors, fonts } from "../src/theme";

export default function IndexRoute() {
  const { hasSeenOnboarding, ready } = useAppState();

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator accessibilityLabel="読み込み中" color={colors.ink} />
        <Text style={styles.loadingText}>読み込み中</Text>
      </View>
    );
  }

  return <Redirect href={hasSeenOnboarding ? "/(tabs)/calendar" : "/onboarding"} />;
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
    fontFamily: fonts.sansBold,
    fontSize: 13,
  },
});
