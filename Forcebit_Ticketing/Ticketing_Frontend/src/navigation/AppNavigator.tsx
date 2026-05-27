import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";

import { useAuth } from "../context/AuthContext";
import AdminScreen from "../screens/AdminScreen";
import HomeScreen from "../screens/HomeScreen";
import LoginScreen from "../screens/LoginScreen";
import NewTicketScreen from "../screens/NewTicketScreen";
import ProfileScreen from "../screens/ProfileScreen";
import RegisterScreen from "../screens/RegisterScreen";
import TicketDetailScreen from "../screens/TicketDetailScreen";
import { appStyles } from "../styles/appStyles";
import { colors } from "../styles/theme";

import type { RootStackParamList } from "../types";

// Type the navigator with RootStackParamList so screen names and route params
// are checked by TypeScript.
const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { token, user, isLoading } = useAuth();

  if (isLoading) {
    // While AuthProvider restores saved token/user data, show a neutral loading
    // screen instead of briefly flashing the login screen.
    return (
      <View style={appStyles.loadingScreen}>
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
