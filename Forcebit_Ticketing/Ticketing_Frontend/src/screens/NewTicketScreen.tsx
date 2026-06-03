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
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import { homeStyles as styles } from "../styles/homeStyles";

import type { NewTicketScreenProps } from "../types";

export default function NewTicketScreen({ navigation }: NewTicketScreenProps) {
  // After a ticket is created, return to Home so the user can see the updated
  // ticket list. The hook receives this as a callback to avoid importing
  // navigation inside the hook.
  const { errorMessage, handleCreateTicket } = useNewTicketScreen(() =>
    navigation.navigate("Home"),
  );
  const { isCompact, isNarrow } = useResponsiveLayout();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      // Keeps the multiline description input usable when the keyboard opens.
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          isCompact ? styles.contentCompact : null,
          isNarrow ? styles.contentNarrow : null,
        ]}
      >
        <AppHeader onBack={() => navigation.goBack()} />

        <View style={[styles.card, isCompact ? styles.cardCompact : null]}>
          <Text style={[styles.title, isCompact ? styles.titleCompact : null]}>
            New ticket
          </Text>

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
