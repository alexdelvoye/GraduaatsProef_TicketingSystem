import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { AppHeader } from "../components/AppHeader";
import { TicketGroupSection } from "../components/TicketGroupSection";
import { useHomeScreen } from "../hooks/useHomeScreen";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import { homeStyles as styles } from "../styles/homeStyles";
import { colors } from "../styles/theme";
import { categoryFilters, statusFilters } from "../types";
import {
  formatTicketCategory,
  formatTicketStatus,
} from "../utils/ticketFormatters";

import type { HomeScreenProps } from "../types";

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const {
    user,
    signOut,
    groupedTickets,
    ticketCounts,
    ticketSearchText,
    setTicketSearchText,
    selectedStatus,
    setSelectedStatus,
    selectedCategory,
    setSelectedCategory,
    isLoading,
    isRefreshing,
    errorMessage,
    loadTickets,
  } = useHomeScreen();
  const { isCompact, isNarrow } = useResponsiveLayout();
  const ticketPageSize = isCompact ? 5 : 8;

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
          <Text style={styles.dashboardSummary}>
            {ticketCounts.newTicketCount} new / {ticketCounts.openTicketCount}{" "}
            open / {ticketCounts.closedTicketCount} closed
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

      <View style={[styles.card, isCompact ? styles.cardCompact : null]}>
        <Text
          style={[
            styles.sectionTitle,
            isCompact ? styles.sectionTitleCompact : null,
          ]}
        >
          Ticket filters
        </Text>
        <TextInput
          style={[styles.input, styles.searchInput]}
          placeholder="Search tickets by title, category, or subject"
          placeholderTextColor={colors.muted}
          value={ticketSearchText}
          onChangeText={setTicketSearchText}
        />

        <View style={styles.filterBlock}>
          <Text style={styles.filterBlockTitle}>Status</Text>
          <View
            style={[
              styles.optionGrid,
              isCompact ? styles.optionGridCompact : null,
            ]}
          >
            {statusFilters.map((status) => (
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

        <View style={styles.filterBlock}>
          <Text style={styles.filterBlockTitle}>Category</Text>
          <View
            style={[
              styles.optionGrid,
              isCompact ? styles.optionGridCompact : null,
            ]}
          >
            {categoryFilters.map((category) => (
              <Pressable
                key={category}
                style={[
                  styles.optionButton,
                  isCompact ? styles.optionButtonCompact : null,
                  selectedCategory === category && styles.optionButtonSelected,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    selectedCategory === category &&
                      styles.optionButtonTextSelected,
                  ]}
                >
                  {category === "All" ? "All" : formatTicketCategory(category)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        // groupedTickets is prepared by the hook so this screen only renders
        // each section.
        groupedTickets.map((group) => (
          <TicketGroupSection
            key={group.status}
            group={group}
            emptyMessage="No tickets in this collection."
            getTicketMeta={(ticket) =>
              `${formatTicketCategory(ticket.category)} / ${ticket.subject}`
            }
            isCompact={isCompact}
            pageSize={ticketPageSize}
            resetKey={`${ticketSearchText}:${selectedStatus}:${selectedCategory}`}
            onOpenTicket={(ticketId) =>
              navigation.navigate("TicketDetail", { ticketId })
            }
          />
        ))
      )}
    </ScrollView>
  );
}
