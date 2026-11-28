import {
  Button,
  View,
  Image,
  Text,
  FlatList,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useState, useEffect, useRef } from "react";
import styles from "../styles";
import * as ImagePicker from "expo-image-picker";
import { useActionSheet } from "@expo/react-native-action-sheet";
import * as SQLite from "expo-sqlite";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditEventScreen({ navigation, route }) {
  const { dateString } = route.params;
  const date = new Date(dateString + "T00:00:00");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [images, setImages] = useState([]);
  const { showActionSheetWithOptions } = useActionSheet();

  // For map stuff
  const imagesWithCoords = images.filter((img) => img.coords !== null);
  const lastAddedCoord =
    imagesWithCoords.length > 0
      ? imagesWithCoords[imagesWithCoords.length - 1].coords
      : null;
  const mapRef = useRef(null);

  // Load stored data on mount and when dateString is updated (screen change)
  useEffect(() => {
    let db;
    const loadEvent = async () => {
      try {
        const savedText = await AsyncStorage.getItem(`${dateString}`);
        const parsedText = savedText
          ? JSON.parse(savedText)
          : { title: "", notes: "" };
        setTitle(parsedText.title);
        setNotes(parsedText.notes);

        db = await SQLite.openDatabaseAsync("events.db");
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
        const eventImages = await db.getAllAsync(
          "SELECT * FROM images WHERE dateString = ?",
          [dateString],
        );
        setImages(
          eventImages.map((img) => ({
            id: img.id,
            uri: img.uri,
            coords:
              img.latitude != null && img.longitude != null
                ? { latitude: img.latitude, longitude: img.longitude }
                : null,
          })),
        );
      } catch (error) {
        console.error("Failed to load event data:", error);
      }
    };
    loadEvent();
  }, [dateString]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={saveChanges}
          style={({ pressed }) => ({
            marginRight: 12,
            paddingHorizontal: 10,
            paddingVertical: 6,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ fontWeight: "bold", fontSize: 15, color: "#007AFF" }}>
            Save Changes
          </Text>
        </Pressable>
      ),
    });
  }, [navigation, title, notes, images]);

  const saveChanges = async () => {
    try {
      await AsyncStorage.setItem(
        `${dateString}`,
        JSON.stringify({ title, notes }),
      );

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
      // Transaction ensures corrupted saves don't happen
      await db.withTransactionAsync(async () => {
        await db.runAsync("DELETE FROM images WHERE dateString = ?;", [
          dateString,
        ]);
        for (const img of images) {
          await db.runAsync(
            "INSERT INTO images (id, dateString, uri, latitude, longitude) VALUES (?, ?, ?, ?, ?);",
            [
              img.id,
              dateString,
              img.uri,
              img.coords?.latitude ?? null,
              img.coords?.longitude ?? null,
            ],
          );
        }
      });

      Alert.alert("Saved", "Your changes have been saved.");
    } catch (error) {
      console.error("Failed to save changes:", error);
      Alert.alert("Error", "Could not save changes.");
    }
  };

  // Haversine fomula found online
  const getDistanceMeters = (coord1, coord2) => {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const R = 6371000; // Earth radius in meters
    const dLat = toRad(coord2.latitude - coord1.latitude);
    const dLon = toRad(coord2.longitude - coord1.longitude);
    const lat1 = toRad(coord1.latitude);
    const lat2 = toRad(coord2.latitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const formatDistance = (meters) => {
    if (meters < 1000) {
      return `${meters.toFixed(1)} m`;
    }
    return `${(meters / 1000).toFixed(2)} km`;
  };

  let totalDistanceMeters = 0;
  for (let i = 1; i < imagesWithCoords.length; i++) {
    totalDistanceMeters += getDistanceMeters(
      imagesWithCoords[i - 1].coords,
      imagesWithCoords[i].coords,
    );
  }

  // For x button on top right of image
  const deleteImage = async (id) => {
    setImages((prevImages) => prevImages.filter((img) => img.id !== id));
  };

  // function for adding images into the SQLite database
  const addImage = async (asset, coords) => {
    const newImage = {
      id: Date.now(),
      uri: asset.uri,
      coords: coords || null,
    };
    setImages((prevImages) => [...prevImages, newImage]);
  };

  // function that brings up menu for adding images
  const showActionSheet = () => {
    showActionSheetWithOptions(
      {
        options: ["Take Picture", "Choose from Gallery", "Cancel"],
        cancelButtonIndex: 2,
        containerStyle: {
          paddingBottom: 40,
        },
      },
      (buttonIndex) => {
        if (buttonIndex === 0) {
          pickImage("camera");
        } else if (buttonIndex === 1) {
          pickImage("gallery");
        }
      },
    );
  };

  // function that action sheet uses to bring up camera or gallery
  const pickImage = async (mode) => {
    let result;
    const options = {
      quality: 1,
      exif: true,
    };
    if (mode === "camera") {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) return;
      result = await ImagePicker.launchCameraAsync(options);
    } else {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync(true);
      if (!permission.granted) return;
      result = await ImagePicker.launchImageLibraryAsync(options);
    }

    if (!result.canceled) {
      const asset = result.assets[0];
      const exifData = asset.exif;
      let coords = null;
      if (exifData) {
        const lat = exifData.GPSLatitude || exifData.latitude;
        const lon = exifData.GPSLongitude || exifData.longitude;
        if (lat != null && lon != null && !(lat === 0 && lon === 0)) {
          coords = { latitude: lat, longitude: lon };
        }
      }
      addImage(asset, coords);
    }
  };

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
          <View style={[styles.container]}>
            <ScrollView contentContainerStyle={{ gap: 10, paddingBottom: 60 }}>
              <Text
                style={[styles.eventDayText, { fontSize: 20, color: "#eee" }]}
              >
                {date.toDateString()}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-around",
                }}
              >
                <Text style={{ fontWeight: "bold", color: "#eee" }}>
                  Title:{" "}
                </Text>
                <TextInput
                  style={[styles.textinput, { flex: 1 }]}
                  onChangeText={(text) => {
                    setTitle(text);
                    AsyncStorage.setItem(
                      dateString,
                      JSON.stringify({ title: text, notes: notes }),
                    );
                  }}
                  value={title}
                  placeholder="Enter event title"
                />
              </View>
              {images.length > 0 ? (
                <FlatList
                  data={images}
                  horizontal
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <View style={[styles.imageContainer]}>
                      <Image source={{ uri: item.uri }} style={styles.image} />
                      <Pressable
                        onPress={() => deleteImage(item.id)}
                        style={({ pressed }) => ({
                          position: "absolute",
                          top: 4,
                          right: 4,
                          alignSelf: "flex-end",
                          width: 22,
                          height: 22,
                          borderRadius: 11,
                          backgroundColor: pressed
                            ? "rgba(0, 0, 0, 0.85)"
                            : "rgba(0, 0, 0, 0.65)",
                          alignItems: "center",
                          justifyContent: "center",
                        })}
                      >
                        <Text
                          style={{
                            color: "#ffffff",
                            includeFontPadding: false,
                            fontWeight: "bold",
                          }}
                        >
                          x
                        </Text>
                      </Pressable>
                    </View>
                  )}
                  style={styles.listStyle}
                />
              ) : (
                <Text style={{ color: "#eee" }}>No images added yet.</Text>
              )}
              <View style={styles.buttonContainer}>
                <Pressable onPress={showActionSheet}>
                  <Text
                    style={[
                      {
                        color: "white",
                        textAlign: "center",
                        padding: 7,
                        fontWeight: "bold",
                      },
                    ]}
                  >
                    Add image
                  </Text>
                </Pressable>
              </View>
              {lastAddedCoord && (
                <View>
                  <MapView
                    style={styles.map}
                    ref={mapRef}
                    initialRegion={{
                      latitude: lastAddedCoord.latitude,
                      longitude: lastAddedCoord.longitude,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }}
                    showsMyLocationButton
                    showsUserLocation
                  >
                    {imagesWithCoords.flatMap((img) => [
                      <Marker
                        key={`${img.id}-pin`}
                        coordinate={{
                          latitude: img.coords.latitude,
                          longitude: img.coords.longitude,
                        }}
                      />,
                      <Marker
                        key={`${img.id}-photo`}
                        coordinate={{
                          latitude: img.coords.latitude,
                          longitude: img.coords.longitude,
                        }}
                        anchor={{ x: 0.5, y: 1.85 }}
                        tappable={false}
                      >
                        <View
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 8,
                            overflow: "hidden",
                            borderWidth: 2,
                            borderColor: "#ffffff",
                            backgroundColor: "#eee",
                          }}
                        >
                          <Image
                            source={{ uri: img.uri }}
                            style={{ width: "100%", height: "100%" }}
                          />
                        </View>
                      </Marker>,
                    ])}
                  </MapView>
                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: "#eee",
                    }}
                  >
                    <Text
                      style={{
                        padding: 10,
                        textAlign: "left",
                        fontWeight: "bold",
                        color: "#eee",
                      }}
                    >
                      Estimated distance from {imagesWithCoords.length}{" "}
                      {imagesWithCoords.length === 1 ? "photo" : "photos"}:{" "}
                      {formatDistance(totalDistanceMeters)}
                    </Text>
                  </View>
                </View>
              )}
              <Text
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  color: "#eee",
                }}
              >
                Notes:
              </Text>
              <TextInput
                multiline={true}
                style={[styles.textinput, { height: 200 }]}
                onChangeText={(text) => {
                  setNotes(text);
                  AsyncStorage.setItem(
                    dateString,
                    JSON.stringify({ title: title, notes: text }),
                  );
                }}
                value={notes}
                placeholder="Enter event notes"
              />
            </ScrollView>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </LinearGradient>
  );
}
