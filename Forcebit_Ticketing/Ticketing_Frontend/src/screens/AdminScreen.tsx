import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { getAllTickets, getClients } from "../api/ticketApi";
import { useAuth } from "../context/AuthContext";
import { useErrorHandler } from "../hooks/useErrorHandler";
import { homeStyles as styles } from "../styles/homeStyles";
import { colors } from "../styles/theme";
import {
  ClientListItem,
  RootStackParamList,
  TicketListItem,
  TicketStatus,
} from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "AdminHome">;
type StatusFilter = "All" | TicketStatus;

const statusFilters: StatusFilter[] = ["All", "Open", "InProgress", "Closed"];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatStatus(status: StatusFilter) {
  if (status === "All") {
    return "All";
  }

  return status === "InProgress" ? "In progress" : status;
}

function getClientLabel(client: ClientListItem) {
  return client.companyName || client.name;
}

export default function AdminScreen({ navigation }: Props) {
  const { signOut } = useAuth();
  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [tickets, setTickets] = useState<TicketListItem[]>([]);
  const [selectedClientId, setSelectedClientId] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("All");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { errorMessage, clearError, handleError } = useErrorHandler(
    "Could not load the admin dashboard.",
  );

  const loadDashboard = useCallback(
    async (showRefreshing = false) => {
      try {
        clearError();
        showRefreshing ? setIsRefreshing(true) : setIsLoading(true);

        const [clientData, ticketData] = await Promise.all([
          getClients(),
          getAllTickets(),
        ]);

        setClients(clientData);
        setTickets(ticketData);
      } catch (error) {
        handleError(error);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [clearError, handleError],
  );

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [loadDashboard]),
  );

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const clientMatches =
        selectedClientId === "All" || ticket.clientId === selectedClientId;
      const statusMatches =
        selectedStatus === "All" || ticket.status === selectedStatus;

      return clientMatches && statusMatches;
    });
  }, [selectedClientId, selectedStatus, tickets]);

  const activeTicketCount = tickets.filter(
    (ticket) => ticket.status !== "Closed",
  ).length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
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

          <Pressable onPress={signOut} style={styles.logoutButton}>
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
                    {formatStatus(status)}
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
                      {formatStatus(ticket.status)}
                    </Text>
                  </View>

                  <Text style={styles.ticketMeta}>
                    {ticket.companyName || ticket.clientName} /{" "}
                    {ticket.category} / {ticket.subject}
                  </Text>
                  <Text style={styles.ticketDate}>
                    Updated {formatDate(ticket.updatedAt)}
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
