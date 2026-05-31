import { Leaf } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { formatWords } from "@onecolor/shared";
import { Screen } from "../../src/components/Screen";
import { ScreenHeader } from "../../src/components/ScreenHeader";
import { useAppState } from "../../src/state/AppState";
import { colors, fonts, shadow } from "../../src/theme";

export default function ProfileScreen() {
  const { colors: palette, entries, getEntry, todayId } = useAppState();
  const entry = getEntry(todayId);

  return (
    <Screen>
      <ScreenHeader title="プロフィール" />

      <View style={styles.profileCard}>
        <View
          style={[
            styles.profileColor,
            entry
              ? { backgroundColor: entry.colorHex }
              : styles.emptyProfileColor,
          ]}
        >
          <Leaf color={entry?.textColor ?? colors.inkSubtle} size={24} />
          <Text
            style={[
              styles.profileColorName,
              { color: entry?.textColor ?? colors.inkSubtle },
            ]}
          >
            {entry?.colorName ?? "未記録"}
          </Text>
        </View>
        <View style={styles.profileCopy}>
          <Text style={styles.profileWords}>
            {entry ? formatWords(entry.words) : "まだ記録なし"}
          </Text>
          <Text style={styles.profileMeta}>
            {entry ? "今日の記録" : "今日の記録はまだありません"}
          </Text>
        </View>
      </View>

      <View style={styles.profileStats}>
        <Stat value={String(palette.length)} label="色" />
        <Stat value={String(entries.length)} label="記録" />
        <Stat value={String(entries.length * 3)} label="語" />
      </View>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 22,
    backgroundColor: "#FFFDF8",
    ...shadow,
  },
  profileColor: {
    width: 72,
    height: 88,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderRadius: 22,
  },
  emptyProfileColor: {
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surfaceMuted,
  },
  profileColorName: {
    fontFamily: fonts.sansHeavy,
    fontSize: 11,
    textAlign: "center",
  },
  profileCopy: {
    flex: 1,
  },
  profileWords: {
    color: colors.ink,
    fontFamily: fonts.serifHeavy,
    fontSize: 22,
    lineHeight: 30,
  },
  profileMeta: {
    color: colors.inkSubtle,
    fontFamily: fonts.sansBold,
    fontSize: 12,
  },
  profileStats: {
    flexDirection: "row",
    gap: 10,
    marginVertical: 18,
  },
  stat: {
    flex: 1,
    minHeight: 88,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    backgroundColor: "#FFFDF8",
  },
  statValue: {
    color: colors.ink,
    fontFamily: fonts.serifHeavy,
    fontSize: 22,
  },
  statLabel: {
    color: colors.inkSubtle,
    fontFamily: fonts.sansBold,
    fontSize: 12,
  },
});
