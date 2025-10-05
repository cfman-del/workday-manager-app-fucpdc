
import { IconSymbol } from '@/components/IconSymbol';
import { useTheme } from '@react-navigation/native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import React from 'react';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, usePathname } from 'expo-router';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { colors, spacing, borderRadius, shadows, commonStyles } from '@/styles/commonStyles';
import { LinearGradient } from 'expo-linear-gradient';

export interface TabBarItem {
  name: string;
  route: string;
  icon: string;
  label: string;
}

interface FloatingTabBarProps {
  tabs: TabBarItem[];
  containerWidth?: number;
  borderRadius?: number;
  bottomMargin?: number;
}

export default function FloatingTabBar({ 
  tabs, 
  containerWidth = Dimensions.get('window').width - 40,
  borderRadius: tabBorderRadius = 25,
  bottomMargin = 20 
}: FloatingTabBarProps) {
  const pathname = usePathname();
  const { colors: themeColors } = useTheme();
  const animatedValue = useSharedValue(0);
  const router = useRouter();

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: interpolate(
            animatedValue.value,
            [0, 1],
            [0, containerWidth / tabs.length]
          ),
        },
      ],
    };
  });

  const handleTabPress = (route: string) => {
    console.log(`Navigating to: ${route}`);
    router.push(route as any);
  };

  return (
    <SafeAreaView style={[styles.container, { marginBottom: bottomMargin }]}>
      <BlurView intensity={100} style={[styles.tabBar, { width: containerWidth, borderRadius: tabBorderRadius }]}>
        <LinearGradient
          colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
          style={[styles.tabBarGradient, { borderRadius: tabBorderRadius }]}
        >
          {tabs.map((tab, index) => {
            const isActive = pathname === tab.route || 
                           (tab.route === '/(tabs)/(home)' && pathname === '/') ||
                           (tab.route === '/(tabs)/profile' && pathname === '/profile');

            return (
              <TouchableOpacity
                key={tab.name}
                style={[
                  styles.tab,
                  isActive && [styles.activeTab, { backgroundColor: colors.primary }]
                ]}
                onPress={() => handleTabPress(tab.route)}
                activeOpacity={0.7}
              >
                <Animated.View style={styles.tabContent}>
                  <View style={[
                    styles.iconContainer,
                    isActive && { backgroundColor: 'rgba(255,255,255,0.2)' }
                  ]}>
                    <IconSymbol
                      name={tab.icon as any}
                      size={22}
                      color={isActive ? 'white' : colors.text}
                    />
                  </View>
                  <Text
                    style={[
                      commonStyles.captionMedium,
                      styles.tabLabel,
                      { color: isActive ? 'white' : colors.text }
                    ]}
                  >
                    {tab.label}
                  </Text>
                </Animated.View>
              </TouchableOpacity>
            );
          })}
        </LinearGradient>
      </BlurView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  tabBar: {
    flexDirection: 'row',
    overflow: 'hidden',
    ...shadows.xl,
  },
  tabBarGradient: {
    flexDirection: 'row',
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
    minHeight: 60,
  },
  activeTab: {
    ...shadows.sm,
  },
  tabContent: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
});
