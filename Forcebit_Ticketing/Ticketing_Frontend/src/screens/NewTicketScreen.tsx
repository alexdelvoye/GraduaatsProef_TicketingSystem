import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  ticketCategories,
  ticketSubjects,
  useNewTicketScreen,
} from "../hooks/useNewTicketScreen";
import { homeStyles as styles } from "../styles/homeStyles";
import { colors } from "../styles/theme";
import { NewTicketScreenProps } from "../types";

export default function NewTicketScreen({ navigation }: NewTicketScreenProps) {
  const {
    title,
    setTitle,
    category,
    setCategory,
    subject,
    setSubject,
    description,
    setDescription,
    isSubmitting,
    isDisabled,
    errorMessage,
    handleCreateTicket,
  } = useNewTicketScreen(() => navigation.navigate("Home"));

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
            {ticketCategories.map((item) => (
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
            {ticketSubjects.map((item) => (
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
