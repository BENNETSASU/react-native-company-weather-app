import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
// Correct imports for screens
import HomeScreen from "./app/screens/HomePage";  // Make sure the Home screen is properly imported
import IndexScreen from "./app/screens/IndexScreen";  // Make sure IndexScreen is correctly imported
import WelcomeScreen from "./app/screens/WelcomeScreen";  // Make sure IndexScreen is correctly imported
import SplashScreen from "./app/screens/SplashScreen";
import ViewImageScreen from "./app/screens/CreateAccount";
const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="HomeScreen">
      <Stack.Screen
          name="SplashScreen"
          component={SplashScreen} // Fixed: Added Home component
          options={{ headerShown: false }} // Optional: hide header
        />
        
        <Stack.Screen
          name="HomeScreen"
          component={HomeScreen} // Fixed: Added Home component
          options={{ headerShown: false }} // Optional: hide header
        />
        
        <Stack.Screen
          name="IndexScreen"
          component={IndexScreen} // IndexScreen component must be imported above
          options={{ headerShown: false }} // Optional: hide header
        />

        <Stack.Screen
          name="WelcomeScreen"
          component={WelcomeScreen} // IndexScreen component must be imported above
          options={{ headerShown: false }} // Optional: hide header
        />

<Stack.Screen
          name="CreateAccount"
          component={ViewImageScreen} // IndexScreen component must be imported above
          options={{ headerShown: false }} // Optional: hide header
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
