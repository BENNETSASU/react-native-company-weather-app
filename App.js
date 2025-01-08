import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
// Uncomment these lines if the screens are ready
// import WelcomeScreen from "./app/screens/WelcomeScreen";
// import ViewImageScreen from "./app/screens/ViewImageScreen";
import IndexScreen from "./app/screens/IndexScreen";

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="IndexScreen">
        {/* Uncomment and adjust these screens as needed */}
        {/*
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ViewImage"
          component={ViewImageScreen}
          options={{ headerShown: false }}
        />
        */}
        <Stack.Screen
          name="IndexScreen"
          component={IndexScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
