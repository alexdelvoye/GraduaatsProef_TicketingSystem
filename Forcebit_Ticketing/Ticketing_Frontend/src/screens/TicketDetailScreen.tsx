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
import {
  ticketStatuses,
  useTicketDetailScreen,
} from "../hooks/useTicketDetailScreen";
import { homeStyles as styles } from "../styles/homeStyles";
import { colors } from "../styles/theme";
import { TicketDetailScreenProps } from "../types";
import {
  formatTicketDateTime,
  formatTicketStatus,
} from "../utils/ticketFormatters";

export default function TicketDetailScreen({
  navigation,
  route,
}: TicketDetailScreenProps) {
  const { ticketId } = route.params;
  const {
    user,
    ticket,
    reply,
    setReply,
    isLoading,
    isSubmitting,
    statusSubmitting,
    errorMessage,
    replyDisabled,
    handleSendReply,
    handleUpdateStatus,
  } = useTicketDetailScreen(ticketId);

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
                  {formatTicketStatus(ticket.status)}
                </Text>
              </View>

              <Text style={styles.ticketMeta}>
                {ticket.category} / {ticket.subject}
              </Text>
              <Text style={styles.ticketDate}>
                Created {formatTicketDateTime(ticket.createdAt)}
              </Text>
              <Text style={styles.description}>{ticket.description}</Text>
            </View>

            {user?.role === "Admin" ? (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Status</Text>
                <View style={styles.optionGrid}>
                  {ticketStatuses.map((status) => (
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
                          : formatTicketStatus(status)}
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
                        {formatTicketDateTime(message.createdAt)}
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
