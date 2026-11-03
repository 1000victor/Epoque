import { Button, View, Image, Text, FlatList } from "react-native";
import { useState, useEffect } from "react";
import styles from "../styles";
import * as ImagePicker from "expo-image-picker";
import { useActionSheet } from "@expo/react-native-action-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function EditEventScreen({ route }) {
  const { dateString } = route.params;
  const date = new Date(dateString + "T00:00:00");
  const [eventData, setEventData] = useState({
    title: "Event Title",
    images: [],
  });
  const { showActionSheetWithOptions } = useActionSheet();

  // Load stored data on mount and when dateString is updated (screen change)
  useEffect(() => {
    const loadEvent = async () => {
      try {
        const savedData = await AsyncStorage.getItem(dateString);
        if (savedData !== null) {
          const parsedData = JSON.parse(savedData);
          setEventData(parsedData);
        }
      } catch (error) {
        console.log("Failed to load event data from storage:", error);
      }
    };
    loadEvent();
  }, [dateString]);

  const saveEvent = async (updatedData) => {
    try {
      await AsyncStorage.setItem(dateString, JSON.stringify(updatedData));
      console.log("Successfully saved to AsyncStorage for date:", dateString);
    } catch (error) {
      console.log("Failed to save event data:", error);
    }
  };

  const addImage = (asset, mode) => {
    const exifData = asset.exif;
    let coords = null;

    if (mode === "camera" && exifData) {
      const lat = exifData.GPSLatitude || exifData.latitude;
      const lon = exifData.GPSLongitude || exifData.longitude;

      if (lat != null && lon != null && !(lat === 0 && lon === 0)) {
        coords = {
          latitude: lat,
          longitude: lon,
        };
      }
    }
    const newImage = {
      id: Date.now(),
      uri: asset.uri,
      coords: coords,
    };
    setEventData((prevData) => {
      const updatedData = {
        ...prevData,
        images: [...prevData.images, newImage],
      };
      saveEvent(updatedData);
      return;
    });
  };

  const showActionSheet = () => {
    const options = ["Take Picture", "Choose from Gallery", "Cancel"];
    const cancelButtonIndex = 2;
    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
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
      addImage(result.assets[0], mode);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Select Image" onPress={showActionSheet} />
      {eventData.images.length > 0 ? (
        <FlatList
          data={eventData.images}
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

      <Text>{dateString}</Text>
      <Text>{JSON.stringify(eventData)}</Text>
      <Button
        title="Clear Async Storage"
        onPress={async () => {
          await AsyncStorage.clear();
          setEventData({
            title: "Event Title",
            images: [],
          });
        }}
      />
    </View>
  );
}
