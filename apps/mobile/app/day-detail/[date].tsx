import { useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { DayRecordView } from "../../src/components/DayRecordView";
import { useAppState } from "../../src/state/AppState";

const dateIdPattern = /^\d{4}-\d{2}-\d{2}$/;

export default function DayDetailScreen() {
  const { date } = useLocalSearchParams<{ date?: string }>();
  const { setSelectedDate, todayId } = useAppState();
  const detailDate = typeof date === "string" && dateIdPattern.test(date) ? date : todayId;

  useEffect(() => {
    setSelectedDate(detailDate);
  }, [detailDate, setSelectedDate]);

  return <DayRecordView date={detailDate} />;
}
