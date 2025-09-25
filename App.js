import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import DoctorDashboard from "./screens/DoctorDashboard";
import PatientDashboard from "./screens/PatientDashboard";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        
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
