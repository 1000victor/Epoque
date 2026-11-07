import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "./src/screens/LoginScreen";
import CalenderScreen from "./src/screens/CalenderScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LoginScreen">
        <Stack.Screen name="LoginScreen" component={LoginScreen} />

        <Stack.Screen name="CalendarScreen" component={CalenderScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
