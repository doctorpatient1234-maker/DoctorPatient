/*import React from "react";
import { View, Text, Button } from "react-native";
import { auth } from "../firebaseConfig";
import { signOut } from "firebase/auth";

export default function PatientDashboard() {
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Patient Akash Dashboard</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}
*/

import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { auth } from "../firebaseConfig";

export default function PatientDashboard({ navigation }) {
  const handleLogout = async () => {
    await auth.signOut();
    navigation.replace("Login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧑‍⚕️ Patient Dashboard</Text>
      <Text>Welcome, Patient! Here you’ll see your reports, prescriptions, etc.</Text>

      <View style={{ marginTop: 20 }}>
        <Button title="Logout" onPress={handleLogout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
});
