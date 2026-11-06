import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";

import { useFocusEffect } from "@react-navigation/native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig.js";

export default function LoginScreen({ route, navigation }) {
  const [logins, setLogins] = useState([]);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  //to display incorrect username/password if user inputs wrong
  const [errorMessage, setErrorMessage] = useState("");

  //update login information from Firebase whenever screen is focused
  useFocusEffect(
    useCallback(() => {
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
    }, [user])
  );

  //Check username and password
  function handleLogin() {
    const foundUser = logins.find(
      //find code found through here: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
      (item) => item.username === user && item.password === pass
    );

    if (foundUser) {
      setErrorMessage("");
      navigation.navigate("CalendarScreen", {
        login: foundUser,
      });
    } else {
      setErrorMessage("Incorrect Username/Password!");
    }
  }

  function register() {
    navigation.navigate("RegistrationScreen");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login Screen</Text>
      <Text style={styles.error}>{errorMessage}</Text>

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

      <TouchableOpacity style={styles.button} onPress={register}>
        <Text style={styles.buttonText}>Register</Text>
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
  error: {
    margin: 1,
    color: "white",
  },
  button: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "black",
    fontWeight: "bold",
  },
});
