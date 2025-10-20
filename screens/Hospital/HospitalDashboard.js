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
    ActivityIndicator,
    Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "../../firebaseConfig";
import {
    doc,
    onSnapshot,
    updateDoc,
    deleteField,
    addDoc,
    collection,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Dimensions } from "react-native";
import { Picker } from "@react-native-picker/picker";

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
    const [user, setUser] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [addingDoctor, setAddingDoctor] = useState(false);
    const [newDoctor, setNewDoctor] = useState({
        name: "",
        mobile: "",
        email: "",
        degree: "",
        experience: "",
        specialization: "",
        gender: "",
        currentlyWorking: "Yes",
    });
    const [loading, setLoading] = useState(true);
    const [editingDoctorId, setEditingDoctorId] = useState(null);
    const [editingDoctor, setEditingDoctor] = useState({});

    const slideAnim = useRef(new Animated.Value(-drawerWidth)).current;

    const specializations = [
        "Cardiology",
        "Neurology",
        "Orthopedics",
        "Pediatrics",
        "General Medicine",
    ];
    const genders = ["Male", "Female", "Other"];

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) setUser(currentUser);
            else navigation.replace("Login");
        });
        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        if (!user) return;

        const hospitalRef = doc(db, "hospitals", user.uid);
        const unsubHospital = onSnapshot(hospitalRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data();
                setHospitalData(data);
                setEditableData(data);
            } else {
                console.log("Hospital not found");
            }
        });

        const doctorsRef = collection(db, "hospitals", user.uid, "doctors");
        const unsubDoctors = onSnapshot(doctorsRef, (snapshot) => {
            const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
            setDoctors(list);
            setLoading(false);
        });

        return () => {
            unsubHospital();
            unsubDoctors();
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

            Object.keys(updatedData).forEach((key) => {
                if (!updatedData[key]) updatedData[key] = deleteField();
            });

            await updateDoc(hospitalRef, updatedData);
            setHospitalData(editableData);
            setEditMode(false);
            Alert.alert("✅ Success", "Hospital details updated successfully!");
        } catch (error) {
            console.error("Error updating hospital:", error);
            Alert.alert("❌ Error", "Update failed.");
        }
    };

    const handleChange = (key, value) =>
        setEditableData((prev) => ({ ...prev, [key]: value }));

    const handleAddDoctor = async () => {
        if (!newDoctor.name || !newDoctor.specialization) {
            Alert.alert("⚠️ Missing Info", "Please fill name and specialization.");
            return;
        }

        try {
            const doctorsRef = collection(db, "hospitals", user.uid, "doctors");
            await addDoc(doctorsRef, newDoctor);
            setNewDoctor({
                name: "",
                mobile: "",
                email: "",
                degree: "",
                experience: "",
                specialization: "",
                gender: "",
                currentlyWorking: "Yes",
            });
            setAddingDoctor(false);
            Alert.alert("✅ Success", "Doctor added successfully!");
        } catch (err) {
            console.error("Add doctor error:", err);
            Alert.alert("❌ Error", "Failed to add doctor.");
        }
    };

    const handleUpdateDoctor = async (doctorId) => {
        try {
            const doctorRef = doc(db, "hospitals", user.uid, "doctors", doctorId);
            await updateDoc(doctorRef, {
                ...editingDoctor,
                currentlyWorking:
                    editingDoctor.currentlyWorking === "Yes" ? "Yes" : "No",
            });
            setEditingDoctorId(null);
            Alert.alert("✅ Success", "Doctor updated successfully!");
        } catch (err) {
            console.error("Error updating doctor:", err);
            Alert.alert("❌ Error", "Failed to update doctor.");
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007BFF" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Menu Button */}
            <TouchableOpacity onPress={openMenu} style={styles.menuIcon}>
                <Ionicons name="menu" size={28} color="#333" />
            </TouchableOpacity>

            {menuOpen && <Pressable style={styles.overlay} onPress={closeMenu} />}

            {/* Drawer */}
            <Animated.View style={[styles.drawer, { left: slideAnim }]}>
                <Text style={styles.drawerTitle}>
                    {hospitalData
                        ? `${hospitalData.hospitalName} Hospital Profile`
                        : "Hospital Profile"}
                </Text>

                <ScrollView style={styles.content}>
                    {["hospitalName", "email", "mobile", "state", "city"].map((field) => (
                        <View key={field}>
                            <Text style={styles.label}>
                                {field.replace(/^\w/, (c) => c.toUpperCase())}
                            </Text>
                            <TextInput
                                style={styles.input}
                                value={editableData[field] || ""}
                                editable={editMode}
                                onChangeText={(t) => handleChange(field, t)}
                            />
                        </View>
                    ))}

                    <View style={styles.buttonContainer}>
                        {editMode ? (
                            <>
                                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                                    <Text style={styles.btnText}>Save</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.cancelBtn}
                                    onPress={handleCancel}
                                >
                                    <Text style={styles.btnText}>Cancel</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <TouchableOpacity
                                style={styles.editBtn}
                                onPress={handleEditToggle}
                            >
                                <Text style={styles.btnText}>Edit</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <TouchableOpacity
                        style={styles.logoutBtn}
                        onPress={async () => {
                            try {
                                await auth.signOut();
                                navigation.replace("Login");
                            } catch (error) {
                                Alert.alert("❌ Error", "Logout failed.");
                            }
                        }}
                    >
                        <Text style={styles.btnText}>Logout</Text>
                    </TouchableOpacity>
                </ScrollView>
            </Animated.View>

            {/* Main Content */}
            <ScrollView contentContainerStyle={styles.mainContent}>
                <Text style={styles.title}>
                    {hospitalData
                        ? `Welcome, ${hospitalData.hospitalName} Admin`
                        : "Hospital Admin Dashboard"}
                </Text>

                <Text style={{ marginBottom: 20 }}>
                    Manage your hospital’s doctors below.
                </Text>

                {/* Doctor List */}
                {doctors
                    .filter((d) => d.currentlyWorking === "Yes")
                    .map((d) => {
                        const isEditing = editingDoctorId === d.id;

                        return (
                            <View key={d.id} style={styles.doctorCard}>
                                {isEditing ? (
                                    <>
                                        <TextInput
                                            style={styles.input}
                                            value={editingDoctor.name}
                                            placeholder="Name"
                                            onChangeText={(t) =>
                                                setEditingDoctor((p) => ({ ...p, name: t }))
                                            }
                                        />
                                        <TextInput
                                            style={styles.input}
                                            value={editingDoctor.mobile}
                                            placeholder="Mobile"
                                            keyboardType="phone-pad"
                                            onChangeText={(t) =>
                                                setEditingDoctor((p) => ({ ...p, mobile: t }))
                                            }
                                        />
                                        <TextInput
                                            style={styles.input}
                                            value={editingDoctor.email}
                                            placeholder="Email"
                                            onChangeText={(t) =>
                                                setEditingDoctor((p) => ({ ...p, email: t }))
                                            }
                                        />
                                        <TextInput
                                            style={styles.input}
                                            value={editingDoctor.degree}
                                            placeholder="Degree"
                                            onChangeText={(t) =>
                                                setEditingDoctor((p) => ({ ...p, degree: t }))
                                            }
                                        />
                                        <TextInput
                                            style={styles.input}
                                            value={editingDoctor.experience}
                                            placeholder="Experience"
                                            keyboardType="numeric"
                                            onChangeText={(t) =>
                                                setEditingDoctor((p) => ({ ...p, experience: t }))
                                            }
                                        />

                                        <Text style={styles.label}>Specialization</Text>
                                        <View style={styles.pickerWrapper}>
                                            <Picker
                                                selectedValue={editingDoctor.specialization}
                                                onValueChange={(v) =>
                                                    setEditingDoctor((p) => ({
                                                        ...p,
                                                        specialization: v,
                                                    }))
                                                }
                                            >
                                                <Picker.Item
                                                    label="Select specialization"
                                                    value=""
                                                />
                                                {specializations.map((spec) => (
                                                    <Picker.Item key={spec} label={spec} value={spec} />
                                                ))}
                                            </Picker>
                                        </View>

                                        <Text style={styles.label}>Gender</Text>
                                        <View style={styles.pickerWrapper}>
                                            <Picker
                                                selectedValue={editingDoctor.gender}
                                                onValueChange={(v) =>
                                                    setEditingDoctor((p) => ({ ...p, gender: v }))
                                                }
                                            >
                                                <Picker.Item label="Select gender" value="" />
                                                {genders.map((g) => (
                                                    <Picker.Item key={g} label={g} value={g} />
                                                ))}
                                            </Picker>
                                        </View>

                                        <Text style={styles.label}>Currently Working?</Text>
                                        <View style={styles.pickerWrapper}>
                                            <Picker
                                                selectedValue={editingDoctor.currentlyWorking}
                                                onValueChange={(v) =>
                                                    setEditingDoctor((p) => ({
                                                        ...p,
                                                        currentlyWorking: v,
                                                    }))
                                                }
                                            >
                                                <Picker.Item label="Yes" value="Yes" />
                                                <Picker.Item label="No" value="No" />
                                            </Picker>
                                        </View>

                                        <View style={styles.addDoctorButtons}>
                                            <TouchableOpacity
                                                style={styles.saveBtn}
                                                onPress={() => handleUpdateDoctor(d.id)}
                                            >
                                                <Text style={styles.btnText}>Save</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={styles.cancelBtn}
                                                onPress={() => setEditingDoctorId(null)}
                                            >
                                                <Text style={styles.btnText}>Cancel</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </>
                                ) : (
                                    <>
                                        <Text style={styles.doctorName}>{d.name}</Text>
                                        <Text>Specialization: {d.specialization}</Text>
                                        <Text>Experience: {d.experience} years</Text>
                                        <Text>Degree: {d.degree}</Text>
                                        <Text>Mobile: {d.mobile}</Text>
                                        {d.email ? <Text>Email: {d.email}</Text> : null}
                                        <Text>Gender: {d.gender}</Text>

                                        <TouchableOpacity
                                            style={styles.editBtn}
                                            onPress={() => {
                                                setEditingDoctorId(d.id);
                                                setEditingDoctor(d);
                                            }}
                                        >
                                            <Text style={styles.btnText}>Edit</Text>
                                        </TouchableOpacity>
                                    </>
                                )}
                            </View>
                        );
                    })}

                {/* Add Doctor */}
                {addingDoctor ? (
                    <View style={styles.addDoctorContainer}>
                        <TextInput
                            placeholder="Name"
                            style={styles.input}
                            value={newDoctor.name}
                            onChangeText={(t) => setNewDoctor((prev) => ({ ...prev, name: t }))}
                        />
                        <TextInput
                            placeholder="Mobile"
                            style={styles.input}
                            value={newDoctor.mobile}
                            keyboardType="phone-pad"
                            onChangeText={(t) => setNewDoctor((prev) => ({ ...prev, mobile: t }))}
                        />
                        <TextInput
                            placeholder="Email"
                            style={styles.input}
                            value={newDoctor.email}
                            onChangeText={(t) => setNewDoctor((prev) => ({ ...prev, email: t }))}
                        />
                        <TextInput
                            placeholder="Degree"
                            style={styles.input}
                            value={newDoctor.degree}
                            onChangeText={(t) => setNewDoctor((prev) => ({ ...prev, degree: t }))}
                        />
                        <TextInput
                            placeholder="Experience"
                            style={styles.input}
                            value={newDoctor.experience}
                            keyboardType="numeric"
                            onChangeText={(t) =>
                                setNewDoctor((prev) => ({ ...prev, experience: t }))
                            }
                        />

                        <Text style={styles.label}>Specialization</Text>
                        <View style={styles.pickerWrapper}>
                            <Picker
                                selectedValue={newDoctor.specialization}
                                onValueChange={(v) =>
                                    setNewDoctor((prev) => ({ ...prev, specialization: v }))
                                }
                            >
                                <Picker.Item label="Select specialization" value="" />
                                {specializations.map((spec) => (
                                    <Picker.Item key={spec} label={spec} value={spec} />
                                ))}
                            </Picker>
                        </View>

                        <Text style={styles.label}>Gender</Text>
                        <View style={styles.pickerWrapper}>
                            <Picker
                                selectedValue={newDoctor.gender}
                                onValueChange={(v) => setNewDoctor((prev) => ({ ...prev, gender: v }))}
                            >
                                <Picker.Item label="Select gender" value="" />
                                {genders.map((g) => (
                                    <Picker.Item key={g} label={g} value={g} />
                                ))}
                            </Picker>
                        </View>

                        <Text style={styles.label}>Currently Working?</Text>
                        <View style={styles.pickerWrapper}>
                            <Picker
                                selectedValue={newDoctor.currentlyWorking}
                                onValueChange={(v) =>
                                    setNewDoctor((prev) => ({ ...prev, currentlyWorking: v }))
                                }
                            >
                                <Picker.Item label="Yes" value="Yes" />
                                <Picker.Item label="No" value="No" />
                            </Picker>
                        </View>

                        <View style={styles.addDoctorButtons}>
                            <TouchableOpacity style={styles.saveBtn} onPress={handleAddDoctor}>
                                <Text style={styles.btnText}>Save</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.cancelBtn}
                                onPress={() => setAddingDoctor(false)}
                            >
                                <Text style={styles.btnText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.addBtn}
                        onPress={() => setAddingDoctor(true)}
                    >
                        <Text style={styles.btnText}>+ Add Doctor</Text>
                    </TouchableOpacity>
                )}

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    menuIcon: {
        position: "absolute",
        top: 10,
        left: 20,
        paddingVertical: 12,
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


    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 15,
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
        marginTop: 5,
    },
    addBtn: {
        backgroundColor: "#007BFF",
        padding: 12,
        borderRadius: 8,
        marginTop: 15,
        width: "60%",
        alignItems: "center",
    },
    btnText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
    logoutBtn: {
        backgroundColor: "#f44336",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 10,
    },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    mainContent: { alignItems: "center", padding: 20, paddingTop: 80 },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 15 },
    doctorName: { fontSize: 18, fontWeight: "bold" },

    doctorCard: {
        backgroundColor: "#ffffff",          // pure white card
        padding: 16,                         // slightly more padding
        borderRadius: 12,                    // softer rounded corners
        width: "90%",
        marginBottom: 16,                    // more spacing between cards
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,                        // Android shadow
        borderWidth: 1,                      // subtle border
        borderColor: "#e0e0e0",
    },

    addDoctorContainer: {
        width: "90%",
        backgroundColor: "#ffffff",          // match doctor cards
        padding: 20,                         // more padding for form
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        marginBottom: 20,                    // separate from other content
    },


    addDoctorButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
    },
    pickerWrapper: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        marginVertical: 5,
    },
});
