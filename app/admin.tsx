
import { supabase } from "@/app/integrations/supabase/client";
import { Tables, TablesInsert } from "@/app/integrations/supabase/types";
import { Stack, router } from "expo-router";
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, FlatList, Modal, Platform } from "react-native";
import { IconSymbol } from "@/components/IconSymbol";
import { colors, spacing, borderRadius, shadows, typography, commonStyles } from "@/styles/commonStyles";
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, FadeInUp, SlideInRight } from 'react-native-reanimated';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState, useEffect } from "react";

type Staff = Tables<"staff">;
type Department = Tables<"departments">;
type WorkEntry = Tables<"work_entries">;

const WORK_TYPES = ["Regular class", "Shimsa", "Event"];

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
  const [showAddWorkEntryModal, setShowAddWorkEntryModal] = useState(false);
  const [showEditWorkEntryModal, setShowEditWorkEntryModal] = useState(false);
  
  // Form states
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffStatus, setNewStaffStatus] = useState("active");
  
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [editStaffName, setEditStaffName] = useState("");
  const [editStaffStatus, setEditStaffStatus] = useState("");
  
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [newDepartmentDescription, setNewDepartmentDescription] = useState("");
  
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [editDepartmentName, setEditDepartmentName] = useState("");
  const [editDepartmentDescription, setEditDepartmentDescription] = useState("");

  // Work entry form states
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [selectedWorkType, setSelectedWorkType] = useState("");
  const [workDate, setWorkDate] = useState(new Date());
  const [workHours, setWorkHours] = useState("");
  const [workDescription, setWorkDescription] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStaffPicker, setShowStaffPicker] = useState(false);
  const [showDepartmentPicker, setShowDepartmentPicker] = useState(false);
  const [showWorkTypePicker, setShowWorkTypePicker] = useState(false);

  // Edit work entry states
  const [editingWorkEntry, setEditingWorkEntry] = useState<WorkEntry | null>(null);
  const [editStaffId, setEditStaffId] = useState("");
  const [editDepartmentId, setEditDepartmentId] = useState("");
  const [editWorkType, setEditWorkType] = useState("");
  const [editWorkDate, setEditWorkDate] = useState(new Date());
  const [editWorkHours, setEditWorkHours] = useState("");
  const [editWorkDescription, setEditWorkDescription] = useState("");
  const [showEditDatePicker, setShowEditDatePicker] = useState(false);

  // Work overview state
  const [workEntries, setWorkEntries] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [staffWorkHours, setStaffWorkHours] = useState<{[key: string]: {name: string, hours: number, id: string}}>({});
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
    if (isLoggedIn) {
      calculateStaffWorkHours(workEntries, selectedMonth, selectedYear);
    }
  }, [selectedMonth, selectedYear, workEntries, isLoggedIn, staffList]);

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
          ),
          departments:department_id (
            id,
            name
          )
        `)
      ]);

      if (staffResponse.error) throw staffResponse.error;
      if (departmentsResponse.error) throw departmentsResponse.error;
      if (workEntriesResponse.error) throw workEntriesResponse.error;

      setStaffList(staffResponse.data || []);
      setDepartments(departmentsResponse.data || []);
      setWorkEntries(workEntriesResponse.data || []);
      
      calculateStaffWorkHours(workEntriesResponse.data || [], selectedMonth, selectedYear);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      Alert.alert("Error", error.message);
    }
  };

  const calculateStaffWorkHours = (entries: any[], month: number, year: number) => {
    const currentYear = new Date().getFullYear();
    
    if (year !== currentYear) {
      setStaffWorkHours({});
      return;
    }

    // Initialize all staff with 0 hours
    const staffHours: {[key: string]: {name: string, hours: number, id: string}} = {};
    
    // First, add all staff members with 0 hours
    staffList.forEach(staff => {
      const key = staff.id;
      staffHours[key] = {
        name: staff.name || 'Unknown Staff',
        hours: 0,
        id: staff.id
      };
    });
    
    // Then, add actual work hours from entries
    entries.forEach(entry => {
      const entryDate = new Date(entry.date);
      if (entryDate.getMonth() === month && entryDate.getFullYear() === year) {
        const staffId = entry.staff_id;
        const staffName = entry.staff?.name || staffList.find(s => s.id === staffId)?.name || 'Unknown Staff';
        
        if (staffHours[staffId]) {
          staffHours[staffId].hours += parseFloat(entry.hours) || 0;
          staffHours[staffId].name = staffName; // Ensure we have the correct name
        } else {
          // If staff not in list, add them
          staffHours[staffId] = {
            name: staffName,
            hours: parseFloat(entry.hours) || 0,
            id: staffId
          };
        }
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
          ),
          departments:department_id (
            id,
            name
          )
        `)
        .gte('date', startDate)
        .lte('date', endDate);

      if (error) throw error;
      
      setWorkEntries(data || []);
      calculateStaffWorkHours(data || [], month, year);
    } catch (error: any) {
      console.error("Error fetching work entries:", error);
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

  // Work Entry Management Functions
  const addWorkEntry = async () => {
    if (!selectedStaffId || !selectedDepartmentId || !selectedWorkType || !workHours) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    const hours = parseFloat(workHours);
    if (isNaN(hours) || hours <= 0) {
      Alert.alert("Error", "Please enter valid work hours");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("work_entries")
        .insert([
          {
            staff_id: selectedStaffId,
            department_id: selectedDepartmentId,
            work_type: selectedWorkType,
            date: workDate.toISOString().split('T')[0],
            hours: hours,
            description: workDescription || null,
          },
        ])
        .select(`
          *,
          staff:staff_id (
            id,
            name,
            email
          ),
          departments:department_id (
            id,
            name
          )
        `);

      if (error) throw error;

      setWorkEntries((prev) => [...prev, ...(data || [])]);
      setShowAddWorkEntryModal(false);
      resetWorkEntryForm();
      Alert.alert("Success", "Work entry added successfully!");
      
      // Refresh data to update calculations
      fetchData();
    } catch (error: any) {
      console.error("Error adding work entry:", error);
      Alert.alert("Error", error.message);
    }
  };

  const editWorkEntry = async () => {
    if (!editingWorkEntry || !editStaffId || !editDepartmentId || !editWorkType || !editWorkHours) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    const hours = parseFloat(editWorkHours);
    if (isNaN(hours) || hours <= 0) {
      Alert.alert("Error", "Please enter valid work hours");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("work_entries")
        .update({
          staff_id: editStaffId,
          department_id: editDepartmentId,
          work_type: editWorkType,
          date: editWorkDate.toISOString().split('T')[0],
          hours: hours,
          description: editWorkDescription || null,
        })
        .eq("id", editingWorkEntry.id)
        .select(`
          *,
          staff:staff_id (
            id,
            name,
            email
          ),
          departments:department_id (
            id,
            name
          )
        `);

      if (error) throw error;

      setWorkEntries((prev) =>
        prev.map((entry) =>
          entry.id === editingWorkEntry.id ? (data?.[0] || entry) : entry
        )
      );
      setShowEditWorkEntryModal(false);
      setEditingWorkEntry(null);
      Alert.alert("Success", "Work entry updated successfully!");
      
      // Refresh data to update calculations
      fetchData();
    } catch (error: any) {
      console.error("Error updating work entry:", error);
      Alert.alert("Error", error.message);
    }
  };

  const deleteWorkEntry = async (entryId: string, staffName: string, date: string) => {
    Alert.alert(
      "Delete Work Entry",
      `Are you sure you want to delete the work entry for ${staffName} on ${new Date(date).toLocaleDateString()}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("work_entries")
                .delete()
                .eq("id", entryId);

              if (error) throw error;

              setWorkEntries((prev) => prev.filter((entry) => entry.id !== entryId));
              Alert.alert("Success", "Work entry deleted successfully!");
              
              // Refresh data to update calculations
              fetchData();
            } catch (error: any) {
              console.error("Error deleting work entry:", error);
              Alert.alert("Error", error.message);
            }
          },
        },
      ]
    );
  };

  const openEditWorkEntryModal = (workEntry: any) => {
    setEditingWorkEntry(workEntry);
    setEditStaffId(workEntry.staff_id);
    setEditDepartmentId(workEntry.department_id);
    setEditWorkType(workEntry.work_type);
    setEditWorkDate(new Date(workEntry.date));
    setEditWorkHours(workEntry.hours.toString());
    setEditWorkDescription(workEntry.description || "");
    setShowEditWorkEntryModal(true);
  };

  const resetWorkEntryForm = () => {
    setSelectedStaffId("");
    setSelectedDepartmentId("");
    setSelectedWorkType("");
    setWorkDate(new Date());
    setWorkHours("");
    setWorkDescription("");
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setWorkDate(selectedDate);
    }
  };

  const handleEditDateChange = (event: any, selectedDate?: Date) => {
    setShowEditDatePicker(false);
    if (selectedDate) {
      setEditWorkDate(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const addStaff = async () => {
    if (!newStaffName) {
      Alert.alert("Error", "Please enter a staff name");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("staff")
        .insert([
          {
            name: newStaffName,
            status: newStaffStatus,
          },
        ])
        .select();

      if (error) throw error;

      setStaffList((prev) => [...prev, ...(data || [])]);
      setShowAddStaffModal(false);
      setNewStaffName("");
      setNewStaffStatus("active");
      Alert.alert("Success", "Staff member added successfully!");
    } catch (error: any) {
      console.error("Error adding staff:", error);
      Alert.alert("Error", error.message);
    }
  };

  const importStaffList = async () => {
    const staffToImport = [
      "Alice Mkrtchian",
      "Anna Juharyan",
      "Damdin Sanzhaev",
      "David El Shanti",
      "Ekatarina Rafailovic",
      "Evylin Wang",
      "Jae-Won Lee",
      "Jessica Li",
      "Lovisa Nihlén",
      "Lukas Erlandsson",
      "Nicole Abiad",
      "Noah Liljeberg",
      "Vera Angsell",
      "Vincent Saigne"
    ];

    Alert.alert(
      "Import Staff",
      `Are you sure you want to import ${staffToImport.length} staff members?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Import",
          onPress: async () => {
            try {
              console.log("Starting staff import...");
              
              const { data: existingStaff, error: fetchError } = await supabase
                .from("staff")
                .select("name");

              if (fetchError) throw fetchError;

              const existingNames = existingStaff?.map(staff => staff.name) || [];
              const newStaffToAdd = staffToImport.filter(name => !existingNames.includes(name));

              if (newStaffToAdd.length === 0) {
                Alert.alert("Info", "All staff members already exist in the database.");
                return;
              }

              const staffData = newStaffToAdd.map(name => ({
                name: name,
                status: "active",
                position: "Staff",
                email: `${name.toLowerCase().replace(/\s+/g, '.')}@company.com`,
                join_date: new Date().toISOString().split('T')[0]
              }));

              console.log("Inserting staff data:", staffData);

              const { data, error } = await supabase
                .from("staff")
                .insert(staffData)
                .select();

              if (error) throw error;

              console.log("Staff import successful:", data);

              setStaffList((prev) => [...prev, ...(data || [])]);
              
              Alert.alert(
                "Success", 
                `Successfully imported ${newStaffToAdd.length} staff members!\n\nSkipped ${staffToImport.length - newStaffToAdd.length} existing members.`
              );
            } catch (error: any) {
              console.error("Error importing staff:", error);
              Alert.alert("Error", `Failed to import staff: ${error.message}`);
            }
          },
        },
      ]
    );
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
      console.error("Error editing staff:", error);
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
              console.error("Error removing staff:", error);
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
      console.error("Error adding department:", error);
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
      console.error("Error editing department:", error);
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
              console.error("Error removing department:", error);
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
        return colors.success;
      case "inactive":
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const renderStaffCard = ({ item, index }: { item: Staff; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 50).springify()}
    >
      <View style={[commonStyles.cardElevated, styles.staffCard]}>
        <View style={styles.cardHeader}>
          <View style={styles.staffInfo}>
            <View style={[styles.staffAvatar, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[commonStyles.bodyMedium, { color: colors.primary }]}>
                {item.name?.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.staffDetails}>
              <Text style={[commonStyles.bodyMedium, styles.staffName]}>{item.name}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status || 'active') + '20' }]}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status || 'active') }]} />
                <Text style={[commonStyles.caption, { color: getStatusColor(item.status || 'active') }]}>
                  {item.status || 'active'}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.cardActions}>
            <Pressable
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => openEditStaffModal(item)}
            >
              <IconSymbol name="pencil" color="white" size={16} />
            </Pressable>
            <Pressable
              style={[styles.actionButton, { backgroundColor: colors.error }]}
              onPress={() => removeStaff(item.id, item.name || "")}
            >
              <IconSymbol name="trash" color="white" size={16} />
            </Pressable>
          </View>
        </View>
      </View>
    </Animated.View>
  );

  const renderDepartmentCard = ({ item, index }: { item: Department; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 50).springify()}
    >
      <View style={[commonStyles.cardElevated, styles.departmentCard]}>
        <View style={styles.cardHeader}>
          <View style={styles.departmentInfo}>
            <View style={[styles.departmentIcon, { backgroundColor: colors.secondary + '20' }]}>
              <IconSymbol name="building.2" color={colors.secondary} size={24} />
            </View>
            <View style={styles.departmentDetails}>
              <Text style={[commonStyles.bodyMedium, styles.departmentName]}>{item.name}</Text>
              <Text style={[commonStyles.caption, styles.departmentDescription]}>{item.description}</Text>
            </View>
          </View>
          <View style={styles.cardActions}>
            <Pressable
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => openEditDepartmentModal(item)}
            >
              <IconSymbol name="pencil" color="white" size={16} />
            </Pressable>
            <Pressable
              style={[styles.actionButton, { backgroundColor: colors.error }]}
              onPress={() => removeDepartment(item.id, item.name || "")}
            >
              <IconSymbol name="trash" color="white" size={16} />
            </Pressable>
          </View>
        </View>
      </View>
    </Animated.View>
  );

  const renderWorkEntryCard = ({ item, index }: { item: any; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 50).springify()}
    >
      <View style={[commonStyles.cardElevated, styles.workEntryCard]}>
        <View style={styles.workEntryHeader}>
          <View style={styles.workEntryInfo}>
            <Text style={[commonStyles.bodyMedium, styles.workEntryDate]}>
              {new Date(item.date).toLocaleDateString()}
            </Text>
            <Text style={[commonStyles.caption, { color: colors.textSecondary }]}>
              {item.staff?.name || 'Unknown Staff'} (ID: {item.staff_id?.substring(0, 8)}...)
            </Text>
            <Text style={[commonStyles.caption, { color: colors.textSecondary }]}>
              {item.departments?.name || 'Unknown Department'}
            </Text>
          </View>
          <View style={styles.workEntryDetails}>
            <View style={[styles.hoursBadge, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[commonStyles.captionMedium, { color: colors.primary }]}>
                {item.hours}h
              </Text>
            </View>
            <View style={[styles.workTypeBadge, { backgroundColor: colors.secondary + '20' }]}>
              <Text style={[commonStyles.caption, { color: colors.secondary }]}>
                {item.work_type}
              </Text>
            </View>
          </View>
        </View>
        {item.description && (
          <Text style={[commonStyles.body, styles.workEntryDescription]}>
            {item.description}
          </Text>
        )}
        <View style={styles.workEntryActions}>
          <Pressable
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => openEditWorkEntryModal(item)}
          >
            <IconSymbol name="pencil" color="white" size={16} />
          </Pressable>
          <Pressable
            style={[styles.actionButton, { backgroundColor: colors.error }]}
            onPress={() => deleteWorkEntry(item.id, item.staff?.name || 'Unknown Staff', item.date)}
          >
            <IconSymbol name="trash" color="white" size={16} />
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );

  const renderDashboardStats = () => (
    <View style={styles.statsContainer}>
      <Animated.View
        entering={FadeInUp.delay(100).springify()}
        style={[styles.statCard, { backgroundColor: colors.primary }]}
      >
        <LinearGradient
          colors={[colors.primary, '#6366F1']}
          style={styles.statGradient}
        >
          <IconSymbol name="person.3.fill" color="white" size={28} />
          <Text style={styles.statNumber}>{staffList.length}</Text>
          <Text style={styles.statLabel}>Total Staff</Text>
        </LinearGradient>
      </Animated.View>
      
      <Animated.View
        entering={FadeInUp.delay(200).springify()}
        style={[styles.statCard, { backgroundColor: colors.secondary }]}
      >
        <LinearGradient
          colors={[colors.secondary, '#059669']}
          style={styles.statGradient}
        >
          <IconSymbol name="building.2.fill" color="white" size={28} />
          <Text style={styles.statNumber}>{departments.length}</Text>
          <Text style={styles.statLabel}>Departments</Text>
        </LinearGradient>
      </Animated.View>
      
      <Animated.View
        entering={FadeInUp.delay(300).springify()}
        style={[styles.statCard, { backgroundColor: colors.accent }]}
      >
        <LinearGradient
          colors={[colors.accent, '#F59E0B']}
          style={styles.statGradient}
        >
          <IconSymbol name="checkmark.circle.fill" color="white" size={28} />
          <Text style={styles.statNumber}>{staffList.filter(s => s.status === 'active').length}</Text>
          <Text style={styles.statLabel}>Active Staff</Text>
        </LinearGradient>
      </Animated.View>
    </View>
  );

  // Overview components
  const StatCard = ({ title, value, icon, color }: { title: string; value: string | number; icon: string; color: string }) => (
    <View style={[styles.overviewStatCard, commonStyles.cardElevated]}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <IconSymbol name={icon as any} color={color} size={24} />
      </View>
      <Text style={[commonStyles.heading3, { color: colors.text }]}>{value}</Text>
      <Text style={[commonStyles.caption, { color: colors.textSecondary }]}>{title}</Text>
    </View>
  );

  const renderOverviewContent = () => {
    const currentYear = new Date().getFullYear();
    const totalHours = Object.values(staffWorkHours).reduce((sum, staff) => sum + staff.hours, 0);
    const staffCount = Object.keys(staffWorkHours).length;
    const avgHours = staffCount > 0 ? (totalHours / staffCount).toFixed(1) : 0;

    return (
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Animated.View 
          style={styles.overviewHeader}
          entering={FadeInUp.springify()}
        >
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            style={styles.overviewIconContainer}
          >
            <IconSymbol name="chart.bar.fill" color="white" size={32} />
          </LinearGradient>
          <Text style={[commonStyles.heading2, styles.overviewTitle]}>Work Overview</Text>
          <Text style={[commonStyles.body, styles.overviewSubtitle]}>
            Staff work hours for {months[selectedMonth]} {selectedYear}
          </Text>
        </Animated.View>

        {/* Month Filter */}
        <Animated.View 
          style={styles.filterSection}
          entering={FadeInDown.delay(100).springify()}
        >
          <Text style={[commonStyles.heading4, styles.sectionTitle]}>Filter by Month</Text>
          <Pressable
            style={[styles.monthPicker, commonStyles.cardElevated]}
            onPress={() => setShowMonthPicker(true)}
          >
            <Text style={[commonStyles.bodyMedium, { color: colors.text }]}>
              {months[selectedMonth]} {selectedYear}
            </Text>
            <IconSymbol name="chevron.down" color={colors.textSecondary} size={20} />
          </Pressable>
        </Animated.View>

        {/* Summary Stats */}
        <Animated.View 
          style={styles.overviewStatsSection}
          entering={FadeInDown.delay(200).springify()}
        >
          <Text style={[commonStyles.heading4, styles.sectionTitle]}>Monthly Summary</Text>
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
              color={colors.error}
            />
          </View>
        </Animated.View>

        {/* Staff Work Hours */}
        <Animated.View 
          style={styles.staffHoursSection}
          entering={FadeInDown.delay(300).springify()}
        >
          <Text style={[commonStyles.heading4, styles.sectionTitle]}>Staff Work Hours</Text>
          {Object.keys(staffWorkHours).length === 0 ? (
            <View style={[styles.emptyState, commonStyles.cardElevated]}>
              <IconSymbol name="clock" color={colors.textSecondary} size={48} />
              <Text style={[commonStyles.bodyMedium, styles.emptyStateText]}>
                No staff data found for {months[selectedMonth]} {selectedYear}
              </Text>
              {selectedYear !== currentYear && (
                <Text style={[commonStyles.caption, styles.emptyStateSubtext]}>
                  Data is only saved for the current year ({currentYear})
                </Text>
              )}
            </View>
          ) : (
            <View style={styles.staffHoursList}>
              {Object.entries(staffWorkHours)
                .sort(([, staffA], [, staffB]) => staffB.hours - staffA.hours)
                .map(([staffId, staffData], index) => (
                  <Animated.View 
                    key={staffId} 
                    entering={FadeInDown.delay(index * 50).springify()}
                  >
                    <View style={[styles.staffHourCard, commonStyles.cardElevated]}>
                      <View style={styles.staffHourHeader}>
                        <LinearGradient
                          colors={[colors.primary, colors.secondary]}
                          style={styles.staffHourAvatar}
                        >
                          <Text style={styles.staffAvatarText}>
                            {staffData.name.charAt(0).toUpperCase()}
                          </Text>
                        </LinearGradient>
                        <View style={styles.staffHourInfo}>
                          <Text style={[commonStyles.bodyMedium, styles.staffHourName]}>
                            {staffData.name}
                          </Text>
                          <Text style={[commonStyles.caption, { color: colors.textSecondary }]}>
                            ID: {staffData.id.substring(0, 8)}...
                          </Text>
                          <Text style={[commonStyles.caption, { color: colors.primary }]}>
                            {staffData.hours.toFixed(1)} hours
                          </Text>
                        </View>
                      </View>
                      <View style={styles.staffHourProgress}>
                        <LinearGradient
                          colors={[colors.primary, colors.secondary]}
                          style={[
                            styles.staffHourProgressBar,
                            { 
                              width: `${Math.min((staffData.hours / Math.max(...Object.values(staffWorkHours).map(s => s.hours))) * 100, 100)}%`
                            }
                          ]}
                        />
                      </View>
                    </View>
                  </Animated.View>
                ))}
            </View>
          )}
        </Animated.View>

        {/* Work Entries Management */}
        <Animated.View 
          style={styles.entriesSection}
          entering={FadeInDown.delay(400).springify()}
        >
          <View style={styles.sectionHeader}>
            <Text style={[commonStyles.heading4, styles.sectionTitle]}>Work Entries</Text>
            <Pressable
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowAddWorkEntryModal(true)}
            >
              <IconSymbol name="plus" color="white" size={20} />
            </Pressable>
          </View>
          {workEntries.length > 0 ? (
            <View style={styles.entriesList}>
              {workEntries
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((entry, index) => (
                  <View key={entry.id}>
                    {renderWorkEntryCard({ item: entry, index })}
                  </View>
                ))}
            </View>
          ) : (
            <View style={[styles.emptyState, commonStyles.cardElevated]}>
              <IconSymbol name="calendar" color={colors.textSecondary} size={48} />
              <Text style={[commonStyles.bodyMedium, styles.emptyStateText]}>
                No work entries found for {months[selectedMonth]} {selectedYear}
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Month Picker Modal */}
        <Modal visible={showMonthPicker} animationType="slide" presentationStyle="pageSheet">
          <BlurView intensity={100} style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={[commonStyles.heading3, { color: colors.text }]}>Select Month</Text>
              <Pressable onPress={() => setShowMonthPicker(false)}>
                <IconSymbol name="xmark" color={colors.text} size={24} />
              </Pressable>
            </View>
            <ScrollView style={styles.modalContent}>
              <View style={styles.yearSection}>
                <Text style={[commonStyles.heading4, { color: colors.text }]}>Year: {currentYear}</Text>
                <Text style={[commonStyles.caption, { color: colors.textSecondary }]}>
                  Only current year data is available
                </Text>
              </View>
              <View style={styles.monthGrid}>
                {months.map((month, index) => (
                  <Pressable
                    key={index}
                    style={[
                      styles.monthButton,
                      commonStyles.cardElevated,
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
                        commonStyles.bodyMedium,
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
          </BlurView>
        </Modal>
      </ScrollView>
    );
  };

  const renderDashboardContent = () => (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {renderDashboardStats()}
      
      <Animated.View 
        style={styles.section}
        entering={FadeInDown.delay(100).springify()}
      >
        <View style={styles.sectionHeader}>
          <Text style={[commonStyles.heading3, styles.sectionTitle]}>Staff Management</Text>
          <View style={styles.headerActions}>
            <Pressable
              style={[styles.importButton, { backgroundColor: colors.secondary }]}
              onPress={importStaffList}
            >
              <IconSymbol name="square.and.arrow.down" color="white" size={16} />
              <Text style={styles.importButtonText}>Import</Text>
            </Pressable>
            <Pressable
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowAddStaffModal(true)}
            >
              <IconSymbol name="plus" color="white" size={20} />
            </Pressable>
          </View>
        </View>
        <FlatList
          data={staffList}
          renderItem={renderStaffCard}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </Animated.View>

      <Animated.View 
        style={styles.section}
        entering={FadeInDown.delay(200).springify()}
      >
        <View style={styles.sectionHeader}>
          <Text style={[commonStyles.heading3, styles.sectionTitle]}>Department Management</Text>
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
      </Animated.View>
    </ScrollView>
  );

  const renderStaffItem = ({ item, index }: { item: Staff; index: number }) => (
    <Pressable
      style={[
        styles.pickerItem,
        commonStyles.cardElevated,
        selectedStaffId === item.id && { backgroundColor: colors.primary }
      ]}
      onPress={() => {
        setSelectedStaffId(item.id);
        setShowStaffPicker(false);
      }}
    >
      <Text
        style={[
          commonStyles.bodyMedium,
          { color: colors.text },
          selectedStaffId === item.id && { color: 'white' }
        ]}
      >
        {item.name}
      </Text>
    </Pressable>
  );

  const renderDepartmentItem = ({ item, index }: { item: Department; index: number }) => (
    <Pressable
      style={[
        styles.pickerItem,
        commonStyles.cardElevated,
        selectedDepartmentId === item.id && { backgroundColor: colors.primary }
      ]}
      onPress={() => {
        setSelectedDepartmentId(item.id);
        setShowDepartmentPicker(false);
      }}
    >
      <Text
        style={[
          commonStyles.bodyMedium,
          { color: colors.text },
          selectedDepartmentId === item.id && { color: 'white' }
        ]}
      >
        {item.name}
      </Text>
    </Pressable>
  );

  const renderWorkTypeItem = ({ item, index }: { item: string; index: number }) => (
    <Pressable
      style={[
        styles.pickerItem,
        commonStyles.cardElevated,
        selectedWorkType === item && { backgroundColor: colors.primary }
      ]}
      onPress={() => {
        setSelectedWorkType(item);
        setShowWorkTypePicker(false);
      }}
    >
      <Text
        style={[
          commonStyles.bodyMedium,
          { color: colors.text },
          selectedWorkType === item && { color: 'white' }
        ]}
      >
        {item}
      </Text>
    </Pressable>
  );

  const renderAddWorkEntryModal = () => (
    <Modal visible={showAddWorkEntryModal} animationType="slide" presentationStyle="pageSheet">
      <BlurView intensity={100} style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={[commonStyles.heading3, { color: colors.text }]}>Add Work Entry</Text>
          <Pressable onPress={() => {
            setShowAddWorkEntryModal(false);
            resetWorkEntryForm();
          }}>
            <IconSymbol name="xmark" color={colors.text} size={24} />
          </Pressable>
        </View>
        <ScrollView style={styles.modalContent}>
          {/* Staff Selection */}
          <View style={styles.inputGroup}>
            <Text style={[commonStyles.bodyMedium, { color: colors.text }]}>Staff Member *</Text>
            <Pressable
              style={[commonStyles.input, styles.pickerButton]}
              onPress={() => setShowStaffPicker(true)}
            >
              <Text style={[commonStyles.bodyMedium, { 
                color: selectedStaffId ? colors.text : colors.textSecondary 
              }]}>
                {selectedStaffId ? staffList.find(s => s.id === selectedStaffId)?.name : 'Select staff member'}
              </Text>
              <IconSymbol name="chevron.down" color={colors.textSecondary} size={20} />
            </Pressable>
          </View>

          {/* Department Selection */}
          <View style={styles.inputGroup}>
            <Text style={[commonStyles.bodyMedium, { color: colors.text }]}>Department *</Text>
            <Pressable
              style={[commonStyles.input, styles.pickerButton]}
              onPress={() => setShowDepartmentPicker(true)}
            >
              <Text style={[commonStyles.bodyMedium, { 
                color: selectedDepartmentId ? colors.text : colors.textSecondary 
              }]}>
                {selectedDepartmentId ? departments.find(d => d.id === selectedDepartmentId)?.name : 'Select department'}
              </Text>
              <IconSymbol name="chevron.down" color={colors.textSecondary} size={20} />
            </Pressable>
          </View>

          {/* Work Type Selection */}
          <View style={styles.inputGroup}>
            <Text style={[commonStyles.bodyMedium, { color: colors.text }]}>Type of Work *</Text>
            <Pressable
              style={[commonStyles.input, styles.pickerButton]}
              onPress={() => setShowWorkTypePicker(true)}
            >
              <Text style={[commonStyles.bodyMedium, { 
                color: selectedWorkType ? colors.text : colors.textSecondary 
              }]}>
                {selectedWorkType || 'Select work type'}
              </Text>
              <IconSymbol name="chevron.down" color={colors.textSecondary} size={20} />
            </Pressable>
          </View>

          {/* Date Selection */}
          <View style={styles.inputGroup}>
            <Text style={[commonStyles.bodyMedium, { color: colors.text }]}>Date *</Text>
            <Pressable
              style={[commonStyles.input, styles.pickerButton]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={[commonStyles.bodyMedium, { color: colors.text }]}>
                {formatDate(workDate)}
              </Text>
              <IconSymbol name="calendar" color={colors.textSecondary} size={20} />
            </Pressable>
          </View>

          {/* Hours Input */}
          <View style={styles.inputGroup}>
            <Text style={[commonStyles.bodyMedium, { color: colors.text }]}>Hours *</Text>
            <TextInput
              style={[commonStyles.input, styles.input]}
              value={workHours}
              onChangeText={setWorkHours}
              placeholder="Enter work hours"
              keyboardType="numeric"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {/* Description Input */}
          <View style={styles.inputGroup}>
            <Text style={[commonStyles.bodyMedium, { color: colors.text }]}>Description</Text>
            <TextInput
              style={[commonStyles.input, styles.textArea]}
              value={workDescription}
              onChangeText={setWorkDescription}
              placeholder="Enter work description (optional)"
              multiline
              numberOfLines={4}
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <Pressable
            style={[styles.submitButton, { backgroundColor: colors.primary }]}
            onPress={addWorkEntry}
          >
            <Text style={[commonStyles.bodyMedium, { color: 'white' }]}>Add Work Entry</Text>
          </Pressable>
        </ScrollView>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={workDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
          />
        )}

        {/* Staff Picker Modal */}
        <Modal visible={showStaffPicker} animationType="slide" presentationStyle="pageSheet">
          <BlurView intensity={100} style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={[commonStyles.heading3, { color: colors.text }]}>Select Staff</Text>
              <Pressable onPress={() => setShowStaffPicker(false)}>
                <IconSymbol name="xmark" color={colors.text} size={24} />
              </Pressable>
            </View>
            <FlatList
              data={staffList.filter(s => s.status === 'active')}
              renderItem={renderStaffItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.pickerList}
            />
          </BlurView>
        </Modal>

        {/* Department Picker Modal */}
        <Modal visible={showDepartmentPicker} animationType="slide" presentationStyle="pageSheet">
          <BlurView intensity={100} style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={[commonStyles.heading3, { color: colors.text }]}>Select Department</Text>
              <Pressable onPress={() => setShowDepartmentPicker(false)}>
                <IconSymbol name="xmark" color={colors.text} size={24} />
              </Pressable>
            </View>
            <FlatList
              data={departments}
              renderItem={renderDepartmentItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.pickerList}
            />
          </BlurView>
        </Modal>

        {/* Work Type Picker Modal */}
        <Modal visible={showWorkTypePicker} animationType="slide" presentationStyle="pageSheet">
          <BlurView intensity={100} style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={[commonStyles.heading3, { color: colors.text }]}>Select Work Type</Text>
              <Pressable onPress={() => setShowWorkTypePicker(false)}>
                <IconSymbol name="xmark" color={colors.text} size={24} />
              </Pressable>
            </View>
            <FlatList
              data={WORK_TYPES}
              renderItem={renderWorkTypeItem}
              keyExtractor={(item) => item}
              contentContainerStyle={styles.pickerList}
            />
          </BlurView>
        </Modal>
      </BlurView>
    </Modal>
  );

  const renderEditWorkEntryModal = () => (
    <Modal visible={showEditWorkEntryModal} animationType="slide" presentationStyle="pageSheet">
      <BlurView intensity={100} style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={[commonStyles.heading3, { color: colors.text }]}>Edit Work Entry</Text>
          <Pressable onPress={() => {
            setShowEditWorkEntryModal(false);
            setEditingWorkEntry(null);
          }}>
            <IconSymbol name="xmark" color={colors.text} size={24} />
          </Pressable>
        </View>
        <ScrollView style={styles.modalContent}>
          {/* Staff Selection */}
          <View style={styles.inputGroup}>
            <Text style={[commonStyles.bodyMedium, { color: colors.text }]}>Staff Member *</Text>
            <Text style={[commonStyles.bodyMedium, { color: colors.textSecondary }]}>
              {staffList.find(s => s.id === editStaffId)?.name || 'Unknown Staff'}
            </Text>
          </View>

          {/* Department Selection */}
          <View style={styles.inputGroup}>
            <Text style={[commonStyles.bodyMedium, { color: colors.text }]}>Department *</Text>
            <Text style={[commonStyles.bodyMedium, { color: colors.textSecondary }]}>
              {departments.find(d => d.id === editDepartmentId)?.name || 'Unknown Department'}
            </Text>
          </View>

          {/* Work Type Selection */}
          <View style={styles.inputGroup}>
            <Text style={[commonStyles.bodyMedium, { color: colors.text }]}>Type of Work *</Text>
            <View style={styles.workTypeContainer}>
              {WORK_TYPES.map((type) => (
                <Pressable
                  key={type}
                  style={[
                    styles.workTypeOption,
                    commonStyles.cardElevated,
                    editWorkType === type && { backgroundColor: colors.primary }
                  ]}
                  onPress={() => setEditWorkType(type)}
                >
                  <Text
                    style={[
                      commonStyles.bodyMedium,
                      { color: colors.text },
                      editWorkType === type && { color: 'white' }
                    ]}
                  >
                    {type}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Date Selection */}
          <View style={styles.inputGroup}>
            <Text style={[commonStyles.bodyMedium, { color: colors.text }]}>Date *</Text>
            <Pressable
              style={[commonStyles.input, styles.pickerButton]}
              onPress={() => setShowEditDatePicker(true)}
            >
              <Text style={[commonStyles.bodyMedium, { color: colors.text }]}>
                {formatDate(editWorkDate)}
              </Text>
              <IconSymbol name="calendar" color={colors.textSecondary} size={20} />
            </Pressable>
          </View>

          {/* Hours Input */}
          <View style={styles.inputGroup}>
            <Text style={[commonStyles.bodyMedium, { color: colors.text }]}>Hours *</Text>
            <TextInput
              style={[commonStyles.input, styles.input]}
              value={editWorkHours}
              onChangeText={setEditWorkHours}
              placeholder="Enter work hours"
              keyboardType="numeric"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {/* Description Input */}
          <View style={styles.inputGroup}>
            <Text style={[commonStyles.bodyMedium, { color: colors.text }]}>Description</Text>
            <TextInput
              style={[commonStyles.input, styles.textArea]}
              value={editWorkDescription}
              onChangeText={setEditWorkDescription}
              placeholder="Enter work description (optional)"
              multiline
              numberOfLines={4}
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <Pressable
            style={[styles.submitButton, { backgroundColor: colors.primary }]}
            onPress={editWorkEntry}
          >
            <Text style={[commonStyles.bodyMedium, { color: 'white' }]}>Update Work Entry</Text>
          </Pressable>
        </ScrollView>

        {/* Edit Date Picker */}
        {showEditDatePicker && (
          <DateTimePicker
            value={editWorkDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleEditDateChange}
          />
        )}
      </BlurView>
    </Modal>
  );

  const renderAddStaffModal = () => (
    <Modal visible={showAddStaffModal} animationType="slide" presentationStyle="pageSheet">
      <BlurView intensity={100} style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={[commonStyles.heading3, { color: colors.text }]}>Add Staff Member</Text>
          <Pressable onPress={() => setShowAddStaffModal(false)}>
            <IconSymbol name="xmark" color={colors.text} size={24} />
          </Pressable>
        </View>
        <ScrollView style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={[commonStyles.bodyMedium, { color: colors.text }]}>Name</Text>
            <TextInput
              style={[commonStyles.input, styles.input]}
              value={newStaffName}
              onChangeText={setNewStaffName}
              placeholder="Enter staff name"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[commonStyles.bodyMedium, { color: colors.text }]}>Status</Text>
            <View style={styles.statusContainer}>
              <Pressable
                style={[
                  styles.statusOption,
                  commonStyles.cardElevated,
                  newStaffStatus === "active" && { backgroundColor: colors.success }
                ]}
                onPress={() => setNewStaffStatus("active")}
              >
                <Text
                  style={[
                    commonStyles.bodyMedium,
                    { color: colors.text },
                    newStaffStatus === "active" && { color: "white" }
                  ]}
                >
                  Active
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.statusOption,
                  commonStyles.cardElevated,
                  newStaffStatus === "inactive" && { backgroundColor: colors.error }
                ]}
                onPress={() => setNewStaffStatus("inactive")}
              >
                <Text
                  style={[
                    commonStyles.bodyMedium,
                    { color: colors.text },
                    newStaffStatus === "inactive" && { color: "white" }
                  ]}
                >
                  Inactive
                </Text>
              </Pressable>
            </View>
          </View>
          <Pressable
            style={[styles.submitButton, { backgroundColor: colors.primary }]}
            onPress={addStaff}
          >
            <Text style={[commonStyles.bodyMedium, { color: 'white' }]}>Add Staff Member</Text>
          </Pressable>
        </ScrollView>
      </BlurView>
    </Modal>
  );

  const renderEditStaffModal = () => (
    <Modal visible={showEditStaffModal} animationType="slide" presentationStyle="pageSheet">
      <BlurView intensity={100} style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={[commonStyles.heading3, { color: colors.text }]}>Edit Staff Member</Text>
          <Pressable onPress={() => setShowEditStaffModal(false)}>
            <IconSymbol name="xmark" color={colors.text} size={24} />
          </Pressable>
        </View>
        <ScrollView style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={[commonStyles.bodyMedium, { color: colors.text }]}>Name</Text>
            <TextInput
              style={[commonStyles.input, styles.input]}
              value={editStaffName}
              onChangeText={setEditStaffName}
              placeholder="Enter staff name"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[commonStyles.bodyMedium, { color: colors.text }]}>Status</Text>
            <View style={styles.statusContainer}>
              <Pressable
                style={[
                  styles.statusOption,
                  commonStyles.cardElevated,
                  editStaffStatus === "active" && { backgroundColor: colors.success }
                ]}
                onPress={() => setEditStaffStatus("active")}
              >
                <Text
                  style={[
                    commonStyles.bodyMedium,
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
                  commonStyles.cardElevated,
                  editStaffStatus === "inactive" && { backgroundColor: colors.error }
                ]}
                onPress={() => setEditStaffStatus("inactive")}
              >
                <Text
                  style={[
                    commonStyles.bodyMedium,
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
            <Text style={[commonStyles.bodyMedium, { color: 'white' }]}>Update Staff Member</Text>
          </Pressable>
        </ScrollView>
      </BlurView>
    </Modal>
  );

  const renderAddDepartmentModal = () => (
    <Modal visible={showAddDepartmentModal} animationType="slide" presentationStyle="pageSheet">
      <BlurView intensity={100} style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={[commonStyles.heading3, { color: colors.text }]}>Add Department</Text>
          <Pressable onPress={() => setShowAddDepartmentModal(false)}>
            <IconSymbol name="xmark" color={colors.text} size={24} />
          </Pressable>
        </View>
        <ScrollView style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={[commonStyles.bodyMedium, { color: colors.text }]}>Department Name</Text>
            <TextInput
              style={[commonStyles.input, styles.input]}
              value={newDepartmentName}
              onChangeText={setNewDepartmentName}
              placeholder="Enter department name"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[commonStyles.bodyMedium, { color: colors.text }]}>Description</Text>
            <TextInput
              style={[commonStyles.input, styles.textArea]}
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
            <Text style={[commonStyles.bodyMedium, { color: 'white' }]}>Add Department</Text>
          </Pressable>
        </ScrollView>
      </BlurView>
    </Modal>
  );

  const renderEditDepartmentModal = () => (
    <Modal visible={showEditDepartmentModal} animationType="slide" presentationStyle="pageSheet">
      <BlurView intensity={100} style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={[commonStyles.heading3, { color: colors.text }]}>Edit Department</Text>
          <Pressable onPress={() => setShowEditDepartmentModal(false)}>
            <IconSymbol name="xmark" color={colors.text} size={24} />
          </Pressable>
        </View>
        <ScrollView style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={[commonStyles.bodyMedium, { color: colors.text }]}>Department Name</Text>
            <TextInput
              style={[commonStyles.input, styles.input]}
              value={editDepartmentName}
              onChangeText={setEditDepartmentName}
              placeholder="Enter department name"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[commonStyles.caption, { color: colors.text }]}>Description</Text>
            <TextInput
              style={[commonStyles.input, styles.textArea]}
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
            <Text style={[commonStyles.bodyMedium, { color: 'white' }]}>Update Department</Text>
          </Pressable>
        </ScrollView>
      </BlurView>
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
        <LinearGradient
          colors={[colors.background, colors.backgroundSecondary]}
          style={styles.container}
        >
          <Animated.View 
            style={styles.loginContainer}
            entering={FadeInUp.springify()}
          >
            <View style={styles.loginHeader}>
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                style={styles.loginIcon}
              >
                <IconSymbol name="lock.fill" color="white" size={32} />
              </LinearGradient>
              <Text style={[commonStyles.heading2, styles.loginTitle]}>Admin Login</Text>
              <Text style={[commonStyles.body, styles.loginSubtitle]}>
                Enter your credentials to access the dashboard
              </Text>
            </View>
            
            <View style={styles.loginForm}>
              <View style={styles.inputGroup}>
                <Text style={[commonStyles.bodyMedium, { color: colors.text }]}>Username</Text>
                <TextInput
                  style={[commonStyles.input, styles.input]}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Enter username"
                  autoCapitalize="none"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[commonStyles.bodyMedium, { color: colors.text }]}>Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[commonStyles.input, styles.passwordInput]}
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
                <LinearGradient
                  colors={[colors.primary, '#6366F1']}
                  style={styles.loginButtonGradient}
                >
                  <Text style={[commonStyles.bodyMedium, { color: 'white' }]}>Login</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </Animated.View>
        </LinearGradient>
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
              <Text style={[commonStyles.bodyMedium, { color: colors.error }]}>Logout</Text>
            </Pressable>
          ),
        }}
      />
      <LinearGradient
        colors={[colors.background, colors.backgroundSecondary]}
        style={styles.container}
      >
        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 0 ? renderDashboardContent() : renderOverviewContent()}
        </View>

        {/* Custom Tab Bar */}
        <View style={styles.customTabBar}>
          <BlurView intensity={100} style={styles.tabBarContainer}>
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
                  commonStyles.captionMedium,
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
                  commonStyles.captionMedium,
                  { color: activeTab === 1 ? "white" : colors.text }
                ]}
              >
                Overview
              </Text>
            </Pressable>
          </BlurView>
        </View>

        {renderAddStaffModal()}
        {renderEditStaffModal()}
        {renderAddDepartmentModal()}
        {renderEditDepartmentModal()}
        {renderAddWorkEntryModal()}
        {renderEditWorkEntryModal()}
      </LinearGradient>
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
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingBottom: 120, // Add padding to account for tab bar
  },
  backButton: {
    padding: spacing.sm,
    marginLeft: -spacing.sm,
  },
  logoutButton: {
    padding: spacing.sm,
    marginRight: -spacing.sm,
  },
  
  // Login Styles
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  loginHeader: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  loginIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.lg,
  },
  loginTitle: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  loginSubtitle: {
    textAlign: 'center',
    color: colors.textSecondary,
  },
  loginForm: {
    gap: spacing.lg,
  },
  inputGroup: {
    gap: spacing.sm,
  },
  input: {
    ...shadows.sm,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
    ...shadows.sm,
  },
  passwordToggle: {
    position: 'absolute',
    right: spacing.md,
    top: spacing.md,
    padding: spacing.xs,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
    ...shadows.sm,
  },
  loginButton: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginTop: spacing.md,
    ...shadows.md,
  },
  loginButtonGradient: {
    padding: spacing.md,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  
  // Stats Styles
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  statGradient: {
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  statNumber: {
    fontSize: typography['2xl'],
    fontWeight: typography.bold,
    color: 'white',
    fontFamily: 'Inter_700Bold',
  },
  statLabel: {
    fontSize: typography.xs,
    color: 'white',
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
  },
  
  // Section Styles
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
    ...shadows.sm,
  },
  importButtonText: {
    color: 'white',
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    fontFamily: 'Inter_600SemiBold',
  },
  
  // Card Styles
  staffCard: {
    marginBottom: spacing.md,
  },
  departmentCard: {
    marginBottom: spacing.md,
  },
  workEntryCard: {
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  staffInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  staffAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  staffDetails: {
    flex: 1,
  },
  staffName: {
    marginBottom: spacing.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  departmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  departmentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  departmentDetails: {
    flex: 1,
  },
  departmentName: {
    marginBottom: spacing.xs,
  },
  departmentDescription: {
    lineHeight: 18,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  
  // Work Entry Card Styles
  workEntryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  workEntryInfo: {
    flex: 1,
  },
  workEntryDate: {
    marginBottom: spacing.xs,
  },
  workEntryDetails: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  hoursBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  workTypeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  workEntryDescription: {
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  workEntryActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalContent: {
    flex: 1,
    padding: spacing.lg,
  },
  submitButton: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
    minHeight: 48,
    ...shadows.sm,
  },
  statusContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statusOption: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  workTypeContainer: {
    gap: spacing.sm,
  },
  workTypeOption: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  
  // Picker Styles
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerList: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  pickerItem: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  
  // Custom Tab Bar Styles
  customTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
  },
  tabBarContainer: {
    flexDirection: 'row',
    borderRadius: borderRadius.xl,
    padding: spacing.sm,
    overflow: 'hidden',
    ...shadows.lg,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  
  // Overview Styles
  overviewHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  overviewIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.lg,
  },
  overviewTitle: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  overviewSubtitle: {
    textAlign: 'center',
    color: colors.textSecondary,
    maxWidth: 280,
  },
  filterSection: {
    marginBottom: spacing.xl,
  },
  monthPicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  overviewStatsSection: {
    marginBottom: spacing.xl,
  },
  overviewStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  overviewStatCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: spacing.lg,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  staffHoursSection: {
    marginBottom: spacing.xl,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.md,
  },
  emptyStateText: {
    textAlign: 'center',
    marginTop: spacing.md,
  },
  emptyStateSubtext: {
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  staffHoursList: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  staffHourCard: {
    padding: spacing.lg,
  },
  staffHourHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  staffHourAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  staffAvatarText: {
    color: 'white',
    fontSize: typography.lg,
    fontWeight: typography.bold,
    fontFamily: 'Inter_700Bold',
  },
  staffHourInfo: {
    flex: 1,
  },
  staffHourName: {
    marginBottom: spacing.xs,
  },
  staffHourProgress: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  staffHourProgressBar: {
    height: '100%',
    borderRadius: 3,
  },
  entriesSection: {
    marginBottom: spacing.xl,
  },
  entriesList: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  entryCard: {
    padding: spacing.lg,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  entryProject: {
    marginBottom: spacing.xs,
  },
  entryDescription: {
    lineHeight: 22,
  },
  yearSection: {
    marginBottom: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  monthButton: {
    flex: 1,
    minWidth: '45%',
    padding: spacing.md,
    alignItems: 'center',
  },
});
