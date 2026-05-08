import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../lib/supabase";
import { theme } from "../lib/theme";

const TABS = [
  { label: "All", value: "all" },
  { label: "Reading", value: "reading" },
  { label: "Want to Read", value: "want_to_read" },
  { label: "Finished", value: "read" },
];

export default function LibraryScreen() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const router = useRouter();

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      let query = supabase
        .from("user_books")
        .select("*")
        .eq("user_id", user.id)
        .order("date_added", { ascending: false });
      if (activeTab !== "all") query = query.eq("status", activeTab);
      const { data, error } = await query;
      if (error) throw error;
      setBooks(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchBooks();
    }, [activeTab]),
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "reading":
        return theme.colors.warning;
      case "want_to_read":
        return theme.colors.primary;
      case "read":
        return theme.colors.success;
      case "dnf":
        return theme.colors.danger;
      default:
        return theme.colors.textMuted;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "reading":
        return "Reading";
      case "want_to_read":
        return "Want to Read";
      case "read":
        return "Finished";
      case "dnf":
        return "DNF";
      default:
        return status;
    }
  };

  const renderBook = ({ item }: any) => (
    <TouchableOpacity
      style={styles.bookCard}
      onPress={() => router.push(`/book-detail?id=${item.id}` as any)}
    >
      <View style={styles.coverContainer}>
        {item.cover_url ? (
          <Image source={{ uri: item.cover_url }} style={styles.cover} />
        ) : (
          <View style={styles.noCover}>
            <Text style={styles.noCoverText}>No cover</Text>
          </View>
        )}
      </View>
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>
          {item.author}
        </Text>
        {item.year ? <Text style={styles.bookYear}>{item.year}</Text> : null}
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + "20" },
          ]}
        >
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {getStatusLabel(item.status)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.value}
            style={[styles.tab, activeTab === tab.value && styles.activeTab]}
            onPress={() => setActiveTab(tab.value)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.value && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {loading ? (
        <ActivityIndicator
          size="large"
          color={theme.colors.primary}
          style={styles.loader}
        />
      ) : books.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📚</Text>
          <Text style={styles.emptyText}>No books here yet</Text>
          <Text style={styles.emptySubtext}>
            Search for books and add them to your library
          </Text>
        </View>
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => item.id}
          renderItem={renderBook}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  tabs: {
    flexDirection: "row",
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingHorizontal: 8,
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  activeTab: { borderBottomWidth: 2, borderBottomColor: theme.colors.primary },
  tabText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.semibold,
  },
  activeTabText: { color: theme.colors.primary, fontFamily: theme.fonts.bold },
  loader: { marginTop: 40 },
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 4,
    fontFamily: theme.fonts.semibold,
  },
  emptySubtext: {
    fontSize: 13,
    color: theme.colors.textMuted,
    textAlign: "center",
    paddingHorizontal: 32,
    fontFamily: theme.fonts.regular,
  },
  list: { padding: 16, gap: 12 },
  bookCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    gap: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  coverContainer: {
    width: 60,
    height: 90,
    borderRadius: 6,
    overflow: "hidden",
  },
  cover: { width: 60, height: 90 },
  noCover: {
    width: 60,
    height: 90,
    backgroundColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
  },
  noCoverText: {
    fontSize: 10,
    color: "#aaa",
    textAlign: "center",
    fontFamily: theme.fonts.regular,
  },
  bookInfo: { flex: 1, justifyContent: "center", gap: 4 },
  bookTitle: {
    fontSize: 15,
    color: theme.colors.text,
    fontFamily: theme.fonts.semibold,
  },
  bookAuthor: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
  },
  bookYear: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  statusText: { fontSize: 11, fontFamily: theme.fonts.semibold },
});
