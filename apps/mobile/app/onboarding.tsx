import { router } from "expo-router";
import { PenLine } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { generateDayPalette } from "@onecolor/shared";
import { AppButton } from "../src/components/AppButton";
import { DecorativeSwatches } from "../src/components/DecorativeSwatches";
import { Screen } from "../src/components/Screen";
import { useAppState } from "../src/state/AppState";
import { colors, fonts, radii, shadowLifted, surfaces } from "../src/theme";

const specimenWords = ["雨", "改札", "嘘"] as [string, string, string];
const specimenColor = generateDayPalette({
  date: "2026-06-02",
  words: specimenWords,
})[0]!;

export default function OnboardingScreen() {
  const { markOnboardingSeen } = useAppState();

  const start = async () => {
    await markOnboardingSeen();
    router.replace("/post");
  };

  const skip = async () => {
    await markOnboardingSeen();
    router.replace("/(tabs)/calendar");
  };

  return (
    <Screen>
      <View style={styles.brandLockup}>
        <Text style={styles.brandMark}>三語一色</Text>
        <Text style={styles.brandSub}>3 words, 1 color</Text>
      </View>

      <View accessibilityLabel={`雨 改札 嘘 ${specimenColor.label}`} style={styles.specimenHero}>
        <View style={styles.specimenStage}>
          <DecorativeSwatches size={88} style={styles.specimenSwatches} />
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
          <Text numberOfLines={1} style={styles.specimenColor}>
            {specimenColor.label}
          </Text>
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
    borderColor: surfaces.lineStrong,
    borderRadius: radii.xl,
    backgroundColor: surfaces.wash,
    marginBottom: 34,
    ...shadowLifted,
  },
  specimenStage: {
    height: 132,
    justifyContent: "center",
    marginBottom: 12,
  },
  specimenSwatches: {
    alignSelf: "center",
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
