import { Platform, StyleSheet } from "react-native";
import { semantic } from "@onecolor/shared";

export const colors = semantic;

export const fonts = {
  sans: "NotoSansJP_400Regular",
  sansBold: "NotoSansJP_700Bold",
  sansHeavy: "NotoSansJP_900Black",
  serifBold: "NotoSerifJP_700Bold",
  serifHeavy: "NotoSerifJP_900Black",
} as const;

export const shadow = Platform.select({
  ios: {
    shadowColor: "#48341C",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
  },
  android: {
    elevation: 4,
  },
  default: {
    shadowColor: "#48341C",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
  },
});

export const shadowSoft = Platform.select({
  ios: {
    shadowColor: "#5A4537",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
  },
  android: {
    elevation: 2,
  },
  default: {
    shadowColor: "#5A4537",
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
});

export const shadowLifted = Platform.select({
  ios: {
    shadowColor: "#48341C",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.18,
    shadowRadius: 30,
  },
  android: {
    elevation: 6,
  },
  default: {
    shadowColor: "#48341C",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.16,
    shadowRadius: 28,
  },
});

export const radii = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
  specimen: 34,
} as const;

export const surfaces = {
  card: "#FFFDF8",
  cardMuted: "rgba(255,253,248,0.78)",
  wash: "#F4EADC",
  lineStrong: "rgba(41,36,31,0.14)",
  hairline: "rgba(41,36,31,0.08)",
} as const;

export const appStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.paperElevated,
  },
  scrollContent: {
    alignItems: "center",
    paddingTop: 22,
    paddingBottom: 118,
  },
  header: {
    marginTop: 10,
    marginBottom: 24,
  },
  eyebrow: {
    color: colors.inkSubtle,
    fontFamily: fonts.sansBold,
    fontSize: 12,
    lineHeight: 18,
  },
  h1: {
    color: colors.ink,
    fontFamily: fonts.serifHeavy,
    fontSize: 32,
    lineHeight: 40,
  },
  body: {
    maxWidth: 300,
    color: colors.inkSubtle,
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 24,
    marginTop: 8,
  },
});
