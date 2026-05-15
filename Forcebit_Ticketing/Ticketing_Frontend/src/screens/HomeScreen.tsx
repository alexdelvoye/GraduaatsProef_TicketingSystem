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
import { getMyTickets } from "../api/ticketApi";
import { useAuth } from "../context/AuthContext";
import { useErrorHandler } from "../hooks/useErrorHandler";
import { homeStyles as styles } from "../styles/homeStyles";
import { colors } from "../styles/theme";
import { RootStackParamList, TicketListItem, TicketStatus } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

type TicketGroup = {
  status: TicketStatus;
  title: string;
  description: string;
};

const ticketGroups: TicketGroup[] = [
  {
    status: "Open",
    title: "Open",
    description: "Waiting for a first response",
  },
  {
    status: "InProgress",
    title: "In progress",
    description: "Being handled by Forcebit",
  },
  {
    status: "Closed",
    title: "Closed",
    description: "Resolved tickets",
  },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function groupTickets(tickets: TicketListItem[]) {
  return ticketGroups.map((group) => ({
    ...group,
    tickets: tickets.filter((ticket) => ticket.status === group.status),
  }));
}

export default function HomeScreen({ navigation }: Props) {
  const { user, signOut } = useAuth();
  const [tickets, setTickets] = useState<TicketListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { errorMessage, clearError, handleError } = useErrorHandler(
    "Could not load your tickets.",
  );

  const groupedTickets = useMemo(() => groupTickets(tickets), [tickets]);
  const activeTicketCount = tickets.filter(
    (ticket) => ticket.status !== "Closed",
  ).length;

  const loadTickets = useCallback(
    async (showRefreshing = false) => {
      try {
        clearError();
        showRefreshing ? setIsRefreshing(true) : setIsLoading(true);
        const data = await getMyTickets();
        setTickets(data);
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
      if (user) {
        loadTickets();
      } else {
        setIsLoading(false);
      }
    }, [loadTickets, user]),
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => loadTickets(true)}
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
          <Text style={styles.eyebrow}>{user?.companyName}</Text>
          <Text style={styles.title}>Tickets</Text>
          <Text style={styles.muted}>
            {activeTicketCount} active ticket
            {activeTicketCount === 1 ? "" : "s"}
          </Text>
        </View>

        {user?.role === "Client" ? (
          <Pressable
            style={styles.primaryButton}
            onPress={() => navigation.navigate("NewTicket")}
          >
            <Text style={styles.primaryButtonText}>New ticket</Text>
          </Pressable>
        ) : null}
      </View>

      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}

      {isLoading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        groupedTickets.map((group) => (
          <View key={group.status} style={styles.ticketSection}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>{group.title}</Text>
                <Text style={styles.muted}>{group.description}</Text>
              </View>

              <Text style={styles.countBadge}>{group.tickets.length}</Text>
            </View>

            {group.tickets.length === 0 ? (
              <Text style={styles.emptyText}>
                No tickets in this collection.
              </Text>
            ) : (
              group.tickets.map((ticket) => (
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
                      {ticket.status === "InProgress"
                        ? "In progress"
                        : ticket.status}
                    </Text>
                  </View>

                  <Text style={styles.ticketMeta}>
                    {ticket.category} / {ticket.subject}
                  </Text>
                  <Text style={styles.ticketDate}>
                    Updated {formatDate(ticket.updatedAt)}
                  </Text>
                </Pressable>
              ))
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}
