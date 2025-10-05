
import React from "react";
import { ScrollView, Pressable, StyleSheet, View, Text, Platform } from "react-native";
import { IconSymbol } from "@/components/IconSymbol";
import { Link, Stack } from "expo-router";
import { colors, spacing, borderRadius, shadows, typography, commonStyles } from "@/styles/commonStyles";
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function HomeScreen() {
  const menuOptions = [
    {
      title: "Register work day",
      description: "Log your daily work activities and track progress",
      route: "/register",
      icon: "calendar.badge.plus",
      gradient: [colors.primary, '#6366F1'],
      iconBg: colors.primaryLight,
    },
    {
      title: "Admin login",
      description: "Access administrative dashboard and settings",
      route: "/admin",
      icon: "person.badge.key.fill",
      gradient: [colors.secondary, '#059669'],
      iconBg: colors.secondaryLight,
    }
  ];

  const renderMenuOption = (item: typeof menuOptions[0], index: number) => (
    <Animated.View
      key={item.route}
      entering={FadeInDown.delay(index * 100).springify()}
    >
      <Link href={item.route as any} asChild>
        <Pressable style={({ pressed }) => [
          styles.optionCard,
          pressed && styles.optionCardPressed
        ]}>
          <LinearGradient
            colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
            style={styles.cardGradient}
          >
            <View style={styles.optionContent}>
              <View style={[styles.optionIconContainer, { backgroundColor: item.iconBg }]}>
                <IconSymbol name={item.icon as any} color={item.gradient[0]} size={32} />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={[commonStyles.heading4, styles.optionTitle]}>{item.title}</Text>
                <Text style={[commonStyles.caption, styles.optionDescription]}>{item.description}</Text>
              </View>
              <View style={styles.chevronContainer}>
                <View style={[styles.chevronBg, { backgroundColor: item.gradient[0] + '20' }]}>
                  <IconSymbol name="chevron.right" color={item.gradient[0]} size={20} />
                </View>
              </View>
            </View>
          </LinearGradient>
        </Pressable>
      </Link>
    </Animated.View>
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
          headerShown: false,
        }}
      />
      <LinearGradient
        colors={[colors.background, colors.backgroundSecondary]}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View 
            style={styles.header}
            entering={FadeInUp.springify()}
          >
            <View style={styles.headerIcon}>
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                style={styles.headerIconGradient}
              >
                <IconSymbol name="briefcase.fill" color="white" size={40} />
              </LinearGradient>
            </View>
            <Text style={[commonStyles.heading1, styles.welcomeTitle]}>Work Tracker</Text>
            <Text style={[commonStyles.body, styles.welcomeSubtitle]}>
              Streamline your workflow and boost productivity
            </Text>
          </Animated.View>
          
          <View style={styles.optionsContainer}>
            {menuOptions.map((item, index) => renderMenuOption(item, index))}
          </View>

          <Animated.View 
            style={styles.footer}
            entering={FadeInUp.delay(300).springify()}
          >
            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <View style={[styles.featureDot, { backgroundColor: colors.primary }]} />
                <Text style={[commonStyles.caption, styles.featureText]}>Track daily work hours</Text>
              </View>
              <View style={styles.featureItem}>
                <View style={[styles.featureDot, { backgroundColor: colors.secondary }]} />
                <Text style={[commonStyles.caption, styles.featureText]}>Manage staff and departments</Text>
              </View>
              <View style={styles.featureItem}>
                <View style={[styles.featureDot, { backgroundColor: colors.accent }]} />
                <Text style={[commonStyles.caption, styles.featureText]}>Generate detailed reports</Text>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  headerIcon: {
    marginBottom: spacing.lg,
  },
  headerIconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
  welcomeTitle: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  welcomeSubtitle: {
    textAlign: 'center',
    color: colors.textSecondary,
    maxWidth: 280,
  },
  optionsContainer: {
    gap: spacing.lg,
    marginBottom: spacing.xxl,
  },
  optionCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  cardGradient: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  optionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    marginBottom: spacing.xs,
  },
  optionDescription: {
    lineHeight: 20,
  },
  chevronContainer: {
    marginLeft: spacing.sm,
  },
  chevronBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    alignItems: 'center',
  },
  featureList: {
    gap: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  featureText: {
    color: colors.textSecondary,
  },
});
