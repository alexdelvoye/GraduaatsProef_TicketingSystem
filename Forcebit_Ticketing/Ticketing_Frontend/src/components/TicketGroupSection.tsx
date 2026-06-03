import { Pressable, Text, View } from "react-native";

import { usePagination } from "../hooks/usePagination";
import { homeStyles as styles } from "../styles/homeStyles";
import {
  formatTicketDate,
  formatTicketStatus,
} from "../utils/ticketFormatters";

import { PaginationControls } from "./PaginationControls";

import type { TicketListItem } from "../types";
import type { TicketGroupWithTickets } from "../utils/ticketGroups";

type TicketGroupSectionProps = {
  group: TicketGroupWithTickets;
  emptyMessage: string;
  getTicketMeta: (ticket: TicketListItem) => string;
  isCompact: boolean;
  pageSize: number;
  resetKey: string;
  onOpenTicket: (ticketId: string) => void;
};

export function TicketGroupSection({
  group,
  emptyMessage,
  getTicketMeta,
  isCompact,
  pageSize,
  resetKey,
  onOpenTicket,
}: TicketGroupSectionProps) {
  // Each workflow group owns its own page state, so moving through Closed
  // tickets does not change the page of New or Open tickets.
  const pagination = usePagination(group.tickets, {
    pageSize,
    resetKey: `${group.status}:${resetKey}:${group.tickets.length}`,
  });

  return (
    <View
      style={[
        styles.ticketSection,
        isCompact ? styles.ticketSectionCompact : null,
      ]}
    >
      <View
        style={[
          styles.sectionHeader,
          isCompact ? styles.sectionHeaderCompact : null,
        ]}
      >
        <View>
          <Text
            style={[
              styles.sectionTitle,
              isCompact ? styles.sectionTitleCompact : null,
            ]}
          >
            {group.title}
          </Text>
          <Text style={styles.muted}>{group.description}</Text>
        </View>

        <Text style={styles.countBadge}>{group.tickets.length}</Text>
      </View>

      {group.tickets.length === 0 ? (
        <Text
          style={[styles.emptyText, isCompact ? styles.emptyTextCompact : null]}
        >
          {emptyMessage}
        </Text>
      ) : (
        <>
          {pagination.pageItems.map((ticket) => (
            // The ticket detail screen is shared by admin and client users.
            <Pressable
              key={ticket.id}
              style={[
                styles.ticketCard,
                isCompact ? styles.ticketCardCompact : null,
              ]}
              onPress={() => onOpenTicket(ticket.id)}
            >
              <View
                style={[
                  styles.ticketCardHeader,
                  isCompact ? styles.ticketCardHeaderCompact : null,
                ]}
              >
                <Text style={styles.ticketTitle}>{ticket.title}</Text>
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

              <Text style={styles.ticketMeta}>{getTicketMeta(ticket)}</Text>
              <Text style={styles.ticketDate}>
                Updated {formatTicketDate(ticket.updatedAt)}
              </Text>
            </Pressable>
          ))}

          <PaginationControls
            itemLabel="tickets"
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            startItem={pagination.startItem}
            endItem={pagination.endItem}
            canGoPrevious={pagination.canGoPrevious}
            canGoNext={pagination.canGoNext}
            onPrevious={pagination.goToPreviousPage}
            onNext={pagination.goToNextPage}
          />
        </>
      )}
    </View>
  );
}
