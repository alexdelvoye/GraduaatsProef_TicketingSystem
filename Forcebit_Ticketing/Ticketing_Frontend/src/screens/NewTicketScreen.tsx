import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { createTicket } from "../api/ticketApi";
import { useErrorHandler } from "../hooks/useErrorHandler";
import { homeStyles as styles } from "../styles/homeStyles";
import { colors } from "../styles/theme";
import { RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "NewTicket">;

const categories = [
  "Sales",
  "TechnicalProblem",
  "Question",
  "Installation",
  "Other",
];

const subjects = [
  "Gateway",
  "Sensors",
  "Software",
  "Dashboard",
  "Connectivity",
  "Account",
  "Other",
];

export default function NewTicketScreen({ navigation }: Props) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [subject, setSubject] = useState(subjects[0]);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { errorMessage, clearError, handleError } = useErrorHandler(
    "Could not create the ticket.",
  );

  async function handleCreateTicket() {
    if (!title.trim() || !description.trim()) {
      return;
    }

    try {
      clearError();
      setIsSubmitting(true);

      await createTicket({
        title: title.trim(),
        category,
        subject,
        description: description.trim(),
      });

      navigation.navigate("Home");
    } catch (error) {
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  const isDisabled = isSubmitting || !title.trim() || !description.trim();

  return (
    <KeyboardAvoidingView
      style={styles.container}
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

          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Short summary"
            placeholderTextColor={colors.muted}
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Category</Text>
          <View style={styles.optionGrid}>
            {categories.map((item) => (
              <Pressable
                key={item}
                style={[
                  styles.optionButton,
                  category === item && styles.optionButtonSelected,
                ]}
                onPress={() => setCategory(item)}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    category === item && styles.optionButtonTextSelected,
                  ]}
                >
                  {item === "TechnicalProblem" ? "Technical" : item}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Subject</Text>
          <View style={styles.optionGrid}>
            {subjects.map((item) => (
              <Pressable
                key={item}
                style={[
                  styles.optionButton,
                  subject === item && styles.optionButtonSelected,
                ]}
                onPress={() => setSubject(item)}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    subject === item && styles.optionButtonTextSelected,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="What happened?"
            placeholderTextColor={colors.muted}
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
          />

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          <Pressable
            style={[styles.primaryButton, isDisabled && styles.buttonDisabled]}
            onPress={handleCreateTicket}
            disabled={isDisabled}
          >
            <Text style={styles.primaryButtonText}>
              {isSubmitting ? "Creating..." : "Create ticket"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
