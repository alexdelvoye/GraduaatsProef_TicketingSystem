import { StyleSheet } from "react-native";

import { attachmentStyleGroup } from "./attachmentStyles";
import { buttonStyleGroup } from "./buttonStyles";
import { formStyleGroup } from "./formStyles";
import { headerStyleGroup } from "./headerStyles";
import { paginationStyleGroup } from "./paginationStyles";
import { profileStyleGroup } from "./profileStyles";
import { sharedStyleGroup } from "./sharedStyles";
import { ticketStyleGroup } from "./ticketStyles";

// Aggregates the style groups used by the ticket/admin/profile part of the app.
// Components keep importing homeStyles for a small public API, while the actual
// style groups stay split by responsibility for easier maintenance and defense.
export const homeStyles = StyleSheet.create({
  ...sharedStyleGroup,
  ...headerStyleGroup,
  ...buttonStyleGroup,
  ...profileStyleGroup,
  ...ticketStyleGroup,
  ...formStyleGroup,
  ...attachmentStyleGroup,
  ...paginationStyleGroup,
});
