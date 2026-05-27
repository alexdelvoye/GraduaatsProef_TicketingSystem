import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";

import { AppHeader } from "../components/AppHeader";
import { NewTicketForm } from "../forms/NewTicketForm";
import { useNewTicketScreen } from "../hooks/useNewTicketScreen";
import { homeStyles as styles } from "../styles/homeStyles";

import type { NewTicketScreenProps } from "../types";

export default function NewTicketScreen({ navigation }: NewTicketScreenProps) {
  // After a ticket is created, return to Home so the user can see the updated
  // ticket list. The hook receives this as a callback to avoid importing
  // navigation inside the hook.
  const { errorMessage, handleCreateTicket } = useNewTicketScreen(() =>
    navigation.navigate("Home"),
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      // Keeps the multiline description input usable when the keyboard opens.
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <AppHeader onBack={() => navigation.goBack()} />

        <View style={styles.card}>
          <Text style={styles.title}>New ticket</Text>

          {/* NewTicketForm owns Formik/Yup details; this screen only places it
             in the page layout. */}
          <NewTicketForm
            errorMessage={errorMessage}
            onSubmit={handleCreateTicket}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
