import type { StatusFilter, TicketGroup, TicketListItem } from "../types";

export type TicketGroupWithTickets = TicketGroup & {
  tickets: TicketListItem[];
};

// The three workflow sections stay the same for admin and client users; only
// the Open description changes because the audience reads the dashboard from a
// different perspective.
function createTicketGroups(openDescription: string): TicketGroup[] {
  return [
    {
      status: "New",
      title: "New",
      description: "Waiting for a first support reply",
    },
    {
      status: "Open",
      title: "Open",
      description: openDescription,
    },
    {
      status: "Closed",
      title: "Closed",
      description: "Resolved tickets",
    },
  ];
}

export const clientTicketGroups = createTicketGroups(
  "Active conversation with Forcebit",
);

export const adminTicketGroups = createTicketGroups(
  "Active support conversations",
);

// Grouping is a presentation concern: both dashboards receive flat API lists,
// then reuse this helper to render the shared New/Open/Closed layout.
export function groupTicketsByStatus(
  tickets: TicketListItem[],
  selectedStatus: StatusFilter,
  groups: TicketGroup[],
): TicketGroupWithTickets[] {
  const visibleGroups =
    selectedStatus === "All"
      ? groups
      : groups.filter((group) => group.status === selectedStatus);

  return visibleGroups.map((group) => ({
    ...group,
    tickets: tickets.filter((ticket) => ticket.status === group.status),
  }));
}
