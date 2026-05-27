import { StyleSheet } from "react-native";

import { attachmentStyleDefinitions } from "./attachmentStyles";
import { buttonStyleDefinitions } from "./buttonStyles";
import { formStyleDefinitions } from "./formStyles";
import { headerStyleDefinitions } from "./headerStyles";
import { profileStyleDefinitions } from "./profileStyles";
import { sharedStyleDefinitions } from "./sharedStyles";
import { ticketStyleDefinitions } from "./ticketStyles";

// Aggregates the style groups used by the ticket/admin/profile part of the app.
// Components keep importing homeStyles for a small public API, while the actual
// definitions are split by responsibility for easier maintenance and defense.
export const homeStyles = StyleSheet.create({
  ...sharedStyleDefinitions,
  ...headerStyleDefinitions,
  ...buttonStyleDefinitions,
  ...profileStyleDefinitions,
  ...ticketStyleDefinitions,
  ...formStyleDefinitions,
  ...attachmentStyleDefinitions,
});
