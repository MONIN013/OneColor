import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { colors, fonts } from "../theme";

type AppButtonProps = {
  busy?: boolean;
  children: ReactNode;
  disabled?: boolean;
  icon?: ReactNode;
  kind?: "primary" | "secondary";
  onPress: () => void;
  style?: ViewStyle;
};

export function AppButton({
  busy = false,
  children,
  disabled = false,
  icon,
  kind = "primary",
  onPress,
  style,
}: AppButtonProps) {
  const isPrimary = kind === "primary";
  const isDisabled = disabled || busy;
  const indicatorColor = isPrimary ? colors.paperElevated : colors.ink;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ busy, disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isPrimary ? styles.primary : styles.secondary,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {busy ? <ActivityIndicator color={indicatorColor} size="small" /> : icon}
      <Text
        adjustsFontSizeToFit
        minimumFontScale={0.82}
        numberOfLines={1}
        style={[styles.label, isPrimary ? styles.primaryLabel : styles.secondaryLabel]}
      >
        {children}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 22,
  },
  primary: {
    backgroundColor: colors.ink,
  },
  secondary: {
    backgroundColor: "rgba(255,253,248,0.74)",
    borderWidth: 1,
    borderColor: colors.line,
  },
  disabled: {
    backgroundColor: "#D6CCBD",
  },
  pressed: {
    opacity: 0.74,
  },
  label: {
    flexShrink: 1,
    fontFamily: fonts.sansHeavy,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  primaryLabel: {
    color: colors.paperElevated,
  },
  secondaryLabel: {
    color: colors.ink,
  },
});
