import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { appStyles } from "../theme";

type ScreenProps = {
  children: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
};

export function Screen({ children, onRefresh, refreshing = false }: ScreenProps) {
  return (
    <SafeAreaView edges={["top", "left", "right"]} style={appStyles.root}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.shell}
      >
        <View style={styles.shell}>
          <ScrollView
            contentContainerStyle={appStyles.scrollContent}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              onRefresh ? (
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              ) : undefined
            }
          >
            <View style={styles.content}>{children}</View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
  content: {
    width: "90%",
    maxWidth: 350,
    marginRight: Platform.select({
      web: 20,
      default: 0,
    }),
  },
});
