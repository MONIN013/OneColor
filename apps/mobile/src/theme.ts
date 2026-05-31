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
    paddingBottom: 110,
  },
  header: {
    marginTop: 8,
    marginBottom: 22,
  },
  eyebrow: {
    color: colors.inkSubtle,
    fontFamily: fonts.sansBold,
    fontSize: 12,
  },
  h1: {
    color: colors.ink,
    fontFamily: fonts.serifHeavy,
    fontSize: 30,
    lineHeight: 38,
  },
  body: {
    maxWidth: 280,
    color: colors.inkSubtle,
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 25,
    marginTop: 8,
  },
});
