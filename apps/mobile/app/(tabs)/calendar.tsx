import { router } from "expo-router";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react-native";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { formatWords } from "@onecolor/shared";
import { ErrorBanner } from "../../src/components/ErrorBanner";
import { Screen } from "../../src/components/Screen";
import { dateIdForDay, getMonthDays, getMonthLabel } from "../../src/lib/dates";
import { useAppState } from "../../src/state/AppState";
import { colors, fonts, radii, shadowLifted, shadowSoft, surfaces } from "../../src/theme";

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
  const { width } = useWindowDimensions();
  const { firstDayOffset, days } = getMonthDays(currentMonth);
  const gridGap = 4;
  const calendarWidth = Math.min(Math.max(width - 64, 240), 348);
  const cellSize = Math.floor((calendarWidth - gridGap * 6) / 7);
  const cellHitSlop = Math.max(0, (44 - cellSize) / 2);
  const visibleSelectedDate = selectedDate.startsWith(`${currentMonth}-`)
    ? selectedDate
    : `${currentMonth}-01`;
  const selectedEntry = getEntry(visibleSelectedDate);
  const { monthName, year } = getMonthLabel(currentMonth);
  const filledCount = days.reduce((count, day) => {
    const date = dateIdForDay(currentMonth, day);
    return getEntry(date) ? count + 1 : count;
  }, 0);
  const monthSamples = days
    .flatMap((day) => {
      const entry = getEntry(dateIdForDay(currentMonth, day));
      return entry ? [entry] : [];
    })
    .slice(0, 5);

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
          <Text style={styles.monthMeta}>{filledCount}日分の色標本</Text>
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

      <View style={styles.calendarPanel}>
        <View accessibilityElementsHidden style={styles.monthRail}>
          {monthSamples.length > 0 ? (
            monthSamples.map((entry, index) => (
              <View
                key={`${entry.date}-${index}`}
                style={[
                  styles.monthRailChip,
                  { backgroundColor: entry.colorHex },
                ]}
              />
            ))
          ) : (
            <View style={styles.monthRailEmpty} />
          )}
        </View>
        <View accessibilityElementsHidden style={styles.weekdayRow}>
          {weekdays.map((weekday) => (
            <Text key={weekday} style={styles.weekday}>
              {weekday}
            </Text>
          ))}
        </View>

        <View
          accessibilityLabel={`${monthName} ${year}`}
          style={[styles.calendarGrid, { columnGap: gridGap, rowGap: gridGap, width: calendarWidth }]}
        >
          {Array.from({ length: firstDayOffset }, (_, index) => (
            <View
              key={`blank-${index}`}
              style={[
                styles.calendarCell,
                { height: cellSize, width: cellSize },
                styles.blankCell,
              ]}
            />
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
                hitSlop={{
                  bottom: cellHitSlop,
                  left: cellHitSlop,
                  right: cellHitSlop,
                  top: cellHitSlop,
                }}
                key={date}
                onPress={() => openDay(date)}
                style={[
                  styles.calendarCell,
                  { height: cellSize, width: cellSize },
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

        <Pressable
          accessibilityRole="button"
          onPress={() => openDay(visibleSelectedDate)}
          style={styles.daySummary}
        >
          <View
            style={[
              styles.largeChip,
              selectedEntry
                ? { backgroundColor: selectedEntry.colorHex }
                : styles.emptyLargeChip,
            ]}
          />
          <View style={styles.summaryCopy}>
            <Text numberOfLines={1} style={styles.summarySmall}>
              {Number(visibleSelectedDate.slice(-2))}日
            </Text>
            <Text
              adjustsFontSizeToFit
              minimumFontScale={0.72}
              numberOfLines={1}
              style={styles.summaryWords}
            >
              {selectedEntry ? formatWords(selectedEntry.words) : "まだ記録なし"}
            </Text>
            <Text numberOfLines={1} style={styles.summarySmall}>
              {selectedEntry ? selectedEntry.colorName : "この日を残す"}
            </Text>
          </View>
          <ArrowRight color={colors.ink} size={18} />
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  calendarHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 16,
  },
  monthTitleWrap: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 10,
  },
  monthTitle: {
    color: colors.ink,
    fontFamily: fonts.serifHeavy,
    fontSize: 34,
    lineHeight: 42,
  },
  year: {
    color: colors.inkSubtle,
    fontFamily: fonts.sansBold,
    fontSize: 13,
  },
  monthMeta: {
    marginTop: 2,
    color: colors.inkSubtle,
    fontFamily: fonts.sansBold,
    fontSize: 12,
    lineHeight: 18,
  },
  monthNavButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: surfaces.lineStrong,
    borderRadius: radii.md,
    backgroundColor: surfaces.card,
    ...shadowSoft,
  },
  calendarPanel: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: surfaces.lineStrong,
    borderRadius: radii.xl,
    backgroundColor: surfaces.wash,
    ...shadowSoft,
  },
  monthRail: {
    alignSelf: "stretch",
    minHeight: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  monthRailChip: {
    width: 30,
    height: 30,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: "rgba(255,253,248,0.42)",
  },
  monthRailEmpty: {
    width: 30,
    height: 30,
    borderWidth: 1,
    borderColor: surfaces.hairline,
    borderRadius: radii.sm,
    backgroundColor: "rgba(255,253,248,0.54)",
  },
  weekdayRow: {
    flexDirection: "row",
    width: "100%",
    paddingHorizontal: 6,
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
    alignSelf: "center",
  },
  calendarCell: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: radii.sm,
  },
  blankCell: {
    borderColor: "transparent",
  },
  emptyCell: {
    borderColor: surfaces.hairline,
    backgroundColor: "rgba(255,253,248,0.68)",
  },
  filledCell: {
    borderColor: "transparent",
  },
  todayCell: {
    borderColor: colors.primaryDark,
  },
  selectedCell: {
    borderColor: colors.ink,
    borderWidth: 2,
  },
  dayNumber: {
    fontFamily: fonts.sansHeavy,
    fontSize: 12,
  },
  emptyDayNumber: {
    color: "#B9AC9E",
  },
  daySummary: {
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: surfaces.lineStrong,
    borderRadius: radii.xl,
    backgroundColor: surfaces.card,
    ...shadowLifted,
  },
  largeChip: {
    width: 64,
    height: 64,
    borderRadius: radii.md,
    flexShrink: 0,
  },
  emptyLargeChip: {
    borderWidth: 1,
    borderColor: surfaces.lineStrong,
    backgroundColor: colors.surfaceMuted,
  },
  summaryCopy: {
    flex: 1,
    minWidth: 0,
  },
  summarySmall: {
    color: colors.inkSubtle,
    fontFamily: fonts.sansBold,
    fontSize: 12,
    lineHeight: 18,
  },
  summaryWords: {
    color: colors.ink,
    fontFamily: fonts.serifHeavy,
    fontSize: 22,
    lineHeight: 30,
  },
});
