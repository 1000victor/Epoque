import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import { firebase_auth } from "../firebaseConfig";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const auth = firebase_auth;

  async function handleSignUp() {
    try {
      const response = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      console.log(response);
      alert("Sign up success. User: " + email + " signed up.");
    } catch (error) {
      console.log(error.message);
      alert(error.message);
    }
  }

  async function handleSignIn() {
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);

      navigation.navigate("CalendarScreen", {
        user: response.user,
      });
    } catch (error) {
      console.log(error.message);
      alert(error.message);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Epoque</Text>

      {/* Email Input */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      {/* Password Input */}
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry={true} // hides text for security (dots/asterisks)
        value={password}
        onChangeText={setPassword}
      />

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Button title="Sign Up" onPress={handleSignUp} />
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Sign In" onPress={handleSignIn} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#f2f2f2",
  },
  header: {
    fontSize: 24,
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: "white",
  },
  buttonContainer: {
    padding: 20,
  },
  footer: {
    marginTop: 20,
    textAlign: "center",
    color: "#888",
  },
});
