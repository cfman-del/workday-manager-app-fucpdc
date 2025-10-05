
import React from "react";
import { ScrollView, Pressable, StyleSheet, View, Text, Platform } from "react-native";
import { IconSymbol } from "@/components/IconSymbol";
import { Link, Stack } from "expo-router";
import { colors } from "@/styles/commonStyles";

export default function HomeScreen() {
  const menuOptions = [
    {
      title: "Register work day",
      description: "Log your daily work activities",
      route: "/register",
      icon: "calendar.badge.plus",
      color: colors.primary,
    },
    {
      title: "Admin login",
      description: "Administrative access",
      route: "/admin",
      icon: "person.badge.key.fill",
      color: colors.accent,
    }
  ];

  const renderMenuOption = (item: typeof menuOptions[0], index: number) => (
    <Link href={item.route as any} asChild key={item.route}>
      <Pressable style={({ pressed }) => [
        styles.optionCard,
        { backgroundColor: colors.card },
        pressed && styles.optionCardPressed
      ]}>
        <View style={[styles.optionIcon, { backgroundColor: item.color }]}>
          <IconSymbol name={item.icon as any} color="white" size={28} />
        </View>
        <View style={styles.optionContent}>
          <Text style={[styles.optionTitle, { color: colors.text }]}>{item.title}</Text>
          <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>{item.description}</Text>
        </View>
        <View style={styles.chevronContainer}>
          <IconSymbol name="chevron.right" color={colors.textSecondary} size={20} />
        </View>
      </Pressable>
    </Link>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "Work Tracker",
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerShown: true,
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={[styles.welcomeTitle, { color: colors.text }]}>Welcome</Text>
            <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
              Choose an option to get started
            </Text>
          </View>
          
          <View style={styles.optionsContainer}>
            {menuOptions.map((item, index) => renderMenuOption(item, index))}
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 20,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 16,
    flex: 1,
    justifyContent: 'center',
  },
  optionCard: {
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
    minHeight: 80,
  },
  optionCardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  chevronContainer: {
    marginLeft: 8,
  },
});
