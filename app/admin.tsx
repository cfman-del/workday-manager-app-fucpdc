
import { supabase } from "@/app/integrations/supabase/client";
import { Tables, TablesInsert } from "@/app/integrations/supabase/types";
import { Stack, router } from "expo-router";
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, FlatList, Modal } from "react-native";
import { IconSymbol } from "@/components/IconSymbol";
import { colors } from "@/styles/commonStyles";
import FloatingTabBar, { TabBarItem } from "@/components/FloatingTabBar";
import React, { useState, useEffect } from "react";

type Staff = Tables<"staff">;
type Department = Tables<"departments">;

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  
  // Modal states
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showEditStaffModal, setShowEditStaffModal] = useState(false);
  const [showAddDepartmentModal, setShowAddDepartmentModal] = useState(false);
  const [showEditDepartmentModal, setShowEditDepartmentModal] = useState(false);
  
  // Form states
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffDepartment, setNewStaffDepartment] = useState("");
  const [newStaffStatus, setNewStaffStatus] = useState("active");
  
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [editStaffName, setEditStaffName] = useState("");
  const [editStaffStatus, setEditStaffStatus] = useState("");
  
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [newDepartmentDescription, setNewDepartmentDescription] = useState("");
  
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [editDepartmentName, setEditDepartmentName] = useState("");
  const [editDepartmentDescription, setEditDepartmentDescription] = useState("");

  // Tab configuration
  const tabs: TabBarItem[] = [
    {
      name: "dashboard",
      route: "/admin",
      icon: "square.grid.2x2.fill",
      label: "Dashboard"
    },
    {
      name: "overview",
      route: "/admin",
      icon: "chart.bar.fill",
      label: "Overview"
    }
  ];

  // Work overview state
  const [workEntries, setWorkEntries] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [staffWorkHours, setStaffWorkHours] = useState<{[key: string]: number}>({});
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  // Generate months for picker
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn && workEntries.length > 0) {
      calculateStaffWorkHours(workEntries, selectedMonth, selectedYear);
    }
  }, [selectedMonth, selectedYear, workEntries, isLoggedIn]);

  const fetchData = async () => {
    try {
      const [staffResponse, departmentsResponse, workEntriesResponse] = await Promise.all([
        supabase.from("staff").select("*"),
        supabase.from("departments").select("*"),
        supabase.from("work_entries").select(`
          *,
          staff:staff_id (
            id,
            name,
            email
          )
        `)
      ]);

      if (staffResponse.error) throw staffResponse.error;
      if (departmentsResponse.error) throw departmentsResponse.error;
      if (workEntriesResponse.error) throw workEntriesResponse.error;

      setStaffList(staffResponse.data || []);
      setDepartments(departmentsResponse.data || []);
      setWorkEntries(workEntriesResponse.data || []);
      
      // Calculate staff work hours for selected month
      calculateStaffWorkHours(workEntriesResponse.data || [], selectedMonth, selectedYear);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const calculateStaffWorkHours = (entries: any[], month: number, year: number) => {
    const currentYear = new Date().getFullYear();
    
    // Only process data for the current year
    if (year !== currentYear) {
      setStaffWorkHours({});
      return;
    }

    const staffHours: {[key: string]: number} = {};
    
    entries.forEach(entry => {
      const entryDate = new Date(entry.date);
      if (entryDate.getMonth() === month && entryDate.getFullYear() === year) {
        const staffId = entry.staff_id;
        const staffName = entry.staff?.name || 'Unknown Staff';
        const key = `${staffId}-${staffName}`;
        
        if (!staffHours[key]) {
          staffHours[key] = 0;
        }
        staffHours[key] += parseFloat(entry.hours) || 0;
      }
    });
    
    setStaffWorkHours(staffHours);
  };

  const fetchWorkEntriesForMonth = async (month: number, year: number) => {
    try {
      const startDate = new Date(year, month, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from("work_entries")
        .select(`
          *,
          staff:staff_id (
            id,
            name,
            email
          )
        `)
        .gte('date', startDate)
        .lte('date', endDate);

      if (error) throw error;
      
      setWorkEntries(data || []);
      calculateStaffWorkHours(data || [], month, year);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleLogin = () => {
    if (username === "cfman@mudo.se" && password === "4218manMudo") {
      setIsLoggedIn(true);
      Alert.alert("Success", "Welcome to the admin dashboard!");
    } else {
      Alert.alert("Error", "Invalid credentials");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername("");
    setPassword("");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const addStaff = async () => {
    if (!newStaffName || !newStaffEmail || !newStaffDepartment) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("staff")
        .insert([
          {
            name: newStaffName,
            email: newStaffEmail,
            department: newStaffDepartment,
            status: newStaffStatus,
          },
        ])
        .select();

      if (error) throw error;

      setStaffList((prev) => [...prev, ...(data || [])]);
      setShowAddStaffModal(false);
      setNewStaffName("");
      setNewStaffEmail("");
      setNewStaffDepartment("");
      setNewStaffStatus("active");
      Alert.alert("Success", "Staff member added successfully!");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const editStaff = async () => {
    if (!editingStaff || !editStaffName) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("staff")
        .update({
          name: editStaffName,
          status: editStaffStatus,
        })
        .eq("id", editingStaff.id)
        .select();

      if (error) throw error;

      setStaffList((prev) =>
        prev.map((staff) =>
          staff.id === editingStaff.id ? (data?.[0] || staff) : staff
        )
      );
      setShowEditStaffModal(false);
      setEditingStaff(null);
      Alert.alert("Success", "Staff member updated successfully!");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const openEditStaffModal = (staffMember: Staff) => {
    setEditingStaff(staffMember);
    setEditStaffName(staffMember.name || "");
    setEditStaffStatus(staffMember.status || "active");
    setShowEditStaffModal(true);
  };

  const removeStaff = async (staffId: string, staffName: string) => {
    Alert.alert(
      "Remove Staff",
      `Are you sure you want to remove ${staffName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "OK",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("staff")
                .delete()
                .eq("id", staffId);

              if (error) throw error;

              setStaffList((prev) => prev.filter((staff) => staff.id !== staffId));
              Alert.alert("Success", "Staff member removed successfully!");
            } catch (error: any) {
              Alert.alert("Error", error.message);
            }
          },
        },
      ]
    );
  };

  const addDepartment = async () => {
    if (!newDepartmentName) {
      Alert.alert("Error", "Please enter a department name");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("departments")
        .insert([
          {
            name: newDepartmentName,
            description: newDepartmentDescription,
          },
        ])
        .select();

      if (error) throw error;

      setDepartments((prev) => [...prev, ...(data || [])]);
      setShowAddDepartmentModal(false);
      setNewDepartmentName("");
      setNewDepartmentDescription("");
      Alert.alert("Success", "Department added successfully!");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const editDepartment = async () => {
    if (!editingDepartment || !editDepartmentName) {
      Alert.alert("Error", "Please enter a department name");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("departments")
        .update({
          name: editDepartmentName,
          description: editDepartmentDescription,
        })
        .eq("id", editingDepartment.id)
        .select();

      if (error) throw error;

      setDepartments((prev) =>
        prev.map((dept) =>
          dept.id === editingDepartment.id ? (data?.[0] || dept) : dept
        )
      );
      setShowEditDepartmentModal(false);
      setEditingDepartment(null);
      Alert.alert("Success", "Department updated successfully!");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const openEditDepartmentModal = (department: Department) => {
    setEditingDepartment(department);
    setEditDepartmentName(department.name || "");
    setEditDepartmentDescription(department.description || "");
    setShowEditDepartmentModal(true);
  };

  const removeDepartment = async (departmentId: string, departmentName: string) => {
    Alert.alert(
      "Remove Department",
      `Are you sure you want to remove ${departmentName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "OK",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("departments")
                .delete()
                .eq("id", departmentId);

              if (error) throw error;

              setDepartments((prev) => prev.filter((dept) => dept.id !== departmentId));
              Alert.alert("Success", "Department removed successfully!");
            } catch (error: any) {
              Alert.alert("Error", error.message);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "#4CAF50";
      case "inactive":
        return "#F44336";
      default:
        return colors.textSecondary;
    }
  };

  const renderStaffCard = ({ item }: { item: Staff }) => (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{item.name}</Text>
        <View style={styles.cardActions}>
          <Pressable
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => openEditStaffModal(item)}
          >
            <IconSymbol name="pencil" color="white" size={16} />
          </Pressable>
          <Pressable
            style={[styles.actionButton, { backgroundColor: colors.accent }]}
            onPress={() => removeStaff(item.id, item.name || "")}
          >
            <IconSymbol name="trash" color="white" size={16} />
          </Pressable>
        </View>
      </View>
      {item.position && (
        <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>{item.position}</Text>
      )}
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status || "") }]}>
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
    </View>
  );

  const renderDepartmentCard = ({ item }: { item: Department }) => (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{item.name}</Text>
        <View style={styles.cardActions}>
          <Pressable
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => openEditDepartmentModal(item)}
          >
            <IconSymbol name="pencil" color="white" size={16} />
          </Pressable>
          <Pressable
            style={[styles.actionButton, { backgroundColor: colors.accent }]}
            onPress={() => removeDepartment(item.id, item.name || "")}
          >
            <IconSymbol name="trash" color="white" size={16} />
          </Pressable>
        </View>
      </View>
      <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>{item.description}</Text>
    </View>
  );

  const renderDashboardStats = () => (
    <View style={styles.statsContainer}>
      <View style={[styles.statCard, { backgroundColor: colors.primary }]}>
        <Text style={styles.statNumber}>{staffList.length}</Text>
        <Text style={styles.statLabel}>Total Staff</Text>
      </View>
      <View style={[styles.statCard, { backgroundColor: colors.accent }]}>
        <Text style={styles.statNumber}>{departments.length}</Text>
        <Text style={styles.statLabel}>Departments</Text>
      </View>
      <View style={[styles.statCard, { backgroundColor: colors.secondary }]}>
        <Text style={styles.statNumber}>{staffList.filter(s => s.status === 'active').length}</Text>
        <Text style={styles.statLabel}>Active Staff</Text>
      </View>
    </View>
  );

  // Overview components
  const StatCard = ({ title, value, icon, color }: { title: string; value: string | number; icon: string; color: string }) => (
    <View style={[styles.overviewStatCard, { backgroundColor: colors.card }]}>
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

  const renderOverviewContent = () => {
    const currentYear = new Date().getFullYear();
    const totalHours = Object.values(staffWorkHours).reduce((sum, hours) => sum + hours, 0);
    const staffCount = Object.keys(staffWorkHours).length;
    const avgHours = staffCount > 0 ? (totalHours / staffCount).toFixed(1) : 0;

    return (
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.overviewHeader}>
          <View style={[styles.iconContainer, { backgroundColor: colors.secondary }]}>
            <IconSymbol name="chart.bar.fill" color="white" size={32} />
          </View>
          <Text style={[styles.overviewTitle, { color: colors.text }]}>Work Overview</Text>
          <Text style={[styles.overviewSubtitle, { color: colors.textSecondary }]}>
            Staff work hours for {months[selectedMonth]} {selectedYear}
          </Text>
        </View>

        {/* Month Filter */}
        <View style={styles.filterSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Filter by Month</Text>
          <Pressable
            style={[styles.monthPicker, { backgroundColor: colors.card }]}
            onPress={() => setShowMonthPicker(true)}
          >
            <Text style={[styles.monthPickerText, { color: colors.text }]}>
              {months[selectedMonth]} {selectedYear}
            </Text>
            <IconSymbol name="chevron.down" color={colors.text} size={20} />
          </Pressable>
        </View>

        {/* Summary Stats */}
        <View style={styles.overviewStatsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Monthly Summary</Text>
          <View style={styles.overviewStatsGrid}>
            <StatCard
              title="Total Hours"
              value={totalHours.toFixed(1)}
              icon="clock.fill"
              color={colors.primary}
            />
            <StatCard
              title="Active Staff"
              value={staffCount}
              icon="person.2.fill"
              color={colors.secondary}
            />
            <StatCard
              title="Avg Hours/Staff"
              value={avgHours}
              icon="chart.line.uptrend.xyaxis"
              color={colors.accent}
            />
            <StatCard
              title="Work Days"
              value={workEntries.length}
              icon="calendar.fill"
              color={colors.highlight}
            />
          </View>
        </View>

        {/* Staff Work Hours */}
        <View style={styles.staffHoursSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Staff Work Hours</Text>
          {Object.keys(staffWorkHours).length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
              <IconSymbol name="clock" color={colors.textSecondary} size={48} />
              <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                No work entries found for {months[selectedMonth]} {selectedYear}
              </Text>
              {selectedYear !== currentYear && (
                <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
                  Data is only saved for the current year ({currentYear})
                </Text>
              )}
            </View>
          ) : (
            <View style={styles.staffHoursList}>
              {Object.entries(staffWorkHours)
                .sort(([, hoursA], [, hoursB]) => hoursB - hoursA)
                .map(([staffKey, hours]) => {
                  const [staffId, staffName] = staffKey.split('-');
                  return (
                    <View key={staffKey} style={[styles.staffHourCard, { backgroundColor: colors.card }]}>
                      <View style={styles.staffHourHeader}>
                        <View style={[styles.staffAvatar, { backgroundColor: colors.primary }]}>
                          <Text style={styles.staffAvatarText}>
                            {staffName.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View style={styles.staffHourInfo}>
                          <Text style={[styles.staffHourName, { color: colors.text }]}>
                            {staffName}
                          </Text>
                          <Text style={[styles.staffHourHours, { color: colors.primary }]}>
                            {hours.toFixed(1)} hours
                          </Text>
                        </View>
                      </View>
                      <View style={styles.staffHourProgress}>
                        <View 
                          style={[
                            styles.staffHourProgressBar, 
                            { 
                              backgroundColor: colors.primary,
                              width: `${Math.min((hours / Math.max(...Object.values(staffWorkHours))) * 100, 100)}%`
                            }
                          ]} 
                        />
                      </View>
                    </View>
                  );
                })}
            </View>
          )}
        </View>

        {/* Recent Entries */}
        {workEntries.length > 0 && (
          <View style={styles.entriesSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Entries</Text>
            <View style={styles.entriesList}>
              {workEntries
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5)
                .map((entry, index) => (
                  <View key={index} style={[styles.entryCard, { backgroundColor: colors.card }]}>
                    <View style={styles.entryHeader}>
                      <Text style={[styles.entryDate, { color: colors.text }]}>
                        {new Date(entry.date).toLocaleDateString()}
                      </Text>
                      <Text style={[styles.entryHours, { color: colors.primary }]}>
                        {entry.hours}h
                      </Text>
                    </View>
                    <Text style={[styles.entryProject, { color: colors.textSecondary }]}>
                      {entry.staff?.name || 'Unknown Staff'}
                    </Text>
                    <Text style={[styles.entryDescription, { color: colors.text }]}>
                      {entry.description || 'No description'}
                    </Text>
                  </View>
                ))}
            </View>
          </View>
        )}

        {/* Month Picker Modal */}
        <Modal visible={showMonthPicker} animationType="slide" presentationStyle="pageSheet">
          <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select Month</Text>
              <Pressable onPress={() => setShowMonthPicker(false)}>
                <IconSymbol name="xmark" color={colors.text} size={24} />
              </Pressable>
            </View>
            <ScrollView style={styles.modalContent}>
              <View style={styles.yearSection}>
                <Text style={[styles.yearTitle, { color: colors.text }]}>Year: {currentYear}</Text>
                <Text style={[styles.yearSubtitle, { color: colors.textSecondary }]}>
                  Only current year data is available
                </Text>
              </View>
              <View style={styles.monthGrid}>
                {months.map((month, index) => (
                  <Pressable
                    key={index}
                    style={[
                      styles.monthButton,
                      { backgroundColor: colors.card },
                      selectedMonth === index && { backgroundColor: colors.primary }
                    ]}
                    onPress={() => {
                      setSelectedMonth(index);
                      setSelectedYear(currentYear);
                      fetchWorkEntriesForMonth(index, currentYear);
                      setShowMonthPicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.monthButtonText,
                        { color: colors.text },
                        selectedMonth === index && { color: 'white' }
                      ]}
                    >
                      {month}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
        </Modal>
      </ScrollView>
    );
  };

  const renderDashboardContent = () => (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {renderDashboardStats()}
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Staff Management</Text>
          <Pressable
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={() => setShowAddStaffModal(true)}
          >
            <IconSymbol name="plus" color="white" size={20} />
          </Pressable>
        </View>
        <FlatList
          data={staffList}
          renderItem={renderStaffCard}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Department Management</Text>
          <Pressable
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={() => setShowAddDepartmentModal(true)}
          >
            <IconSymbol name="plus" color="white" size={20} />
          </Pressable>
        </View>
        <FlatList
          data={departments}
          renderItem={renderDepartmentCard}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </View>
    </ScrollView>
  );

  const renderAddStaffModal = () => (
    <Modal visible={showAddStaffModal} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Add Staff Member</Text>
          <Pressable onPress={() => setShowAddStaffModal(false)}>
            <IconSymbol name="xmark" color={colors.text} size={24} />
          </Pressable>
        </View>
        <ScrollView style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
              value={newStaffName}
              onChangeText={setNewStaffName}
              placeholder="Enter staff name"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Email</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
              value={newStaffEmail}
              onChangeText={setNewStaffEmail}
              placeholder="Enter email address"
              keyboardType="email-address"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Department</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
              value={newStaffDepartment}
              onChangeText={setNewStaffDepartment}
              placeholder="Enter department"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          <Pressable
            style={[styles.submitButton, { backgroundColor: colors.primary }]}
            onPress={addStaff}
          >
            <Text style={styles.submitButtonText}>Add Staff Member</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );

  const renderEditStaffModal = () => (
    <Modal visible={showEditStaffModal} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Staff Member</Text>
          <Pressable onPress={() => setShowEditStaffModal(false)}>
            <IconSymbol name="xmark" color={colors.text} size={24} />
          </Pressable>
        </View>
        <ScrollView style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
              value={editStaffName}
              onChangeText={setEditStaffName}
              placeholder="Enter staff name"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Status</Text>
            <View style={styles.statusContainer}>
              <Pressable
                style={[
                  styles.statusOption,
                  { backgroundColor: colors.card },
                  editStaffStatus === "active" && { backgroundColor: colors.primary }
                ]}
                onPress={() => setEditStaffStatus("active")}
              >
                <Text
                  style={[
                    styles.statusOptionText,
                    { color: colors.text },
                    editStaffStatus === "active" && { color: "white" }
                  ]}
                >
                  Active
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.statusOption,
                  { backgroundColor: colors.card },
                  editStaffStatus === "inactive" && { backgroundColor: colors.accent }
                ]}
                onPress={() => setEditStaffStatus("inactive")}
              >
                <Text
                  style={[
                    styles.statusOptionText,
                    { color: colors.text },
                    editStaffStatus === "inactive" && { color: "white" }
                  ]}
                >
                  Inactive
                </Text>
              </Pressable>
            </View>
          </View>
          <Pressable
            style={[styles.submitButton, { backgroundColor: colors.primary }]}
            onPress={editStaff}
          >
            <Text style={styles.submitButtonText}>Update Staff Member</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );

  const renderAddDepartmentModal = () => (
    <Modal visible={showAddDepartmentModal} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Add Department</Text>
          <Pressable onPress={() => setShowAddDepartmentModal(false)}>
            <IconSymbol name="xmark" color={colors.text} size={24} />
          </Pressable>
        </View>
        <ScrollView style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Department Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
              value={newDepartmentName}
              onChangeText={setNewDepartmentName}
              placeholder="Enter department name"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Description</Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: colors.card, color: colors.text }]}
              value={newDepartmentDescription}
              onChangeText={setNewDepartmentDescription}
              placeholder="Enter department description"
              multiline
              numberOfLines={4}
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          <Pressable
            style={[styles.submitButton, { backgroundColor: colors.primary }]}
            onPress={addDepartment}
          >
            <Text style={styles.submitButtonText}>Add Department</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );

  const renderEditDepartmentModal = () => (
    <Modal visible={showEditDepartmentModal} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Department</Text>
          <Pressable onPress={() => setShowEditDepartmentModal(false)}>
            <IconSymbol name="xmark" color={colors.text} size={24} />
          </Pressable>
        </View>
        <ScrollView style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Department Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
              value={editDepartmentName}
              onChangeText={setEditDepartmentName}
              placeholder="Enter department name"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Description</Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: colors.card, color: colors.text }]}
              value={editDepartmentDescription}
              onChangeText={setEditDepartmentDescription}
              placeholder="Enter department description"
              multiline
              numberOfLines={4}
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          <Pressable
            style={[styles.submitButton, { backgroundColor: colors.primary }]}
            onPress={editDepartment}
          >
            <Text style={styles.submitButtonText}>Update Department</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );

  const handleTabPress = (tabIndex: number) => {
    console.log(`Tab ${tabIndex} pressed`);
    setActiveTab(tabIndex);
  };

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
          <View style={styles.loginContainer}>
            <Text style={[styles.loginTitle, { color: colors.text }]}>Admin Login</Text>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Username</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
                value={username}
                onChangeText={setUsername}
                placeholder="Enter username"
                autoCapitalize="none"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.passwordInput, { backgroundColor: colors.card, color: colors.text }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter password"
                  secureTextEntry={!showPassword}
                  placeholderTextColor={colors.textSecondary}
                />
                <Pressable
                  style={styles.passwordToggle}
                  onPress={togglePasswordVisibility}
                >
                  <IconSymbol
                    name={showPassword ? "eye.slash" : "eye"}
                    color={colors.textSecondary}
                    size={20}
                  />
                </Pressable>
              </View>
            </View>

            <Pressable
              style={[styles.loginButton, { backgroundColor: colors.primary }]}
              onPress={handleLogin}
            >
              <Text style={styles.loginButtonText}>Login</Text>
            </Pressable>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: activeTab === 0 ? "Admin Dashboard" : "Overview",
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
              <Text style={[styles.logoutText, { color: colors.accent }]}>Logout</Text>
            </Pressable>
          ),
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 0 ? renderDashboardContent() : renderOverviewContent()}
        </View>

        {/* Custom Tab Bar */}
        <View style={styles.customTabBar}>
          <View style={[styles.tabBarContainer, { backgroundColor: colors.card }]}>
            <Pressable
              style={[
                styles.tabButton,
                activeTab === 0 && { backgroundColor: colors.primary }
              ]}
              onPress={() => handleTabPress(0)}
            >
              <IconSymbol
                name="square.grid.2x2.fill"
                color={activeTab === 0 ? "white" : colors.text}
                size={20}
              />
              <Text
                style={[
                  styles.tabButtonText,
                  { color: activeTab === 0 ? "white" : colors.text }
                ]}
              >
                Dashboard
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.tabButton,
                activeTab === 1 && { backgroundColor: colors.primary }
              ]}
              onPress={() => handleTabPress(1)}
            >
              <IconSymbol
                name="chart.bar.fill"
                color={activeTab === 1 ? "white" : colors.text}
                size={20}
              />
              <Text
                style={[
                  styles.tabButtonText,
                  { color: activeTab === 1 ? "white" : colors.text }
                ]}
              >
                Overview
              </Text>
            </Pressable>
          </View>
        </View>

        {renderAddStaffModal()}
        {renderEditStaffModal()}
        {renderAddDepartmentModal()}
        {renderEditDepartmentModal()}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
  },
  scrollContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    paddingBottom: 100, // Add padding to account for tab bar
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  logoutButton: {
    padding: 8,
    marginRight: -8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 48,
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
    borderColor: '#E0E0E0',
    minHeight: 48,
  },
  passwordToggle: {
    position: 'absolute',
    right: 16,
    top: 14,
    padding: 4,
  },
  textArea: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  loginButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    minHeight: 48,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: 'white',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  cardSubtitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  submitButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    minHeight: 48,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Custom Tab Bar Styles
  customTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
  },
  tabBarContainer: {
    flexDirection: 'row',
    borderRadius: 25,
    padding: 8,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
    elevation: 8,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 17,
    gap: 8,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Overview Styles
  overviewHeader: {
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
  overviewTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  overviewSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  overviewStatsSection: {
    marginBottom: 32,
  },
  overviewStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  overviewStatCard: {
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
  // New styles for work overview
  filterSection: {
    marginBottom: 24,
  },
  monthPicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  monthPickerText: {
    fontSize: 16,
    fontWeight: '600',
  },
  staffHoursSection: {
    marginBottom: 32,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 16,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  staffHoursList: {
    gap: 12,
  },
  staffHourCard: {
    borderRadius: 16,
    padding: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  staffHourHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  staffAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  staffAvatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  staffHourInfo: {
    flex: 1,
  },
  staffHourName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  staffHourHours: {
    fontSize: 14,
    fontWeight: '700',
  },
  staffHourProgress: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  staffHourProgressBar: {
    height: '100%',
    borderRadius: 3,
  },
  yearSection: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  yearTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  yearSubtitle: {
    fontSize: 14,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  monthButton: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  monthButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statusOption: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  statusOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
