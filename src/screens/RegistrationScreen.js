import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";

import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../firebaseConfig.js";

export default function Registration({ route, navigation }) {
  const [logins, setLogins] = useState([]);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  //to display incorrect username/password if user inputs wrong
  const [errorMessage, setErrorMessage] = useState("Register");
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
        console.error("Error fetching collection data: å", error);
      }
    }

    fetchLogin();
  }, []);

  //Check username and password
  async function handleRegister() {
    const foundUser = logins.find((item) => item.username === user);

    if (foundUser) {
      setErrorMessage("User already exists");
    } else {
      try {
        const docRef = await addDoc(collection(db, "login"), {
          username: user,
          password: pass,
        });

        console.log("Document written with ID: ", docRef.id);

        setErrorMessage("Registration Successful");
        setUser("");
        setPass("");
      } catch (e) {
        console.error("Error adding document: ", e);
        setErrorMessage("Registration Failed");
      }
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
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
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
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
  },
  buttonText: {
    color: "black",
    fontWeight: "bold",
  },
});
