// components/PatientManager.js

import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    Button,
    StyleSheet,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { auth, db, storage } from "../firebaseConfig";
import {
    collection,
    addDoc,
    onSnapshot,
    updateDoc,
    doc,
    getDoc,
    setDoc,
    serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function PatientManager() {
    const [formVisible, setFormVisible] = useState(false);
    const [showPatients, setShowPatients] = useState(false);
    const [patients, setPatients] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [editingPatient, setEditingPatient] = useState(null);
    const [uploading, setUploading] = useState(false);

    const [newPatient, setNewPatient] = useState({
        name: "",
        address: "",
        disease: "",
        cause: "",
        prescription: "",
        mobile: "",
        email: "",
        attachmentUrl: "",
    });

    // 🔹 Load patients for the logged-in doctor
    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        const patientsCol = collection(db, "users", user.uid, "patients");
        const unsubscribe = onSnapshot(patientsCol, (snapshot) => {
            const list = [];
            snapshot.forEach((docSnap) => {
                list.push({ id: docSnap.id, ...docSnap.data() });
            });
            setPatients(list);
        });

        return () => unsubscribe();
    }, []);

    const handleChange = (field, value) => {
        setNewPatient({ ...newPatient, [field]: value });
    };

    const resetForm = () => {
        setNewPatient({
            name: "",
            address: "",
            disease: "",
            cause: "",
            prescription: "",
            mobile: "",
            email: "",
            attachmentUrl: "",
        });
        setEditingPatient(null);
    };

    // 🔹 File Upload
    const handleFileUpload = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: "*/*",
                copyToCacheDirectory: true,
            });

            if (result.canceled) return;

            setUploading(true);
            const file = result.assets[0];
            const response = await fetch(file.uri);
            const blob = await response.blob();

            const fileRef = ref(storage, `attachments/${Date.now()}_${file.name}`);
            await uploadBytes(fileRef, blob);
            const downloadUrl = await getDownloadURL(fileRef);

            setNewPatient({ ...newPatient, attachmentUrl: downloadUrl });
            Alert.alert("File Uploaded", "Attachment uploaded successfully!");
        } catch (err) {
            console.error("File upload error:", err);
            Alert.alert("Error", "Failed to upload attachment");
        } finally {
            setUploading(false);
        }
    };

    // 🔹 Add or Update Patient
    const handleAddOrUpdatePatient = async () => {
        const { name, address, disease, mobile } = newPatient;

        if (!name || !address || !disease || !mobile) {
            Alert.alert("Error", "Please fill in all required fields.");
            return;
        }

        try {
            const user = auth.currentUser;
            if (!user) {
                Alert.alert("Error", "User not authenticated");
                return;
            }

            const doctorId = user.uid;
            const doctorName = user.displayName || "Unknown Doctor";

            const patientsCol = collection(db, "users", doctorId, "patients");
            const visitDate = new Date().toISOString();

            if (editingPatient) {
                // 🔄 Update in doctor's subcollection
                const docRef = doc(db, "users", doctorId, "patients", editingPatient.id);
                await updateDoc(docRef, {
                    ...newPatient,
                    updatedAt: serverTimestamp(),
                    visitDate,
                });

                // 🔄 Update in global record
                const globalRef = doc(db, "patients", mobile);
                await updateDoc(globalRef, {
                    name,
                    address,
                    email: newPatient.email || "",
                    lastUpdated: serverTimestamp(),
                    visitHistory: arrayUnion({
                        doctorId,
                        doctorName,
                        date: visitDate,
                    }),
                });

                Alert.alert("✅ Success", "Patient details updated successfully.");
            } else {
                // 🆕 Add to doctor's subcollection
                const docRef = await addDoc(patientsCol, {
                    ...newPatient,
                    dateAdded: serverTimestamp(),
                    visitDate,
                });

                // 🧭 Add or update global record
                const globalRef = doc(db, "patients", mobile);
                const snap = await getDoc(globalRef);

                if (snap.exists()) {
                    const data = snap.data();
                    const updatedDoctors = data.linkedDoctors
                        ? Array.from(new Set([...data.linkedDoctors, doctorId]))
                        : [doctorId];

                    await updateDoc(globalRef, {
                        linkedDoctors: updatedDoctors,
                        lastUpdated: serverTimestamp(),
                        visitHistory: arrayUnion({
                            doctorId,
                            doctorName,
                            date: visitDate,
                        }),
                    });
                } else {
                    await setDoc(globalRef, {
                        name,
                        address,
                        email: newPatient.email || "",
                        mobile,
                        linkedDoctors: [doctorId],
                        createdAt: serverTimestamp(),
                        lastUpdated: serverTimestamp(),
                        visitHistory: [
                            {
                                doctorId,
                                doctorName,
                                date: visitDate,
                            },
                        ],
                    });
                }

                Alert.alert("✅ Success", "Patient added successfully.");
            }

            resetForm();
            setFormVisible(false);
            if (!showPatients) setShowPatients(true);
        } catch (err) {
            console.error("🔥 Error adding/updating patient:", err);
            Alert.alert("Error", err.message || "Could not save patient");
        }
    };

    // 🔹 Search by name, address, mobile, email, or date
    const filteredPatients = patients.filter((p) => {
        const q = searchQuery.toLowerCase().trim();
        const dateString = p.dateAdded
            ? new Date(p.dateAdded.toDate ? p.dateAdded.toDate() : p.dateAdded)
                .toISOString()
                .slice(0, 10)
            : "";
        const localDate = p.dateAdded
            ? new Date(p.dateAdded.toDate ? p.dateAdded.toDate() : p.dateAdded)
                .toLocaleDateString()
            : "";

        return (
            p.name?.toLowerCase().includes(q) ||
            p.address?.toLowerCase().includes(q) ||
            p.mobile?.toLowerCase().includes(q) ||
            p.email?.toLowerCase().includes(q) ||
            dateString.includes(q) ||
            localDate.includes(q)
        );
    });

    const handleEdit = (patient) => {
        setEditingPatient(patient);
        setNewPatient(patient);
        setFormVisible(true);
    };

    return (
        <View style={styles.container}>
            {/* Top Buttons */}
            <View style={styles.topButtons}>
                <Button
                    title={formVisible ? "Cancel" : "Add Patient"}
                    onPress={() => {
                        if (formVisible) resetForm();
                        setFormVisible(!formVisible);
                    }}
                />
                <View style={{ width: 10 }} />
                <Button
                    title={showPatients ? "Hide Patients" : "View Patients"}
                    onPress={() => setShowPatients(!showPatients)}
                />
            </View>

            {/* Add/Edit Form */}
            {formVisible && (
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
                >
                    <View style={styles.formContainer}>
                        <Text style={styles.formTitle}>
                            {editingPatient ? "Edit Patient" : "Add Patient"}
                        </Text>

                        {[
                            { field: "name", placeholder: "Patient Name *" },
                            { field: "address", placeholder: "Address *" },
                            { field: "disease", placeholder: "Disease *" },
                            { field: "cause", placeholder: "Cause" },
                            { field: "prescription", placeholder: "Prescription" },
                            { field: "mobile", placeholder: "Mobile Number *" },
                            { field: "email", placeholder: "Email" },
                        ].map((input) => (
                            <TextInput
                                key={input.field}
                                style={styles.input}
                                placeholder={input.placeholder}
                                value={newPatient[input.field]}
                                onChangeText={(text) => handleChange(input.field, text)}
                            />
                        ))}

                        {/* File Upload */}
                        <TouchableOpacity
                            style={styles.uploadButton}
                            onPress={handleFileUpload}
                            disabled={uploading}
                        >
                            <Text style={styles.uploadText}>
                                {uploading ? "Uploading..." : "📎 Attach File"}
                            </Text>
                        </TouchableOpacity>

                        {newPatient.attachmentUrl ? (
                            <Text style={styles.linkText}>
                                ✅ File Attached ({newPatient.attachmentUrl.split("/").pop()})
                            </Text>
                        ) : null}

                        <Button
                            title={editingPatient ? "Save Changes" : "Submit Patient"}
                            onPress={handleAddOrUpdatePatient}
                        />
                    </View>
                </KeyboardAvoidingView>
            )}

            {/* Patient List */}
            {showPatients && (
                <View style={{ marginTop: 10 }}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by name, address, mobile, email, or date"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    <ScrollView style={styles.cardList}>
                        {filteredPatients.length > 0 ? (
                            filteredPatients.map((p) => (
                                <View key={p.id} style={styles.card}>
                                    <Text style={styles.cardTitle}>{p.name}</Text>
                                    <Text>🏠 {p.address}</Text>
                                    <Text>🦠 {p.disease}</Text>
                                    {p.mobile ? <Text>📞 {p.mobile}</Text> : null}
                                    {p.email ? <Text>📧 {p.email}</Text> : null}
                                    {p.cause ? <Text>🔍 {p.cause}</Text> : null}
                                    {p.prescription ? <Text>💊 {p.prescription}</Text> : null}
                                    <Text style={styles.date}>
                                        📅{" "}
                                        {p.dateAdded
                                            ? new Date(
                                                p.dateAdded.toDate ? p.dateAdded.toDate() : p.dateAdded
                                            ).toLocaleDateString()
                                            : ""}
                                    </Text>
                                    {p.attachmentUrl ? (
                                        <Text
                                            style={styles.linkText}
                                            onPress={() => Alert.alert("Open File", p.attachmentUrl)}
                                        >
                                            📎 View Attachment
                                        </Text>
                                    ) : null}

                                    <TouchableOpacity
                                        onPress={() => handleEdit(p)}
                                        style={styles.editBtn}
                                    >
                                        <Text style={{ color: "white", fontWeight: "bold" }}>
                                            ✏️ Edit
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            ))
                        ) : (
                            <Text style={{ textAlign: "center", marginTop: 20 }}>
                                No matching patients found.
                            </Text>
                        )}
                    </ScrollView>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginTop: 20, flex: 1, paddingHorizontal: 10 },
    topButtons: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginBottom: 10,
    },
    formContainer: { marginTop: 20, marginLeft: 10 },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        marginBottom: 10,
        borderRadius: 8,
        backgroundColor: "#fff",
    },
    searchInput: {
        borderWidth: 1,
        borderColor: "#aaa",
        padding: 10,
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 10,
        borderRadius: 8,
        backgroundColor: "#fff",
    },
    cardList: { marginTop: 10, maxHeight: 400 },
    card: {
        backgroundColor: "#f2f6ff",
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        borderWidth: 2,
        borderColor: "#dbe9ff",
    },
    cardTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
    date: { marginTop: 5, fontSize: 12, color: "#666" },
    uploadButton: {
        backgroundColor: "#007bff",
        padding: 10,
        borderRadius: 6,
        alignItems: "center",
        marginBottom: 10,
    },
    uploadText: { color: "#fff", fontWeight: "bold" },
    linkText: {
        color: "#007bff",
        textDecorationLine: "underline",
        marginBottom: 10,
    },
    editBtn: {
        marginTop: 10,
        backgroundColor: "#0063dbff",
        padding: 8,
        borderRadius: 6,
        alignItems: "center",
    },
});
