import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

import { AppHeader } from "../components/AppHeader";
import { useHomeScreen } from "../hooks/useHomeScreen";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import { homeStyles as styles } from "../styles/homeStyles";
import { colors } from "../styles/theme";
import {
  formatTicketDate,
  formatTicketStatus,
} from "../utils/ticketFormatters";

import type { HomeScreenProps } from "../types";

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
  const { isCompact, isNarrow } = useResponsiveLayout();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        isCompact ? styles.contentCompact : null,
        isNarrow ? styles.contentNarrow : null,
      ]}
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
      <AppHeader
        onProfile={() => navigation.navigate("Profile")}
        onLogout={() => {
          void signOut();
        }}
      />

      <View style={[styles.hero, isCompact ? styles.heroCompact : null]}>
        <View>
          <Text style={styles.eyebrow}>{user?.companyName}</Text>
          <Text style={[styles.title, isCompact ? styles.titleCompact : null]}>
            Tickets
          </Text>
          <Text style={styles.muted}>
            {activeTicketCount} active ticket
            {activeTicketCount === 1 ? "" : "s"}
          </Text>
        </View>

        {user?.role === "Client" ? (
          // Only clients can create tickets. Admins use the admin dashboard.
          <Pressable
            style={[
              styles.primaryButton,
              isCompact ? styles.primaryButtonCompact : null,
              isNarrow ? styles.primaryButtonNarrow : null,
            ]}
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
          <View
            key={group.status}
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
                style={[
                  styles.emptyText,
                  isCompact ? styles.emptyTextCompact : null,
                ]}
              >
                No tickets in this collection.
              </Text>
            ) : (
              group.tickets.map((ticket) => (
                // Pressing a ticket opens the shared detail screen.
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
