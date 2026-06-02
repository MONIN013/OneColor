import { Tabs } from "expo-router";
import type { LucideIcon } from "lucide-react-native";
import type { ColorValue } from "react-native";
import { CalendarDays, CircleUserRound, Compass, Home } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { colors, fonts, radii, shadowSoft, surfaces } from "../../src/theme";

const renderTabIcon =
  (Icon: LucideIcon) =>
  ({ color, focused }: { color: ColorValue; focused: boolean; size: number }) => (
    <View style={[styles.iconShell, focused && styles.iconShellActive]}>
      <Icon color={focused ? colors.ink : color} size={20} strokeWidth={2.1} />
    </View>
  );

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
          fontSize: 10,
          lineHeight: 13,
          marginTop: 1,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        tabBarStyle: {
          position: "absolute",
          left: 14,
          right: 14,
          bottom: 10,
          minHeight: 74,
          paddingTop: 9,
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
          tabBarIcon: renderTabIcon(CalendarDays),
        }}
      />
      <Tabs.Screen
        name="day"
        options={{
          title: "今日",
          tabBarIcon: renderTabIcon(Home),
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          title: "みんな",
          tabBarIcon: renderTabIcon(Compass),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "私",
          tabBarIcon: renderTabIcon(CircleUserRound),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconShell: {
    width: 42,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
  },
  iconShellActive: {
    backgroundColor: surfaces.primaryWash,
    borderWidth: 1,
    borderColor: surfaces.hairline,
  },
});
