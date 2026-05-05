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

      const total = data.length;
      const reading = data.filter((b) => b.status === "reading").length;
      const finished = data.filter((b) => b.status === "read").length;

      setStats({ total, reading, finished });
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
        <Text style={styles.greeting}>{getGreeting()}</Text>
        <Text style={styles.name}>{user?.email?.split("@")[0]}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total books</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.finished}</Text>
          <Text style={styles.statLabel}>Finished</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.reading}</Text>
          <Text style={styles.statLabel}>Reading now</Text>
        </View>
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
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
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
  container: { flex: 1, backgroundColor: "#f8f8f8" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  hero: {
    backgroundColor: "#6B4EFF",
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
  },
  greeting: { fontSize: 16, color: "rgba(255,255,255,0.8)", marginBottom: 4 },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textTransform: "capitalize",
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
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6B4EFF",
    marginBottom: 4,
  },
  statLabel: { fontSize: 11, color: "#888", textAlign: "center" },
  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
  },
  emptyIcon: { fontSize: 32, marginBottom: 12 },
  emptyText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  emptySubtext: { fontSize: 13, color: "#888", textAlign: "center" },
  bookRow: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    gap: 12,
    borderWidth: 1,
    borderColor: "#eee",
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
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  bookAuthor: { fontSize: 13, color: "#888", marginBottom: 6 },
  readingBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F59E0B20",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  readingBadgeText: { fontSize: 11, fontWeight: "600", color: "#F59E0B" },
  horizontalScroll: { marginLeft: -4 },
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
    fontWeight: "500",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  horizontalRating: { fontSize: 11 },
});
