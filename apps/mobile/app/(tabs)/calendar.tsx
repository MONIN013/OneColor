import { router } from "expo-router";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react-native";
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
    currentMonth,
    entriesStatus,
    getEntry,
    goToNextMonth,
    goToPreviousMonth,
    refreshEntries,
    selectedDate,
    setSelectedDate,
    todayId,
  } = useAppState();
  const { firstDayOffset, days } = getMonthDays(currentMonth);
  const visibleSelectedDate = selectedDate.startsWith(`${currentMonth}-`)
    ? selectedDate
    : `${currentMonth}-01`;
  const selectedEntry = getEntry(visibleSelectedDate);
  const { monthName, year } = getMonthLabel(currentMonth);

  const openDay = (date: string) => {
    setSelectedDate(date);
    router.push({
      pathname: "/day-detail/[date]",
      params: { date },
    });
  };

  return (
    <Screen onRefresh={refreshEntries} refreshing={entriesStatus.loading}>
      <ErrorBanner message={entriesStatus.error} onRetry={refreshEntries} />
      <View style={styles.calendarHeading}>
        <Pressable
          accessibilityLabel="前の月"
          accessibilityRole="button"
          onPress={goToPreviousMonth}
          style={styles.monthNavButton}
        >
          <ChevronLeft color={colors.ink} size={20} />
        </Pressable>
        <View accessibilityRole="header" style={styles.monthTitleWrap}>
          <Text style={styles.monthTitle}>
            {monthName} <Text style={styles.year}>{year}</Text>
          </Text>
        </View>
        <Pressable
          accessibilityLabel="次の月"
          accessibilityRole="button"
          onPress={goToNextMonth}
          style={styles.monthNavButton}
        >
          <ChevronRight color={colors.ink} size={20} />
        </Pressable>
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
          const selected = visibleSelectedDate === date;
          const isToday = todayId === date;
          const stateSuffix = [
            isToday ? "今日" : null,
            selected ? "選択中" : null,
            entry ? "記録あり" : "空白",
          ].filter(Boolean).join(" ");
          return (
            <Pressable
              accessibilityLabel={
                entry
                  ? `${day}日 ${stateSuffix} ${entry.colorName} ${formatWords(entry.words)}`
                  : `${day}日 ${stateSuffix}`
              }
              accessibilityRole="button"
              accessibilityState={{ selected }}
              key={date}
              onPress={() => openDay(date)}
              style={[
                styles.calendarCell,
                entry ? styles.filledCell : styles.emptyCell,
                entry ? { backgroundColor: entry.colorHex } : null,
                isToday && styles.todayCell,
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

      <Pressable accessibilityRole="button" onPress={() => openDay(visibleSelectedDate)} style={styles.daySummary}>
        <View
          style={[
            styles.largeChip,
            selectedEntry
              ? { backgroundColor: selectedEntry.colorHex }
              : styles.emptyLargeChip,
          ]}
        />
        <View style={styles.summaryCopy}>
          <Text style={styles.summarySmall}>{Number(visibleSelectedDate.slice(-2))}日</Text>
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
  monthTitleWrap: {
    flex: 1,
    alignItems: "center",
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
  monthNavButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 999,
    backgroundColor: "#FFFDF8",
  },
  weekdayRow: {
    flexDirection: "row",
    gap: 4,
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
    gap: 4,
  },
  calendarCell: {
    width: "13.85%",
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 12,
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
  todayCell: {
    borderColor: colors.primaryDark,
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
