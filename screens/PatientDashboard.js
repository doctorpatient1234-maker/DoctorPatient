/*import React from "react";
import { View, Text } from "react-native";

export default function PatientDashboard() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Patient Dashboard</Text>
    </View>
  );
}
*/



import React from "react";
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
