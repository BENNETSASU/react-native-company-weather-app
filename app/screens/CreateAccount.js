import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import colors from "../config/colors"; // Use your color configuration if necessary

function ViewImageScreen({ navigation }) { // Add navigation as a prop
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }
    setIsSubmitting(true);
    // Simulate an API call or authentication logic here
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert("Success", "Login successful!");
      // Navigate to the "Index" screen after successful login
      navigation.navigate("IndexScreen"); // Assuming "Index" is the name of the screen you want to navigate to
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      {/* Email Input */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={colors.medium || "#999"}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={(text) => setEmail(text)}
      />

      {/* Password Input */}
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={colors.medium || "#999"}
        secureTextEntry
        value={password}
        onChangeText={(text) => setPassword(text)}
      />

      {/* Login Button */}
      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleLogin}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <Text style={styles.buttonText}>Logging in...</Text>
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>

      {/* Register Button
      <TouchableOpacity
        style={styles.registerButton}
        onPress={() => {
          // Handle registration logic or navigate to Register Screen
          Alert.alert("Redirect", "Navigate to Register Screen");
        }}
      >
        <Text style={styles.buttonText}>Don't have an account? Register</Text>
      </TouchableOpacity>
       */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 40,
    color: colors.primary || "#007BFF",
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: colors.medium || "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingLeft: 15,
    fontSize: 16,
  },
  loginButton: {
    width: "100%",
    height: 50,
    backgroundColor: colors.primary || "#007BFF",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
    marginBottom: 20,
  },
  registerButton: {
    width: "100%",
    height: 50,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default ViewImageScreen;
