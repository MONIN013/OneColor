import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { colors, fonts } from "../theme";

type AppButtonProps = {
  children: ReactNode;
  disabled?: boolean;
  icon?: ReactNode;
  kind?: "primary" | "secondary";
  onPress: () => void;
  style?: ViewStyle;
};

export function AppButton({
  children,
  disabled = false,
  icon,
  kind = "primary",
  onPress,
  style,
}: AppButtonProps) {
  const isPrimary = kind === "primary";
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isPrimary ? styles.primary : styles.secondary,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {icon}
      <Text style={[styles.label, isPrimary ? styles.primaryLabel : styles.secondaryLabel]}>
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
    fontFamily: fonts.sansHeavy,
    fontSize: 14,
  },
  primaryLabel: {
    color: colors.paperElevated,
  },
  secondaryLabel: {
    color: colors.ink,
  },
});
