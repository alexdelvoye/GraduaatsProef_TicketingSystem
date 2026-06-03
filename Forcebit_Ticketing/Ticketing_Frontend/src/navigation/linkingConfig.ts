import type { LinkingOptions } from "@react-navigation/native";

import type { RootStackParamList } from "../types";

// React Navigation only syncs Expo web navigation with browser history when a
// linking config exists. These paths are therefore the browser-facing route
// contract for back/forward buttons, refreshes, and shareable ticket links.
export const navigationLinkingConfig: LinkingOptions<RootStackParamList> = {
  prefixes: [],
  config: {
    screens: {
      Login: "login",
      Register: "register",
      AdminHome: "admin",
      Home: "tickets",
      NewTicket: "tickets/new",
      Profile: "profile",
      TicketDetail: "tickets/:ticketId",
    },
  },
};
