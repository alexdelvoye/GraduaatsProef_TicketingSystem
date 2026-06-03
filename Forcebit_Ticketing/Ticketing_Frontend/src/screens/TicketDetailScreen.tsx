import {
  ActivityIndicator,
  Image,
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
  ticketStatusUpdateOptions,
  useTicketDetailScreen,
} from "../hooks/useTicketDetailScreen";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
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
    attachmentPreviewUrls,
    isLoading,
    statusSubmitting,
    errorMessage,
    isTicketClosed,
    clientStatusAction,
    handleSendReply,
    handleUpdateStatus,
    handleDownloadAttachment,
  } = useTicketDetailScreen(ticketId);

  // Compact and narrow layout flags keep the ticket detail readable on small
  // screens without changing the desktop visual structure.
  const { isCompact, isNarrow } = useResponsiveLayout();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      // Reply form sits near the bottom, so keyboard avoidance matters here.
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

        {isLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : ticket ? (
          // Once loaded, render ticket information, optional admin controls,
          // the conversation, and the reply form.
          <>
            <View style={[styles.card, isCompact ? styles.cardCompact : null]}>
              <View
                style={[
                  styles.ticketCardHeader,
                  isCompact ? styles.ticketCardHeaderCompact : null,
                ]}
              >
                <View style={styles.ticketTitleBlock}>
                  <Text style={styles.eyebrow}>{ticket.companyName}</Text>
                  <Text
                    style={[
                      styles.title,
                      isCompact ? styles.titleCompact : null,
                    ]}
                  >
                    {ticket.title}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.statusPill,
                    isCompact ? styles.statusPillCompact : null,
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
              <View
                style={[styles.card, isCompact ? styles.cardCompact : null]}
              >
                <Text
                  style={[
                    styles.sectionTitle,
                    isCompact ? styles.sectionTitleCompact : null,
                  ]}
                >
                  Status
                </Text>
                <View
                  style={[
                    styles.optionGrid,
                    isCompact ? styles.optionGridCompact : null,
                  ]}
                >
                  {ticketStatusUpdateOptions.map((status) => (
                    // statusSubmitting disables all status buttons while one
                    // request is in flight, preventing double updates.
                    <Pressable
                      key={status}
                      style={[
                        styles.optionButton,
                        isCompact ? styles.optionButtonCompact : null,
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
              <View
                style={[styles.card, isCompact ? styles.cardCompact : null]}
              >
                <Text
                  style={[
                    styles.sectionTitle,
                    isCompact ? styles.sectionTitleCompact : null,
                  ]}
                >
                  Ticket action
                </Text>
                <Pressable
                  style={[
                    styles.primaryButton,
                    isCompact ? styles.primaryButtonCompact : null,
                    isNarrow ? styles.primaryButtonNarrow : null,
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

            <View
              style={[
                styles.ticketSection,
                isCompact ? styles.ticketSectionCompact : null,
              ]}
            >
              <Text
                style={[
                  styles.sectionTitle,
                  isCompact ? styles.sectionTitleCompact : null,
                ]}
              >
                Conversation
              </Text>

              {ticket.messages.length === 0 ? (
                <Text
                  style={[
                    styles.emptyText,
                    isCompact ? styles.emptyTextCompact : null,
                  ]}
                >
                  No replies yet.
                </Text>
              ) : (
                ticket.messages.map((message) => (
                  // The conversation uses role-based bubbles: client messages
                  // stay left and admin/support replies stay right.
                  <View
                    key={message.id}
                    style={[
                      styles.messageRow,
                      message.senderRole === "Admin" && styles.adminMessageRow,
                    ]}
                  >
                    <View
                      style={[
                        styles.messageCard,
                        styles.clientMessageCard,
                        isCompact ? styles.messageCardCompact : null,
                        isNarrow ? styles.messageCardNarrow : null,
                        message.senderRole === "Admin" &&
                          styles.adminMessageCard,
                      ]}
                    >
                      <View
                        style={[
                          styles.messageHeader,
                          isCompact ? styles.messageHeaderCompact : null,
                        ]}
                      >
                        <Text
                          style={[
                            styles.messageSender,
                            message.senderRole === "Admin" &&
                              styles.adminMessageSender,
                          ]}
                        >
                          {message.senderName || message.senderRole}
                        </Text>
                        <Text
                          style={[
                            styles.ticketDate,
                            message.senderRole === "Admin" &&
                              styles.adminMessageDate,
                          ]}
                        >
                          {formatTicketDateTime(message.createdAt)}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.messageText,
                          message.senderRole === "Admin" &&
                            styles.adminMessageText,
                        ]}
                      >
                        {message.message}
                      </Text>

                      {message.attachments.length > 0 ? (
                        <View style={styles.attachmentList}>
                          {message.attachments.map((attachment) => (
                            <View
                              key={attachment.id}
                              style={styles.messageAttachment}
                            >
                              {/* Preview URLs only exist for protected PNG/JPG
                                 attachments. Other file types keep the same
                                 download button without an empty preview box. */}
                              {attachmentPreviewUrls[attachment.id] ? (
                                <Image
                                  source={{
                                    uri: attachmentPreviewUrls[attachment.id],
                                  }}
                                  style={[
                                    styles.attachmentPreviewImage,
                                    isCompact
                                      ? styles.attachmentPreviewImageCompact
                                      : null,
                                  ]}
                                  resizeMode="cover"
                                />
                              ) : null}

                              <Pressable
                                style={styles.attachmentDownloadButton}
                                onPress={() =>
                                  handleDownloadAttachment(attachment)
                                }
                              >
                                <Text style={styles.attachmentDownloadText}>
                                  {attachment.fileName}
                                </Text>
                              </Pressable>
                            </View>
                          ))}
                        </View>
                      ) : null}
                    </View>
                  </View>
                ))
              )}
            </View>

            <View style={[styles.card, isCompact ? styles.cardCompact : null]}>
              <Text
                style={[
                  styles.sectionTitle,
                  isCompact ? styles.sectionTitleCompact : null,
                ]}
              >
                Reply
              </Text>
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
