
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from "react-native";
import { Stack, router } from "expo-router";
import { IconSymbol } from "@/components/IconSymbol";
import { colors } from "@/styles/commonStyles";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSecureEntry, setIsSecureEntry] = useState(true);

  const handleLogin = () => {
    if (!username || !password) {
      Alert.alert("Error", "Please enter both username and password");
      return;
    }
    
    console.log("Admin login attempt:", { username });
    
    // Updated authentication credentials
    if (username === "cfman@mudo.se" && password === "4218manMudo") {
      Alert.alert(
        "Success", 
        "Admin login successful!",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } else {
      Alert.alert("Error", "Invalid credentials. Please try again.");
    }
  };

  const togglePasswordVisibility = () => {
    setIsSecureEntry(!isSecureEntry);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Admin Login",
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
            <View style={[styles.iconContainer, { backgroundColor: colors.accent }]}>
              <IconSymbol name="person.badge.key.fill" color="white" size={32} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Admin Access</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Enter your administrator credentials
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Username</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
                placeholder="Enter admin username"
                placeholderTextColor={colors.textSecondary}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.passwordInput, { backgroundColor: colors.card, color: colors.text }]}
                  placeholder="Enter admin password"
                  placeholderTextColor={colors.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={isSecureEntry}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Pressable onPress={togglePasswordVisibility} style={styles.eyeButton}>
                  <IconSymbol 
                    name={isSecureEntry ? "eye.slash.fill" : "eye.fill"} 
                    color={colors.textSecondary} 
                    size={20} 
                  />
                </Pressable>
              </View>
            </View>

            <Pressable
              style={[styles.loginButton, { backgroundColor: colors.accent }]}
              onPress={handleLogin}
            >
              <Text style={styles.loginButtonText}>Login as Admin</Text>
            </Pressable>

            <View style={styles.helpSection}>
              <Text style={[styles.helpText, { color: colors.textSecondary }]}>
                Contact system administrator for credentials
              </Text>
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
    justifyContent: 'center',
    minHeight: '100%',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
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
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.secondary + '30',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    borderRadius: 12,
    padding: 16,
    paddingRight: 50,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.secondary + '30',
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 4,
  },
  loginButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  helpSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  helpText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
