import { Tabs } from "expo-router";
import { CalendarDays, CircleUserRound, Compass, Home } from "lucide-react-native";
import { colors, fonts, radii, shadowSoft, surfaces } from "../../src/theme";

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="calendar"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: "#9A8E80",
        tabBarLabelStyle: {
          fontFamily: fonts.sansBold,
          fontSize: 11,
        },
        tabBarStyle: {
          position: "absolute",
          left: 14,
          right: 14,
          bottom: 10,
          minHeight: 70,
          paddingTop: 8,
          paddingBottom: 10,
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: surfaces.lineStrong,
          borderRadius: radii.xl,
          backgroundColor: "rgba(255,253,248,0.94)",
          ...shadowSoft,
        },
      }}
    >
      <Tabs.Screen
        name="calendar"
        options={{
          title: "暦",
          tabBarIcon: ({ color, size }) => <CalendarDays color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="day"
        options={{
          title: "今日",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          title: "みんな",
          tabBarIcon: ({ color, size }) => <Compass color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "私",
          tabBarIcon: ({ color, size }) => <CircleUserRound color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
