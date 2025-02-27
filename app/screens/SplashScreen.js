//Splash Screen. First screen
import React, {useEffect} from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

const SplashScreen = ({ navigation }) => {
    useEffect(() => {
      setTimeout(() => {
        // Navigate to the main screen after 5 seconds
        navigation.navigate('HomeScreen');
      }, 5000);
    }, []);

  return (
    // <View style={styles.container}>
    // {/* Animated logo for the splash scsreen */}
    // <Image source={ require('..//assets/ANI.json') }/> 
    // </View>

    <LottieView
      source={require("..//assets/ANI.json")}
      style={{width: "100%", height: "100%"}}
      autoPlay
      loop
    />
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default SplashScreen;