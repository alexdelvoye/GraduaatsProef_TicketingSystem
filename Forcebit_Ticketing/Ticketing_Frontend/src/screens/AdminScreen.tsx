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
import { PaginationControls } from "../components/PaginationControls";
import { TicketGroupSection } from "../components/TicketGroupSection";
import { usePagination } from "../hooks/usePagination";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import {
  categoryFilters,
  getClientLabel,
  statusFilters,
  subjectFilters,
  useAdminScreen,
} from "../hooks/useAdminScreen";
import { homeStyles as styles } from "../styles/homeStyles";
import { colors } from "../styles/theme";
import {
  formatTicketCategory,
  formatTicketStatus,
} from "../utils/ticketFormatters";

import type { ClientDashboardItem } from "../hooks/useAdminScreen";
import type { AdminScreenProps } from "../types";
import type { TicketStatusCounts } from "../utils/ticketListHelpers";

type ClientStatusCountsProps = {
  newTicketCount: number;
  openTicketCount: number;
  closedTicketCount: number;
  isSelected: boolean;
};

type ClientStatusCountsData = Omit<ClientStatusCountsProps, "isSelected">;

type ClientRowProps = {
  clientId: string;
  label: string;
  subtitle: string;
  counts: ClientStatusCountsData;
  isCompact: boolean;
  isSelected: boolean;
  onPress: () => void;
};

function ClientStatusCounts({
  newTicketCount,
  openTicketCount,
  closedTicketCount,
  isSelected,
}: ClientStatusCountsProps) {
  const statusCounts = [
    ["New", newTicketCount],
    ["Open", openTicketCount],
    ["Closed", closedTicketCount],
  ] as const;

  return (
    <View style={styles.clientCountRow}>
      {statusCounts.map(([label, count]) => (
        <View
          key={label}
          style={[
            styles.clientCountPill,
            isSelected ? styles.clientCountPillSelected : null,
          ]}
        >
          <Text
            style={[
              styles.clientCountText,
              isSelected ? styles.clientCountTextSelected : null,
            ]}
          >
            {label} {count}
          </Text>
        </View>
      ))}
    </View>
  );
}

function ClientRow({
  clientId,
  label,
  subtitle,
  counts,
  isCompact,
  isSelected,
  onPress,
}: ClientRowProps) {
  return (
    <Pressable
      key={clientId}
      style={[
        styles.clientRow,
        isCompact ? styles.clientRowCompact : null,
        isSelected ? styles.clientRowSelected : null,
      ]}
      onPress={onPress}
    >
      <View style={styles.clientIdentity}>
        <Text
          style={[
            styles.clientName,
            isSelected ? styles.clientNameSelected : null,
          ]}
        >
          {label}
        </Text>
        <Text
          style={[
            styles.clientEmail,
            isSelected ? styles.clientEmailSelected : null,
          ]}
        >
          {subtitle}
        </Text>
      </View>

      <ClientStatusCounts {...counts} isSelected={isSelected} />
    </Pressable>
  );
}

export default function AdminScreen({ navigation }: AdminScreenProps) {
  const {
    signOut,
    clients,
    filteredClients,
    selectedClientId,
    setSelectedClientId,
    selectedStatus,
    setSelectedStatus,
    selectedCategory,
    setSelectedCategory,
    selectedSubject,
    setSelectedSubject,
    clientSearchText,
    setClientSearchText,
    ticketSearchText,
    setTicketSearchText,
    filteredTickets,
    groupedTickets,
    ticketCounts,
    isLoading,
    isRefreshing,
    errorMessage,
    loadDashboard,
  } = useAdminScreen();
  const { isCompact, isNarrow } = useResponsiveLayout();
  const clientPageSize = isCompact ? 5 : 8;
  const ticketPageSize = isCompact ? 6 : 10;
  const clientPagination = usePagination(filteredClients, {
    pageSize: clientPageSize,
    resetKey: `${clientSearchText}:${filteredClients.length}`,
  });
  const ticketFilterResetKey = [
    selectedClientId,
    selectedStatus,
    selectedCategory,
    selectedSubject,
    ticketSearchText,
  ].join(":");

  function getClientCounts(client: ClientDashboardItem) {
    return {
      newTicketCount: client.newTicketCount,
      openTicketCount: client.openTicketCount,
      closedTicketCount: client.closedTicketCount,
    };
  }

  function getAllClientCounts(counts: TicketStatusCounts) {
    return {
      newTicketCount: counts.newTicketCount,
      openTicketCount: counts.openTicketCount,
      closedTicketCount: counts.closedTicketCount,
    };
  }

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
          <Text style={styles.dashboardSummary}>
            {clients.length} client{clients.length === 1 ? "" : "s"} /{" "}
            {ticketCounts.newTicketCount} new / {ticketCounts.openTicketCount}{" "}
            open / {ticketCounts.closedTicketCount} closed
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
            <TextInput
              style={[styles.input, styles.searchInput]}
              placeholder="Search clients by name, company, or email"
              placeholderTextColor={colors.muted}
              value={clientSearchText}
              onChangeText={setClientSearchText}
            />

            <View style={styles.clientList}>
              <ClientRow
                clientId="All"
                label="All clients"
                subtitle={`${clients.length} total client${
                  clients.length === 1 ? "" : "s"
                }`}
                counts={getAllClientCounts(ticketCounts)}
                isCompact={isCompact}
                isSelected={selectedClientId === "All"}
                onPress={() => setSelectedClientId("All")}
              />

              {filteredClients.length === 0 ? (
                <Text
                  style={[
                    styles.emptyText,
                    isCompact ? styles.emptyTextCompact : null,
                  ]}
                >
                  No clients match this search.
                </Text>
              ) : (
                clientPagination.pageItems.map((client) => (
                  // Selecting a client filters the already-loaded ticket queue.
                  <ClientRow
                    key={client.id}
                    clientId={client.id}
                    label={getClientLabel(client)}
                    subtitle={client.email}
                    counts={getClientCounts(client)}
                    isCompact={isCompact}
                    isSelected={selectedClientId === client.id}
                    onPress={() => setSelectedClientId(client.id)}
                  />
                ))
              )}
            </View>

            <PaginationControls
              itemLabel="clients"
              currentPage={clientPagination.currentPage}
              totalPages={clientPagination.totalPages}
              totalItems={clientPagination.totalItems}
              startItem={clientPagination.startItem}
              endItem={clientPagination.endItem}
              canGoPrevious={clientPagination.canGoPrevious}
              canGoNext={clientPagination.canGoNext}
              onPrevious={clientPagination.goToPreviousPage}
              onNext={clientPagination.goToNextPage}
            />
          </View>

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
              placeholder="Search tickets by title, client, category, or subject"
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
                      selectedCategory === category &&
                        styles.optionButtonSelected,
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
                      {category === "All"
                        ? "All"
                        : formatTicketCategory(category)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.filterBlock}>
              <Text style={styles.filterBlockTitle}>Subject</Text>
              <View
                style={[
                  styles.optionGrid,
                  isCompact ? styles.optionGridCompact : null,
                ]}
              >
                {subjectFilters.map((subject) => (
                  <Pressable
                    key={subject}
                    style={[
                      styles.optionButton,
                      isCompact ? styles.optionButtonCompact : null,
                      selectedSubject === subject &&
                        styles.optionButtonSelected,
                    ]}
                    onPress={() => setSelectedSubject(subject)}
                  >
                    <Text
                      style={[
                        styles.optionButtonText,
                        selectedSubject === subject &&
                          styles.optionButtonTextSelected,
                      ]}
                    >
                      {subject}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.ticketSection}>
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

            {groupedTickets.map((group) => (
              <TicketGroupSection
                key={group.status}
                group={group}
                emptyMessage="No tickets match this filter."
                getTicketMeta={(ticket) =>
                  `${ticket.companyName || ticket.clientName} / ${formatTicketCategory(
                    ticket.category,
                  )} / ${ticket.subject}`
                }
                isCompact={isCompact}
                pageSize={ticketPageSize}
                resetKey={ticketFilterResetKey}
                onOpenTicket={(ticketId) =>
                  navigation.navigate("TicketDetail", { ticketId })
                }
              />
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}
