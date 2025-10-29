import React from "react";
import { useState } from "react";
import { View, Text, StyleSheet, Button, SafeAreaView } from "react-native";
import { auth } from "../firebaseConfig";
import DoctorDetails from "./DoctorDetails";


export default function DoctorDashboard({ navigation }) {
  const handleLogout = async () => {
    await auth.signOut();
    navigation.replace("Login");
  };

  return (
    <SafeAreaView style={styles.safeArea}>

      <View style={styles.container}>

        <View style={{ alignItems: "center" }}>
          <Text style={styles.title}>👨‍⚕️ Doctor Dashboard</Text>
          <Text style={styles.subtitle}>
            Welcome, Doctor! Here you’ll see patient lists, appointments, etc.
          </Text>
        </View>



        {/* Doctor Info (contains its own scroll view) ..*/}
        <DoctorDetails />


      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
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
