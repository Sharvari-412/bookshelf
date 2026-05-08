import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../lib/supabase";
import { theme } from "../lib/theme";

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ total: 0, reading: 0, finished: 0 });
  const [currentlyReading, setCurrentlyReading] = useState<any[]>([]);
  const [recentlyFinished, setRecentlyFinished] = useState<any[]>([]);
  const router = useRouter();

  const fetchData = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      const { data, error } = await supabase
        .from("user_books")
        .select("*")
        .eq("user_id", user?.id)
        .order("date_added", { ascending: false });
      if (error) throw error;
      setStats({
        total: data.length,
        reading: data.filter((b) => b.status === "reading").length,
        finished: data.filter((b) => b.status === "read").length,
      });
      setCurrentlyReading(
        data.filter((b) => b.status === "reading").slice(0, 3),
      );
      setRecentlyFinished(data.filter((b) => b.status === "read").slice(0, 5));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, []),
  );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning 👋";
    if (hour < 18) return "Good afternoon 👋";
    return "Good evening 👋";
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
        <Text style={styles.greeting}>{getGreeting()}</Text>
        <Text style={styles.name}>{user?.email?.split("@")[0]}</Text>
      </View>

      <View style={styles.statsRow}>
        {[
          { label: "Total books", value: stats.total },
          { label: "Finished", value: stats.finished },
          { label: "Reading", value: stats.reading },
        ].map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <Text style={styles.statNumber}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Currently reading</Text>
        {currentlyReading.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📚</Text>
            <Text style={styles.emptyText}>No books in progress</Text>
            <Text style={styles.emptySubtext}>
              Search for a book to get started
            </Text>
          </View>
        ) : (
          currentlyReading.map((book) => (
            <TouchableOpacity
              key={book.id}
              style={styles.bookRow}
              onPress={() => router.push(`/book-detail?id=${book.id}` as any)}
            >
              {book.cover_url ? (
                <Image source={{ uri: book.cover_url }} style={styles.cover} />
              ) : (
                <View style={styles.noCover}>
                  <Text style={styles.noCoverEmoji}>📖</Text>
                </View>
              )}
              <View style={styles.bookInfo}>
                <Text style={styles.bookTitle} numberOfLines={2}>
                  {book.title}
                </Text>
                <Text style={styles.bookAuthor} numberOfLines={1}>
                  {book.author}
                </Text>
                <View style={styles.readingBadge}>
                  <Text style={styles.readingBadgeText}>Reading</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      {recentlyFinished.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recently finished</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {recentlyFinished.map((book) => (
              <TouchableOpacity
                key={book.id}
                style={styles.horizontalBook}
                onPress={() => router.push(`/book-detail?id=${book.id}` as any)}
              >
                {book.cover_url ? (
                  <Image
                    source={{ uri: book.cover_url }}
                    style={styles.horizontalCover}
                  />
                ) : (
                  <View
                    style={[styles.horizontalCover, styles.noCoverHorizontal]}
                  >
                    <Text style={styles.noCoverEmoji}>📖</Text>
                  </View>
                )}
                <Text style={styles.horizontalTitle} numberOfLines={2}>
                  {book.title}
                </Text>
                {book.rating ? (
                  <Text style={styles.horizontalRating}>
                    {"⭐".repeat(book.rating)}
                  </Text>
                ) : null}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  hero: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
  },
  greeting: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 4,
    fontFamily: theme.fonts.regular,
  },
  name: {
    fontSize: 28,
    color: "#fff",
    textTransform: "capitalize",
    fontFamily: theme.fonts.bold,
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 10,
    marginTop: -20,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  statNumber: {
    fontSize: 24,
    color: theme.colors.primary,
    marginBottom: 4,
    fontFamily: theme.fonts.bold,
  },
  statLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    textAlign: "center",
    fontFamily: theme.fonts.regular,
  },
  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionTitle: {
    fontSize: 18,
    color: theme.colors.text,
    marginBottom: 12,
    fontFamily: theme.fonts.bold,
  },
  emptyCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  emptyIcon: { fontSize: 32, marginBottom: 12 },
  emptyText: {
    fontSize: 15,
    color: theme.colors.text,
    marginBottom: 4,
    fontFamily: theme.fonts.semibold,
  },
  emptySubtext: {
    fontSize: 13,
    color: theme.colors.textMuted,
    textAlign: "center",
    fontFamily: theme.fonts.regular,
  },
  bookRow: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    gap: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 8,
    alignItems: "center",
  },
  cover: { width: 50, height: 70, borderRadius: 6 },
  noCover: {
    width: 50,
    height: 70,
    borderRadius: 6,
    backgroundColor: "#f3f3f3",
    alignItems: "center",
    justifyContent: "center",
  },
  noCoverEmoji: { fontSize: 24 },
  bookInfo: { flex: 1 },
  bookTitle: {
    fontSize: 15,
    color: theme.colors.text,
    marginBottom: 4,
    fontFamily: theme.fonts.semibold,
  },
  bookAuthor: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginBottom: 6,
    fontFamily: theme.fonts.regular,
  },
  readingBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F59E0B20",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  readingBadgeText: {
    fontSize: 11,
    color: theme.colors.warning,
    fontFamily: theme.fonts.semibold,
  },
  horizontalBook: { width: 100, marginRight: 12 },
  horizontalCover: {
    width: 100,
    height: 140,
    borderRadius: 8,
    marginBottom: 8,
  },
  noCoverHorizontal: {
    backgroundColor: "#f3f3f3",
    alignItems: "center",
    justifyContent: "center",
  },
  horizontalTitle: {
    fontSize: 12,
    color: theme.colors.text,
    marginBottom: 4,
    fontFamily: theme.fonts.semibold,
  },
  horizontalRating: { fontSize: 11 },
});
