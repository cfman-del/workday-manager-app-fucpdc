
import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { Stack, router } from "expo-router";
import { IconSymbol } from "@/components/IconSymbol";
import { colors } from "@/styles/commonStyles";

export default function Overview() {
  // Mock data for demonstration
  const stats = {
    totalHours: 168,
    daysWorked: 21,
    averageHours: 8,
    currentStreak: 5,
  };

  const recentEntries = [
    { date: "2024-01-15", hours: 8, project: "Mobile App", description: "Implemented user authentication" },
    { date: "2024-01-14", hours: 7.5, project: "Web Dashboard", description: "Fixed responsive design issues" },
    { date: "2024-01-13", hours: 8.5, project: "Mobile App", description: "Added navigation and routing" },
  ];

  const StatCard = ({ title, value, icon, color }: { title: string; value: string | number; icon: string; color: string }) => (
    <View style={[styles.statCard, { backgroundColor: colors.card }]}>
      <View style={[styles.statIcon, { backgroundColor: color }]}>
        <IconSymbol name={icon as any} color="white" size={24} />
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statTitle, { color: colors.textSecondary }]}>{title}</Text>
    </View>
  );

  const EntryCard = ({ entry }: { entry: typeof recentEntries[0] }) => (
    <View style={[styles.entryCard, { backgroundColor: colors.card }]}>
      <View style={styles.entryHeader}>
        <Text style={[styles.entryDate, { color: colors.text }]}>{entry.date}</Text>
        <Text style={[styles.entryHours, { color: colors.primary }]}>{entry.hours}h</Text>
      </View>
      <Text style={[styles.entryProject, { color: colors.textSecondary }]}>{entry.project}</Text>
      <Text style={[styles.entryDescription, { color: colors.text }]}>{entry.description}</Text>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "Overview",
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <IconSymbol name="chevron.left" color={colors.text} size={24} />
            </Pressable>
          ),
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: colors.secondary }]}>
              <IconSymbol name="chart.bar.fill" color="white" size={32} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Work Overview</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Your work summary and statistics
            </Text>
          </View>

          <View style={styles.statsSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Statistics</Text>
            <View style={styles.statsGrid}>
              <StatCard
                title="Total Hours"
                value={stats.totalHours}
                icon="clock.fill"
                color={colors.primary}
              />
              <StatCard
                title="Days Worked"
                value={stats.daysWorked}
                icon="calendar.fill"
                color={colors.secondary}
              />
              <StatCard
                title="Avg Hours/Day"
                value={stats.averageHours}
                icon="chart.line.uptrend.xyaxis"
                color={colors.accent}
              />
              <StatCard
                title="Current Streak"
                value={`${stats.currentStreak} days`}
                icon="flame.fill"
                color={colors.highlight}
              />
            </View>
          </View>

          <View style={styles.entriesSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Entries</Text>
            <View style={styles.entriesList}>
              {recentEntries.map((entry, index) => (
                <EntryCard key={index} entry={entry} />
              ))}
            </View>
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
    padding: 20,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  statsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  entriesSection: {
    marginBottom: 32,
  },
  entriesList: {
    gap: 12,
  },
  entryCard: {
    borderRadius: 16,
    padding: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryDate: {
    fontSize: 16,
    fontWeight: '600',
  },
  entryHours: {
    fontSize: 16,
    fontWeight: '700',
  },
  entryProject: {
    fontSize: 14,
    marginBottom: 4,
  },
  entryDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
});
