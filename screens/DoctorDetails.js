import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Pressable,
  Button,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "../firebaseConfig";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";

import PatientManager from "./PatientManager";

const { width, height } = Dimensions.get("window");
const isSmallScreen = width < 768;
const drawerWidth = isSmallScreen ? width * 0.7 : width * 0.3;

export default function DoctorDetails({ navigation }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editableData, setEditableData] = useState({});
  const [patients, setPatients] = useState([]);

  const slideAnim = useRef(new Animated.Value(-drawerWidth)).current;

  const handleLogout = async () => {
    await auth.signOut();
    navigation?.replace?.("Login") ?? (window.location.href = "/login");
  };

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const unsub = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserData(data);
        setEditableData(data);
      }
    });

    return () => unsub();
  }, []);

  const openMenu = () => {
    setMenuOpen(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const closeMenu = () => {
    Animated.timing(slideAnim, {
      toValue: -drawerWidth,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setMenuOpen(false);
      setEditMode(false);
      setEditableData(userData);
    });
  };

  const handleEditToggle = () => setEditMode(true);
  const handleCancelEdit = () => {
    setEditMode(false);
    setEditableData(userData);
  };

  const handleSave = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      await updateDoc(doc(db, "users", user.uid), editableData);
      setEditMode(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      Alert.alert("Error", "Could not update profile.");
    }
  };

  const handleChange = (field, value) => {
    setEditableData({ ...editableData, [field]: value });
  };

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <TouchableOpacity onPress={openMenu} style={styles.hamburger}>
          <Ionicons name="menu" size={32} color="#0063dbff" />
        </TouchableOpacity>
        <Text style={styles.title}>My App</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.hint}>Click ☰ to see your details</Text>
      </View>

      <PatientManager patients={patients} setPatients={setPatients} />

      {menuOpen && (
        <>
          <Pressable style={styles.overlay} onPress={closeMenu} />
          <Animated.View
            style={[
              styles.drawer,
              {
                width: drawerWidth,
                height: height,
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            <ScrollView style={styles.drawerContent}>
              {userData ? (
                <>
                  {!editMode && (
                    <TouchableOpacity
                      onPress={handleEditToggle}
                      style={styles.editIcon}
                    >
                      <Ionicons
                        name="create-outline"
                        size={24}
                        color="#0063dbff"
                      />
                    </TouchableOpacity>
                  )}

                  {editMode ? (
                    <>
                      {/* Full Name */}
                      <TextInput
                        style={styles.input}
                        value={editableData.fullName}
                        onChangeText={(text) => handleChange("fullName", text)}
                        placeholder="Full Name"
                      />

                      {/* Email */}
                      <TextInput
                        style={styles.input}
                        value={editableData.email}
                        onChangeText={(text) => handleChange("email", text)}
                        placeholder="Email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />

                      {/* Mobile */}
                      <TextInput
                        style={styles.input}
                        value={editableData.mobile || ""}
                        onChangeText={(text) => handleChange("mobile", text)}
                        placeholder="Mobile Number"
                        keyboardType="phone-pad"
                        maxLength={10}
                      />

                      {/* Doctor Specialization */}
                      {editableData.role === "doctor" && (
                        <View style={styles.pickerWrapper}>
                          <Picker
                            selectedValue={editableData.specialization || ""}
                            onValueChange={(value) =>
                              handleChange("specialization", value)
                            }
                          >
                            <Picker.Item
                              label="Select Specialization"
                              value=""
                            />
                            <Picker.Item
                              label="Cardiologist"
                              value="Cardiologist"
                            />
                            <Picker.Item
                              label="Dermatologist"
                              value="Dermatologist"
                            />
                            <Picker.Item
                              label="Neurologist"
                              value="Neurologist"
                            />
                            <Picker.Item
                              label="Pediatrician"
                              value="Pediatrician"
                            />
                            <Picker.Item
                              label="General Physician"
                              value="General Physician"
                            />
                            <Picker.Item
                              label="Orthopedic"
                              value="Orthopedic"
                            />
                            <Picker.Item label="Ayurveda" value="Ayurveda" />
                            <Picker.Item
                              label="Homeopathy"
                              value="Homeopathy"
                            />
                            <Picker.Item
                              label="Nephrologist"
                              value="Nephrologist"
                            />
                            <Picker.Item label="Urologist" value="Urologist" />
                            <Picker.Item label="Dentist" value="Dentist" />
                            <Picker.Item
                              label="Ophthalmology"
                              value="Ophthalmology"
                            />
                            <Picker.Item
                              label="Oncologist"
                              value="Oncologist"
                            />
                            <Picker.Item
                              label="Pulmonologist"
                              value="Pulmonologist"
                            />
                            <Picker.Item
                              label="Psychiatrist"
                              value="Psychiatrist"
                            />
                            <Picker.Item
                              label="Radiologist"
                              value="Radiologist"
                            />
                            <Picker.Item
                              label="Gynecology"
                              value="Gynecology"
                            />
                          </Picker>
                        </View>
                      )}

                      <View style={styles.editButtons}>
                        <Button title="Save" onPress={handleSave} />
                        <View style={{ width: 10 }} />
                        <Button
                          title="Cancel"
                          onPress={handleCancelEdit}
                          color="#888"
                        />
                      </View>
                    </>
                  ) : (
                    <>
                      <Text style={styles.drawerItem}>
                        👤 {userData.fullName}
                      </Text>
                      <Text style={styles.drawerItem}>💼 {userData.role}</Text>
                      {userData.email ? (
                        <Text style={styles.drawerItem}>📧 {userData.email}</Text>
                      ) : null}
                      {userData.mobile ? (
                        <Text style={styles.drawerItem}>📱 {userData.mobile}</Text>
                      ) : null}
                      {userData.role === "doctor" &&
                        userData.specialization && (
                          <Text style={styles.drawerItem}>
                            🩺 {userData.specialization}
                          </Text>
                        )}
                      <View style={styles.logoutBtn}>
                        <Button title="Logout" onPress={handleLogout} />
                      </View>
                    </>
                  )}
                </>
              ) : (
                <Text style={styles.drawerItem}>Loading...</Text>
              )}
            </ScrollView>
          </Animated.View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 15,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0063dbff",
    marginLeft: 50,
  },
  hamburger: { position: "absolute", left: 20, top: 15 },
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
  hint: { marginTop: 10, fontSize: 16, color: "#777" },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 5,
  },
  drawer: {
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: "#fff",
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    zIndex: 10,
  },
  drawerContent: { padding: 20 },
  drawerItem: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 15,
    color: "#333",
  },
  logoutBtn: { alignSelf: "flex-start", marginTop: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    fontSize: 16,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 15,
    overflow: "hidden",
  },
  editButtons: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 10,
  },
  editIcon: {
    alignSelf: "flex-end",
    marginBottom: 10,
  },
});
