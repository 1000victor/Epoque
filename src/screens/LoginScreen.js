import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";

import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig.js";

export default function LoginScreen({ route, navigation }) {
  const [logins, setLogins] = useState([]);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");

  // Retrieve login information from Firebase
  useEffect(() => {
    async function fetchLogin() {
      try {
        const querySnapshot = await getDocs(collection(db, "login"));

        const loginList = querySnapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        }));

        setLogins(loginList);
      } catch (error) {
        console.error("Error fetching login:", error);
      }
    }

    fetchLogin();
  }, []);

  //Check username and password
  function handleLogin() {
    const foundUser = logins.find(
      //find code found through here: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
      (item) => item.username === user && item.password === pass
    );
    if (foundUser) {
      navigation.navigate("CalendarScreen", {
        login: foundUser,
      });
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login Screen</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#C6C8D2"
        value={user}
        onChangeText={setUser}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#C6C8D2"
        value={pass}
        onChangeText={setPass}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#30323D",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "white",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    color: "white",
  },
  button: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "black",
    fontWeight: "bold",
  },
});
