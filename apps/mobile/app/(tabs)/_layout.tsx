import { Tabs } from "expo-router";
import { CalendarDays, CircleUserRound, Compass, Home } from "lucide-react-native";
import { colors, fonts } from "../../src/theme";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: "#9A8E80",
        tabBarLabelStyle: {
          fontFamily: fonts.sansBold,
          fontSize: 11,
        },
        tabBarStyle: {
          minHeight: 74,
          paddingTop: 8,
          paddingBottom: 12,
          borderTopWidth: 1,
          borderTopColor: colors.line,
          backgroundColor: "rgba(245,235,221,0.97)",
        },
      }}
    >
      <Tabs.Screen
        name="day"
        options={{
          title: "今日の記録",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "カレンダー",
          tabBarIcon: ({ color, size }) => <CalendarDays color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          title: "みんなの日",
          tabBarIcon: ({ color, size }) => <Compass color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "プロフィール",
          tabBarIcon: ({ color, size }) => <CircleUserRound color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
