import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { useRegisterScreen } from "../hooks/useRegisterScreen";
import { colors } from "../styles/theme";
import { registerStyles as styles } from "../styles/registerStyles";
import { RegisterScreenProps } from "../types";

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const {
    name,
    setName,
    companyName,
    setCompanyName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    isSubmitting,
    errorMessage,
    handleRegister,
  } = useRegisterScreen();

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

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

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
