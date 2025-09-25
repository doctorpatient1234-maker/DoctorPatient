/*import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function DoctorDetails({ route }) {
  const { doctor } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{doctor.fullName}</Text>
      <Text style={styles.info}>Degree: {doctor.degree}</Text>
      <Text style={styles.info}>Specialization: {doctor.specialization}</Text>
      <Text style={styles.info}>Availability: {doctor.availability}</Text>
      <Text style={styles.info}>Fees: ₹{doctor.fees}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  name: { fontSize: 24, fontWeight: "bold", color: "#0063dbff", marginBottom: 10 },
  info: { fontSize: 16, marginVertical: 4, color: "#333" },
});
