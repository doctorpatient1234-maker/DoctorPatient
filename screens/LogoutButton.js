// LogoutButton.js
import React from "react";
import { Button, Platform } from "react-native";
import { auth } from "../firebaseConfig";
import { useNavigation } from "@react-navigation/native";

export default function LogoutButton({ unsubRef }) {
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      // Stop snapshot listener before signOut
      if (unsubRef?.current) {
        unsubRef.current();
        unsubRef.current = null;
      }

      // Small delay ensures Firestore unsubscribes cleanly
      await new Promise((res) => setTimeout(res, 300));

      // Sign out user
      await auth.signOut();

      if (Platform.OS === "web") {
        window.location.href = "/login";
      } else {
        navigation.replace("Login");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return <Button title="Logout" onPress={handleLogout} color="#e53935" />;
}
