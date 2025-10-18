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

    // Load patients for this doctor
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

            const patientsCol = collection(db, "users", user.uid, "patients");

            if (editingPatient) {
                // ✅ Get reference to the document being edited
                const docRef = doc(db, "users", user.uid, "patients", editingPatient.id);

                // ✅ Prepare only the editable fields
                const updatedData = {
                    name: newPatient.name,
                    address: newPatient.address,
                    disease: newPatient.disease,
                    cause: newPatient.cause || "",
                    prescription: newPatient.prescription || "",
                    mobile: newPatient.mobile,
                    email: newPatient.email || "",
                    attachmentUrl: newPatient.attachmentUrl || "",
                    updatedAt: new Date().toISOString(), // track updates
                };

                // ✅ Update Firestore
                await updateDoc(docRef, updatedData);

                Alert.alert("✅ Success", "Patient details updated successfully.");
            } else {
                // ✅ Add new document
                await addDoc(patientsCol, {
                    ...newPatient,
                    dateAdded: new Date().toISOString(),
                });
                Alert.alert("✅ Success", "Patient added successfully.");
            }

            resetForm();
            setFormVisible(false);
            if (!showPatients) setShowPatients(true);
        } catch (err) {
            console.error("Error adding/updating patient:", err);
            Alert.alert("Error", "Could not save patient. Check console for details.");
        }
    };


    // ✅ Search by name, address, mobile, email, or date
    const filteredPatients = patients.filter((p) => {
        const q = searchQuery.toLowerCase().trim();
        const dateString = new Date(p.dateAdded).toISOString().slice(0, 10); // YYYY-MM-DD
        const localDate = new Date(p.dateAdded).toLocaleDateString();

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
                                        📅 {new Date(p.dateAdded).toLocaleDateString()}
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
