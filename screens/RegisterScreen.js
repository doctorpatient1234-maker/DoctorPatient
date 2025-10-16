import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "../firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient");
  const [specialization, setSpecialization] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName || (!email && !mobile) || (email && !password) || (role === "doctor" && !specialization)) {
      Alert.alert("Error", "Please fill all mandatory fields.\n(Either Email or Mobile number required)");
      return;
    }

    setLoading(true);
    try {
      let userId;

      // If email is provided, create Firebase Auth user
      if (email) {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        userId = userCred.user.uid;
      } else {
        // If only mobile is provided, generate a custom ID
        userId = `mobile_${mobile}`;
      }

      // Prepare user data
      const userData = {
        fullName,
        email: email || null,
        mobile: mobile || null,
        role,
      };

      if (role === "doctor") {
        userData.specialization = specialization;
      }

      // Save user info in Firestore
      await setDoc(doc(db, "users", userId), userData);

      Alert.alert("Success", "Account created successfully!");
      navigation.replace(role === "doctor" ? "DoctorDashboard" : "PatientDashboard");
    } catch (err) {
      Alert.alert("Registration Failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Ionicons name="person-add" size={60} color="#0063dbff" style={styles.icon} />
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Join as Doctor or Patient</Text>

      {/* Full Name */}
      <View style={styles.inputContainer}>
        <Ionicons name="person-outline" size={20} color="#0063dbff" />
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={fullName}
          onChangeText={setFullName}
        />
      </View>


      {/* Mobile */}
      <View style={styles.inputContainer}>
        <Ionicons name="call-outline" size={20} color="#0063dbff" />
        <TextInput
          style={styles.input}
          placeholder="Mobile Number (optional if Email entered)"
          value={mobile}
          onChangeText={setMobile}
          keyboardType="phone-pad"
          maxLength={10}
        />
      </View>

      {/* Email */}
      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={20} color="#0063dbff" />
        <TextInput
          style={styles.input}
          placeholder="Email (optional if Mobile entered)"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      

      {/* Password (only if email entered) */}
      {email ? (
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#0063dbff" />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
      ) : null}

      {/* Role Dropdown */}
      <View style={styles.inputContainer}>
        <Ionicons name="briefcase-outline" size={20} color="#0063dbff" />
        <Picker
          selectedValue={role}
          style={styles.picker}
          onValueChange={(itemValue) => {
            setRole(itemValue);
            setSpecialization("");
          }}
        >
          <Picker.Item label="Doctor" value="doctor" />
          <Picker.Item label="Patient" value="patient" />
        </Picker>
      </View>

      {/* Specialization (Doctor only) */}
      {role === "doctor" && (
        <View style={styles.inputContainer}>
          <Ionicons name="medkit-outline" size={20} color="#0063dbff" />
          <Picker
            selectedValue={specialization}
            style={styles.picker}
            onValueChange={(itemValue) => setSpecialization(itemValue)}
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
        </View>
      )}

      {/* Register Button */}
      <TouchableOpacity
        style={[styles.registerButton, loading && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.registerButtonText}>Register</Text>
        )}
      </TouchableOpacity>

      {/* Login Link */}
      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.loginText}>
          Already have an account?{" "}
          <Text style={{ color: "#0063dbff", fontWeight: "bold" }}>Login</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    padding: 20,
  },
  icon: { marginBottom: 15 },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#0063dbff",
    marginBottom: 5,
  },
  subtitle: { fontSize: 16, color: "#555", marginBottom: 20 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginVertical: 8,
    width: "70%",
    backgroundColor: "#fff",
  },
  input: { flex: 1, marginLeft: 10 },
  picker: { flex: 1, marginLeft: 10, height: 40 },
  registerButton: {
    backgroundColor: "#0063dbff",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 20,
    width: "40%",
    alignItems: "center",
  },
  buttonDisabled: { backgroundColor: "#2980b9", opacity: 0.7 },
  registerButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  loginText: { marginTop: 15, fontSize: 14, color: "#333" },
});
