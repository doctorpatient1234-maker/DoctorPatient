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

const Stack = createStackNavigator();

export default function App() {
  const [initialScreen, setInitialScreen] = useState("Login");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {              // Added so that user will not logout after window refresh
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const role = userDoc.data().role;
            if (role === "doctor") {
              setInitialScreen("DoctorDashboard");
            } else {
              setInitialScreen("PatientDashboard");
            }
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

  if (loading) return null; // or a splash screen

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
