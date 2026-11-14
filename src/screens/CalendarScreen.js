import { StatusBar } from "expo-status-bar";
import styles from "../styles";
import { useState, useEffect, useCallback } from "react";
import {
  Button,
  View,
  Platform,
  Text,
  Pressable,
  FlatList,
  Image,
  Modal,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Location from "expo-location";
import { useFocusEffect } from "@react-navigation/native";
import * as SQLite from "expo-sqlite";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { resolveWebView } from "expo/src/dom/webview-wrapper.ts";

export default function CalenderScreen({ route, navigation }) {
  const user = route.params?.foundUser;
  const [sunday, setSunday] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - date.getDay());
    date.setHours(0, 0, 0, 0);
    return date;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  // weatherJSON stored here
  const [weatherJSON, setWeatherJSON] = useState(null);
  // If location disabled, weather will just say location disabled
  const [locationStatus, setLocationStatus] = useState("loading");
  const [eventData, setEventData] = useState({});
  const [eventImages, setEventImages] = useState({});
  // To allow fix date picker bouncing around
  const [datePickerDate, setDatePickerDate] = useState(() => {
    return new Date(sunday);
  });

  // Weather codes provided by openmeteo api
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
      newDate.setHours(0, 0, 0, 0);
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
  const updateSunday = (dir) => {
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
      updatedSunday.setHours(0, 0, 0, 0);
      return updatedSunday;
    });
  };

  // function to format day to "YYYY-MM-DD"
  const formatDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${d}`;
  };

  // function for grabbing forecast if day is 7 days ahead including now
  const getWeatherForDay = (day) => {
    if (locationStatus === "denied") {
      return "Location disabled";
    }
    if (!weatherJSON || !weatherJSON.daily) {
      return "Loading weather...";
    }
    // indexOf finds the first occurance in an array, returns -1 if fails
    const apiIndex = weatherJSON.daily.time.indexOf(formatDateString(day));

    if (apiIndex !== -1) {
      const code = weatherJSON.daily.weather_code[apiIndex];
      return weatherCode[code] || "Unknown weather";
    }
    return "No forecast available";
  };

  // Allows the calender to be up to date without having to look away
  useFocusEffect(
    useCallback(() => {
      const loadWeek = async () => {
        try {
          const dateStrings = weekdays.map((day) => formatDateString(day));
          const multiStoredText = await AsyncStorage.multiGet(dateStrings);
          const texts = {};
          multiStoredText.forEach(([dateString, titleNote]) => {
            if (titleNote) {
              try {
                texts[dateString] = JSON.parse(titleNote);
              } catch (e) {
                // In case a non json is stored (only really happens while deving)
                texts[dateString] = { title: titleNote };
              }
            }
          });

          const db = await SQLite.openDatabaseAsync("events.db");
          const dbImages = await db.getAllAsync(
            `SELECT * FROM images WHERE dateString IN (${dateStrings.map(() => "?").join(",")})`,
            dateStrings,
          );

          const imagesMap = {};
          dbImages.forEach((img) => {
            if (!imagesMap[img.dateString]) {
              imagesMap[img.dateString] = [];
            }
            imagesMap[img.dateString].push(img);
          });
          setEventData(texts);
          setEventImages(imagesMap);
        } catch (error) {
          console.error("Failed to load week data:", error);
        }
      };
      loadWeek();
    }, [sunday]),
  );

  // Load weather prediction array for next 7 days on mount
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLocationStatus("denied");
          return;
        }
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max&hourly=temperature_2m&timezone=auto`;
        const response = await fetch(url);
        if (!response.ok) {
          console.error("Weather fetch failed");
        }
        const data = await response.json();
        setWeatherJSON(data);
        setLocationStatus("granted");
      } catch (e) {
        console.error(e);
      }
    };
    fetchWeather();
  }, []);

  return (
    <View style={[styles?.container, { flexDirection: "row" }]}>
      <Pressable
        onPress={() => updateSunday("prev")}
        style={({ pressed }) => [
          {
            backgroundColor: pressed ? "#ddd" : "#f0f0f0",
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 8,
            justifyContent: "center",
          },
        ]}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>{"<-"}</Text>
      </Pressable>
      <View style={styles.container}>
        <Button
          onPress={() => setShowDatePicker(true)}
          title={
            weekdays[0].toDateString() + " - " + weekdays[6].toDateString()
          }
        />
        <View style={{ flex: 1, justifyContent: "space-between" }}>
          {weekdays.map((day, index) => {
            const dateStr = formatDateString(day);
            const currentEvent = eventData[dateStr];
            const currentImages = eventImages[dateStr] || [];
            const rawTitle = currentEvent?.title || "";
            const truncatedTitle =
              rawTitle.length > 35
                ? rawTitle.substring(0, 35) + "..."
                : rawTitle;
            return (
              <Pressable
                key={index}
                style={styles.dayContainer}
                onPress={() =>
                  navigation.navigate("EditEventScreen", {
                    dateString: dateStr,
                  })
                }
              >
                <View style={styles.dayHeader}>
                  <View style={{ flexDirection: "column" }}>
                    <Text style={styles.dayText}>{day.toDateString()}</Text>
                    <Text style={styles.eventText}>{truncatedTitle}</Text>
                  </View>

                  <Text style={styles.dayText}>{getWeatherForDay(day)}</Text>
                </View>

                {currentImages.length > 0 && (
                  <FlatList
                    horizontal
                    data={currentImages}
                    keyExtractor={(img) => img.id.toString()}
                    style={[styles.listStyle, { marginVertical: 2 }]}
                    renderItem={({ item: img }) => (
                      <View style={styles.imageContainer}>
                        <Image source={{ uri: img.uri }} style={styles.image} />
                      </View>
                    )}
                  />
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
      <Pressable
        onPress={() => updateSunday("next")}
        style={({ pressed }) => [
          {
            backgroundColor: pressed ? "#ddd" : "#f0f0f0",
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 8,
            justifyContent: "center",
          },
        ]}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>{"->"}</Text>
      </Pressable>

      {showDatePicker && Platform.OS === "android" && (
        <DateTimePicker
          testID="dateTimePicker"
          value={datePickerDate}
          mode="date"
          is24Hour={true}
          display="inline"
          onChange={datePicker}
        />
      )}
      {showDatePicker && Platform.OS === "ios" && (
        <Modal visible={showDatePicker} transparent={true}>
          <View
            style={[
              styles.container,
              { justifyContent: "center", alignItems: "center" },
            ]}
          >
            <DateTimePicker
              testID="dateTimePicker"
              value={datePickerDate}
              mode="date"
              is24Hour={true}
              display="inline"
              onChange={datePicker}
            />
            <Button title="Done" onPress={() => setShowDatePicker(false)} />
          </View>
        </Modal>
      )}
      <StatusBar style="auto" />
    </View>
  );
}
