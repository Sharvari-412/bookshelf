import { useFocusEffect } from "expo-router";
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

      if (activeTab !== "all") {
        query = query.eq("status", activeTab);
      }

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
        return "#F59E0B";
      case "want_to_read":
        return "#6B4EFF";
      case "read":
        return "#10B981";
      case "dnf":
        return "#EF4444";
      default:
        return "#888";
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
    <View style={styles.bookCard}>
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
    </View>
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
        <ActivityIndicator size="large" color="#6B4EFF" style={styles.loader} />
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
  container: { flex: 1, backgroundColor: "#f8f8f8" },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#6B4EFF",
  },
  tabText: {
    fontSize: 12,
    color: "#888",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#6B4EFF",
    fontWeight: "600",
  },
  loader: { marginTop: 40 },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
    color: "#888",
    textAlign: "center",
    paddingHorizontal: 32,
  },
  list: { padding: 16, gap: 12 },
  bookCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    gap: 12,
    borderWidth: 1,
    borderColor: "#eee",
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
  noCoverText: { fontSize: 10, color: "#aaa", textAlign: "center" },
  bookInfo: { flex: 1, justifyContent: "center", gap: 4 },
  bookTitle: { fontSize: 15, fontWeight: "600", color: "#1a1a1a" },
  bookAuthor: { fontSize: 13, color: "#555" },
  bookYear: { fontSize: 12, color: "#aaa" },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  statusText: { fontSize: 11, fontWeight: "600" },
});
