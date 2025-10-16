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
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { auth, db } from "../firebaseConfig";
import { collection, addDoc, onSnapshot } from "firebase/firestore";

export default function PatientManager() {
  const [formVisible, setFormVisible] = useState(false);
  const [showPatients, setShowPatients] = useState(false);
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [newPatient, setNewPatient] = useState({
    name: "",
    address: "",
    disease: "",
    cause: "",
    prescription: "",
    mobile: "",
    email: "",
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

  const handleAddPatient = async () => {
    const { name, address, disease, mobile } = newPatient;

    if (!name || !address || !disease || !mobile) {
      Alert.alert("Error", "Please fill in all required fields (name, address, disease, mobile).");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Error", "User not authenticated");
        return;
      }

      const patientsCol = collection(db, "users", user.uid, "patients");
      await addDoc(patientsCol, {
        ...newPatient,
        dateAdded: new Date().toISOString(),
      });

      setNewPatient({
        name: "",
        address: "",
        disease: "",
        cause: "",
        prescription: "",
        mobile: "",
        email: "",
      });

      setFormVisible(false);
      if (!showPatients) setShowPatients(true);
    } catch (err) {
      console.error("Error adding patient:", err);
      Alert.alert("Error", "Could not add patient.");
    }
  };

  // Filter patients by name, address, mobile, email, or date
  const filteredPatients = patients.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.address?.toLowerCase().includes(q) ||
      p.mobile?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      new Date(p.dateAdded).toLocaleDateString().includes(q)
    );
  });

  return (
    <View style={styles.container}>
      {/* Top Buttons */}
      <View style={styles.topButtons}>
        <Button
          title={formVisible ? "Cancel" : "Add Patient"}
          onPress={() => setFormVisible(!formVisible)}
        />
        <View style={{ width: 10 }} />
        <Button
          title={showPatients ? "Hide Patients" : "View Patients"}
          onPress={() => setShowPatients(!showPatients)}
        />
      </View>

      {/* Add Patient Form */}
      {formVisible && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ marginTop: 20, marginLeft: 20 }}>
              <TextInput
                style={styles.input}
                placeholder="Patient Name *"
                value={newPatient.name}
                onChangeText={(text) => handleChange("name", text)}
              />
              <TextInput
                style={styles.input}
                placeholder="Address *"
                value={newPatient.address}
                onChangeText={(text) => handleChange("address", text)}
              />
              <TextInput
                style={styles.input}
                placeholder="Disease *"
                value={newPatient.disease}
                onChangeText={(text) => handleChange("disease", text)}
              />
              <TextInput
                style={styles.input}
                placeholder="Cause"
                value={newPatient.cause}
                onChangeText={(text) => handleChange("cause", text)}
              />
              <TextInput
                style={styles.input}
                placeholder="Prescription"
                value={newPatient.prescription}
                onChangeText={(text) => handleChange("prescription", text)}
              />
              <TextInput
                style={styles.input}
                placeholder="Mobile Number *"
                keyboardType="phone-pad"
                value={newPatient.mobile}
                onChangeText={(text) => handleChange("mobile", text)}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                keyboardType="email-address"
                value={newPatient.email}
                onChangeText={(text) => handleChange("email", text)}
              />
              <Button title="Submit Patient" onPress={handleAddPatient} />
            </View>
          </TouchableWithoutFeedback>
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
  container: { marginTop: 20, flex: 1 },
  topButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 10,
  },
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
  cardList: { marginTop: 10, maxHeight: 300 },
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
});
