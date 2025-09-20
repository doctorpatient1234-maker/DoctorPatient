import React, { useState } from "react";
import { View, TextInput, Button, Text, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker"; // install if not already
import { auth, db } from "../firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient"); // default role

  const handleRegister = async () => {
    try {
      // Create user in Firebase Authentication
      const userCred = await createUserWithEmailAndPassword(auth, email, password);

      // Save user info in Firestore under `users/{uid}`
      await setDoc(doc(db, "users", userCred.user.uid), {
        email: email,
        role: role,
      });

      alert(`Registered as ${role}`);
      navigation.replace("Login"); // go back to login screen
    } catch (err) {
      alert("Registration failed: " + err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Email:</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Text style={styles.label}>Password:</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Text style={styles.label}>Select Role:</Text>
      <Picker
        selectedValue={role}
        onValueChange={(itemValue) => setRole(itemValue)}
        style={styles.input}
      >
        <Picker.Item label="Patient" value="patient" />
        <Picker.Item label="Doctor" value="doctor" />
      </Picker>

      <Button title="Register" onPress={handleRegister} />
      <View style={{ marginTop: 10 }}>
        <Button title="Go to Login" onPress={() => navigation.navigate("Login")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  label: { marginTop: 10, fontWeight: "bold" },
  input: { borderWidth: 1, padding: 10, marginVertical: 5, borderRadius: 5 },
});
