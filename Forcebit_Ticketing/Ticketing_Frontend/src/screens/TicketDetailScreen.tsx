import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { AppHeader } from "../components/AppHeader";
import { TicketReplyForm } from "../forms/TicketReplyForm";
import {
  ticketStatuses,
  useTicketDetailScreen,
} from "../hooks/useTicketDetailScreen";
import { homeStyles as styles } from "../styles/homeStyles";
import { colors } from "../styles/theme";
import {
  formatTicketDateTime,
  formatTicketStatus,
} from "../utils/ticketFormatters";

import type { TicketDetailScreenProps } from "../types";

export default function TicketDetailScreen({
  navigation,
  route,
}: TicketDetailScreenProps) {
  // ticketId comes from React Navigation route params. The typed route prevents
  // opening this screen without an id.
  const { ticketId } = route.params;

  const {
    user,
    ticket,
    isLoading,
    statusSubmitting,
    errorMessage,
    isTicketClosed,
    clientStatusAction,
    handleSendReply,
    handleUpdateStatus,
    handleDownloadAttachment,
  } = useTicketDetailScreen(ticketId);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      // Reply form sits near the bottom, so keyboard avoidance matters here.
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <AppHeader onBack={() => navigation.goBack()} />

        {isLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : ticket ? (
          // Once loaded, render ticket information, optional admin controls,
          // the conversation, and the reply form.
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
            </View>

            {user?.role === "Admin" ? (
              // Only admins can change status. The backend also enforces this,
              // so the UI rule is for usability, not security.
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Status</Text>
                <View style={styles.optionGrid}>
                  {ticketStatuses.map((status) => (
                    // statusSubmitting disables all status buttons while one
                    // request is in flight, preventing double updates.
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

            {clientStatusAction ? (
              // Clients get only the business actions they are allowed to take:
              // close their own ticket, or reopen it if the issue is not fixed.
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Ticket action</Text>
                <Pressable
                  style={[
                    styles.primaryButton,
                    statusSubmitting && styles.buttonDisabled,
                  ]}
                  onPress={() => handleUpdateStatus(clientStatusAction.status)}
                  disabled={Boolean(statusSubmitting)}
                >
                  <Text style={styles.primaryButtonText}>
                    {statusSubmitting === clientStatusAction.status
                      ? "Saving..."
                      : clientStatusAction.label}
                  </Text>
                </Pressable>
              </View>
            ) : null}

            <View style={styles.ticketSection}>
              <Text style={styles.sectionTitle}>Conversation</Text>

              {ticket.messages.length === 0 ? (
                <Text style={styles.emptyText}>No replies yet.</Text>
              ) : (
                ticket.messages.map((message) => (
                  // Admin messages use a different style so clients can quickly
                  // distinguish support replies.
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

                    {message.attachments.length > 0 ? (
                      <View style={styles.attachmentList}>
                        {message.attachments.map((attachment) => (
                          <Pressable
                            key={attachment.id}
                            style={styles.attachmentDownloadButton}
                            onPress={() => handleDownloadAttachment(attachment)}
                          >
                            <Text style={styles.attachmentDownloadText}>
                              {attachment.fileName}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    ) : null}
                  </View>
                ))
              )}
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Reply</Text>
              {/* Closed tickets pass disabled=true so the form becomes read-only. */}
              <TicketReplyForm
                disabled={isTicketClosed}
                errorMessage={errorMessage}
                onSubmit={handleSendReply}
              />
            </View>
          </>
        ) : (
          <Text style={styles.emptyText}>Ticket not found.</Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
