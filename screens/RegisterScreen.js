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
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }
    setLoading(true);
    try {
      // Create user in Firebase Auth
      const userCred = await createUserWithEmailAndPassword(auth, email, password);

      // Save user info in Firestore
      await setDoc(doc(db, "users", userCred.user.uid), {
        fullName,
        email,
        role,
      });

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

      {/* Email */}
      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={20} color="#0063dbff" />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      {/* Password */}
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

      {/* Role Dropdown */}
      <View style={styles.inputContainer}>
        <Ionicons name="briefcase-outline" size={20} color="#0063dbff" />
        <Picker
          selectedValue={role}
          style={styles.picker}
          onValueChange={(itemValue) => setRole(itemValue)}
        >
          <Picker.Item label="Doctor" value="doctor" />
          <Picker.Item label="Patient" value="patient" />
        </Picker>
      </View>

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
  picker: { flex: 1, marginLeft: 10 },
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
