import { StatusBar } from "expo-status-bar";
import styles from "../styles";
import { useState, useEffect, useCallback } from "react";
import {
  Button,
  View,
  Platform,
  Image,
  Text,
  Pressable,
  FlatList,
  Modal,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Location from "expo-location";
import { useFocusEffect } from "@react-navigation/native";
import * as SQLite from "expo-sqlite";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { resolveWebView } from "expo/src/dom/webview-wrapper.ts";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

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
  // To fix date picker bouncing around
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
  const todayStr = formatDateString(new Date());

  // function for grabbing forecast if day is 7 days ahead including now
  const getWeatherForDay = (day) => {
    if (locationStatus === "denied") {
      return "Location disabled";
    }
    if (locationStatus === "error") {
      return "Weather unavailable";
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

  const renderImageCollection = (photos) => {
    const visible = (photos || []).slice(0, 3);
    if (visible.length === 0) return null;
    return (
      <View style={styles.imageCollectionLayer}>
        {visible.map((photo) => (
          <Image
            key={photo.id}
            source={{ uri: photo.uri }}
            resizeMode="cover"
            style={styles.collectionImage}
          />
        ))}
      </View>
    );
  };

  const renderDayCard = (day, { isSaturday = false } = {}) => {
    const dateStr = formatDateString(day);
    const title = String(eventData[dateStr]?.title || "");
    const dayShort = day.toLocaleDateString(undefined, { weekday: "short" });
    return (
      <Pressable
        key={dateStr}
        onPress={() =>
          navigation.navigate("EditEventScreen", { dateString: dateStr })
        }
        style={[
          styles.dayCard,
          isSaturday ? styles.saturdayDayCard : styles.regularDayCard,
          dateStr === todayStr && styles.todayBorder,
        ]}
      >
        {renderImageCollection(eventImages[dateStr])}
        <View style={styles.cardBlackBar}>
          <Text style={styles.cardText}>
            {`${dayShort} ${day.getDate()}: ${title}`}
          </Text>
          <Text style={styles.cardText}>{getWeatherForDay(day)}</Text>
        </View>
      </Pressable>
    );
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
                texts[dateString] = { title: titleNote };
              }
            }
          });

          const db = await SQLite.openDatabaseAsync("events.db");
          await db.execAsync(`
        CREATE TABLE IF NOT EXISTS images (
          id INTEGER,
          dateString TEXT,
          uri TEXT,
          latitude REAL,
          longitude REAL,
          PRIMARY KEY (id)
        );
      `);
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
          setLocationStatus("error");
          return;
        }
        const data = await response.json();
        setWeatherJSON(data);
        setLocationStatus("granted");
      } catch (e) {
        console.error(e);
        setLocationStatus("error");
      }
    };
    fetchWeather();
  }, []);

  return (
    <LinearGradient
      colors={["#a32540", "#ff00f7", "#5747ec"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={{ flex: 1 }}
    >
      <LinearGradient
        colors={["#1a0036", "#ffffff00", "#1a0036"]}
        start={{ x: 0, y: 0.27 }}
        end={{ x: 0, y: 0.66 }}
        style={{ flex: 1 }}
      >
        <SafeAreaView edges={["bottom"]} style={{ flex: 1 }}>
          <View style={styles.container}>
            <Pressable
              style={({ pressed }) => [
                styles.buttonContainer,
                { width: null },
                pressed && { backgroundColor: "#34148b" },
              ]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateRangeText}>
                {weekdays[0].toDateString() +
                  " - " +
                  weekdays[6].toDateString()}
              </Text>
            </Pressable>
            <View style={{ gap: 10, padding: 15 }}>
              {[0, 2, 4].map((startIdx) => (
                <View key={startIdx} style={{ flexDirection: "row", gap: 20 }}>
                  {renderDayCard(weekdays[startIdx])}
                  {renderDayCard(weekdays[1 + startIdx])}
                </View>
              ))}
              {renderDayCard(weekdays[6], { isSaturday: true })}
            </View>
            <Pressable
              onPress={() => updateSunday("prev")}
              style={({ pressed }) => [
                styles.navArrow,
                { left: 4 },
                {
                  backgroundColor: pressed ? "#34148b" : "#242424bd",
                },
              ]}
            >
              <Text style={styles.navArrowText}>{"<"}</Text>
            </Pressable>
            <Pressable
              onPress={() => updateSunday("next")}
              style={({ pressed }) => [
                styles.navArrow,
                { right: 4 },
                {
                  backgroundColor: pressed ? "#34148b" : "#242424bd",
                },
              ]}
            >
              <Text style={styles.navArrowText}>{">"}</Text>
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
              <Modal
                visible={showDatePicker}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowDatePicker(false)}
              >
                <View style={styles.iosModalDim}>
                  <View style={styles.iosModalCard}>
                    <DateTimePicker
                      testID="dateTimePicker"
                      value={datePickerDate}
                      mode="date"
                      is24Hour={true}
                      display="inline"
                      themeVariant="dark"
                      onChange={(event, selectedDate) => {
                        if (selectedDate) {
                          setDatePickerDate(selectedDate);
                        }
                        datePicker(event, selectedDate);
                      }}
                    />
                    <Button
                      title="Done"
                      onPress={() => setShowDatePicker(false)}
                    />
                  </View>
                </View>
              </Modal>
            )}
            <StatusBar style="auto" />
          </View>
        </SafeAreaView>
      </LinearGradient>
    </LinearGradient>
  );
}
