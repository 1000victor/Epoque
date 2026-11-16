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
  const [theme, setTheme] = useState("dark");

  const auth = firebase_auth;

  async function handleSignUp() {
    try {
      navigation.navigate("RegisterScreen");
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
        theme: theme,
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
        placeholderTextColor="#787878"
      />

      {/* Password Input */}
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry={true} // hides text for security (dots/asterisks)
        value={password}
        onChangeText={setPassword}
        placeholderTextColor="#787878"
      />

      {/* Action Buttons */}

      <View style={styles.buttonContainer}>
        <Button title="Sign In" onPress={handleSignIn} color="white" />
      </View>

      <View style={styles.signUpContainer}>
        <Text style={styles.signUp}>Don't have an account?</Text>
        <Button title="Sign Up" onPress={handleSignUp} color="white" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#0F0F0F",
  },
  header: {
    fontSize: 24,
    marginBottom: 24,
    textAlign: "center",
    color: "white",
  },
  input: {
    height: 40,
    borderColor: "white",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: "#1D1D1D",
    color: "white",
  },
  buttonContainer: {
    marginTop: 15,
    marginBottom: 15,
    padding: 5,
    borderColor: "white",
    borderWidth: 1,
    color: "white",
    borderRadius: 40,
    backgroundColor: "#1D1D1D",
    width: 200,
    alignSelf: "center",
  },
  footer: {
    marginTop: 20,
    textAlign: "center",
    color: "#888",
  },
  signUpContainer: {
    textAlign: "center",
    alignSelf: "center",
    top: 150,
  },
  signUp: {
    color: "white",
    textAlign: "center",
    alignSelf: "center",
  },
});
