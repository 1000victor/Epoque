import { Button, View, Image, Text, FlatList, TextInput } from "react-native";
import { useState, useEffect } from "react";
import styles from "../styles";
import * as ImagePicker from "expo-image-picker";
import { useActionSheet } from "@expo/react-native-action-sheet";
import * as SQLite from "expo-sqlite";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function EditEventScreen({ route }) {
  const { dateString } = route.params;
  const date = new Date(dateString + "T00:00:00");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [images, setImages] = useState([]);
  const { showActionSheetWithOptions } = useActionSheet();

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

  // function for adding images into the SQLite database
  const addImage = async (asset, coords) => {
    const newImage = {
      id: Date.now(),
      uri: asset.uri,
      coords: coords || null,
    };
    setImages((prevImages) => [...prevImages, newImage]);
    try {
      const db = await SQLite.openDatabaseAsync("events.db");
      await db.runAsync(
        "INSERT INTO images (id, dateString, uri, latitude, longitude) VALUES (?, ?, ?, ?, ?);",
        [
          newImage.id,
          dateString,
          newImage.uri,
          newImage.coords?.latitude ?? null,
          newImage.coords?.longitude ?? null,
        ],
      );
    } catch (error) {
      console.error("Failed to save image to SQLite:", error);
    }
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
    <View style={styles.container}>
      <Text style={styles.eventDayText}>{date.toDateString()}</Text>
      <TextInput
        style={styles.textinput}
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
      <Button title="Add image" onPress={showActionSheet} />
      {images.length > 0 ? (
        <FlatList
          data={images}
          horizontal
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.imageContainer}>
              <Image source={{ uri: item.uri }} style={styles.image} />
            </View>
          )}
          style={styles.listStyle}
        />
      ) : (
        <Text>No images added yet.</Text>
      )}
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
      <Button
        title="Wipe date data"
        onPress={async () => {
          try {
            await AsyncStorage.removeItem(dateString);
            const db = await SQLite.openDatabaseAsync("events.db");
            await db.runAsync("DELETE FROM images WHERE dateString = ?;", [
              dateString,
            ]);
            setTitle("");
            setNotes("");
            setImages([]);
          } catch (error) {
            console.error("Failed to clear database:", error);
          }
        }}
      />
    </View>
  );
}
