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
} from "react-native";
import { auth, db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  doc,
} from "firebase/firestore";

export default function PatientManager() {
  const [formVisible, setFormVisible] = useState(false);
  const [showPatients, setShowPatients] = useState(false);
  const [patients, setPatients] = useState([]);

  const [newPatient, setNewPatient] = useState({
    name: "",
    address: "",
    disease: "",
    cause: "",
    prescription: "",
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
    const { name, address, disease } = newPatient;

    if (!name || !address || !disease) {
      Alert.alert("Error", "Please fill in all required fields (name, address, disease).");
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

      // reset form
      setNewPatient({
        name: "",
        address: "",
        disease: "",
        cause: "",
        prescription: "",
      });

      setFormVisible(false);
      if (!showPatients) {
        setShowPatients(true);
      }
    } catch (err) {
      console.error("Error adding patient:", err);
      Alert.alert("Error", "Could not add patient.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topButtons}>
        <Button
          title={formVisible ? "Cancel" : "Add Patient"}
          onPress={() => {
            setFormVisible(!formVisible);
          }}
        />
        <View style={{ width: 10 }} />
        <Button
          title={showPatients ? "Hide Patients" : "View Patients"}
          onPress={() => setShowPatients(!showPatients)}
        />
      </View>

      {formVisible && (
        <View style={{ marginTop: 10 }}>
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

          <Button title="Submit Patient" onPress={handleAddPatient} />
        </View>
      )}

      {showPatients && (
        <ScrollView style={styles.cardList}>
          {patients.map((p) => (
            <View key={p.id} style={styles.card}>
              <Text style={styles.cardTitle}>{p.name}</Text>
              <Text>🏠 {p.address}</Text>
              <Text>🦠 {p.disease}</Text>
              {p.cause ? <Text>🔍 {p.cause}</Text> : null}
              {p.prescription ? <Text>💊 {p.prescription}</Text> : null}
              <Text style={styles.date}>
                📅 {new Date(p.dateAdded).toLocaleDateString()}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({

  container: { marginTop: 20 },

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
  cardList: { marginTop: 15, maxHeight: 300 },
  card: {
    backgroundColor: "#f2f6ff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#dbe9ff",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  date: {
    marginTop: 5,
    fontSize: 12,
    color: "#666",
  },
});
