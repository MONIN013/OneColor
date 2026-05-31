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

  return (
    <Screen>
      <View style={styles.brandLockup}>
        <Text style={styles.brandMark}>三語一色</Text>
        <Text style={styles.brandSub}>3 words, 1 color</Text>
      </View>

      <View accessibilityLabel="雨 改札 嘘 遠い青" style={styles.specimenHero}>
        <View style={[styles.paperSwatch, styles.swatchBlue]} />
        <View style={[styles.paperSwatch, styles.swatchOrange]} />
        <View style={[styles.paperSwatch, styles.swatchGreen]} />
        <View style={styles.specimenCaption}>
          <Text style={styles.specimenWords}>雨 / 改札 / 嘘</Text>
          <Text style={styles.specimenColor}>遠い青</Text>
        </View>
      </View>

      <View style={styles.titleBlock}>
        <Text style={styles.title}>今日を、{"\n"}三つのことばと{"\n"}一つの色で。</Text>
      </View>

      <AppButton
        icon={<PenLine color={colors.paperElevated} size={18} />}
        onPress={start}
      >
        今日を残す
      </AppButton>
      <Pressable accessibilityRole="button" onPress={() => router.replace("/(tabs)/day")}>
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
    minHeight: 206,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 28,
    backgroundColor: colors.surfaceMuted,
    marginBottom: 34,
  },
  paperSwatch: {
    position: "absolute",
    borderRadius: 20,
    ...shadow,
  },
  swatchBlue: {
    top: 20,
    left: 24,
    width: 86,
    height: 92,
    backgroundColor: "#5F7E96",
  },
  swatchOrange: {
    top: 36,
    left: 86,
    width: 86,
    height: 88,
    backgroundColor: "#D69A5C",
  },
  swatchGreen: {
    top: 20,
    right: 24,
    width: 62,
    height: 76,
    backgroundColor: "#405650",
  },
  specimenCaption: {
    position: "absolute",
    left: 28,
    bottom: 20,
    gap: 4,
  },
  specimenWords: {
    color: colors.ink,
    fontFamily: fonts.serifHeavy,
    fontSize: 22,
    lineHeight: 30,
  },
  specimenColor: {
    color: colors.inkSubtle,
    fontFamily: fonts.sansBold,
    fontSize: 12,
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
  skip: {
    marginTop: 18,
    textAlign: "center",
    color: colors.primaryDark,
    fontFamily: fonts.sansBold,
    fontSize: 12,
  },
});
