const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
const monthNames = [
  "一月",
  "二月",
  "三月",
  "四月",
  "五月",
  "六月",
  "七月",
  "八月",
  "九月",
  "十月",
  "十一月",
  "十二月",
];

export const toDateId = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getTodayId = () => toDateId(new Date());

export const getMonthId = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

export const getMonthLabel = (monthId: string) => {
  const [year, month] = monthId.split("-").map(Number);
  return {
    monthName: monthNames[month - 1] ?? `${month}月`,
    year,
  };
};

export const getDateTitle = (dateId: string) => {
  const date = new Date(`${dateId}T00:00:00`);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day} ${weekdays[date.getDay()]}`;
};

export const getMonthDays = (monthId: string) => {
  const [year, month] = monthId.split("-").map(Number);
  const first = new Date(year, month - 1, 1);
  const last = new Date(year, month, 0);
  const firstDayOffset = (first.getDay() + 6) % 7;

  return {
    firstDayOffset,
    days: Array.from({ length: last.getDate() }, (_, index) => index + 1),
  };
};

export const dateIdForDay = (monthId: string, day: number) =>
  `${monthId}-${String(day).padStart(2, "0")}`;
