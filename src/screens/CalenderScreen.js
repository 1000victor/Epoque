import { StatusBar } from "expo-status-bar";
import styles from "../styles";
import { useState } from "react";
import { Button, View, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function CalenderScreen({ navigation }) {
  const [sunday, setSunday] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - date.getDay());
    return date;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Part of fully functional date picker for quick navigation
  const datePicker = (event, selectedDate) => {
    const currentDate = selectedDate || sunday;
    setShowDatePicker(Platform.OS === "ios");
    setSunday(() => {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() - newDate.getDay());
      return newDate;
    });
  };

  // Quickly initialize an array of weekdays
  const weekdays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(sunday);
    day.setDate(day.getDate() + i);
    return day;
  });

  // function for changing months using arrows
  function updateSunday(dir) {
    if (dir !== "next" && dir !== "prev") {
      throw new Error("Invalid dir passed into updateSunday()");
    }
    setSunday((oldSunday) => {
      const updatedSunday = new Date(oldSunday);
      if (dir === "next") {
        updatedSunday.setDate(updatedSunday.getDate() + 7);
      } else if (dir === "prev") {
        updatedSunday.setDate(updatedSunday.getDate() - 7);
      }
      return updatedSunday;
    });
  }

  return (
    <View style={styles?.container}>
      <Button onPress={() => updateSunday("prev")} title="<" />
      <Button
        onPress={() => setShowDatePicker(true)}
        title={weekdays[0].toDateString() + " - " + weekdays[6].toDateString()}
      />
      <Button onPress={() => updateSunday("next")} title=">" />

      {showDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={sunday}
          mode="date"
          is24Hour={true}
          display="default"
          onChange={datePicker}
        />
      )}

      <StatusBar style="auto" />
    </View>
  );
}
