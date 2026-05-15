import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  addTicketMessage,
  getTicketById,
  updateTicketStatus,
} from "../api/ticketApi";
import { useAuth } from "../context/AuthContext";
import { useErrorHandler } from "../hooks/useErrorHandler";
import { homeStyles as styles } from "../styles/homeStyles";
import { colors } from "../styles/theme";
import { RootStackParamList, TicketDetail, TicketStatus } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "TicketDetail">;

const statuses: TicketStatus[] = ["Open", "InProgress", "Closed"];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatStatus(status: TicketStatus) {
  return status === "InProgress" ? "In progress" : status;
}

export default function TicketDetailScreen({ navigation, route }: Props) {
  const { user } = useAuth();
  const { ticketId } = route.params;

  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [reply, setReply] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusSubmitting, setStatusSubmitting] = useState<TicketStatus | null>(
    null,
  );

  const { errorMessage, clearError, handleError } = useErrorHandler(
    "Could not load this ticket.",
  );

  const loadTicket = useCallback(async () => {
    try {
      clearError();
      setIsLoading(true);
      const data = await getTicketById(ticketId);
      setTicket(data);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, [clearError, handleError, ticketId]);

  useFocusEffect(
    useCallback(() => {
      loadTicket();
    }, [loadTicket]),
  );

  async function handleSendReply() {
    if (!reply.trim()) {
      return;
    }

    try {
      clearError();
      setIsSubmitting(true);
      await addTicketMessage(ticketId, { message: reply.trim() });
      setReply("");
      await loadTicket();
    } catch (error) {
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdateStatus(status: TicketStatus) {
    try {
      clearError();
      setStatusSubmitting(status);
      await updateTicketStatus(ticketId, status);
      await loadTicket();
    } catch (error) {
      handleError(error);
    } finally {
      setStatusSubmitting(null);
    }
  }

  const replyDisabled =
    isSubmitting || !reply.trim() || ticket?.status === "Closed";

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

        {isLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : ticket ? (
          <>
            <View style={styles.card}>
              <View style={styles.ticketCardHeader}>
                <View style={styles.ticketTitleBlock}>
                  <Text style={styles.eyebrow}>{ticket.companyName}</Text>
                  <Text style={styles.title}>{ticket.title}</Text>
                </View>

                <Text
                  style={[
                    styles.statusPill,
                    ticket.status === "Closed" && styles.statusPillClosed,
                  ]}
                >
                  {formatStatus(ticket.status)}
                </Text>
              </View>

              <Text style={styles.ticketMeta}>
                {ticket.category} / {ticket.subject}
              </Text>
              <Text style={styles.ticketDate}>
                Created {formatDate(ticket.createdAt)}
              </Text>
              <Text style={styles.description}>{ticket.description}</Text>
            </View>

            {user?.role === "Admin" ? (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Status</Text>
                <View style={styles.optionGrid}>
                  {statuses.map((status) => (
                    <Pressable
                      key={status}
                      style={[
                        styles.optionButton,
                        ticket.status === status && styles.optionButtonSelected,
                      ]}
                      onPress={() => handleUpdateStatus(status)}
                      disabled={Boolean(statusSubmitting)}
                    >
                      <Text
                        style={[
                          styles.optionButtonText,
                          ticket.status === status &&
                            styles.optionButtonTextSelected,
                        ]}
                      >
                        {statusSubmitting === status
                          ? "Saving..."
                          : formatStatus(status)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : null}

            <View style={styles.ticketSection}>
              <Text style={styles.sectionTitle}>Conversation</Text>

              {ticket.messages.length === 0 ? (
                <Text style={styles.emptyText}>No replies yet.</Text>
              ) : (
                ticket.messages.map((message) => (
                  <View
                    key={message.id}
                    style={[
                      styles.messageCard,
                      message.senderRole === "Admin" && styles.adminMessageCard,
                    ]}
                  >
                    <View style={styles.messageHeader}>
                      <Text style={styles.messageSender}>
                        {message.senderName || message.senderRole}
                      </Text>
                      <Text style={styles.ticketDate}>
                        {formatDate(message.createdAt)}
                      </Text>
                    </View>
                    <Text style={styles.messageText}>{message.message}</Text>
                  </View>
                ))
              )}
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Reply</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={
                  ticket.status === "Closed"
                    ? "Closed tickets cannot receive replies"
                    : "Write a reply"
                }
                placeholderTextColor={colors.muted}
                value={reply}
                onChangeText={setReply}
                editable={ticket.status !== "Closed"}
                multiline
                textAlignVertical="top"
              />

              {errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text>
              ) : null}

              <Pressable
                style={[
                  styles.primaryButton,
                  replyDisabled && styles.buttonDisabled,
                ]}
                onPress={handleSendReply}
                disabled={replyDisabled}
              >
                <Text style={styles.primaryButtonText}>
                  {isSubmitting ? "Sending..." : "Send reply"}
                </Text>
              </Pressable>
            </View>
          </>
        ) : (
          <Text style={styles.emptyText}>Ticket not found.</Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
