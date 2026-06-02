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

export const shadowPressed = Platform.select({
  ios: {
    shadowColor: "#48341C",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
  },
  android: {
    elevation: 1,
  },
  default: {
    shadowColor: "#48341C",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
});

export const radii = {
  sm: 10,
  md: 18,
  lg: 24,
  xl: 30,
  specimen: 36,
} as const;

export const surfaces = {
  card: "#FFFDF8",
  cardMuted: "rgba(255,253,248,0.76)",
  field: "#FFF7EE",
  wash: "#EFE3D3",
  washCool: "#E6EDE8",
  footer: "rgba(255,253,248,0.94)",
  primaryWash: "rgba(96,118,110,0.16)",
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
    paddingTop: 18,
    paddingBottom: 126,
  },
  header: {
    marginTop: 8,
    marginBottom: 22,
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
    fontSize: 31,
    lineHeight: 39,
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
