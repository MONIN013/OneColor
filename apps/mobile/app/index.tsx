import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useAppState } from "../src/state/AppState";
import { colors } from "../src/theme";

export default function IndexRoute() {
  const { hasSeenOnboarding, ready } = useAppState();

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.ink} />
      </View>
    );
  }

  return (
    <Redirect href={hasSeenOnboarding ? "/(tabs)/day" : "/onboarding"} />
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.paperElevated,
  },
});
