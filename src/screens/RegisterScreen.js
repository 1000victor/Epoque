import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useState } from "react";
import {
  Button,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
} from "react-native";
import { firebase_auth } from "../firebaseConfig";
import { LinearGradient } from "expo-linear-gradient";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [theme, setTheme] = useState("dark");

  const auth = firebase_auth;

  async function handleSignUp() {
    try {
      const response = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
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
        theme: theme,
      });
    } catch (error) {
      console.log(error.message);
      alert(error.message);
    }
  }

  return (
    <LinearGradient
      colors={["#ff0000", "#ff00f7", "#6f00ff"]}
      // locations={[0, 0.25, 0.75, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={{ flex: 1 }}
    >
      <LinearGradient
        colors={["#ffffff00", "#1a0036"]}
        // locations={[0, 0.25, 0.75, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.6 }}
        style={{ flex: 1 }}
      >
        <View style={styles.container}>
          {/* <Text style={styles.header}>Registration</Text> */}
          <Text
            style={[styles.header, { fontWeight: "bold", marginBottom: 12 }]}
          >
            Époque
          </Text>
          <Text style={[styles.header, { fontSize: 16, fontStyle: "italic" }]}>
            Register a New Account!
          </Text>

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
            {/* <Button title="Sign Up" onPress={handleSignUp} color="white" /> */}
            <Pressable onPress={handleSignUp}>
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
                Sign Up
              </Text>
            </Pressable>
          </View>
        </View>
      </LinearGradient>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    // backgroundColor: "#0F0F0F",
  },
  header: {
    fontSize: 42,
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
