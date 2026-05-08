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
import { theme } from "../lib/theme";

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
      setStats({
        total: data.length,
        reading: data.filter((b) => b.status === "reading").length,
        finished: data.filter((b) => b.status === "read").length,
        wantToRead: data.filter((b) => b.status === "want_to_read").length,
      });
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
    Alert.alert("Sign out", "Are you sure?", [
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

  if (loading)
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );

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
          {[
            {
              label: "Total books",
              value: stats.total,
              color: theme.colors.primary,
            },
            {
              label: "Finished",
              value: stats.finished,
              color: theme.colors.success,
            },
            {
              label: "Reading",
              value: stats.reading,
              color: theme.colors.warning,
            },
            {
              label: "Want to Read",
              value: stats.wantToRead,
              color: theme.colors.primary,
            },
          ].map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <Text style={[styles.statNumber, { color: stat.color }]}>
                {stat.value}
              </Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
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
  container: { flex: 1, backgroundColor: theme.colors.background },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  hero: {
    backgroundColor: theme.colors.primary,
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
  avatarText: { fontSize: 28, color: "#fff", fontFamily: theme.fonts.bold },
  email: { fontSize: 16, color: "#fff", fontFamily: theme.fonts.semibold },
  memberSince: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    fontFamily: theme.fonts.regular,
  },
  statsSection: { padding: 16, marginTop: 16 },
  sectionTitle: {
    fontSize: 18,
    color: theme.colors.text,
    marginBottom: 12,
    fontFamily: theme.fonts.bold,
  },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    width: "47%",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statNumber: { fontSize: 28, marginBottom: 4, fontFamily: theme.fonts.bold },
  statLabel: {
    fontSize: 13,
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
  },
  section: { paddingHorizontal: 16, marginTop: 8, marginBottom: 32 },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
  },
  menuItem: { padding: 16 },
  menuItemTextDanger: {
    fontSize: 15,
    color: theme.colors.danger,
    fontFamily: theme.fonts.semibold,
  },
});
