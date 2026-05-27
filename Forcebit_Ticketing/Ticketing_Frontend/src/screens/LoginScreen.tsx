import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";

import { LoginForm } from "../forms/LoginForm";
import { useLoginScreen } from "../hooks/useLoginScreen";
import { loginStyles as styles } from "../styles/loginStyles";

import type { LoginScreenProps } from "../types";

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const { errorMessage, handleLogin } = useLoginScreen();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      // On iOS this moves the form above the keyboard. Android handles this
      // differently, so undefined keeps the default behavior there.
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.logo}>FORCEBIT</Text>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Log in to manage your tickets.</Text>

        <LoginForm errorMessage={errorMessage} onSubmit={handleLogin} />

        {/* Navigation stays in the screen because it is a UI flow decision, not
           part of the reusable login form. */}
        <Pressable onPress={() => navigation.navigate("Register")}>
          <Text style={styles.link}>No account yet? Register</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
