import { DayRecordView } from "../../src/components/DayRecordView";
import { useAppState } from "../../src/state/AppState";

export default function DayScreen() {
  const { todayId } = useAppState();
  return <DayRecordView date={todayId} isToday />;
}
