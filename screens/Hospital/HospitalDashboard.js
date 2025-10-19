import React, { useState, useRef, useEffect } from "react";
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
    Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "../../firebaseConfig";
import { doc, onSnapshot, updateDoc, deleteField } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;

const drawerWidth = Platform.select({
    ios: screenWidth * 0.75,
    android: screenWidth * 0.7,
    web: Math.min(screenWidth * 0.3, 400),
});

export default function HospitalDashboard({ navigation }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [hospitalData, setHospitalData] = useState(null);
    const [editableData, setEditableData] = useState({});
    const [editMode, setEditMode] = useState(false);
    const [user, setUser] = useState(null); // new state for auth user

    const slideAnim = useRef(new Animated.Value(-drawerWidth)).current;
    const unsubRef = useRef(null);

    // Wait for Firebase auth to initialize
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser); // set the user
            } else {
                navigation.replace("Login"); // redirect only if actually logged out
            }
        });

        return () => unsubscribeAuth();
    }, []);

    // Fetch hospital data only after user is set
    useEffect(() => {
        if (!user) return;

        const hospitalRef = doc(db, "hospitals", user.uid); // hospital doc ID = admin uid
        unsubRef.current = onSnapshot(
            hospitalRef,
            (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.data();
                    setHospitalData(data);
                    setEditableData(data);
                } else {
                    console.log("Hospital data not found");
                }
            },
            (error) => console.error("Firestore listener error:", error)
        );

        return () => {
            if (unsubRef.current) unsubRef.current();
        };
    }, [user]);

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

    const handleEditToggle = () => setEditMode(true);

    const handleCancel = () => {
        setEditMode(false);
        setEditableData(hospitalData);
    };

    const handleSave = async () => {
        try {
            const hospitalRef = doc(db, "hospitals", user.uid);
            const updatedData = { ...editableData };

            if (!editableData.hospitalName) updatedData.hospitalName = deleteField();
            if (!editableData.email) updatedData.email = deleteField();
            if (!editableData.city) updatedData.city = deleteField();
            if (!editableData.state) updatedData.state = deleteField();
            if (!editableData.mobile) updatedData.mobile = deleteField();

            await updateDoc(hospitalRef, updatedData);
            setHospitalData(editableData);
            setEditMode(false);
            Alert.alert("✅ Success", "Hospital details updated successfully!");
        } catch (error) {
            console.error("Error updating hospital data:", error);
            Alert.alert("❌ Error", "Failed to update details. Try again.");
        }
    };

    const handleChange = (key, value) => {
        setEditableData((prev) => ({ ...prev, [key]: value }));
    };

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
                <Text style={styles.drawerTitle}>
                    {hospitalData ? `${hospitalData.hospitalName} Hospital's Profile` : "Hospital Profile"}
                </Text>

                {hospitalData ? (
                    <ScrollView style={styles.content}>
                        <Text style={styles.label}>Hospital Name</Text>
                        <TextInput
                            style={styles.input}
                            value={editableData.hospitalName || ""}
                            editable={editMode}
                            onChangeText={(text) => handleChange("hospitalName", text)}
                        />

                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            value={editableData.email || ""}
                            editable={editMode}
                            onChangeText={(text) => handleChange("email", text)}
                        />

                        <Text style={styles.label}>Mobile</Text>
                        <TextInput
                            style={styles.input}
                            value={editableData.mobile || ""}
                            editable={editMode}
                            keyboardType="number-pad"
                            onChangeText={(text) => handleChange("mobile", text)}
                        />

                        <Text style={styles.label}>State</Text>
                        <TextInput
                            style={styles.input}
                            value={editableData.state || ""}
                            editable={editMode}
                            onChangeText={(text) => handleChange("state", text)}
                        />

                        <Text style={styles.label}>City</Text>
                        <TextInput
                            style={styles.input}
                            value={editableData.city || ""}
                            editable={editMode}
                            onChangeText={(text) => handleChange("city", text)}
                        />

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

                        <View style={{ marginTop: 20 }}>
                            <TouchableOpacity
                                style={styles.logoutBtn}
                                onPress={async () => {
                                    try {
                                        await auth.signOut();
                                        navigation.replace("Login");
                                    } catch (error) {
                                        console.error("Logout failed:", error);
                                        Alert.alert("❌ Error", "Logout failed.");
                                    }
                                }}
                            >
                                <Text style={styles.btnText}>Logout</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                ) : (
                    <Text style={styles.loading}>Loading...</Text>
                )}
            </Animated.View>

            {/* Main Content */}
            <View style={styles.mainContent}>
                <Text style={styles.title}>
                    {hospitalData ? `Admin Dashboard of ${hospitalData.hospitalName} Hospital` : "Hospital Admin Dashboard"}
                </Text>
                <Text>Manage doctors in your hospital here.</Text>
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
    buttonContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 15 },
    saveBtn: { flex: 1, backgroundColor: "#4CAF50", padding: 10, borderRadius: 8, marginRight: 5 },
    cancelBtn: { flex: 1, backgroundColor: "#f44336", padding: 10, borderRadius: 8, marginLeft: 5 },
    editBtn: { flex: 1, backgroundColor: "#2196F3", padding: 10, borderRadius: 8 },
    btnText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
    logoutBtn: { backgroundColor: "#f44336", padding: 12, borderRadius: 8, alignItems: "center" },
    loading: { marginTop: 20, textAlign: "center", color: "#888" },
    mainContent: { flex: 1, justifyContent: "center", alignItems: "center", zIndex: 1 },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
});
