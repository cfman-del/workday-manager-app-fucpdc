
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, FlatList, Modal } from "react-native";
import { Stack, router } from "expo-router";
import { IconSymbol } from "@/components/IconSymbol";
import { colors } from "@/styles/commonStyles";
import { supabase } from "@/app/integrations/supabase/client";
import { Tables, TablesInsert } from "@/app/integrations/supabase/types";

type Staff = Tables<'staff'> & {
  departments?: Tables<'departments'> | null;
};

type Department = Tables<'departments'>;

export default function AdminDashboard() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSecureEntry, setIsSecureEntry] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showAddDepartmentModal, setShowAddDepartmentModal] = useState(false);
  const [showEditStaffModal, setShowEditStaffModal] = useState(false);
  const [showEditDepartmentModal, setShowEditDepartmentModal] = useState(false);
  
  // Edit states
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  
  // Form states
  const [newStaff, setNewStaff] = useState({
    name: '',
    position: '',
    email: '',
    phone: '',
    department_id: '',
    status: 'active' as 'active' | 'inactive'
  });
  
  const [newDepartment, setNewDepartment] = useState({
    name: '',
    description: ''
  });

  const [editStaffForm, setEditStaffForm] = useState({
    name: '',
    position: '',
    email: '',
    phone: '',
    department_id: '',
    status: 'active' as 'active' | 'inactive'
  });

  const [editDepartmentForm, setEditDepartmentForm] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    }
  }, [isLoggedIn]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch staff with department information
      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select(`
          *,
          departments (
            id,
            name,
            description
          )
        `)
        .order('name');

      if (staffError) {
        console.error('Error fetching staff:', staffError);
        Alert.alert('Error', 'Failed to fetch staff data');
      } else {
        setStaff(staffData || []);
      }

      // Fetch departments
      const { data: departmentsData, error: departmentsError } = await supabase
        .from('departments')
        .select('*')
        .order('name');

      if (departmentsError) {
        console.error('Error fetching departments:', departmentsError);
        Alert.alert('Error', 'Failed to fetch departments data');
      } else {
        setDepartments(departmentsData || []);
      }
    } catch (error) {
      console.error('Error in fetchData:', error);
      Alert.alert('Error', 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    if (!username || !password) {
      Alert.alert("Error", "Please enter both username and password");
      return;
    }
    
    console.log("Admin login attempt:", { username });
    
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
            setStaff([]);
            setDepartments([]);
            console.log("Admin logged out");
          }
        }
      ]
    );
  };

  const togglePasswordVisibility = () => {
    setIsSecureEntry(!isSecureEntry);
  };

  const addStaff = async () => {
    if (!newStaff.name || !newStaff.position || !newStaff.email) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const staffToInsert: TablesInsert<'staff'> = {
        name: newStaff.name,
        position: newStaff.position,
        email: newStaff.email,
        phone: newStaff.phone || null,
        department_id: newStaff.department_id || null,
        status: newStaff.status,
      };

      const { error } = await supabase
        .from('staff')
        .insert([staffToInsert]);

      if (error) {
        console.error('Error adding staff:', error);
        Alert.alert('Error', 'Failed to add staff member');
      } else {
        Alert.alert('Success', 'Staff member added successfully');
        setShowAddStaffModal(false);
        setNewStaff({
          name: '',
          position: '',
          email: '',
          phone: '',
          department_id: '',
          status: 'active'
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error in addStaff:', error);
      Alert.alert('Error', 'Failed to add staff member');
    }
  };

  const editStaff = async () => {
    if (!editingStaff || !editStaffForm.name || !editStaffForm.position || !editStaffForm.email) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('staff')
        .update({
          name: editStaffForm.name,
          position: editStaffForm.position,
          email: editStaffForm.email,
          phone: editStaffForm.phone || null,
          department_id: editStaffForm.department_id || null,
          status: editStaffForm.status,
        })
        .eq('id', editingStaff.id);

      if (error) {
        console.error('Error updating staff:', error);
        Alert.alert('Error', 'Failed to update staff member');
      } else {
        Alert.alert('Success', 'Staff member updated successfully');
        setShowEditStaffModal(false);
        setEditingStaff(null);
        fetchData();
      }
    } catch (error) {
      console.error('Error in editStaff:', error);
      Alert.alert('Error', 'Failed to update staff member');
    }
  };

  const openEditStaffModal = (staffMember: Staff) => {
    console.log('Opening edit modal for staff:', staffMember.name);
    setEditingStaff(staffMember);
    setEditStaffForm({
      name: staffMember.name,
      position: staffMember.position,
      email: staffMember.email,
      phone: staffMember.phone || '',
      department_id: staffMember.department_id || '',
      status: staffMember.status || 'active'
    });
    setShowEditStaffModal(true);
  };

  const removeStaff = async (staffId: string, staffName: string) => {
    console.log('removeStaff function called with:', { staffId, staffName });
    Alert.alert(
      'Remove Staff',
      `Are you sure you want to remove ${staffName}?`,
      [
        { 
          text: 'Cancel', 
          style: 'cancel',
          onPress: () => console.log('Staff removal cancelled')
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            console.log('Attempting to remove staff:', staffName);
            try {
              const { error } = await supabase
                .from('staff')
                .delete()
                .eq('id', staffId);

              if (error) {
                console.error('Error removing staff:', error);
                Alert.alert('Error', 'Failed to remove staff member');
              } else {
                console.log('Staff member removed successfully:', staffName);
                Alert.alert('Success', 'Staff member removed successfully');
                fetchData();
              }
            } catch (error) {
              console.error('Error in removeStaff:', error);
              Alert.alert('Error', 'Failed to remove staff member');
            }
          }
        }
      ]
    );
  };

  const addDepartment = async () => {
    if (!newDepartment.name) {
      Alert.alert('Error', 'Please enter a department name');
      return;
    }

    try {
      const departmentToInsert: TablesInsert<'departments'> = {
        name: newDepartment.name,
        description: newDepartment.description || null,
      };

      const { error } = await supabase
        .from('departments')
        .insert([departmentToInsert]);

      if (error) {
        console.error('Error adding department:', error);
        Alert.alert('Error', 'Failed to add department');
      } else {
        Alert.alert('Success', 'Department added successfully');
        setShowAddDepartmentModal(false);
        setNewDepartment({ name: '', description: '' });
        fetchData();
      }
    } catch (error) {
      console.error('Error in addDepartment:', error);
      Alert.alert('Error', 'Failed to add department');
    }
  };

  const editDepartment = async () => {
    if (!editingDepartment || !editDepartmentForm.name) {
      Alert.alert('Error', 'Please enter a department name');
      return;
    }

    try {
      const { error } = await supabase
        .from('departments')
        .update({
          name: editDepartmentForm.name,
          description: editDepartmentForm.description || null,
        })
        .eq('id', editingDepartment.id);

      if (error) {
        console.error('Error updating department:', error);
        Alert.alert('Error', 'Failed to update department');
      } else {
        Alert.alert('Success', 'Department updated successfully');
        setShowEditDepartmentModal(false);
        setEditingDepartment(null);
        fetchData();
      }
    } catch (error) {
      console.error('Error in editDepartment:', error);
      Alert.alert('Error', 'Failed to update department');
    }
  };

  const openEditDepartmentModal = (department: Department) => {
    console.log('Opening edit modal for department:', department.name);
    setEditingDepartment(department);
    setEditDepartmentForm({
      name: department.name,
      description: department.description || ''
    });
    setShowEditDepartmentModal(true);
  };

  const removeDepartment = async (departmentId: string, departmentName: string) => {
    console.log('removeDepartment function called with:', { departmentId, departmentName });
    Alert.alert(
      'Remove Department',
      `Are you sure you want to remove ${departmentName}? This will unassign all staff from this department.`,
      [
        { 
          text: 'Cancel', 
          style: 'cancel',
          onPress: () => console.log('Department removal cancelled')
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            console.log('Attempting to remove department:', departmentName);
            try {
              const { error } = await supabase
                .from('departments')
                .delete()
                .eq('id', departmentId);

              if (error) {
                console.error('Error removing department:', error);
                Alert.alert('Error', 'Failed to remove department');
              } else {
                console.log('Department removed successfully:', departmentName);
                Alert.alert('Success', 'Department removed successfully');
                fetchData();
              }
            } catch (error) {
              console.error('Error in removeDepartment:', error);
              Alert.alert('Error', 'Failed to remove department');
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? colors.primary : colors.textSecondary;
  };

  const renderStaffCard = ({ item }: { item: Staff }) => (
    <View style={[styles.staffCard, { backgroundColor: colors.card }]}>
      <View style={styles.staffHeader}>
        <View style={[styles.avatarContainer, { backgroundColor: colors.secondary + '20' }]}>
          <IconSymbol name={item.avatar || 'person.circle.fill'} color={colors.primary} size={32} />
        </View>
        <View style={styles.staffInfo}>
          <Text style={[styles.staffName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.staffPosition, { color: colors.textSecondary }]}>{item.position}</Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status || 'active') }]} />
            <Text style={[styles.statusText, { color: getStatusColor(item.status || 'active') }]}>
              {(item.status || 'active').charAt(0).toUpperCase() + (item.status || 'active').slice(1)}
            </Text>
          </View>
        </View>
        <View style={styles.actionButtons}>
          <Pressable
            style={({ pressed }) => [
              styles.editButton, 
              { 
                backgroundColor: pressed ? colors.primary + '40' : colors.primary + '20',
                opacity: pressed ? 0.8 : 1
              }
            ]}
            onPress={() => {
              console.log('Edit icon pressed for staff:', item.name);
              openEditStaffModal(item);
            }}
            accessibilityLabel={`Edit ${item.name}`}
            accessibilityRole="button"
          >
            <IconSymbol name="pencil" color={colors.primary} size={20} />
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.removeButton, 
              { 
                backgroundColor: pressed ? colors.accent + '40' : colors.accent + '20',
                opacity: pressed ? 0.8 : 1
              }
            ]}
            onPress={() => {
              console.log('Trash icon pressed for staff:', item.name);
              removeStaff(item.id, item.name);
            }}
            accessibilityLabel={`Remove ${item.name}`}
            accessibilityRole="button"
          >
            <IconSymbol name="trash" color={colors.accent} size={20} />
          </Pressable>
        </View>
      </View>
      
      <View style={styles.staffDetails}>
        <View style={styles.detailRow}>
          <IconSymbol name="building.2.fill" color={colors.textSecondary} size={16} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>
            {item.departments?.name || 'No Department'}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <IconSymbol name="envelope.fill" color={colors.textSecondary} size={16} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>{item.email}</Text>
        </View>
        {item.phone && (
          <View style={styles.detailRow}>
            <IconSymbol name="phone.fill" color={colors.textSecondary} size={16} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>{item.phone}</Text>
          </View>
        )}
        <View style={styles.detailRow}>
          <IconSymbol name="calendar" color={colors.textSecondary} size={16} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>
            Joined: {item.join_date ? new Date(item.join_date).toLocaleDateString() : 'N/A'}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderDepartmentCard = ({ item }: { item: Department }) => (
    <View style={[styles.departmentCard, { backgroundColor: colors.card }]}>
      <View style={styles.departmentHeader}>
        <View style={styles.departmentInfo}>
          <Text style={[styles.departmentName, { color: colors.text }]}>{item.name}</Text>
          {item.description && (
            <Text style={[styles.departmentDescription, { color: colors.textSecondary }]}>
              {item.description}
            </Text>
          )}
        </View>
        <View style={styles.actionButtons}>
          <Pressable
            style={({ pressed }) => [
              styles.editButton, 
              { 
                backgroundColor: pressed ? colors.primary + '40' : colors.primary + '20',
                opacity: pressed ? 0.8 : 1
              }
            ]}
            onPress={() => {
              console.log('Edit icon pressed for department:', item.name);
              openEditDepartmentModal(item);
            }}
            accessibilityLabel={`Edit ${item.name} department`}
            accessibilityRole="button"
          >
            <IconSymbol name="pencil" color={colors.primary} size={20} />
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.removeButton, 
              { 
                backgroundColor: pressed ? colors.accent + '40' : colors.accent + '20',
                opacity: pressed ? 0.8 : 1
              }
            ]}
            onPress={() => {
              console.log('Trash icon pressed for department:', item.name);
              removeDepartment(item.id, item.name);
            }}
            accessibilityLabel={`Remove ${item.name} department`}
            accessibilityRole="button"
          >
            <IconSymbol name="trash" color={colors.accent} size={20} />
          </Pressable>
        </View>
      </View>
    </View>
  );

  const renderDashboardStats = () => (
    <View style={styles.statsContainer}>
      <View style={[styles.statCard, { backgroundColor: colors.card }]}>
        <IconSymbol name="person.3.fill" color={colors.primary} size={24} />
        <Text style={[styles.statNumber, { color: colors.text }]}>{staff.length}</Text>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Staff</Text>
      </View>
      
      <View style={[styles.statCard, { backgroundColor: colors.card }]}>
        <IconSymbol name="checkmark.circle.fill" color={colors.primary} size={24} />
        <Text style={[styles.statNumber, { color: colors.text }]}>
          {staff.filter(s => s.status === 'active').length}
        </Text>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Active</Text>
      </View>
      
      <View style={[styles.statCard, { backgroundColor: colors.card }]}>
        <IconSymbol name="building.2.fill" color={colors.primary} size={24} />
        <Text style={[styles.statNumber, { color: colors.text }]}>{departments.length}</Text>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Departments</Text>
      </View>
    </View>
  );

  const renderAddStaffModal = () => (
    <Modal
      visible={showAddStaffModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowAddStaffModal(false)}
    >
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Add New Staff</Text>
          <Pressable onPress={() => setShowAddStaffModal(false)}>
            <IconSymbol name="xmark" color={colors.text} size={24} />
          </Pressable>
        </View>
        
        <ScrollView style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Name *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
              placeholder="Enter staff name"
              placeholderTextColor={colors.textSecondary}
              value={newStaff.name}
              onChangeText={(text) => setNewStaff({ ...newStaff, name: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Position *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
              placeholder="Enter position"
              placeholderTextColor={colors.textSecondary}
              value={newStaff.position}
              onChangeText={(text) => setNewStaff({ ...newStaff, position: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Email *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
              placeholder="Enter email address"
              placeholderTextColor={colors.textSecondary}
              value={newStaff.email}
              onChangeText={(text) => setNewStaff({ ...newStaff, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Phone</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
              placeholder="Enter phone number"
              placeholderTextColor={colors.textSecondary}
              value={newStaff.phone}
              onChangeText={(text) => setNewStaff({ ...newStaff, phone: text })}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Department</Text>
            <View style={styles.pickerContainer}>
              {departments.map((dept) => (
                <Pressable
                  key={dept.id}
                  style={[
                    styles.pickerOption,
                    { 
                      backgroundColor: newStaff.department_id === dept.id ? colors.primary + '20' : colors.card,
                      borderColor: newStaff.department_id === dept.id ? colors.primary : colors.secondary + '30'
                    }
                  ]}
                  onPress={() => setNewStaff({ ...newStaff, department_id: dept.id })}
                >
                  <Text style={[
                    styles.pickerOptionText,
                    { color: newStaff.department_id === dept.id ? colors.primary : colors.text }
                  ]}>
                    {dept.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <Pressable
              style={[styles.cancelButton, { backgroundColor: colors.card }]}
              onPress={() => setShowAddStaffModal(false)}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
            </Pressable>
            
            <Pressable
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={addStaff}
            >
              <Text style={styles.addButtonText}>Add Staff</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  const renderEditStaffModal = () => (
    <Modal
      visible={showEditStaffModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowEditStaffModal(false)}
    >
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Staff</Text>
          <Pressable onPress={() => setShowEditStaffModal(false)}>
            <IconSymbol name="xmark" color={colors.text} size={24} />
          </Pressable>
        </View>
        
        <ScrollView style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Name *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
              placeholder="Enter staff name"
              placeholderTextColor={colors.textSecondary}
              value={editStaffForm.name}
              onChangeText={(text) => setEditStaffForm({ ...editStaffForm, name: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Position *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
              placeholder="Enter position"
              placeholderTextColor={colors.textSecondary}
              value={editStaffForm.position}
              onChangeText={(text) => setEditStaffForm({ ...editStaffForm, position: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Email *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
              placeholder="Enter email address"
              placeholderTextColor={colors.textSecondary}
              value={editStaffForm.email}
              onChangeText={(text) => setEditStaffForm({ ...editStaffForm, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Phone</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
              placeholder="Enter phone number"
              placeholderTextColor={colors.textSecondary}
              value={editStaffForm.phone}
              onChangeText={(text) => setEditStaffForm({ ...editStaffForm, phone: text })}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Department</Text>
            <View style={styles.pickerContainer}>
              {departments.map((dept) => (
                <Pressable
                  key={dept.id}
                  style={[
                    styles.pickerOption,
                    { 
                      backgroundColor: editStaffForm.department_id === dept.id ? colors.primary + '20' : colors.card,
                      borderColor: editStaffForm.department_id === dept.id ? colors.primary : colors.secondary + '30'
                    }
                  ]}
                  onPress={() => setEditStaffForm({ ...editStaffForm, department_id: dept.id })}
                >
                  <Text style={[
                    styles.pickerOptionText,
                    { color: editStaffForm.department_id === dept.id ? colors.primary : colors.text }
                  ]}>
                    {dept.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Status</Text>
            <View style={styles.statusPickerContainer}>
              <Pressable
                style={[
                  styles.statusOption,
                  { 
                    backgroundColor: editStaffForm.status === 'active' ? colors.primary + '20' : colors.card,
                    borderColor: editStaffForm.status === 'active' ? colors.primary : colors.secondary + '30'
                  }
                ]}
                onPress={() => setEditStaffForm({ ...editStaffForm, status: 'active' })}
              >
                <Text style={[
                  styles.statusOptionText,
                  { color: editStaffForm.status === 'active' ? colors.primary : colors.text }
                ]}>
                  Active
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.statusOption,
                  { 
                    backgroundColor: editStaffForm.status === 'inactive' ? colors.primary + '20' : colors.card,
                    borderColor: editStaffForm.status === 'inactive' ? colors.primary : colors.secondary + '30'
                  }
                ]}
                onPress={() => setEditStaffForm({ ...editStaffForm, status: 'inactive' })}
              >
                <Text style={[
                  styles.statusOptionText,
                  { color: editStaffForm.status === 'inactive' ? colors.primary : colors.text }
                ]}>
                  Inactive
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <Pressable
              style={[styles.cancelButton, { backgroundColor: colors.card }]}
              onPress={() => setShowEditStaffModal(false)}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
            </Pressable>
            
            <Pressable
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={editStaff}
            >
              <Text style={styles.addButtonText}>Update Staff</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  const renderAddDepartmentModal = () => (
    <Modal
      visible={showAddDepartmentModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowAddDepartmentModal(false)}
    >
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Add New Department</Text>
          <Pressable onPress={() => setShowAddDepartmentModal(false)}>
            <IconSymbol name="xmark" color={colors.text} size={24} />
          </Pressable>
        </View>
        
        <ScrollView style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Department Name *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
              placeholder="Enter department name"
              placeholderTextColor={colors.textSecondary}
              value={newDepartment.name}
              onChangeText={(text) => setNewDepartment({ ...newDepartment, name: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: colors.card, color: colors.text }]}
              placeholder="Enter department description"
              placeholderTextColor={colors.textSecondary}
              value={newDepartment.description}
              onChangeText={(text) => setNewDepartment({ ...newDepartment, description: text })}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.buttonContainer}>
            <Pressable
              style={[styles.cancelButton, { backgroundColor: colors.card }]}
              onPress={() => setShowAddDepartmentModal(false)}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
            </Pressable>
            
            <Pressable
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={addDepartment}
            >
              <Text style={styles.addButtonText}>Add Department</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  const renderEditDepartmentModal = () => (
    <Modal
      visible={showEditDepartmentModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowEditDepartmentModal(false)}
    >
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Department</Text>
          <Pressable onPress={() => setShowEditDepartmentModal(false)}>
            <IconSymbol name="xmark" color={colors.text} size={24} />
          </Pressable>
        </View>
        
        <ScrollView style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Department Name *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
              placeholder="Enter department name"
              placeholderTextColor={colors.textSecondary}
              value={editDepartmentForm.name}
              onChangeText={(text) => setEditDepartmentForm({ ...editDepartmentForm, name: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: colors.card, color: colors.text }]}
              placeholder="Enter department description"
              placeholderTextColor={colors.textSecondary}
              value={editDepartmentForm.description}
              onChangeText={(text) => setEditDepartmentForm({ ...editDepartmentForm, description: text })}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.buttonContainer}>
            <Pressable
              style={[styles.cancelButton, { backgroundColor: colors.card }]}
              onPress={() => setShowEditDepartmentModal(false)}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
            </Pressable>
            
            <Pressable
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={editDepartment}
            >
              <Text style={styles.addButtonText}>Update Department</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </Modal>
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
              Manage staff members and departments
            </Text>
          </View>

          {renderDashboardStats()}

          <View style={styles.actionButtonsContainer}>
            <Pressable
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowAddStaffModal(true)}
            >
              <IconSymbol name="person.badge.plus" color="white" size={20} />
              <Text style={styles.actionButtonText}>Add Staff</Text>
            </Pressable>
            
            <Pressable
              style={[styles.actionButton, { backgroundColor: colors.secondary }]}
              onPress={() => setShowAddDepartmentModal(true)}
            >
              <IconSymbol name="building.2.fill" color="white" size={20} />
              <Text style={styles.actionButtonText}>Add Department</Text>
            </Pressable>
          </View>

          <View style={styles.staffSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              All Staff ({staff.length})
            </Text>
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading...</Text>
              </View>
            ) : (
              <FlatList
                data={staff}
                renderItem={renderStaffCard}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.staffList}
              />
            )}
          </View>

          <View style={styles.departmentsSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Departments ({departments.length})
            </Text>
            
            <FlatList
              data={departments}
              renderItem={renderDepartmentCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.departmentsList}
            />
          </View>
        </ScrollView>
      </View>

      {renderAddStaffModal()}
      {renderEditStaffModal()}
      {renderAddDepartmentModal()}
      {renderEditDepartmentModal()}
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
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
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  staffSection: {
    marginBottom: 24,
  },
  departmentsSection: {
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
  departmentsList: {
    gap: 12,
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
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    padding: 10,
    borderRadius: 8,
    minWidth: 40,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  removeButton: {
    padding: 10,
    borderRadius: 8,
    minWidth: 40,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.accent + '40',
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
  departmentCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.secondary + '20',
  },
  departmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  departmentInfo: {
    flex: 1,
  },
  departmentName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  departmentDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  modalContent: {
    flex: 1,
  },
  pickerContainer: {
    gap: 8,
  },
  pickerOption: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  pickerOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  statusPickerContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statusOption: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  statusOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 40,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.secondary + '30',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
