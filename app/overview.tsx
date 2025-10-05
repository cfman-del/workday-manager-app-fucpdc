
import React, { useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { Stack, router } from "expo-router";
import { IconSymbol } from "@/components/IconSymbol";
import { colors } from "@/styles/commonStyles";

export default function Overview() {
  useEffect(() => {
    // Redirect to admin page since the work overview is now implemented there
    router.replace('/admin');
  }, []);



  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.redirectContainer}>
        <View style={[styles.iconContainer, { backgroundColor: colors.secondary }]}>
          <IconSymbol name="chart.bar.fill" color="white" size={32} />
        </View>
        <Text style={[styles.redirectText, { color: colors.text }]}>
          Redirecting to Work Overview...
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  redirectContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  redirectText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});
