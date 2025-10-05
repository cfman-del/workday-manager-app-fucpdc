
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, FlatList } from "react-native";
import { Stack, router } from "expo-router";
import { IconSymbol } from "@/components/IconSymbol";
import { colors } from "@/styles/commonStyles";

// Mock staff data - this would come from your backend/database in a real app
const mockStaffData = [
  {
    id: '1',
    name: 'John Anderson',
    position: 'Senior Developer',
    department: 'Engineering',
    email: 'john.anderson@company.com',
    phone: '+1 (555) 123-4567',
    status: 'active',
    joinDate: '2022-03-15',
    avatar: 'person.circle.fill'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    position: 'Project Manager',
    department: 'Operations',
    email: 'sarah.johnson@company.com',
    phone: '+1 (555) 234-5678',
    status: 'active',
    joinDate: '2021-08-22',
    avatar: 'person.circle.fill'
  },
  {
    id: '3',
    name: 'Michael Chen',
    position: 'UX Designer',
    department: 'Design',
    email: 'michael.chen@company.com',
    phone: '+1 (555) 345-6789',
    status: 'active',
    joinDate: '2023-01-10',
    avatar: 'person.circle.fill'
  },
  {
    id: '4',
    name: 'Emily Rodriguez',
    position: 'Marketing Specialist',
    department: 'Marketing',
    email: 'emily.rodriguez@company.com',
    phone: '+1 (555) 456-7890',
    status: 'active',
    joinDate: '2022-11-05',
    avatar: 'person.circle.fill'
  },
  {
    id: '5',
    name: 'David Wilson',
    position: 'Sales Representative',
    department: 'Sales',
    email: 'david.wilson@company.com',
    phone: '+1 (555) 567-8901',
    status: 'inactive',
    joinDate: '2020-06-18',
    avatar: 'person.circle.fill'
  },
  {
    id: '6',
    name: 'Lisa Thompson',
    position: 'HR Manager',
    department: 'Human Resources',
    email: 'lisa.thompson@company.com',
    phone: '+1 (555) 678-9012',
    status: 'active',
    joinDate: '2019-04-12',
    avatar: 'person.circle.fill'
  }
];

export default function AdminDashboard() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSecureEntry, setIsSecureEntry] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogin = () => {
    if (!username || !password) {
      Alert.alert("Error", "Please enter both username and password");
      return;
    }
    
    console.log("Admin login attempt:", { username });
    
    // Updated authentication credentials
    if (username === "cfman@mudo.se" && password === "4218manMudo") {
      console.log("Admin login successful");
      setIsLoggedIn(true);
    } else {
      Alert.alert("Error", "Invalid credentials. Please try again.");
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive",
          onPress: () => {
            setIsLoggedIn(false);
            setUsername("");
            setPassword("");
            console.log("Admin logged out");
          }
        }
      ]
    );
  };

  const togglePasswordVisibility = () => {
    setIsSecureEntry(!isSecureEntry);
  };

  const filteredStaff = mockStaffData.filter(staff =>
    staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    staff.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
    staff.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    return status === 'active' ? colors.primary : colors.textSecondary;
  };

  const renderStaffCard = ({ item }: { item: typeof mockStaffData[0] }) => (
    <View style={[styles.staffCard, { backgroundColor: colors.card }]}>
      <View style={styles.staffHeader}>
        <View style={[styles.avatarContainer, { backgroundColor: colors.secondary + '20' }]}>
          <IconSymbol name={item.avatar} color={colors.primary} size={32} />
        </View>
        <View style={styles.staffInfo}>
          <Text style={[styles.staffName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.staffPosition, { color: colors.textSecondary }]}>{item.position}</Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.staffDetails}>
        <View style={styles.detailRow}>
          <IconSymbol name="building.2.fill" color={colors.textSecondary} size={16} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>{item.department}</Text>
        </View>
        <View style={styles.detailRow}>
          <IconSymbol name="envelope.fill" color={colors.textSecondary} size={16} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>{item.email}</Text>
        </View>
        <View style={styles.detailRow}>
          <IconSymbol name="phone.fill" color={colors.textSecondary} size={16} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>{item.phone}</Text>
        </View>
        <View style={styles.detailRow}>
          <IconSymbol name="calendar" color={colors.textSecondary} size={16} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>
            Joined: {new Date(item.joinDate).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderDashboardStats = () => (
    <View style={styles.statsContainer}>
      <View style={[styles.statCard, { backgroundColor: colors.card }]}>
        <IconSymbol name="person.3.fill" color={colors.primary} size={24} />
        <Text style={[styles.statNumber, { color: colors.text }]}>{mockStaffData.length}</Text>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Staff</Text>
      </View>
      
      <View style={[styles.statCard, { backgroundColor: colors.card }]}>
        <IconSymbol name="checkmark.circle.fill" color={colors.primary} size={24} />
        <Text style={[styles.statNumber, { color: colors.text }]}>
          {mockStaffData.filter(s => s.status === 'active').length}
        </Text>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Active</Text>
      </View>
      
      <View style={[styles.statCard, { backgroundColor: colors.card }]}>
        <IconSymbol name="building.2.fill" color={colors.primary} size={24} />
        <Text style={[styles.statNumber, { color: colors.text }]}>
          {new Set(mockStaffData.map(s => s.department)).size}
        </Text>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Departments</Text>
      </View>
    </View>
  );

  if (!isLoggedIn) {
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

  return (
    <>
      <Stack.Screen
        options={{
          title: "Admin Dashboard",
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <IconSymbol name="chevron.left" color={colors.text} size={24} />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={handleLogout} style={styles.logoutButton}>
              <IconSymbol name="power" color={colors.accent} size={24} />
            </Pressable>
          ),
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView style={styles.dashboardContainer}>
          <View style={styles.dashboardHeader}>
            <Text style={[styles.dashboardTitle, { color: colors.text }]}>Staff Dashboard</Text>
            <Text style={[styles.dashboardSubtitle, { color: colors.textSecondary }]}>
              Manage and view all staff members
            </Text>
          </View>

          {renderDashboardStats()}

          <View style={styles.searchSection}>
            <View style={styles.searchContainer}>
              <IconSymbol name="magnifyingglass" color={colors.textSecondary} size={20} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search staff by name, position, or department..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          <View style={styles.staffSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              All Staff ({filteredStaff.length})
            </Text>
            
            <FlatList
              data={filteredStaff}
              renderItem={renderStaffCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.staffList}
            />
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
  dashboardContainer: {
    flex: 1,
    padding: 20,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  logoutButton: {
    padding: 8,
    marginRight: -8,
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
  dashboardHeader: {
    marginBottom: 24,
  },
  dashboardTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  dashboardSubtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.secondary + '20',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  searchSection: {
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.secondary + '20',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  staffSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  staffList: {
    gap: 16,
  },
  staffCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.secondary + '20',
  },
  staffHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  staffPosition: {
    fontSize: 14,
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  staffDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailText: {
    fontSize: 14,
    flex: 1,
  },
});
