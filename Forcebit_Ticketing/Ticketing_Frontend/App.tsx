import { AuthProvider } from "./src/context/AuthContext";
import { NotificationProvider } from "./src/context/NotificationContext";
import { AppNavigator } from "./src/navigation/AppNavigator";

export default function App() {
  return (
    // NotificationProvider wraps AuthProvider because auth actions such as
    // signOut can show toast messages. Routing itself lives in AppNavigator so
    // this root component stays focused on application-wide providers.
    <NotificationProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </NotificationProvider>
  );
}
