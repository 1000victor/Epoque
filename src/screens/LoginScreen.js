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
    <LinearGradient
      colors={["#a32540", "#ff00f7", "#5747ec"]}
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
          <Text
            style={[styles.header, { fontWeight: "bold", marginBottom: 12 }]}
          >
            Époque
          </Text>
          <Text style={[styles.header, { fontSize: 16, fontStyle: "italic" }]}>
            Episodic memories are saved here
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
            {/* <Button title="Sign In" onPress={handleSignIn} color="white" /> */}
            <Pressable onPress={handleSignIn}>
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
                Sign In
              </Text>
            </Pressable>
          </View>

          <View style={styles.signUpContainer}>
            <Text style={styles.signUp}>Don't have an account?</Text>
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
                Register an account
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
    top: 120,
  },
  signUp: {
    color: "white",
    textAlign: "center",
    alignSelf: "center",
  },
});
