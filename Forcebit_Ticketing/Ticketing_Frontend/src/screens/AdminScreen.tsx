import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

import { AppHeader } from "../components/AppHeader";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import {
  getClientLabel,
  statusFilters,
  useAdminScreen,
} from "../hooks/useAdminScreen";
import { homeStyles as styles } from "../styles/homeStyles";
import { colors } from "../styles/theme";
import {
  formatTicketDate,
  formatTicketStatus,
} from "../utils/ticketFormatters";

import type { AdminScreenProps } from "../types";

export default function AdminScreen({ navigation }: AdminScreenProps) {
  const {
    signOut,
    clients,
    selectedClientId,
    setSelectedClientId,
    selectedStatus,
    setSelectedStatus,
    filteredTickets,
    activeTicketCount,
    isLoading,
    isRefreshing,
    errorMessage,
    loadDashboard,
  } = useAdminScreen();
  const { isCompact, isNarrow } = useResponsiveLayout();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        isCompact ? styles.contentCompact : null,
        isNarrow ? styles.contentNarrow : null,
      ]}
      // Admin can pull to refresh clients and tickets together.
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => loadDashboard(true)}
          tintColor={colors.primary}
        />
      }
    >
      <AppHeader
        onProfile={() => navigation.navigate("Profile")}
        onLogout={() => {
          void signOut();
        }}
      />

      <View style={[styles.hero, isCompact ? styles.heroCompact : null]}>
        <View>
          <Text style={styles.eyebrow}>Admin</Text>
          <Text style={[styles.title, isCompact ? styles.titleCompact : null]}>
            Client tickets
          </Text>
          <Text style={styles.muted}>
            {clients.length} client{clients.length === 1 ? "" : "s"} /{" "}
            {activeTicketCount} active ticket
            {activeTicketCount === 1 ? "" : "s"}
          </Text>
        </View>
      </View>

      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}

      {isLoading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <>
          <View style={[styles.card, isCompact ? styles.cardCompact : null]}>
            <Text
              style={[
                styles.sectionTitle,
                isCompact ? styles.sectionTitleCompact : null,
              ]}
            >
              Clients
            </Text>
            <View
              style={[
                styles.optionGrid,
                isCompact ? styles.optionGridCompact : null,
              ]}
            >
              {/* "All" is a frontend-only filter option. */}
              <Pressable
                style={[
                  styles.optionButton,
                  isCompact ? styles.optionButtonCompact : null,
                  selectedClientId === "All" && styles.optionButtonSelected,
                ]}
                onPress={() => setSelectedClientId("All")}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    selectedClientId === "All" &&
                      styles.optionButtonTextSelected,
                  ]}
                >
                  All clients
                </Text>
              </Pressable>

              {clients.map((client) => (
                // Client buttons filter the ticket queue without another API
                // request because all admin tickets are already loaded.
                <Pressable
                  key={client.id}
                  style={[
                    styles.optionButton,
                    isCompact ? styles.optionButtonCompact : null,
                    selectedClientId === client.id &&
                      styles.optionButtonSelected,
                  ]}
                  onPress={() => setSelectedClientId(client.id)}
                >
                  <Text
                    style={[
                      styles.optionButtonText,
                      selectedClientId === client.id &&
                        styles.optionButtonTextSelected,
                    ]}
                  >
                    {getClientLabel(client)}
                  </Text>
                  <Text
                    style={[
                      styles.optionSubtext,
                      selectedClientId === client.id &&
                        styles.optionSubtextSelected,
                    ]}
                  >
                    {client.activeTicketCount} active /{" "}
                    {client.closedTicketCount} closed
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={[styles.card, isCompact ? styles.cardCompact : null]}>
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
              {statusFilters.map((status) => (
                // Status filters reuse backend status values plus the "All"
                // frontend value.
                <Pressable
                  key={status}
                  style={[
                    styles.optionButton,
                    isCompact ? styles.optionButtonCompact : null,
                    selectedStatus === status && styles.optionButtonSelected,
                  ]}
                  onPress={() => setSelectedStatus(status)}
                >
                  <Text
                    style={[
                      styles.optionButtonText,
                      selectedStatus === status &&
                        styles.optionButtonTextSelected,
                    ]}
                  >
                    {formatTicketStatus(status)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

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
                  Tickets
                </Text>
                <Text style={styles.muted}>
                  {filteredTickets.length} matching ticket
                  {filteredTickets.length === 1 ? "" : "s"}
                </Text>
              </View>
            </View>

            {filteredTickets.length === 0 ? (
              <Text
                style={[
                  styles.emptyText,
                  isCompact ? styles.emptyTextCompact : null,
                ]}
              >
                No tickets match this filter.
              </Text>
            ) : (
              filteredTickets.map((ticket) => (
                // The same ticket detail screen is used by admin and client.
                <Pressable
                  key={ticket.id}
                  style={[
                    styles.ticketCard,
                    isCompact ? styles.ticketCardCompact : null,
                  ]}
                  onPress={() =>
                    navigation.navigate("TicketDetail", { ticketId: ticket.id })
                  }
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

                  <Text style={styles.ticketMeta}>
                    {ticket.companyName || ticket.clientName} /{" "}
                    {ticket.category} / {ticket.subject}
                  </Text>
                  <Text style={styles.ticketDate}>
                    Updated {formatTicketDate(ticket.updatedAt)}
                  </Text>
                </Pressable>
              ))
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}
