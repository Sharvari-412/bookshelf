import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../lib/supabase";
import { theme } from "../lib/theme";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);

  const searchBooks = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const response = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=20`,
      );
      const data = await response.json();
      setBooks(data.docs || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addToLibrary = async (item: any, status: string) => {
    setAdding(item.key);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const cover = item.cover_i
        ? `https://covers.openlibrary.org/b/id/${item.cover_i}-M.jpg`
        : null;
      const { error } = await supabase.from("user_books").insert({
        user_id: user.id,
        book_id: item.key,
        title: item.title,
        author: item.author_name?.join(", ") || "Unknown author",
        cover_url: cover,
        year: item.first_publish_year?.toString() || "",
        status,
      });
      if (error) throw error;
      Alert.alert("Added!", `"${item.title}" added to your library.`);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setAdding(null);
    }
  };

  const renderBook = ({ item }: any) => {
    const cover = item.cover_i
      ? `https://covers.openlibrary.org/b/id/${item.cover_i}-M.jpg`
      : null;
    const isAdding = adding === item.key;
    return (
      <View style={styles.bookCard}>
        <View style={styles.coverContainer}>
          {cover ? (
            <Image source={{ uri: cover }} style={styles.cover} />
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
            {item.author_name?.join(", ") || "Unknown author"}
          </Text>
          {item.first_publish_year ? (
            <Text style={styles.bookYear}>
              {String(item.first_publish_year)}
            </Text>
          ) : null}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.readingBtn]}
              onPress={() => addToLibrary(item, "reading")}
              disabled={isAdding}
            >
              <Text style={styles.actionBtnText}>Reading</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.wantBtn]}
              onPress={() => addToLibrary(item, "want_to_read")}
              disabled={isAdding}
            >
              <Text style={styles.actionBtnText}>Want to Read</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.readBtn]}
              onPress={() => addToLibrary(item, "read")}
              disabled={isAdding}
            >
              <Text style={styles.actionBtnText}>Finished</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          placeholder="Search books, authors..."
          placeholderTextColor="#aaa"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={searchBooks}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={searchBooks}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>
      {loading && (
        <ActivityIndicator
          size="large"
          color={theme.colors.primary}
          style={styles.loader}
        />
      )}
      {!loading && searched && books.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No books found</Text>
          <Text style={styles.emptySubtext}>Try a different search term</Text>
        </View>
      )}
      {!loading && !searched && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyText}>Find your next read</Text>
          <Text style={styles.emptySubtext}>
            Search by title, author or ISBN
          </Text>
        </View>
      )}
      <FlatList
        data={books}
        keyExtractor={(item: any) => item.key}
        renderItem={renderBook}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  searchBar: {
    flexDirection: "row",
    padding: 16,
    gap: 10,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: "#f3f3f3",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
  },
  searchButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    paddingHorizontal: 18,
    justifyContent: "center",
  },
  searchButtonText: {
    color: "#fff",
    fontFamily: theme.fonts.semibold,
    fontSize: 14,
  },
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
  actions: { flexDirection: "row", gap: 6, marginTop: 8, flexWrap: "wrap" },
  actionBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  actionBtnText: {
    fontSize: 11,
    color: "#fff",
    fontFamily: theme.fonts.semibold,
  },
  readingBtn: { backgroundColor: theme.colors.warning },
  wantBtn: { backgroundColor: theme.colors.primary },
  readBtn: { backgroundColor: theme.colors.success },
});
