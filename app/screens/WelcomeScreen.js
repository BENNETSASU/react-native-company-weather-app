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
  // const [isLoading, setIsLoading] = useState(true);

  // useEffect(() => {
  //   setTimeout(() => {
  //     //setIsLoading(false);
  //   }, 3000);
  // }, []);

  // if (isLoading) {
  //   return (
  //     <View style={styles.loadingContainer}>
  //       <ActivityIndicator size="large" color="#007BFF" />
  //       source={ require('..//assets/logo_animation_GIF.gif') }
  //     </View>
  //   );
  // }

  return (
    <ImageBackground
      style={styles.background}
   //   source={require("../assets/k.jpg")}
    >
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          style={styles.logo}
          //source={{ uri: "https://media.giphy.com/media/1zxfeeSqszCp5MdVF1/giphy.gif" }}
          source={ require('..//assets/gmetbgr.png') }
        />
         {/* Logo <Text style={styles.tagline}>GROW YOUR OWN FOOD</Text>
    
    */}
     </View>

      {/* Login Button */}
      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => navigation.navigate("HomePage")}
      >
        <Text style={styles.buttonText}>Check the Weather</Text>
      </TouchableOpacity>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
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
    top: 170,
    alignItems: "center",
  },
  logo: {
    width: 300,
    height: 300,
     backgroundColor: "transparent",
  },
  tagline: {
    fontSize: 20,
    fontWeight: "600",
    color: "white",
    marginTop: 10,
    textAlign: "center",
  },
  loginButton: {
    width: "100%",
    height: 70,
    backgroundColor: "rgb(46, 147, 214)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 200,
    borderRadius: 50,
    maxWidth:300
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default WelcomeScreen;
