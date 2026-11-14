import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "./src/screens/LoginScreen";
import CalendarScreen from "./src/screens/CalendarScreen";
import EditEventScreen from "./src/screens/EditEventScreen";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ActionSheetProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="LoginScreen">
          {/*Mainly to not need to login each time*/}
          {/* <Stack.Navigator initialRouteName="CalendarScreen">  */}
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
          <Stack.Screen
            name="CalendarScreen"
            component={CalendarScreen}
            options={{ title: "Calendar" }}
          />
          <Stack.Screen
            name="EditEventScreen"
            component={EditEventScreen}
            options={{ title: "Edit Event" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ActionSheetProvider>
  );
}
