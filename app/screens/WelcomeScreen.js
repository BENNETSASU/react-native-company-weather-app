import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  ImageBackground,
  View,
  Image,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

function WelcomeScreen({ navigation }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for 3 seconds (you can replace this with any async task)
    setTimeout(() => {
      setIsLoading(false); // Hide the loading screen after 3 seconds
    }, 300);
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      style={styles.background}
      source={require("../assets/k.jpg")}
    >{/* LOGO
      <View style={styles.logoContainer}>
        <Image style={styles.logo} source={require("../assets/p.png")} />
       <Text style={styles.tagline}>GROW YOUR OWN FOOD</Text>
     </View>
     */}

      {/* Login Button */}
      <TouchableOpacity
        style={styles.logingButton}
        onPress={() => navigation.navigate("ViewImage")} // Navigate to ViewImageScreen
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      {/* Register Button */}
      <TouchableOpacity style={styles.registerButton}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff", // You can change this to a background color of your choice
  },
  loadingText: {
    fontSize: 18,
    marginTop: 20,
    fontWeight: "bold",
  },
  background: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  logoContainer: {
    position: "absolute",
    top: 70,
    alignItems: "center",
  },
  logo: {
    width: 100,
    height: 100,
  },
  tagline: {
    fontSize: 20,
    fontWeight: "600",
    color: "white",
    marginTop: 10,
    textAlign: "center",
  },
  logingButton: {
    width: "100%",
    height: 70,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  registerButton: {
    width: "100%",
    height: 70,
    backgroundColor: "orange",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default WelcomeScreen;
