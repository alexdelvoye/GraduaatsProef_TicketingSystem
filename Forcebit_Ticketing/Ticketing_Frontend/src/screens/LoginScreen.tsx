import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLoginScreen } from "../hooks/useLoginScreen";
import { colors } from "../styles/theme";
import { loginStyles as styles } from "../styles/loginStyles";
import { LoginScreenProps } from "../types";

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const {
    email,
    setEmail,
    password,
    setPassword,
    isSubmitting,
    errorMessage,
    handleLogin,
  } = useLoginScreen();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.logo}>FORCEBIT</Text>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Log in to manage your tickets.</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.muted}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.muted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        <Pressable
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isSubmitting}
        >
          <Text style={styles.buttonText}>
            {isSubmitting ? "Logging in..." : "Log in"}
          </Text>
        </Pressable>

        <Pressable onPress={() => navigation.navigate("Register")}>
          <Text style={styles.link}>No account yet? Register</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
