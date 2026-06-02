import { router } from "expo-router";
import { PenLine } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppButton } from "../src/components/AppButton";
import { Screen } from "../src/components/Screen";
import { useAppState } from "../src/state/AppState";
import { colors, fonts, shadow } from "../src/theme";

export default function OnboardingScreen() {
  const { markOnboardingSeen } = useAppState();

  const start = async () => {
    await markOnboardingSeen();
    router.replace("/post");
  };

  const skip = async () => {
    await markOnboardingSeen();
    router.replace("/(tabs)/day");
  };

  return (
    <Screen>
      <View style={styles.brandLockup}>
        <Text style={styles.brandMark}>三語一色</Text>
        <Text style={styles.brandSub}>3 words, 1 color</Text>
      </View>

      <View accessibilityLabel="雨 改札 嘘 遠い青" style={styles.specimenHero}>
        <View style={styles.specimenStage}>
          <View style={[styles.paperSwatch, styles.swatchBlue]} />
          <View style={[styles.paperSwatch, styles.swatchOrange]} />
          <View style={[styles.paperSwatch, styles.swatchGreen]} />
        </View>
        <View style={styles.specimenCaption}>
          <Text
            adjustsFontSizeToFit
            minimumFontScale={0.76}
            numberOfLines={1}
            style={styles.specimenWords}
          >
            雨 / 改札 / 嘘
          </Text>
          <Text style={styles.specimenColor}>遠い青</Text>
        </View>
      </View>

      <View style={styles.titleBlock}>
        <Text maxFontSizeMultiplier={1.14} style={styles.title}>
          今日を、{"\n"}三つのことばと{"\n"}一つの色で。
        </Text>
      </View>

      <AppButton
        icon={<PenLine color={colors.paperElevated} size={18} />}
        onPress={start}
      >
        今日を残す
      </AppButton>
      <Pressable accessibilityRole="button" onPress={skip} style={styles.skipButton}>
        <Text style={styles.skip}>今日の記録を見る</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brandLockup: {
    gap: 2,
    marginTop: 12,
    marginBottom: 28,
  },
  brandMark: {
    color: colors.ink,
    fontFamily: fonts.serifHeavy,
    fontSize: 18,
  },
  brandSub: {
    color: colors.inkSubtle,
    fontFamily: fonts.sansBold,
    fontSize: 12,
  },
  specimenHero: {
    minHeight: 238,
    overflow: "hidden",
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 20,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 28,
    backgroundColor: colors.surfaceMuted,
    marginBottom: 34,
  },
  specimenStage: {
    height: 150,
    position: "relative",
    marginBottom: 12,
  },
  paperSwatch: {
    position: "absolute",
    borderRadius: 20,
    ...shadow,
  },
  swatchBlue: {
    top: 10,
    left: 4,
    width: 96,
    height: 112,
    backgroundColor: "#5F7E96",
  },
  swatchOrange: {
    top: 36,
    left: 84,
    width: 104,
    height: 110,
    backgroundColor: "#D69A5C",
  },
  swatchGreen: {
    top: 8,
    right: 2,
    width: 78,
    height: 94,
    backgroundColor: "#405650",
  },
  specimenCaption: {
    gap: 4,
    paddingRight: 18,
  },
  specimenWords: {
    color: colors.ink,
    fontFamily: fonts.serifHeavy,
    fontSize: 24,
    lineHeight: 32,
  },
  specimenColor: {
    color: colors.inkSubtle,
    fontFamily: fonts.sansBold,
    fontSize: 13,
    lineHeight: 20,
  },
  titleBlock: {
    marginBottom: 24,
  },
  title: {
    color: colors.ink,
    fontFamily: fonts.serifHeavy,
    fontSize: 30,
    lineHeight: 38,
  },
  skipButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  skip: {
    textAlign: "center",
    color: colors.primaryDark,
    fontFamily: fonts.sansBold,
    fontSize: 12,
  },
});
