import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { NewTicketForm } from "../forms/NewTicketForm";
import { useNewTicketScreen } from "../hooks/useNewTicketScreen";
import { homeStyles as styles } from "../styles/homeStyles";
import { NewTicketScreenProps } from "../types";

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
        <View style={styles.header}>
          <Text style={styles.logo}>FORCEBIT</Text>

          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>Back</Text>
          </Pressable>
        </View>

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
