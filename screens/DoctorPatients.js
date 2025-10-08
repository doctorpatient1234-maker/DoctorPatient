import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Button,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
  SafeAreaView,
} from "react-native";
import { auth, db } from "../firebaseConfig";
import { collection, addDoc, query, where, onSnapshot } from "firebase/firestore";

const { width } = Dimensions.get("window");

export default function DoctorPatients() {
  const [showForm, setShowForm] = useState(false);
  const [patients, setPatients] = useState([]);
  const [newPatient, setNewPatient] = useState({
    name: "",
    mobile: "",
    address: "",
  });
  const [saving, setSaving] = useState(false);

  // Fetch all patients for logged-in doctor
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, "patients"), where("doctorId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPatients(data);
    });

    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    if (!newPatient.name || !newPatient.mobile || !newPatient.address) {
      alert("Please fill all fields");
      return;
    }

    try {
      setSaving(true);
      const user = auth.currentUser;
      if (!user) throw new Error("User not logged in");

      await addDoc(collection(db, "patients"), {
        ...newPatient,
        doctorId: user.uid,
        createdAt: new Date(),
      });

      setNewPatient({ name: "", mobile: "", address: "" });
      setShowForm(false);
    } catch (error) {
      console.error("Error adding patient:", error);
      alert("Error adding patient: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, width: "100%" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <Text style={styles.heading}>🩺 My Patients</Text>

          {/* Add Patient Button */}
          {!showForm && (
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(true)}>
              <Text style={styles.addBtnText}>➕ Add Patient</Text>
            </TouchableOpacity>
          )}

          {/* Add Patient Form */}
          {showForm && (
            <View style={styles.form}>
              <Text style={styles.formTitle}>Add New Patient</Text>

              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={newPatient.name}
                onChangeText={(text) => setNewPatient({ ...newPatient, name: text })}
              />

              <TextInput
                style={styles.input}
                placeholder="Mobile Number"
                keyboardType="phone-pad"
                value={newPatient.mobile}
                onChangeText={(text) => setNewPatient({ ...newPatient, mobile: text })}
              />

              <TextInput
                style={[styles.input, { height: 80 }]}
                placeholder="Address"
                multiline
                value={newPatient.address}
                onChangeText={(text) => setNewPatient({ ...newPatient, address: text })}
              />

              <View style={styles.btnGroup}>
                <Button title={saving ? "Saving..." : "Save"} onPress={handleSave} />
                <View style={{ marginTop: 10 }}>
                  <Button title="Cancel" color="gray" onPress={() => setShowForm(false)} />
                </View>
              </View>
            </View>
          )}

          {/* Patient List */}
          {patients.length === 0 ? (
            <Text style={styles.noData}>No patients added yet.</Text>
          ) : (
            patients.map((p) => (
              <View key={p.id} style={styles.card}>
                <Text style={styles.cardTitle}>{p.name}</Text>
                <Text style={styles.cardText}>📞 {p.mobile}</Text>
                <Text style={styles.cardText}>🏠 {p.address}</Text>
              </View>
            ))
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F8F9FA",
    padding: 15,
    alignItems: "center",
    width: "100%",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0063dbff",
    marginBottom: 15,
    textAlign: "center",
  },
  addBtn: {
    backgroundColor: "#0063dbff",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
    width: "100%",
  },
  addBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  form: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 20,
    width: "100%",
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    width: "100%",
  },
  btnGroup: {
    marginTop: 5,
  },
  noData: {
    textAlign: "center",
    color: "#777",
    marginTop: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    width: width - 30,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOpacity: Platform.OS === "web" ? 0.1 : 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0063dbff",
  },
  cardText: {
    marginTop: 5,
    fontSize: 15,
    color: "#333",
  },
});
