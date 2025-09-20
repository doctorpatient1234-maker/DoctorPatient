import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { auth, db } from "../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      // 1. Sign in with Firebase Auth
      const userCred = await signInWithEmailAndPassword(auth, email, password);

      // 2. Fetch user document from Firestore
      const userDoc = await getDoc(doc(db, "users", userCred.user.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const role = userData.role;

        // 3. Navigate based on role
        if (role === "doctor") {
          navigation.replace("DoctorDashboard");
        } else {
          navigation.replace("PatientDashboard");
        }
      } else {
        alert("No user role found. Please register again.");
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

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

      <Button title="Login" onPress={handleLogin} />
      <View style={{ height: 10 }} />
      <Button title="Go to Register" onPress={() => navigation.navigate("Register")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: { borderWidth: 1, borderRadius: 5, padding: 10, marginVertical: 8 },
});
