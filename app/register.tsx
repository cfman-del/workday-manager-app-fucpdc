
import { Tables } from "@/app/integrations/supabase/types";
import React, { useState, useEffect } from "react";
import { colors, spacing, borderRadius, shadows, typography, commonStyles } from "@/styles/commonStyles";
import { supabase } from "@/app/integrations/supabase/client";
import { IconSymbol } from "@/components/IconSymbol";
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, Modal, FlatList, Platform } from "react-native";
import { Stack, router } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import DateTimePicker from '@react-native-community/datetimepicker';

type Staff = Tables<"staff">;
type Department = Tables<"departments">;

const WORK_TYPES = [
  "Regular class",
  "Shimsa",
  "Event"
];

export default function RegisterWorkDay() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [selectedWorkType, setSelectedWorkType] = useState<string>("");
  const [hours, setHours] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [showWorkTypeModal, setShowWorkTypeModal] = useState(false);

  useEffect(() => {
    fetchStaff();
    fetchDepartments();
  }, []);

  const fetchStaff = async () => {
    try {
      const { data, error } = await supabase
        .from("staff")
        .select("*")
        .eq("status", "active");

      if (error) throw error;
      
      // Sort staff list alphabetically by name
      const sortedStaff = (data || []).sort((a, b) => {
        const nameA = a.name?.toLowerCase() || '';
        const nameB = b.name?.toLowerCase() || '';
        return nameA.localeCompare(nameB);
      });
      
      console.log("Staff list sorted alphabetically:", sortedStaff.map(staff => staff.name));
      setStaffList(sortedStaff);
    } catch (error: any) {
      console.log("Error fetching staff:", error);
      Alert.alert("Error", error.message);
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from("departments")
        .select("*");

      if (error) throw error;
      setDepartments(data || []);
    } catch (error: any) {
      console.log("Error fetching departments:", error);
      Alert.alert("Error", error.message);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    console.log("Date picker event:", event.type, selectedDate);
    
    // On Android, the picker is dismissed automatically
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    // Handle the selected date
    if (event.type === 'set' && selectedDate) {
      setDate(selectedDate);
      console.log("Date updated to:", selectedDate.toLocaleDateString());
    } else if (event.type === 'dismissed') {
      console.log("Date picker was dismissed");
    }
    
    // On iOS, we need to manually close the picker when done
    if (Platform.OS === 'ios' && event.type === 'set') {
      setShowDatePicker(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedStaff || !selectedDepartment || !selectedWorkType || !hours) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    const hoursFloat = parseFloat(hours);
    if (isNaN(hoursFloat) || hoursFloat <= 0) {
      Alert.alert("Error", "Please enter a valid number of hours");
      return;
    }

    if (hoursFloat > 24) {
      Alert.alert("Error", "Hours cannot exceed 24 per day");
      return;
    }

    try {
      // Format date as YYYY-MM-DD for database
      const formattedDate = date.toISOString().split('T')[0];
      console.log("Submitting work entry:", {
        staff_id: selectedStaff.id,
        department_id: selectedDepartment.id,
        date: formattedDate,
        hours: hoursFloat,
        work_type: selectedWorkType,
      });

      const { error } = await supabase
        .from("work_entries")
        .insert([
          {
            staff_id: selectedStaff.id,
            department_id: selectedDepartment.id,
            date: formattedDate,
            hours: hoursFloat,
            work_type: selectedWorkType,
          },
        ]);

      if (error) throw error;

      Alert.alert("Success", "Work day registered successfully!", [
        {
          text: "OK",
          onPress: () => {
            // Reset form
            setSelectedStaff(null);
            setSelectedDepartment(null);
            setSelectedWorkType("");
            setHours("");
            setDate(new Date());
          },
        },
      ]);
    } catch (error: any) {
      console.log("Error submitting work entry:", error);
      Alert.alert("Error", error.message);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStaffItem = ({ item, index }: { item: Staff; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 50).springify()}
    >
      <Pressable
        style={[styles.modalItem, commonStyles.cardElevated]}
        onPress={() => {
          setSelectedStaff(item);
          setShowStaffModal(false);
        }}
      >
        <View style={[styles.staffAvatar, { backgroundColor: colors.primary + '20' }]}>
          <Text style={[commonStyles.bodyMedium, { color: colors.primary }]}>
            {item.name?.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={[commonStyles.bodyMedium, { color: colors.text }]}>{item.name}</Text>
        {selectedStaff?.id === item.id && (
          <IconSymbol name="checkmark.circle.fill" color={colors.success} size={24} />
        )}
      </Pressable>
    </Animated.View>
  );

  const renderDepartmentItem = ({ item, index }: { item: Department; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 50).springify()}
    >
      <Pressable
        style={[styles.modalItem, commonStyles.cardElevated]}
        onPress={() => {
          setSelectedDepartment(item);
          setShowDepartmentModal(false);
        }}
      >
        <View style={[styles.departmentIcon, { backgroundColor: colors.secondary + '20' }]}>
          <IconSymbol name="building.2" color={colors.secondary} size={20} />
        </View>
        <View style={styles.departmentInfo}>
          <Text style={[commonStyles.bodyMedium, { color: colors.text }]}>{item.name}</Text>
          <Text style={[commonStyles.caption, { color: colors.textSecondary }]}>{item.description}</Text>
        </View>
        {selectedDepartment?.id === item.id && (
          <IconSymbol name="checkmark.circle.fill" color={colors.success} size={24} />
        )}
      </Pressable>
    </Animated.View>
  );

  const renderWorkTypeItem = ({ item, index }: { item: string; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 30).springify()}
    >
      <Pressable
        style={[styles.workTypeItem, commonStyles.cardElevated]}
        onPress={() => {
          setSelectedWorkType(item);
          setShowWorkTypeModal(false);
        }}
      >
        <View style={[styles.workTypeIcon, { backgroundColor: colors.accent + '20' }]}>
          <IconSymbol name="briefcase" color={colors.accent} size={20} />
        </View>
        <Text style={[commonStyles.bodyMedium, { color: colors.text }]}>{item}</Text>
        {selectedWorkType === item && (
          <IconSymbol name="checkmark.circle.fill" color={colors.success} size={24} />
        )}
      </Pressable>
    </Animated.View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "Register Work Day",
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
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View 
            style={styles.header}
            entering={FadeInUp.springify()}
          >
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              style={styles.headerIcon}
            >
              <IconSymbol name="calendar.badge.plus" color="white" size={32} />
            </LinearGradient>
            <Text style={[commonStyles.heading2, styles.title]}>Register Work Day</Text>
            <Text style={[commonStyles.body, styles.subtitle]}>
              Log your daily work activities and track your progress
            </Text>
          </Animated.View>

          <View style={styles.form}>
            {/* Staff Selection */}
            <Animated.View 
              style={styles.inputGroup}
              entering={FadeInDown.delay(100).springify()}
            >
              <Text style={[commonStyles.bodyMedium, styles.label]}>Staff Member *</Text>
              <Pressable
                style={[styles.selector, commonStyles.cardElevated]}
                onPress={() => setShowStaffModal(true)}
              >
                {selectedStaff ? (
                  <View style={styles.selectedItem}>
                    <View style={[styles.staffAvatar, { backgroundColor: colors.primary + '20' }]}>
                      <Text style={[commonStyles.captionMedium, { color: colors.primary }]}>
                        {selectedStaff.name?.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <Text style={[commonStyles.bodyMedium, { color: colors.text }]}>
                      {selectedStaff.name}
                    </Text>
                  </View>
                ) : (
                  <Text style={[commonStyles.body, { color: colors.textSecondary }]}>
                    Select staff member
                  </Text>
                )}
                <IconSymbol name="chevron.down" color={colors.textSecondary} size={20} />
              </Pressable>
            </Animated.View>

            {/* Department Selection */}
            <Animated.View 
              style={styles.inputGroup}
              entering={FadeInDown.delay(200).springify()}
            >
              <Text style={[commonStyles.bodyMedium, styles.label]}>Department *</Text>
              <Pressable
                style={[styles.selector, commonStyles.cardElevated]}
                onPress={() => setShowDepartmentModal(true)}
              >
                {selectedDepartment ? (
                  <View style={styles.selectedItem}>
                    <View style={[styles.departmentIcon, { backgroundColor: colors.secondary + '20' }]}>
                      <IconSymbol name="building.2" color={colors.secondary} size={16} />
                    </View>
                    <Text style={[commonStyles.bodyMedium, { color: colors.text }]}>
                      {selectedDepartment.name}
                    </Text>
                  </View>
                ) : (
                  <Text style={[commonStyles.body, { color: colors.textSecondary }]}>
                    Select department
                  </Text>
                )}
                <IconSymbol name="chevron.down" color={colors.textSecondary} size={20} />
              </Pressable>
            </Animated.View>

            {/* Work Type Selection */}
            <Animated.View 
              style={styles.inputGroup}
              entering={FadeInDown.delay(300).springify()}
            >
              <Text style={[commonStyles.bodyMedium, styles.label]}>Type of Work *</Text>
              <Pressable
                style={[styles.selector, commonStyles.cardElevated]}
                onPress={() => setShowWorkTypeModal(true)}
              >
                {selectedWorkType ? (
                  <View style={styles.selectedItem}>
                    <View style={[styles.workTypeIcon, { backgroundColor: colors.accent + '20' }]}>
                      <IconSymbol name="briefcase" color={colors.accent} size={16} />
                    </View>
                    <Text style={[commonStyles.bodyMedium, { color: colors.text }]}>
                      {selectedWorkType}
                    </Text>
                  </View>
                ) : (
                  <Text style={[commonStyles.body, { color: colors.textSecondary }]}>
                    Select work type
                  </Text>
                )}
                <IconSymbol name="chevron.down" color={colors.textSecondary} size={20} />
              </Pressable>
            </Animated.View>

            {/* Date Selection */}
            <Animated.View 
              style={styles.inputGroup}
              entering={FadeInDown.delay(400).springify()}
            >
              <Text style={[commonStyles.bodyMedium, styles.label]}>Date *</Text>
              <Pressable
                style={[styles.selector, commonStyles.cardElevated]}
                onPress={() => {
                  console.log("Opening date picker");
                  setShowDatePicker(true);
                }}
              >
                <View style={styles.selectedItem}>
                  <View style={[styles.dateIcon, { backgroundColor: colors.primary + '20' }]}>
                    <IconSymbol name="calendar" color={colors.primary} size={16} />
                  </View>
                  <Text style={[commonStyles.bodyMedium, { color: colors.text }]}>
                    {formatDate(date)}
                  </Text>
                </View>
                <IconSymbol name="chevron.down" color={colors.textSecondary} size={20} />
              </Pressable>
            </Animated.View>

            {/* Hours Input */}
            <Animated.View 
              style={styles.inputGroup}
              entering={FadeInDown.delay(500).springify()}
            >
              <Text style={[commonStyles.bodyMedium, styles.label]}>Hours Worked *</Text>
              <View style={[styles.hoursInputContainer, commonStyles.cardElevated]}>
                <View style={[styles.hoursIcon, { backgroundColor: colors.accent + '20' }]}>
                  <IconSymbol name="clock" color={colors.accent} size={16} />
                </View>
                <TextInput
                  style={[commonStyles.body, styles.hoursInput]}
                  value={hours}
                  onChangeText={setHours}
                  placeholder="0.0"
                  keyboardType="numeric"
                  placeholderTextColor={colors.textSecondary}
                />
                <Text style={[commonStyles.caption, { color: colors.textSecondary }]}>hours</Text>
              </View>
            </Animated.View>

            {/* Submit Button */}
            <Animated.View 
              entering={FadeInDown.delay(600).springify()}
            >
              <Pressable
                style={[styles.submitButton, { opacity: selectedStaff && selectedDepartment && selectedWorkType && hours ? 1 : 0.6 }]}
                onPress={handleSubmit}
                disabled={!selectedStaff || !selectedDepartment || !selectedWorkType || !hours}
              >
                <LinearGradient
                  colors={[colors.primary, colors.secondary]}
                  style={styles.submitGradient}
                >
                  <IconSymbol name="checkmark.circle.fill" color="white" size={20} />
                  <Text style={[commonStyles.bodyMedium, { color: 'white' }]}>Register Work Day</Text>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          </View>
        </ScrollView>

        {/* Date Picker - Platform specific rendering */}
        {showDatePicker && (
          <>
            {Platform.OS === 'ios' ? (
              <Modal
                visible={showDatePicker}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowDatePicker(false)}
              >
                <BlurView intensity={100} style={styles.datePickerModal}>
                  <View style={styles.datePickerHeader}>
                    <Pressable onPress={() => setShowDatePicker(false)}>
                      <Text style={[commonStyles.bodyMedium, { color: colors.primary }]}>Cancel</Text>
                    </Pressable>
                    <Text style={[commonStyles.heading3, { color: colors.text }]}>Select Date</Text>
                    <Pressable onPress={() => setShowDatePicker(false)}>
                      <Text style={[commonStyles.bodyMedium, { color: colors.primary }]}>Done</Text>
                    </Pressable>
                  </View>
                  <View style={styles.datePickerContainer}>
                    <DateTimePicker
                      value={date}
                      mode="date"
                      display="spinner"
                      onChange={handleDateChange}
                      maximumDate={new Date()}
                      style={styles.datePicker}
                    />
                  </View>
                </BlurView>
              </Modal>
            ) : (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}
          </>
        )}

        {/* Staff Modal */}
        <Modal visible={showStaffModal} animationType="slide" presentationStyle="pageSheet">
          <BlurView intensity={100} style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={[commonStyles.heading3, { color: colors.text }]}>Select Staff Member</Text>
              <Pressable onPress={() => setShowStaffModal(false)}>
                <IconSymbol name="xmark" color={colors.text} size={24} />
              </Pressable>
            </View>
            <FlatList
              data={staffList}
              renderItem={renderStaffItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.modalContent}
              showsVerticalScrollIndicator={false}
            />
          </BlurView>
        </Modal>

        {/* Department Modal */}
        <Modal visible={showDepartmentModal} animationType="slide" presentationStyle="pageSheet">
          <BlurView intensity={100} style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={[commonStyles.heading3, { color: colors.text }]}>Select Department</Text>
              <Pressable onPress={() => setShowDepartmentModal(false)}>
                <IconSymbol name="xmark" color={colors.text} size={24} />
              </Pressable>
            </View>
            <FlatList
              data={departments}
              renderItem={renderDepartmentItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.modalContent}
              showsVerticalScrollIndicator={false}
            />
          </BlurView>
        </Modal>

        {/* Work Type Modal */}
        <Modal visible={showWorkTypeModal} animationType="slide" presentationStyle="pageSheet">
          <BlurView intensity={100} style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={[commonStyles.heading3, { color: colors.text }]}>Select Work Type</Text>
              <Pressable onPress={() => setShowWorkTypeModal(false)}>
                <IconSymbol name="xmark" color={colors.text} size={24} />
              </Pressable>
            </View>
            <FlatList
              data={WORK_TYPES}
              renderItem={renderWorkTypeItem}
              keyExtractor={(item) => item}
              contentContainerStyle={styles.modalContent}
              showsVerticalScrollIndicator={false}
            />
          </BlurView>
        </Modal>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  backButton: {
    padding: spacing.sm,
    marginLeft: -spacing.sm,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.lg,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
    color: colors.textSecondary,
    maxWidth: 280,
  },
  form: {
    gap: spacing.lg,
  },
  inputGroup: {
    gap: spacing.sm,
  },
  label: {
    color: colors.text,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    minHeight: 56,
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  staffAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  departmentIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  workTypeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hoursInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  hoursIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hoursInput: {
    flex: 1,
    color: colors.text,
    textAlign: 'center',
  },
  submitButton: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginTop: spacing.lg,
    ...shadows.md,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
    minHeight: 56,
  },
  
  // Date Picker Styles
  datePickerModal: {
    flex: 1,
    backgroundColor: colors.background,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  datePickerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePicker: {
    width: '100%',
    height: 200,
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
    padding: spacing.md,
    gap: spacing.sm,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  departmentInfo: {
    flex: 1,
  },
  workTypeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
});
