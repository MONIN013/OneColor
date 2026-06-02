import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { appStyles, colors } from "../theme";

type ScreenProps = {
  children: ReactNode;
  footer?: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
};

export function Screen({ children, footer, onRefresh, refreshing = false }: ScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={appStyles.root}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.shell}
      >
        <View style={styles.shell}>
          <ScrollView
            contentContainerStyle={[
              appStyles.scrollContent,
              footer ? styles.scrollContentWithFooter : null,
            ]}
            contentInsetAdjustmentBehavior="automatic"
            keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              onRefresh ? (
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              ) : undefined
            }
            style={styles.scroller}
          >
            <View style={styles.content}>{children}</View>
          </ScrollView>
          {footer ? (
            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 14) }]}>
              <View style={styles.content}>{footer}</View>
            </View>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
  scroller: {
    flex: 1,
  },
  scrollContentWithFooter: {
    paddingBottom: 24,
  },
  content: {
    width: "90%",
    maxWidth: 350,
    alignSelf: "center",
  },
  footer: {
    alignItems: "center",
    paddingTop: 12,
    backgroundColor: colors.paper,
  },
});
