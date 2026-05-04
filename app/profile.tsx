import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../lib/supabase";

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    total: 0,
    reading: 0,
    finished: 0,
    wantToRead: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      const { data, error } = await supabase
        .from("user_books")
        .select("status")
        .eq("user_id", user?.id);

      if (error) throw error;

      const total = data.length;
      const reading = data.filter((b) => b.status === "reading").length;
      const finished = data.filter((b) => b.status === "read").length;
      const wantToRead = data.filter((b) => b.status === "want_to_read").length;

      setStats({ total, reading, finished, wantToRead });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, []),
  );

  const handleSignOut = async () => {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6B4EFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.email?.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.memberSince}>
          Member since{" "}
          {new Date(user?.created_at).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </Text>
      </View>

      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Your reading stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total books</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: "#10B981" }]}>
              {stats.finished}
            </Text>
            <Text style={styles.statLabel}>Finished</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: "#F59E0B" }]}>
              {stats.reading}
            </Text>
            <Text style={styles.statLabel}>Reading</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: "#6B4EFF" }]}>
              {stats.wantToRead}
            </Text>
            <Text style={styles.statLabel}>Want to Read</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
            <Text style={styles.menuItemTextDanger}>Sign out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f8f8" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  hero: {
    backgroundColor: "#6B4EFF",
    paddingTop: 40,
    paddingBottom: 32,
    alignItems: "center",
    gap: 8,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  email: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  memberSince: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
  },
  statsSection: {
    padding: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    width: "47%",
    borderWidth: 1,
    borderColor: "#eee",
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#6B4EFF",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: "#888",
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 32,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    overflow: "hidden",
  },
  menuItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  menuItemTextDanger: {
    fontSize: 15,
    color: "#EF4444",
    fontWeight: "500",
  },
});
