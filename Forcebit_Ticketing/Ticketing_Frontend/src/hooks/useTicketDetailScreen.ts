import { useCallback, useEffect, useRef, useState } from "react";

import { useFocusEffect } from "@react-navigation/native";

import {
  createAttachmentPreviewUrl,
  downloadTicketAttachment,
  isPreviewableImageAttachment,
} from "../apis/attachmentApi";
import {
  addTicketMessage,
  addTicketMessageWithAttachments,
  getTicketById,
  updateTicketStatus,
} from "../apis/ticketApi";

import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { ticketStatusUpdateOptions } from "../types";
import { formatTicketStatus } from "../utils/ticketFormatters";

import { useErrorHandler } from "./useErrorHandler";

import type {
  SelectedAttachment,
  TicketAttachment,
  TicketDetail,
  TicketStatus,
} from "../types";
import type { TicketMessageFormValues } from "../validation/ticketSchema";

export { ticketStatusUpdateOptions };

// A custom hook is used here so the screen component can stay focused on
// rendering. This hook owns the behavior of the ticket detail page: loading
// data, sending replies, changing status, and showing notifications.
export function useTicketDetailScreen(ticketId: string) {
  // AuthContext gives the currently logged-in user. The screen uses this to
  // decide which actions should be visible for clients/admins.
  const { user } = useAuth();

  // The notification context centralizes success messages, so every screen uses
  // the same toast style instead of custom alerts.
  const { showSuccess } = useNotifications();

  // Null means "we have not loaded a ticket yet" or "loading failed".
  const [ticket, setTicket] = useState<TicketDetail | null>(null);

  // Preview URLs are browser object URLs keyed by attachment id. State is used
  // for rendering; the ref mirrors it so cleanup can run without stale closures.
  const [attachmentPreviewUrls, setAttachmentPreviewUrls] = useState<
    Record<string, string>
  >({});
  const attachmentPreviewUrlsRef = useRef<Record<string, string>>({});

  // Preview generation is async. This flag prevents setting state if the user
  // leaves the detail screen while image blobs are still loading.
  const isMountedRef = useRef(true);

  // Separate loading flags keep the UI precise: full-screen loading for the
  // initial ticket load, and button-level loading for a status update.
  const [isLoading, setIsLoading] = useState(true);
  const [statusSubmitting, setStatusSubmitting] = useState<TicketStatus | null>(
    null,
  );

  // useErrorHandler converts unknown API/JavaScript errors into one readable
  // message for the screen and toast system.
  const { errorMessage, clearError, handleError } = useErrorHandler(
    "Could not load this ticket.",
  );

  const revokeAttachmentPreviewUrls = useCallback(() => {
    // Object URLs hold browser memory until revoked. Revoke them whenever the
    // ticket changes, loading fails, or the screen unmounts.
    Object.values(attachmentPreviewUrlsRef.current).forEach((url) => {
      URL.revokeObjectURL(url);
    });

    attachmentPreviewUrlsRef.current = {};
  }, []);

  const clearAttachmentPreviewUrls = useCallback(() => {
    revokeAttachmentPreviewUrls();
    setAttachmentPreviewUrls({});
  }, [revokeAttachmentPreviewUrls]);

  const refreshAttachmentPreviewUrls = useCallback(
    async (loadedTicket: TicketDetail) => {
      // Only image attachments need preview URLs. Other files still show the
      // download action without doing extra blob requests.
      const previewableAttachments = loadedTicket.messages.flatMap((message) =>
        message.attachments.filter(isPreviewableImageAttachment),
      );
      const previewableIds = new Set(
        previewableAttachments.map((attachment) => attachment.id),
      );

      const nextPreviewUrls: Record<string, string> = {};

      // Keep object URLs for attachments that are still present after a reload.
      // This avoids flicker and unnecessary refetching after sending a reply.
      Object.entries(attachmentPreviewUrlsRef.current).forEach(([id, url]) => {
        if (previewableIds.has(id)) {
          nextPreviewUrls[id] = url;
        } else {
          URL.revokeObjectURL(url);
        }
      });

      await Promise.all(
        previewableAttachments.map(async (attachment) => {
          if (nextPreviewUrls[attachment.id]) {
            return;
          }

          try {
            const previewUrl = await createAttachmentPreviewUrl(
              loadedTicket.id,
              attachment,
            );

            if (previewUrl) {
              nextPreviewUrls[attachment.id] = previewUrl;
            }
          } catch {
            // Preview failure should not block the conversation. The download
            // button remains available for the same protected attachment.
          }
        }),
      );

      if (!isMountedRef.current) {
        // If previews finished after unmount, the new object URLs were never
        // stored in the ref. Revoke them here so they do not leak.
        Object.values(nextPreviewUrls).forEach((url) => {
          URL.revokeObjectURL(url);
        });

        return;
      }

      attachmentPreviewUrlsRef.current = nextPreviewUrls;
      setAttachmentPreviewUrls(nextPreviewUrls);
    },
    [],
  );

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      // Screen-level cleanup owns all preview URLs created by this hook.
      isMountedRef.current = false;
      revokeAttachmentPreviewUrls();
    };
  }, [revokeAttachmentPreviewUrls]);

  // useCallback keeps the function reference stable. That matters because
  // useFocusEffect depends on this function and should not rerun endlessly.
  const loadTicket = useCallback(async () => {
    try {
      // Clear older errors before a fresh request so stale messages disappear
      // once the user retries.
      clearError();
      setIsLoading(true);

      // The API layer already knows the base URL and authorization header.
      // The hook only asks for the ticket by id.
      const data = await getTicketById(ticketId);

      setTicket(data);
      void refreshAttachmentPreviewUrls(data);
    } catch (error) {
      clearAttachmentPreviewUrls();
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, [
    clearAttachmentPreviewUrls,
    clearError,
    handleError,
    refreshAttachmentPreviewUrls,
    ticketId,
  ]);

  // useFocusEffect is a React Navigation hook. It runs when the user navigates
  // to this screen, which keeps the ticket fresh after coming back from other
  // screens.
  useFocusEffect(
    useCallback(() => {
      loadTicket();
    }, [loadTicket]),
  );

  // Formik calls this after Yup validation succeeds. The hook trims the message
  // before sending so accidental whitespace is not saved as part of the reply.
  async function handleSendReply(
    values: TicketMessageFormValues,
    attachments: SelectedAttachment[],
  ) {
    try {
      clearError();

      const message = values.message.trim();

      if (attachments.length > 0) {
        await addTicketMessageWithAttachments(ticketId, message, attachments);
      } else {
        await addTicketMessage(ticketId, { message });
      }

      // Reload after writing so the message list and status are based on the
      // database result, not on a guessed local update.
      await loadTicket();

      showSuccess("Reply sent", "The conversation has been updated.");

      // Returning true lets the form know it may reset the text area.
      return true;
    } catch (error) {
      handleError(error);
      return false;
    }
  }

  // Status action buttons call this with the target status. Admin controls use
  // the actionable workflow states; clients use the same endpoint for
  // close/reopen.
  async function handleUpdateStatus(status: TicketStatus) {
    try {
      clearError();

      // Store the exact status currently being submitted so only that button
      // needs to show a loading/disabled state.
      setStatusSubmitting(status);

      await updateTicketStatus(ticketId, status);
      await loadTicket();

      showSuccess(
        "Status updated",
        `Ticket is now ${formatTicketStatus(status)}.`,
      );
    } catch (error) {
      handleError(error);
    } finally {
      setStatusSubmitting(null);
    }
  }

  async function handleDownloadAttachment(attachment: TicketAttachment) {
    try {
      clearError();

      await downloadTicketAttachment(ticketId, attachment);
      showSuccess("Download started", attachment.fileName);
    } catch (error) {
      handleError(error, "Could not download this attachment.");
    }
  }

  // Closed tickets cannot receive new replies. Keeping this as a derived value
  // avoids duplicating the same status check in multiple screen components.
  const isTicketClosed = ticket?.status === "Closed";

  // Client status actions are limited to close/reopen. Reopening moves a closed
  // ticket to Open, not to the brand-new "New" state.
  const clientStatusAction =
    user?.role === "Client" && ticket
      ? {
        status: isTicketClosed
          ? ("Open" as TicketStatus)
          : ("Closed" as TicketStatus),
        label: isTicketClosed ? "Reopen ticket" : "Close ticket",
      }
      : null;

  // Returning plain values/functions gives the screen a clean interface, almost
  // like a small view model.
  return {
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
  };
}
