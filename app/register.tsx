
import { Stack, router } from "expo-router";
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, Modal, FlatList } from "react-native";
import { IconSymbol } from "@/components/IconSymbol";
import { colors } from "@/styles/commonStyles";
import { supabase } from "@/app/integrations/supabase/client";
import { Tables } from "@/app/integrations/supabase/types";

type Staff = Tables<"staff">;
type Department = Tables<"departments">;

const WORK_TYPES = [
  "Regular class",
  "Shimsa", 
  "Events"
];

export default function RegisterWorkDay() {
  const [workHours, setWorkHours] = useState('');
  const [description, setDescription] = useState('');
  const [workType, setWorkType] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [departmentList, setDepartmentList] = useState<Department[]>([]);
  const [showStaffPicker, setShowStaffPicker] = useState(false);
  const [showDepartmentPicker, setShowDepartmentPicker] = useState(false);
  const [showWorkTypePicker, setShowWorkTypePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setStaffList(data || []);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from("departments")
        .select("*")
        .order("name");

      if (error) throw error;
      setDepartmentList(data || []);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleSubmit = async () => {
    const currentYear = new Date().getFullYear();
    const entryYear = new Date(date).getFullYear();

    if (!workHours || !workType || !selectedStaff || !selectedDepartment) {
      Alert.alert('Error', 'Please fill in all required fields: staff member, department, work hours, and type of work');
      return;
    }

    if (entryYear !== currentYear) {
      Alert.alert('Error', `Work entries can only be registered for the current year (${currentYear})`);
      return;
    }

    const hours = parseFloat(workHours);
    if (isNaN(hours) || hours <= 0 || hours > 24) {
      Alert.alert('Error', 'Please enter valid work hours (0-24)');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("work_entries")
        .insert([
          {
            staff_id: selectedStaff.id,
            department_id: selectedDepartment.id,
            date: date,
            hours: hours,
            work_type: workType,
            description: description || null,
          },
        ]);

      if (error) throw error;

      Alert.alert(
        'Success', 
        'Work day registered successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

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
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Staff Member *</Text>
              <Pressable
                style={[styles.input, { backgroundColor: colors.card }]}
                onPress={() => setShowStaffPicker(true)}
              >
                <Text style={[styles.inputText, { color: selectedStaff ? colors.text : colors.textSecondary }]}>
                  {selectedStaff ? selectedStaff.name : 'Select staff member'}
                </Text>
                <IconSymbol name="chevron.down" color={colors.textSecondary} size={20} />
              </Pressable>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Department *</Text>
              <Pressable
                style={[styles.input, { backgroundColor: colors.card }]}
                onPress={() => setShowDepartmentPicker(true)}
              >
                <Text style={[styles.inputText, { color: selectedDepartment ? colors.text : colors.textSecondary }]}>
                  {selectedDepartment ? selectedDepartment.name : 'Select department'}
                </Text>
                <IconSymbol name="chevron.down" color={colors.textSecondary} size={20} />
              </Pressable>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Date *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textSecondary}
              />
              <Text style={[styles.helperText, { color: colors.textSecondary }]}>
                Only current year ({new Date().getFullYear()}) entries are allowed
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Work Hours *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
                value={workHours}
                onChangeText={setWorkHours}
                placeholder="8.0"
                keyboardType="numeric"
                placeholderTextColor={colors.textSecondary}
              />
              <Text style={[styles.helperText, { color: colors.textSecondary }]}>
                Enter hours worked (0-24)
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Types of work *</Text>
              <Pressable
                style={[styles.input, { backgroundColor: colors.card }]}
                onPress={() => setShowWorkTypePicker(true)}
              >
                <Text style={[styles.inputText, { color: workType ? colors.text : colors.textSecondary }]}>
                  {workType || 'Select type of work'}
                </Text>
                <IconSymbol name="chevron.down" color={colors.textSecondary} size={20} />
              </Pressable>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Additional Description (Optional)</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: colors.card, color: colors.text }]}
                value={description}
                onChangeText={setDescription}
                placeholder="Add any additional details about your work..."
                multiline
                numberOfLines={4}
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <Pressable
              style={[
                styles.submitButton, 
                { 
                  backgroundColor: isSubmitting ? colors.textSecondary : colors.primary,
                  opacity: isSubmitting ? 0.7 : 1
                }
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Registering...' : 'Register Work Day'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>

        {/* Staff Picker Modal */}
        <Modal visible={showStaffPicker} animationType="slide" presentationStyle="pageSheet">
          <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select Staff Member</Text>
              <Pressable onPress={() => setShowStaffPicker(false)}>
                <IconSymbol name="xmark" color={colors.text} size={24} />
              </Pressable>
            </View>
            <FlatList
              data={staffList}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  style={[
                    styles.staffItem,
                    { backgroundColor: colors.card },
                    selectedStaff?.id === item.id && { backgroundColor: colors.primary }
                  ]}
                  onPress={() => {
                    setSelectedStaff(item);
                    setShowStaffPicker(false);
                  }}
                >
                  <View style={[styles.staffAvatar, { backgroundColor: colors.secondary }]}>
                    <Text style={styles.staffAvatarText}>
                      {item.name?.charAt(0).toUpperCase() || 'S'}
                    </Text>
                  </View>
                  <View style={styles.staffInfo}>
                    <Text
                      style={[
                        styles.staffName,
                        { color: selectedStaff?.id === item.id ? 'white' : colors.text }
                      ]}
                    >
                      {item.name}
                    </Text>
                    <Text
                      style={[
                        styles.staffEmail,
                        { color: selectedStaff?.id === item.id ? 'rgba(255,255,255,0.8)' : colors.textSecondary }
                      ]}
                    >
                      {item.email}
                    </Text>
                  </View>
                  {selectedStaff?.id === item.id && (
                    <IconSymbol name="checkmark" color="white" size={20} />
                  )}
                </Pressable>
              )}
              contentContainerStyle={styles.staffList}
            />
          </View>
        </Modal>

        {/* Department Picker Modal */}
        <Modal visible={showDepartmentPicker} animationType="slide" presentationStyle="pageSheet">
          <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select Department</Text>
              <Pressable onPress={() => setShowDepartmentPicker(false)}>
                <IconSymbol name="xmark" color={colors.text} size={24} />
              </Pressable>
            </View>
            <FlatList
              data={departmentList}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  style={[
                    styles.departmentItem,
                    { backgroundColor: colors.card },
                    selectedDepartment?.id === item.id && { backgroundColor: colors.primary }
                  ]}
                  onPress={() => {
                    setSelectedDepartment(item);
                    setShowDepartmentPicker(false);
                  }}
                >
                  <View style={[styles.departmentIcon, { backgroundColor: colors.secondary }]}>
                    <IconSymbol 
                      name="building.2" 
                      color="white" 
                      size={20} 
                    />
                  </View>
                  <View style={styles.departmentInfo}>
                    <Text
                      style={[
                        styles.departmentName,
                        { color: selectedDepartment?.id === item.id ? 'white' : colors.text }
                      ]}
                    >
                      {item.name}
                    </Text>
                    {item.description && (
                      <Text
                        style={[
                          styles.departmentDescription,
                          { color: selectedDepartment?.id === item.id ? 'rgba(255,255,255,0.8)' : colors.textSecondary }
                        ]}
                      >
                        {item.description}
                      </Text>
                    )}
                  </View>
                  {selectedDepartment?.id === item.id && (
                    <IconSymbol name="checkmark" color="white" size={20} />
                  )}
                </Pressable>
              )}
              contentContainerStyle={styles.departmentList}
            />
          </View>
        </Modal>

        {/* Work Type Picker Modal */}
        <Modal visible={showWorkTypePicker} animationType="slide" presentationStyle="pageSheet">
          <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select Type of Work</Text>
              <Pressable onPress={() => setShowWorkTypePicker(false)}>
                <IconSymbol name="xmark" color={colors.text} size={24} />
              </Pressable>
            </View>
            <FlatList
              data={WORK_TYPES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable
                  style={[
                    styles.workTypeItem,
                    { backgroundColor: colors.card },
                    workType === item && { backgroundColor: colors.primary }
                  ]}
                  onPress={() => {
                    setWorkType(item);
                    setShowWorkTypePicker(false);
                  }}
                >
                  <View style={[styles.workTypeIcon, { backgroundColor: colors.secondary }]}>
                    <IconSymbol 
                      name={item === 'Regular class' ? 'book' : item === 'Shimsa' ? 'checkmark.circle' : 'calendar'} 
                      color="white" 
                      size={20} 
                    />
                  </View>
                  <Text
                    style={[
                      styles.workTypeName,
                      { color: workType === item ? 'white' : colors.text }
                    ]}
                  >
                    {item}
                  </Text>
                  {workType === item && (
                    <IconSymbol name="checkmark" color="white" size={20} />
                  )}
                </Pressable>
              )}
              contentContainerStyle={styles.workTypeList}
            />
          </View>
        </Modal>
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
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  form: {
    flex: 1,
    justifyContent: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputText: {
    fontSize: 16,
    flex: 1,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
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
  staffList: {
    padding: 16,
  },
  staffItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  staffAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  staffAvatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  staffEmail: {
    fontSize: 14,
  },
  departmentList: {
    padding: 16,
  },
  departmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  departmentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  departmentInfo: {
    flex: 1,
  },
  departmentName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  departmentDescription: {
    fontSize: 14,
  },
  workTypeList: {
    padding: 16,
  },
  workTypeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  workTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  workTypeName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
});
