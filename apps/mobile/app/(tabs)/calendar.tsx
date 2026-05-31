import { router } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { formatWords } from "@onecolor/shared";
import { ErrorBanner } from "../../src/components/ErrorBanner";
import { Screen } from "../../src/components/Screen";
import { dateIdForDay, getMonthDays, getMonthLabel } from "../../src/lib/dates";
import { useAppState } from "../../src/state/AppState";
import { colors, fonts, shadow } from "../../src/theme";

const weekdays = ["月", "火", "水", "木", "金", "土", "日"];

export default function CalendarScreen() {
  const {
    apiError,
    currentMonth,
    getEntry,
    refreshEntries,
    refreshing,
    selectedDate,
    setSelectedDate,
  } = useAppState();
  const { firstDayOffset, days } = getMonthDays(currentMonth);
  const selectedEntry = getEntry(selectedDate);
  const { monthName, year } = getMonthLabel(currentMonth);

  const openDay = (date: string) => {
    setSelectedDate(date);
    router.push("/(tabs)/day");
  };

  return (
    <Screen onRefresh={refreshEntries} refreshing={refreshing}>
      <ErrorBanner message={apiError} onRetry={refreshEntries} />
      <View style={styles.calendarHeading}>
        <Text style={styles.monthTitle}>
          {monthName} <Text style={styles.year}>{year}</Text>
        </Text>
        <View accessibilityLabel="表示切り替え" style={styles.monthToggle}>
          <Text style={styles.monthToggleActive}>月</Text>
          <Text style={styles.monthToggleText}>年</Text>
        </View>
      </View>

      <View accessibilityElementsHidden style={styles.weekdayRow}>
        {weekdays.map((weekday) => (
          <Text key={weekday} style={styles.weekday}>
            {weekday}
          </Text>
        ))}
      </View>

      <View accessibilityLabel={`${monthName} ${year}`} style={styles.calendarGrid}>
        {Array.from({ length: firstDayOffset }, (_, index) => (
          <View key={`blank-${index}`} style={[styles.calendarCell, styles.blankCell]} />
        ))}
        {days.map((day) => {
          const date = dateIdForDay(currentMonth, day);
          const entry = getEntry(date);
          const selected = selectedDate === date;
          return (
            <Pressable
              accessibilityLabel={
                entry
                  ? `${day}日 ${entry.colorName} ${formatWords(entry.words)}`
                  : `${day}日 空白`
              }
              accessibilityRole="button"
              key={date}
              onPress={() => setSelectedDate(date)}
              style={[
                styles.calendarCell,
                entry ? styles.filledCell : styles.emptyCell,
                entry ? { backgroundColor: entry.colorHex } : null,
                selected && styles.selectedCell,
              ]}
            >
              <Text
                style={[
                  styles.dayNumber,
                  entry ? { color: entry.textColor } : styles.emptyDayNumber,
                ]}
              >
                {day}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable accessibilityRole="button" onPress={() => openDay(selectedDate)} style={styles.daySummary}>
        <View
          style={[
            styles.largeChip,
            selectedEntry
              ? { backgroundColor: selectedEntry.colorHex }
              : styles.emptyLargeChip,
          ]}
        />
        <View style={styles.summaryCopy}>
          <Text style={styles.summarySmall}>{Number(selectedDate.slice(-2))}日</Text>
          <Text style={styles.summaryWords}>
            {selectedEntry ? formatWords(selectedEntry.words) : "まだ記録なし"}
          </Text>
          <Text style={styles.summarySmall}>
            {selectedEntry ? selectedEntry.colorName : "この日を残す"}
          </Text>
        </View>
        <ArrowRight color={colors.ink} size={18} />
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  calendarHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 18,
    marginBottom: 20,
  },
  monthTitle: {
    color: colors.ink,
    fontFamily: fonts.serifHeavy,
    fontSize: 30,
  },
  year: {
    color: colors.inkSubtle,
    fontFamily: fonts.sansBold,
    fontSize: 13,
  },
  monthToggle: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: 5,
    borderRadius: 999,
    backgroundColor: colors.surfaceMuted,
  },
  monthToggleText: {
    minWidth: 34,
    color: colors.inkSubtle,
    fontFamily: fonts.sansHeavy,
    fontSize: 12,
    lineHeight: 34,
    textAlign: "center",
  },
  monthToggleActive: {
    minWidth: 34,
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: "#FFFDF8",
    color: colors.ink,
    fontFamily: fonts.sansHeavy,
    fontSize: 12,
    lineHeight: 34,
    textAlign: "center",
  },
  weekdayRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 8,
  },
  weekday: {
    flex: 1,
    color: "#A99D8F",
    fontFamily: fonts.sansHeavy,
    fontSize: 11,
    textAlign: "center",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  calendarCell: {
    width: "13.4%",
    aspectRatio: 1,
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingTop: 8,
  },
  blankCell: {
    borderColor: "transparent",
  },
  emptyCell: {
    borderColor: colors.line,
    backgroundColor: "#FFFDF8",
  },
  filledCell: {
    borderColor: "transparent",
  },
  selectedCell: {
    borderColor: colors.ink,
  },
  dayNumber: {
    fontFamily: fonts.sansHeavy,
    fontSize: 12,
  },
  emptyDayNumber: {
    color: "#B9AC9E",
  },
  daySummary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 22,
    backgroundColor: "#FFFDF8",
    ...shadow,
  },
  largeChip: {
    width: 56,
    height: 56,
    borderRadius: 16,
  },
  emptyLargeChip: {
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surfaceMuted,
  },
  summaryCopy: {
    flex: 1,
  },
  summarySmall: {
    color: colors.inkSubtle,
    fontFamily: fonts.sansBold,
    fontSize: 12,
  },
  summaryWords: {
    color: colors.ink,
    fontFamily: fonts.serifHeavy,
    fontSize: 22,
    lineHeight: 30,
  },
});
