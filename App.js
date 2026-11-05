import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CalenderScreen from "./src/screens/CalenderScreen";
import EditEventScreen from "./src/screens/EditEventScreen";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ActionSheetProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="CalenderScreen"
            component={CalenderScreen}
            options={{ title: "Calender" }}
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
