/*import React from "react";
import { View, Text } from "react-native";

export default function DoctorDashboard() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Doctor Dashboard</Text>
    </View>
  );
}
*/



import React from "react";
import { View, Text, Button } from "react-native";
import { auth } from "../firebaseConfig";
import { signOut } from "firebase/auth";

export default function DoctorDashboard() {
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Doctor Akash Dashboard</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}
