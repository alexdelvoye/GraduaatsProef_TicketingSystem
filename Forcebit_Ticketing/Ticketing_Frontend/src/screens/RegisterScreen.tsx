import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ScrollView,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { useAuth } from "../context/AuthContext";
import { colors } from "../styles/theme";
import { registerStyles as styles } from "../styles/registerStyles";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

export default function RegisterScreen({ navigation }: Props) {
  const { signUp } = useAuth();

  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRegister() {
    console.log("Register button pressed");

    try {
      setIsSubmitting(true);

      await signUp({
        name,
        companyName,
        email,
        password,
        confirmPassword,
      });
    } catch (error: any) {
      console.log("Register error:", error);
      Alert.alert("Registration failed", error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.logo}>FORCEBIT</Text>
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Register to create support tickets.</Text>

        <TextInput
          style={styles.input}
          placeholder="Full name"
          placeholderTextColor={colors.muted}
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Company name"
          placeholderTextColor={colors.muted}
          value={companyName}
          onChangeText={setCompanyName}
        />

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

        <TextInput
          style={styles.input}
          placeholder="Confirm password"
          placeholderTextColor={colors.muted}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <Pressable
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={isSubmitting}
        >
          <Text style={styles.buttonText}>
            {isSubmitting ? "Creating account..." : "Register"}
          </Text>
        </Pressable>

        <Pressable onPress={() => navigation.navigate("Login")}>
          <Text style={styles.link}>Already have an account? Log in</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
