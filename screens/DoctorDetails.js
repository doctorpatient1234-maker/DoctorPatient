import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Pressable,
  Button
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "../firebaseConfig";
import { doc, onSnapshot } from "firebase/firestore";

const { width, height } = Dimensions.get("window");

// Responsive drawer width based on screen size
const isSmallScreen = width < 768; // Treat screens <768px as mobile
const drawerWidth = isSmallScreen ? width * 0.7 : width * 0.3;

export default function Dashboard({ navigation }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const slideAnim = useRef(new Animated.Value(-drawerWidth)).current;

  /*const handleLogout = async () => {
      await auth.signOut();
      navigation.replace("Login");              //This function is giving err "TypeError: Cannot read properties of undefined (reading 'replace')". 
    };
*/
    const handleLogout = async () => {
  await auth.signOut();
  if (navigation?.replace) {
    navigation.replace("Login");
  } else {
    // fallback for web
    window.location.href = "/login";
  }
};

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const unsub = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      if (docSnap.exists()) setUserData(docSnap.data());
    });

    return () => unsub();
  }, []);

  const openMenu = () => {
    setMenuOpen(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const closeMenu = () => {
    Animated.timing(slideAnim, {
      toValue: -drawerWidth,
      duration: 300,
      useNativeDriver: false,
    }).start(() => setMenuOpen(false));
  };

  return (
    <View style={styles.container}>
      {/* Top Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={openMenu} style={styles.hamburger}>
          <Ionicons name="menu" size={32} color="#0063dbff" />
        </TouchableOpacity>
        <Text style={styles.title}>My App</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.welcome}>Welcome 👋</Text>
        <Text style={styles.hint}>Click ☰ to see your details</Text>
      </View>

      {/* Drawer + Overlay */}
      {menuOpen && (
        <>
          <Pressable style={styles.overlay} onPress={closeMenu} />
          <Animated.View
            style={[
              styles.drawer,
              { width: drawerWidth, height: height, transform: [{ translateX: slideAnim }] },
            ]}
          >
            <View style={styles.drawerContent}>
              {userData ? (
                <>
                  <Text style={styles.drawerItem}>👤 {userData.fullName}</Text>
                  <Text style={styles.drawerItem}>💼 {userData.role}</Text>
                  <Text style={styles.drawerItem}>📧 {userData.email}</Text>
                  <View style={styles.logoutBtn}>
                            <Button title="Logout" onPress={handleLogout} />
                  </View>
                </>
              ) : (
                <Text style={styles.drawerItem}>Loading...</Text>
              )}
            </View>
          </Animated.View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },

  navbar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 15,
    elevation: 5,
  },
  title: { fontSize: 20, fontWeight: "bold", color: "#0063dbff", marginLeft: 50 },
  hamburger: { position: "absolute", left: 20, top: 15 },

  content: { flex: 1, justifyContent: "center", alignItems: "center" },
  welcome: { fontSize: 22, fontWeight: "bold", color: "#333" },
  hint: { marginTop: 10, fontSize: 16, color: "#777" },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 5,
  },

  drawer: {
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: "#fff",
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    zIndex: 10,
  },
  drawerContent: { padding: 20 },
  drawerItem: { fontSize: 18, fontWeight: "500", marginBottom: 15, color: "#333" },

  logoutBtn: {
    alignSelf: "flex-start",
    marginBottom: 20,
  },
});
