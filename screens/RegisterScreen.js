import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { auth, db } from "../firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient"); // default role

  const handleRegister = async () => {
    try {
      // 1. Create user with Firebase Auth
      const userCred = await createUserWithEmailAndPassword(auth, email, password);

      // 2. Save extra info (role + email) in Firestore
      await setDoc(doc(db, "users", userCred.user.uid), {
        email: email,
        role: role,
      });

      alert(`Registered as ${role}`);
      navigation.navigate("Login"); // go back to Login screen
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>

      <Text>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <Text>Password</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Text>Select Role</Text>
      <Picker
        selectedValue={role}
        style={styles.input}
        onValueChange={(itemValue) => setRole(itemValue)}
      >
        <Picker.Item label="Patient" value="patient" />
        <Picker.Item label="Doctor" value="doctor" />
      </Picker>

      <Button title="Register" onPress={handleRegister} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: { borderWidth: 1, borderRadius: 5, padding: 10, marginVertical: 8 },
});
