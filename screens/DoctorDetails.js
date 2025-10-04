import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Pressable,
  TextInput,
  Button,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { auth, db } from "../firebaseConfig";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";

const { width, height } = Dimensions.get("window");
const isSmallScreen = width < 768;
const drawerWidth = isSmallScreen ? width * 0.7 : width * 0.3;

export default function Dashboard({ navigation }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [updatedData, setUpdatedData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const slideAnim = useRef(new Animated.Value(-drawerWidth)).current;

  // Logout safely
  const handleLogout = async () => {
    await auth.signOut();
    if (navigation?.replace) {
      navigation.replace("Login");
    } else {
      window.location.href = "/login";
    }
  };

  // Fetch user data live
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const unsub = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        setUserData(docSnap.data());
        setUpdatedData(docSnap.data());
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // Animate drawer open/close
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

  // Save updated user info
  const handleSave = async () => {
    try {
      setSaving(true);
      const user = auth.currentUser;
      if (!user) return;
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        fullName: updatedData.fullName,
        email: updatedData.email,
        role: updatedData.role,
      });
      setEditing(false);
    } catch (error) {
      alert("Error updating profile: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={openMenu} style={styles.hamburger}>
          <Ionicons name="menu" size={32} color="#0063dbff" />
        </TouchableOpacity>
        <Text style={styles.title}>Doctor Dashboard</Text>
      </View>

      {/* Main content */}
      <View style={styles.content}>
        <Text style={styles.welcome}>Welcome 👋</Text>
        <Text style={styles.hint}>Click ☰ to view and edit your details</Text>
      </View>

      {/* Drawer & Overlay */}
      {menuOpen && (
        <>
          <Pressable style={styles.overlay} onPress={closeMenu} />
          <Animated.View
            style={[
              styles.drawer,
              { width: drawerWidth, height: height, transform: [{ translateX: slideAnim }] },
            ]}
          >
            <View style={styles.drawerContent}>
              {loading ? (
                <ActivityIndicator size="large" color="#0063dbff" />
              ) : editing ? (
                <>
                  <Text style={styles.drawerTitle}>✏️ Edit Profile</Text>

                  {/* Full Name */}
                  <Text style={styles.pickerLabel}>Name</Text>
                  <TextInput
                    style={styles.input}
                    value={updatedData.fullName}
                    onChangeText={(text) => setUpdatedData({ ...updatedData, fullName: text })}
                    placeholder="Full Name"
                  />

                  {/* Email */}
                  <Text style={styles.pickerLabel}>Email</Text>
                  <TextInput
                    style={styles.input}
                    value={updatedData.email}
                    onChangeText={(text) => setUpdatedData({ ...updatedData, email: text })}
                    placeholder="Email"
                    autoCapitalize="none"
                  />

                  {/* Role Dropdown */}
                  <Text style={styles.pickerLabel}>Role</Text>
                  <View style={styles.pickerContainer}>
                    
                    {/*while editing Role Dropdown contains values */}
                    <Picker                                                             
                      selectedValue={updatedData.role}
                      onValueChange={(value) =>
                        setUpdatedData({ ...updatedData, role: value })
                      }
                      style={styles.picker}
                    >
                      <Picker.Item label="Doctor" value="doctor" />
                      <Picker.Item label="Patient" value="patient" />
                    </Picker>
                  </View>

                  {/* Save + Cancel */}
                  <View style={{ marginTop: 15 }}>
                    <Button
                      title={saving ? "Saving..." : "Save"}
                      onPress={handleSave}
                      disabled={saving}
                    />
                    <View style={{ marginTop: 10 }}>
                      <Button title="Cancel" color="gray" onPress={() => setEditing(false)} />                  {/*Cancel Button To Cancel Editing profile*/}
                    </View>
                  </View>
                </>
              ) : userData ? (
                <>
                  <Text style={styles.drawerItem}>👤 {userData.fullName}</Text>
                  <Text style={styles.drawerItem}>💼 {userData.role}</Text>
                  <Text style={styles.drawerItem}>📧 {userData.email}</Text>

                  <View style={{ marginTop: 20 }}>
                    <Button title="Edit Profile" onPress={() => setEditing(true)} />
                  </View>

                  <View style={{ marginTop: 20 }}>
                    <Button title="Logout" color="red" onPress={handleLogout} />
                  </View>
                </>
              ) : (
                <Text>No user data found.</Text>
              )}
            </View>
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
  title: { fontSize: 20, fontWeight: "bold", color: "#0063dbff", marginLeft: 50 },
  hamburger: { position: "absolute", left: 20, top: 15 },
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
  welcome: { fontSize: 22, fontWeight: "bold", color: "#333" },
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
  drawerItem: { fontSize: 18, fontWeight: "500", marginBottom: 15, color: "#333" },
  drawerTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10, color: "#0063dbff" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginVertical: 8,
    width: "100%",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginVertical: 8,
  },
  pickerLabel: {
    fontWeight: "bold",
    marginTop: 5,
    marginLeft: 10,
    color: "#333",
  },
  picker: {
    height: 30,
    width: "100%",
  },
});
