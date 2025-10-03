import React from "react";
import { View, Text, StyleSheet, Button, ScrollView } from "react-native";
import { auth } from "../firebaseConfig";
import DoctorDetails from "./DoctorDetails";

export default function DoctorDashboard({ navigation }) {
  const handleLogout = async () => {
    await auth.signOut();
    navigation.replace("Login");
  };

  return (
    <View style={styles.container}>
      {/* ScrollView makes it responsive on mobile & laptop */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>👨‍⚕️ Doctor Dashboard</Text>
        <Text style={styles.subtitle}>
          Welcome, Doctor! Here you’ll see patient lists, appointments, etc.
        </Text>

        <View style={styles.logoutBtn}>
          <Button title="Logout" onPress={handleLogout} />
        </View>

        {/* Doctor Info */}
        <DoctorDetails />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA", // light background for real-app feel
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 8,
    color: "#0063dbff",
  },
  subtitle: {
    fontSize: 16,
    color: "#444",
    marginBottom: 20,
  },
  logoutBtn: {
    alignSelf: "flex-start",
    marginBottom: 20,
  },
});
