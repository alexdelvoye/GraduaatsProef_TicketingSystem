import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "../styles/theme";

type NotificationType = "success" | "error" | "info";

type Notification = {
  id: number;
  type: NotificationType;
  title: string;
  message?: string;
};

type ShowNotificationOptions = {
  type?: NotificationType;
  title: string;
  message?: string;
};

type NotificationContextType = {
  showNotification: (options: ShowNotificationOptions) => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
};

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // A single provider gives the whole app one professional feedback system.
  // Screens/hooks call showSuccess/showError instead of each screen inventing
  // its own alert style.
  const [notification, setNotification] = useState<Notification | null>(null);

  // Store the timeout id in a ref because changing it should not re-render the
  // UI. Refs are useful for mutable values that are not displayed directly.
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismissNotification = useCallback(() => {
    // Setting notification to null removes the toast from the render output.
    setNotification(null);
  }, []);

  const showNotification = useCallback(
    ({ type = "info", title, message }: ShowNotificationOptions) => {
      // Only one toast is shown at a time. A new notification replaces the old
      // one and restarts the timer.
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setNotification({
        // Date.now gives each toast a fresh key so React treats replacement
        // notifications as new visible items.
        id: Date.now(),
        type,
        title,
        message,
      });

      timeoutRef.current = setTimeout(dismissNotification, 4200);
    },
    [dismissNotification],
  );

  const showSuccess = useCallback(
    (title: string, message?: string) => {
      showNotification({ type: "success", title, message });
    },
    [showNotification],
  );

  const showError = useCallback(
    (title: string, message?: string) => {
      showNotification({ type: "error", title, message });
    },
    [showNotification],
  );

  const showInfo = useCallback(
    (title: string, message?: string) => {
      showNotification({ type: "info", title, message });
    },
    [showNotification],
  );

  useEffect(() => {
    // Cleanup runs when the provider unmounts. Without this, the timeout could
    // try to update state after the component is gone.
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{ showNotification, showSuccess, showError, showInfo }}
    >
      <View style={styles.root}>
        {children}

        {notification ? (
          // Pressing the toast dismisses it manually. It also disappears after
          // the timeout configured in showNotification.
          <Pressable
            key={notification.id}
            onPress={dismissNotification}
            style={[
              styles.toast,
              Platform.OS === "web" ? styles.toastWeb : styles.toastNative,
              notification.type === "success" && styles.toastSuccess,
              notification.type === "error" && styles.toastError,
            ]}
          >
            <Text style={styles.title}>{notification.title}</Text>
            {notification.message ? (
              <Text style={styles.message}>{notification.message}</Text>
            ) : null}
          </Pressable>
        ) : null}
      </View>
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used inside NotificationProvider",
    );
  }

  return context;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  toast: {
    position: "absolute",
    bottom: 24,
    zIndex: 20,
    backgroundColor: colors.card,
    borderLeftColor: colors.primary,
    borderLeftWidth: 4,
    borderRadius: 10,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
  },
  toastWeb: {
    right: 24,
    width: "90%",
    maxWidth: 360,
  },
  toastNative: {
    left: 18,
    right: 18,
  },
  toastSuccess: {
    borderLeftColor: colors.success,
  },
  toastError: {
    borderLeftColor: colors.danger,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  message: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
});
