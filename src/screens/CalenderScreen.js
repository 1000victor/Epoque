import { StatusBar } from "expo-status-bar";
import styles from "../styles";
import { useState, useEffect } from "react";
import { Button, View, Platform, Text } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Location from "expo-location";

export default function CalenderScreen({ navigation }) {
  const [sunday, setSunday] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - date.getDay());
    return date;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  // weatherJSON stored here
  const [weatherJSON, setWeatherJSON] = useState(null);

  const weatherCode = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snowfall",
    73: "Moderate snowfall",
    75: "Heavy snowfall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    97: "Heavy thunderstorm",
    99: "Thunderstorm with heavy hail",
  };

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

  // Function for fetching forecast array
  async function fetchWeather() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      let latitude = 52.52; // Default fallback
      let longitude = 13.41;

      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({});
        latitude = location.coords.latitude;
        longitude = location.coords.longitude;
      } else {
        console.error(
          "Permission to access location was denied. Using default.",
        );
      }
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code&hourly=temperature_2m`;
      const response = await fetch(url);
      if (!response.ok) {
        console.error("Weather fetch failed");
      }
      const data = await response.json();
      setWeatherJSON(data);
    } catch (e) {
      console.error(e);
    }
  }

  const getWeatherForDay = (day) => {
    if (!weatherJSON || !weatherJSON.daily) {
      return "Loading weather...";
    }

    // Format day to "YYYY-MM-DD"
    const year = day.getFullYear();
    const month = String(day.getMonth() + 1).padStart(2, "0");
    const d = String(day.getDate()).padStart(2, "0");
    const targetDateString = `${year}-${month}-${d}`;

    // indexOf finds the first occurance in an array, returns -1 if fails
    const apiIndex = weatherJSON.daily.time.indexOf(targetDateString);

    if (apiIndex !== -1) {
      const code = weatherJSON.daily.weather_code[apiIndex];
      return weatherCode[code] || "Unknown weather";
    }

    return "No forecast available";
  };

  // Load weather prediction array for next 7 days on mount
  useEffect(() => {
    fetchWeather();
  }, []);

  return (
    <View style={styles?.container}>
      <View style={styles.navigationBar}>
        <Button onPress={() => updateSunday("prev")} title="<" />
        <Button
          onPress={() => setShowDatePicker(true)}
          title={
            weekdays[0].toDateString() + " - " + weekdays[6].toDateString()
          }
        />
        <Button onPress={() => updateSunday("next")} title=">" />
      </View>
      {weekdays.map((day, index) => (
        <View key={index} style={styles.dayContainer}>
          <View style={styles.dayHeader}>
            <Text style={styles.dayText}>{day.toDateString()}</Text>
            <Text style={styles.eventText}>Event Name Here</Text>
            <Text style={styles.weatherText}>{getWeatherForDay(day)}</Text>
          </View>
          {/* Insert collection of images here */}
          <Text>Images Here</Text>
        </View>
      ))}

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
