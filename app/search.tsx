import { useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

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

  const renderBook = ({ item }: any) => {
    const cover = item.cover_i
      ? `https://covers.openlibrary.org/b/id/${item.cover_i}-M.jpg`
      : null;
    const authors = item.author_name?.join(", ") || "Unknown author";
    const year = item.first_publish_year || "";

    return (
      <TouchableOpacity style={styles.bookCard}>
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
            {authors}
          </Text>
          {year ? <Text style={styles.bookYear}>{String(year)}</Text> : null}
        </View>
      </TouchableOpacity>
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
        <ActivityIndicator size="large" color="#6B4EFF" style={styles.loader} />
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
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  searchBar: {
    flexDirection: "row",
    padding: 16,
    gap: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  input: {
    flex: 1,
    backgroundColor: "#f3f3f3",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: "#1a1a1a",
  },
  searchButton: {
    backgroundColor: "#6B4EFF",
    borderRadius: 10,
    paddingHorizontal: 18,
    justifyContent: "center",
  },
  searchButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  loader: {
    marginTop: 40,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
    color: "#888",
  },
  list: {
    padding: 16,
    gap: 12,
  },
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
  cover: {
    width: 60,
    height: 90,
  },
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
  },
  bookInfo: {
    flex: 1,
    justifyContent: "center",
    gap: 4,
  },
  bookTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  bookAuthor: {
    fontSize: 13,
    color: "#555",
  },
  bookYear: {
    fontSize: 12,
    color: "#aaa",
  },
});
