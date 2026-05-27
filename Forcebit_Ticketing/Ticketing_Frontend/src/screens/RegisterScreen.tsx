import { Pressable, ScrollView, Text, View } from "react-native";

import { RegisterForm } from "../forms/RegisterForm";
import { useRegisterScreen } from "../hooks/useRegisterScreen";
import { registerStyles as styles } from "../styles/registerStyles";
import { RegisterScreenProps } from "../types";

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const { errorMessage, handleRegister } = useRegisterScreen();

  return (
    // ScrollView keeps the full registration form reachable on smaller screens.
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.logo}>FORCEBIT</Text>
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Register to create support tickets.</Text>

        <RegisterForm errorMessage={errorMessage} onSubmit={handleRegister} />

        {/* Screen-level navigation link; the form remains only about input and
           submit behavior. */}
        <Pressable onPress={() => navigation.navigate("Login")}>
          <Text style={styles.link}>Already have an account? Log in</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
