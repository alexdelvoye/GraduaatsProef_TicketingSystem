import { NativeStackScreenProps } from "@react-navigation/native-stack";

// Central list of all navigation routes and their params. undefined means the
// screen does not require route parameters.
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  AdminHome: undefined;
  Home: undefined;
  NewTicket: undefined;
  Profile: undefined;
  TicketDetail: { ticketId: string };
};

// Screen prop aliases keep component signatures readable and type-safe.
export type LoginScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Login"
>;

export type RegisterScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Register"
>;

export type AdminScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "AdminHome"
>;

export type HomeScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Home"
>;

export type NewTicketScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "NewTicket"
>;

export type ProfileScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Profile"
>;

export type TicketDetailScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "TicketDetail"
>;
