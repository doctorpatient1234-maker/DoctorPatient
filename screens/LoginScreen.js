import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

export default function LoginScreen({ navigation }) {
  const [emailOrMobile, setEmailOrMobile] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const fadeAnim = useState(new Animated.Value(0))[0];

  const showError = (message) => {
    setErrorMsg(message);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, 3000);
  };

  const handleLogin = async () => {
    try {
      let emailToUse = emailOrMobile;

      // ✅ STEP 1: If input is mobile, find its email in users or hospitals collection
      if (!emailOrMobile.includes("@")) {
        let emailFound = null;

        // 🔹 Check "users" collection (doctors/patients)
        const userQuery = query(collection(db, "users"), where("mobile", "==", emailOrMobile));
        const userSnap = await getDocs(userQuery);

        if (!userSnap.empty) {
          const userData = userSnap.docs[0].data();
          emailFound = userData.email;
        }

        // 🔹 If not found, check "hospitals" collection
        if (!emailFound) {
          const hospitalQuery = query(collection(db, "hospitals"), where("mobile", "==", emailOrMobile));
          const hospitalSnap = await getDocs(hospitalQuery);

          if (!hospitalSnap.empty) {
            const hospitalData = hospitalSnap.docs[0].data();
            emailFound = hospitalData.email;
          }
        }

        if (!emailFound) {
          showError("No account found with this mobile number.");
          return;
        }

        emailToUse = emailFound;
      }

      // ✅ STEP 2: Sign in with Email + Password
      const userCred = await signInWithEmailAndPassword(auth, emailToUse, password);
      const uid = userCred.user.uid;

      // ✅ STEP 3: Check if it's a doctor/patient
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const role = userDoc.data().role;
        if (role === "doctor") {
          navigation.replace("DoctorDashboard");
        } else {
          navigation.replace("PatientDashboard");
        }
        return;
      }

      // ✅ STEP 4: Check if it's a hospital admin
      const hospitalDoc = await getDoc(doc(db, "hospitals", uid));
      if (hospitalDoc.exists()) {
        navigation.replace("HospitalDashboard");
        return;
      }

      // ❌ No valid record found
      showError("No account found. Please register again.");

    } catch (err) {
      console.error("Login Error:", err);
      let errorMessage = "Something went wrong. Please try again.";

      switch (err.code) {
        case "auth/invalid-email":
          errorMessage = "Invalid email format.";
          break;
        case "auth/user-not-found":
          errorMessage = "No account found with this email.";
          break;
        case "auth/wrong-password":
          errorMessage = "Incorrect password.";
          break;
        case "auth/invalid-credential":
          errorMessage = "Invalid email or password.";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many failed attempts. Try again later.";
          break;
      }

      showError(errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {errorMsg ? (
        <Animated.View style={[styles.errorBanner, { opacity: fadeAnim }]}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </Animated.View>
      ) : null}

      <Ionicons name="medkit" size={60} color="#0063dbff" style={styles.icon} />
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Login using email or mobile number</Text>

      <View style={styles.inputContainer}>
        <Ionicons name="person-outline" size={20} color="#0063dbff" />
        <TextInput
          style={styles.input}
          placeholder="Email or Mobile number"
          value={emailOrMobile}
          onChangeText={setEmailOrMobile}
          autoCapitalize="none"
          keyboardType="default"
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="#0063dbff" />
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.registerText}>
          Don’t have an account?{" "}
          <Text style={{ color: "#0063dbff", fontWeight: "bold" }}>Register</Text>
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    padding: 20,
  },
  errorBanner: {
    position: "absolute",
    top: 40,
    backgroundColor: "#ff4d4f",
    padding: 12,
    borderRadius: 8,
    width: "85%",
    alignItems: "center",
    zIndex: 10,
  },
  errorText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  icon: {
    marginBottom: 15,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#0063dbff",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginVertical: 8,
    width: "70%",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    marginLeft: 10,
  },
  loginButton: {
    backgroundColor: "#0063dbff",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 20,
    width: "40%",
    alignItems: "center",
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  registerText: {
    marginTop: 15,
    fontSize: 14,
    color: "#333",
  },
});
