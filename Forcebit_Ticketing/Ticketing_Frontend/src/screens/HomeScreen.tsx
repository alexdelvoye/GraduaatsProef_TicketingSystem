import { View, Text, Pressable } from "react-native";
import { useAuth } from "../context/AuthContext";
import { homeStyles as styles } from "../styles/homeStyles";

export default function HomeScreen() {
  const { user, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>FORCEBIT</Text>

        <Pressable onPress={signOut} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Ticketing System</Text>

        <Text style={styles.label}>Logged in as</Text>
        <Text style={styles.value}>{user?.name}</Text>

        <Text style={styles.label}>Company</Text>
        <Text style={styles.value}>{user?.companyName}</Text>

        <Text style={styles.label}>Role</Text>
        <Text style={styles.role}>{user?.role}</Text>
      </View>

      <View style={styles.card}>
        {user?.role === "Admin" ? (
          <>
            <Text style={styles.sectionTitle}>Admin dashboard</Text>
            <Text style={styles.muted}>
              Next: show client list and open tickets.
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>My tickets</Text>
            <Text style={styles.muted}>
              Next: show your ticket overview here.
            </Text>
          </>
        )}
      </View>

      <Pressable style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>
          {user?.role === "Admin" ? "View clients" : "Create new ticket"}
        </Text>
      </Pressable>
    </View>
  );
}
