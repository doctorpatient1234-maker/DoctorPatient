import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebaseConfig";

import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import DoctorDashboard from "./screens/DoctorDashboard";
import PatientDashboard from "./screens/PatientDashboard";
import { Platform } from "react-native";

const Stack = createStackNavigator();

export default function App() {
  const [initialScreen, setInitialScreen] = useState("Login");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const role = userDoc.data().role;
            setInitialScreen(role === "doctor" ? "DoctorDashboard" : "PatientDashboard");
          } else {
            setInitialScreen("Login");
          }
        } catch (err) {
          console.error("Error fetching user role:", err);
          setInitialScreen("Login");
        }
      } else {
        setInitialScreen("Login");
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // 👇 Add global scrollbar style for web
  useEffect(() => {
    if (Platform.OS === "web") {
      const style = document.createElement("style");
      style.innerHTML = `
        ::-webkit-scrollbar {
          width: 10px;
        }
        ::-webkit-scrollbar-thumb {
          background-color: rgba(0, 99, 219, 0.6);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background-color: rgba(0, 99, 219, 0.9);
        }
        ::-webkit-scrollbar-track {
          background: #e6e6e6;
          border-radius: 10px;
        }
        html, body {
          overflow-y: scroll; /* ensures scrollbar always visible */
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  if (loading) return null;

  
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialScreen}>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ title: "Register" }}
        />
        <Stack.Screen
          name="DoctorDashboard"
          component={DoctorDashboard}
          options={{ title: "Doctor Dashboard" }}
        />
        <Stack.Screen
          name="PatientDashboard"
          component={PatientDashboard}
          options={{ title: "Patient Dashboard" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
