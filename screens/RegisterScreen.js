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

  // Hospital Admin fields
  const [hospitalName, setHospitalName] = useState("");
  const [hospitalState, setHospitalState] = useState("");
  const [hospitalCity, setHospitalCity] = useState("");
  const [hospitalEmail, setHospitalEmail] = useState("");

  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email and password are required.");
      return;
    }

    if (role === "doctor" && (!fullName || !specialization)) {
      Alert.alert("Error", "Please fill all doctor details.");
      return;
    }

    if (role === "hospitalAdmin" && (!hospitalName || !hospitalState || !hospitalCity || !mobile)) {
      Alert.alert("Error", "Please fill all hospital details including mobile.");
      return;
    }

    setLoading(true);

    try {
      // Firebase Auth registration for ALL users (doctor, patient, hospitalAdmin)
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCred.user.uid;


      if (role === "hospitalAdmin") {
        const hospitalId = userId;
        await setDoc(doc(db, "hospitals", hospitalId), {
          adminId: hospitalId,
          hospitalName,
          state: hospitalState,
          city: hospitalCity,
          email,
          mobile,
          createdAt: new Date(),
        });

        Alert.alert("Success", "Hospital registered successfully!");
        navigation.replace("HospitalDashboard");
        return;
      }
      else {
        // Save Doctor or Patient in Firestore
        const userData = {
          fullName,
          email,
          mobile,
          role,
          createdAt: new Date().toISOString(),
        };

        if (role === "doctor") userData.specialization = specialization;

        await setDoc(doc(db, "users", userId), userData);

        Alert.alert("Success", "Account created successfully!");
        navigation.replace(role === "doctor" ? "DoctorDashboard" : "PatientDashboard");
      }
    } catch (err) {
      console.error("Registration Error:", err);
      Alert.alert("Registration Failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Ionicons name="person-add" size={60} color="#0063dbff" style={styles.icon} />
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Join as Doctor, Patient, or Hospital Admin</Text>

      {/* Common fields */}
      {(role === "doctor" || role === "patient") && (
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="#0063dbff" />
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={fullName}
            onChangeText={setFullName}
          />
        </View>
      )}

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

      <View style={styles.inputContainer}>
        <Ionicons name="call-outline" size={20} color="#0063dbff" />
        <TextInput
          style={styles.input}
          placeholder="Mobile Number"
          value={mobile}
          onChangeText={setMobile}
          keyboardType="phone-pad"
          maxLength={10}
        />
      </View>

      {/* Role selection */}
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
          <Picker.Item label="Hospital Admin" value="hospitalAdmin" />
        </Picker>
      </View>

      {/* Doctor specialization */}
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
          </Picker>
        </View>
      )}

      {/* Hospital fields */}
      {role === "hospitalAdmin" && (
        <>
          <View style={styles.inputContainer}>
            <Ionicons name="business-outline" size={20} color="#0063dbff" />
            <TextInput
              style={styles.input}
              placeholder="Hospital Name"
              value={hospitalName}
              onChangeText={setHospitalName}
            />
          </View>
          <View style={styles.inputContainer}>
            <Ionicons name="location-outline" size={20} color="#0063dbff" />
            <TextInput
              style={styles.input}
              placeholder="State"
              value={hospitalState}
              onChangeText={setHospitalState}
            />
          </View>
          <View style={styles.inputContainer}>
            <Ionicons name="location-outline" size={20} color="#0063dbff" />
            <TextInput
              style={styles.input}
              placeholder="City"
              value={hospitalCity}
              onChangeText={setHospitalCity}
            />
          </View>
        </>
      )}

      {/* Register button */}
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
  title: { fontSize: 26, fontWeight: "bold", color: "#0063dbff", marginBottom: 5 },
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
