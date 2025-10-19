// screens/HospitalDashboard.js
import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { auth } from "../../firebaseConfig";

export default function HospitalDashboard({ navigation }) {
    const handleLogout = async () => {
        try {
            await auth.signOut();
            navigation.replace("Login");
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Hospital Admin Dashboard</Text>
            <Text>Manage doctors in your hospital here.</Text>

            <View style={{ marginTop: 20 }}>
                <Button title="Logout" onPress={handleLogout} />
            </View>
        </View>
    );
}


const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center" },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
});
