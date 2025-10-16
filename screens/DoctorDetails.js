import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Animated,
  Pressable,
  ScrollView,
  Alert,
  
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { doc, onSnapshot, updateDoc, deleteField } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import PatientManager from "./PatientManager";
import LogoutButton from "./LogoutButton";
import { Dimensions, Platform } from "react-native";


//const drawerWidth = 320;

const screenWidth = Dimensions.get("window").width;

const drawerWidth = Platform.select({
  ios: screenWidth * 0.75,       // 75% width on iOS
  android: screenWidth * 0.7,    // 80% width on Android
  web: Math.min(screenWidth * 0.3, 400), // Max 400px or 30% on Web
});


export default function DoctorDetails() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [editableData, setEditableData] = useState({});
  const [editMode, setEditMode] = useState(false);

  const slideAnim = useRef(new Animated.Value(-drawerWidth)).current;
  const unsubRef = useRef(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    unsubRef.current = onSnapshot(
      userRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setUserData(data);
          setEditableData(data);
        } else {
          console.log("User data not found");
        }
      },
      (error) => {
        console.error("Firestore listener error:", error);
      }
    );

    return () => {
      if (unsubRef.current) unsubRef.current();
    };
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
    }).start(() => setMenuOpen(false));
  };

  const handleEditToggle = () => {
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    setEditableData(userData);
  };

  const handleSave = async () => {
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      const updatedData = { ...editableData };

      // Remove fields if empty
      if (!editableData.mobile) updatedData.mobile = deleteField();
      if (!editableData.email) updatedData.email = deleteField();

      await updateDoc(userRef, updatedData);
      setUserData(editableData);
      setEditMode(false);
      Alert.alert("✅ Success", "Details updated successfully!");
    } catch (error) {
      console.error("Error saving data:", error);
      Alert.alert("❌ Error", "Failed to update details. Try again.");
    }
  };

  const handleChange = (key, value) => {
    setEditableData((prev) => ({ ...prev, [key]: value }));
  };

  const isMobileDisabled = !editableData.email || editableData.email.trim() === "";
  const isEmailDisabled = !editableData.mobile || editableData.mobile.trim() === "";

  return (
    <View style={styles.container}>
      {/* Menu Button */}
      <TouchableOpacity onPress={openMenu} style={styles.menuIcon}>
        <Ionicons name="menu" size={28} color="#333" />
      </TouchableOpacity>

      {/* Overlay */}
      {menuOpen && <Pressable style={styles.overlay} onPress={closeMenu} />}

      {/* Drawer */}
      <Animated.View style={[styles.drawer, { left: slideAnim }]}>
        <Text style={styles.drawerTitle}>Doctor Profile</Text>

        {userData ? (
          <ScrollView style={styles.content}>
            {/* Name */}
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={editableData.fullName || ""}
              editable={editMode}
              onChangeText={(text) => handleChange("fullName", text)}
            />

            {/* Mobile */}
            <Text style={styles.label}>Mobile</Text>
            <TextInput
              style={[styles.input, isMobileDisabled && styles.disabledInput]}
              value={editableData.mobile || ""}
              editable={editMode && !isMobileDisabled}
              onChangeText={(text) => handleChange("mobile", text)}
              keyboardType="number-pad"
            />

            {/* Email */}
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, isEmailDisabled && styles.disabledInput]}
              value={editableData.email || ""}
              editable={editMode && !isEmailDisabled}
              onChangeText={(text) => handleChange("email", text)}
            />

            {/* Specialization */}
            <Text style={styles.label}>Specialization</Text>
            <Picker
              enabled={editMode}
              selectedValue={editableData.specialization || ""}
              onValueChange={(itemValue) => handleChange("specialization", itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select Specialization" value="" />
              <Picker.Item label="Cardiologist" value="Cardiologist" />
              <Picker.Item label="Dermatologist" value="Dermatologist" />
              <Picker.Item label="Neurologist" value="Neurologist" />
              <Picker.Item label="Pediatrician" value="Pediatrician" />
              <Picker.Item label="General Physician" value="General Physician" />
              <Picker.Item label="Orthopedic" value="Orthopedic" />
              <Picker.Item label="Ayurveda" value="Ayurveda" />
              <Picker.Item label="Homeopathy" value="Homeopathy" />
              <Picker.Item label="Nephrologist" value="Nephrologist" />
              <Picker.Item label="Urologist" value="Urologist" />
              <Picker.Item label="Dentist" value="Dentist" />
              <Picker.Item label="Ophthalmology" value="Ophthalmology" />
              <Picker.Item label="Oncologist" value="Oncologist" />
              <Picker.Item label="Pulmonologist" value="Pulmonologist" />
              <Picker.Item label="Psychiatrist" value="Psychiatrist" />
              <Picker.Item label="Radiologist" value="Radiologist" />
              <Picker.Item label="Gynecology" value="Gynecology" />
              
            </Picker>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              {editMode ? (
                <>
                  <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                    <Text style={styles.btnText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
                    <Text style={styles.btnText}>Cancel</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity style={styles.editBtn} onPress={handleEditToggle}>
                  <Text style={styles.btnText}>Edit</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Platform Info */}
            {/* <Text style={styles.platformText}>Platform: {Platform.OS}</Text> */}   {/* This line will  print if it is WEB or ANDROID*/}

            {/* Logout Button */}
            <View style={styles.logoutContainer}>
              <LogoutButton unsubRef={unsubRef} />
            </View>
          </ScrollView>
        ) : (
          <Text style={styles.loading}>Loading...</Text>
        )}
      </Animated.View>

      {/* Main App View */}
      {/* 
      <View style={{ zIndex: 1 }}>
          <PatientManager />
      </View>
      */}
   

    <View style={{ flex: 1, zIndex: 1, position: "relative" }}>
  <PatientManager />
</View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  menuIcon: {
    position: "absolute",
    top: 10,
    paddingVertical: 12,
    left: 20,
    zIndex: 2,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  drawer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: drawerWidth,
    backgroundColor: "#fafafa",
    zIndex: 5,
    padding: 20,
    borderRightWidth: 1,
    borderColor: "#ddd",
  },
  drawerTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  content: { flex: 1 },
  label: { fontWeight: "bold", marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginVertical: 5,
  },
  disabledInput: {
    backgroundColor: "#eaeaea",
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginVertical: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 8,
    marginRight: 5,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#f44336",
    padding: 10,
    borderRadius: 8,
    marginLeft: 5,
  },
  editBtn: {
    flex: 1,
    backgroundColor: "#2196F3",
    padding: 10,
    borderRadius: 8,
  },
  btnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  logoutContainer: {
    marginTop: 20,
  },
  loading: {
    marginTop: 20,
    textAlign: "center",
    color: "#888",
  },
  platformText: {
    marginTop: 20,
    textAlign: "center",
    color: "#555",
  },

  overlay: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.3)",
  zIndex: 10,
},

drawer: {
  position: "absolute",
  top: 0,
  bottom: 0,
  left: 0,
  width: drawerWidth,
  backgroundColor: "#fafafa",
  zIndex: 20,
  padding: 20,
  borderRightWidth: 1,
  borderColor: "#ddd",
},



 


});
