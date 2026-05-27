import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

import {
  getClientLabel,
  statusFilters,
  useAdminScreen,
} from "../hooks/useAdminScreen";
import { homeStyles as styles } from "../styles/homeStyles";
import { colors } from "../styles/theme";
import { AdminScreenProps } from "../types";
import {
  formatTicketDate,
  formatTicketStatus,
} from "../utils/ticketFormatters";

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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      // Admin can pull to refresh clients and tickets together.
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => loadDashboard(true)}
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.logo}>FORCEBIT</Text>

        <View style={styles.headerActions}>
          <Pressable
            onPress={() => navigation.navigate("Profile")}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>Profile</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              void signOut();
            }}
            style={styles.logoutButton}
          >
            <Text style={styles.logoutText}>Log out</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.hero}>
        <View>
          <Text style={styles.eyebrow}>Admin</Text>
          <Text style={styles.title}>Client tickets</Text>
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
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Clients</Text>
            <View style={styles.optionGrid}>
              {/* "All" is a frontend-only filter option. */}
              <Pressable
                style={[
                  styles.optionButton,
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
                    {client.openTicketCount} open / {client.closedTicketCount}{" "}
                    closed
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Status</Text>
            <View style={styles.optionGrid}>
              {statusFilters.map((status) => (
                // Status filters reuse backend status values plus the "All"
                // frontend value.
                <Pressable
                  key={status}
                  style={[
                    styles.optionButton,
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

          <View style={styles.ticketSection}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Tickets</Text>
                <Text style={styles.muted}>
                  {filteredTickets.length} matching ticket
                  {filteredTickets.length === 1 ? "" : "s"}
                </Text>
              </View>
            </View>

            {filteredTickets.length === 0 ? (
              <Text style={styles.emptyText}>
                No tickets match this filter.
              </Text>
            ) : (
              filteredTickets.map((ticket) => (
                // The same ticket detail screen is used by admin and client.
                <Pressable
                  key={ticket.id}
                  style={styles.ticketCard}
                  onPress={() =>
                    navigation.navigate("TicketDetail", { ticketId: ticket.id })
                  }
                >
                  <View style={styles.ticketCardHeader}>
                    <Text style={styles.ticketTitle}>{ticket.title}</Text>
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
