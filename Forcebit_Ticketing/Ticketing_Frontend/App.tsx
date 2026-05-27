import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";

import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { NotificationProvider } from "./src/context/NotificationContext";
import AdminScreen from "./src/screens/AdminScreen";
import HomeScreen from "./src/screens/HomeScreen";
import LoginScreen from "./src/screens/LoginScreen";
import NewTicketScreen from "./src/screens/NewTicketScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import TicketDetailScreen from "./src/screens/TicketDetailScreen";
import { colors } from "./src/styles/theme";
import { RootStackParamList } from "./src/types";

// Type the navigator with RootStackParamList so screen names and route params
// are checked by TypeScript.
const Stack = createNativeStackNavigator<RootStackParamList>();

function Navigation() {
  const { token, user, isLoading } = useAuth();

  if (isLoading) {
    // While AuthProvider restores saved token/user data, show a neutral loading
    // screen instead of briefly flashing the login screen.
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token ? (
          // Authenticated users get the app screens. Admins and clients start on
          // different home screens but share profile and ticket detail routes.
          <>
            {user?.role === "Admin" ? (
              <Stack.Screen name="AdminHome" component={AdminScreen} />
            ) : (
              <>
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="NewTicket" component={NewTicketScreen} />
              </>
            )}
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="TicketDetail" component={TicketDetailScreen} />
          </>
        ) : (
          // Anonymous users can only log in or create an account.
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    // NotificationProvider wraps AuthProvider because auth actions such as
    // signOut can show toast messages.
    <NotificationProvider>
      <AuthProvider>
        <Navigation />
      </AuthProvider>
    </NotificationProvider>
  );
}
