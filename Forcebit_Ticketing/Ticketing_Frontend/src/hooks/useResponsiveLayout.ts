import { useWindowDimensions } from "react-native";

// Compact is for tablet-sized browser widths and small laptops. Narrow is for
// phone-like widths where action buttons and chat bubbles need more room.
const compactBreakpoint = 760;
const narrowBreakpoint = 480;

export function useResponsiveLayout() {
  const { width } = useWindowDimensions();

  // The frontend is used both as an Expo web app and on smaller devices. These
  // named breakpoints keep responsive decisions consistent across screens.
  return {
    isCompact: width < compactBreakpoint,
    isNarrow: width < narrowBreakpoint,
  };
}
