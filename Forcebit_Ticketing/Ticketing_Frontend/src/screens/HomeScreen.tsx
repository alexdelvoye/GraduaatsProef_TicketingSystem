import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

import { useHomeScreen } from "../hooks/useHomeScreen";
import { homeStyles as styles } from "../styles/homeStyles";
import { colors } from "../styles/theme";
import { HomeScreenProps } from "../types";
import {
  formatTicketDate,
  formatTicketStatus,
} from "../utils/ticketFormatters";

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const {
    user,
    signOut,
    groupedTickets,
    activeTicketCount,
    isLoading,
    isRefreshing,
    errorMessage,
    loadTickets,
  } = useHomeScreen();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      // Pull-to-refresh reuses the same load function as initial loading, but
      // asks the hook to show the refresh spinner instead.
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
          <Text style={styles.eyebrow}>{user?.companyName}</Text>
          <Text style={styles.title}>Tickets</Text>
          <Text style={styles.muted}>
            {activeTicketCount} active ticket
            {activeTicketCount === 1 ? "" : "s"}
          </Text>
        </View>

        {user?.role === "Client" ? (
          // Only clients can create tickets. Admins use the admin dashboard.
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
        // groupedTickets is prepared by the hook so this screen only renders
        // each section.
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
                // Pressing a ticket opens the shared detail screen.
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
                    {ticket.category} / {ticket.subject}
                  </Text>
                  <Text style={styles.ticketDate}>
                    Updated {formatTicketDate(ticket.updatedAt)}
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
