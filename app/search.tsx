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
import { useTheme } from "../lib/ThemeContext";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const { colors } = useTheme();

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
      const { error } = await supabase
        .from("user_books")
        .insert({
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
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 12,
          padding: 12,
          flexDirection: "row",
          gap: 12,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <View
          style={{ width: 60, height: 90, borderRadius: 6, overflow: "hidden" }}
        >
          {cover ? (
            <Image source={{ uri: cover }} style={{ width: 60, height: 90 }} />
          ) : (
            <View
              style={{
                width: 60,
                height: 90,
                backgroundColor: colors.input,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  color: colors.textMuted,
                  textAlign: "center",
                  fontFamily: theme.fonts.regular,
                }}
              >
                No cover
              </Text>
            </View>
          )}
        </View>
        <View style={{ flex: 1, justifyContent: "center", gap: 4 }}>
          <Text
            style={{
              fontSize: 15,
              color: colors.text,
              fontFamily: theme.fonts.semibold,
            }}
            numberOfLines={2}
          >
            {item.title}
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: colors.textSecondary,
              fontFamily: theme.fonts.regular,
            }}
            numberOfLines={1}
          >
            {item.author_name?.join(", ") || "Unknown author"}
          </Text>
          {item.first_publish_year ? (
            <Text
              style={{
                fontSize: 12,
                color: colors.textMuted,
                fontFamily: theme.fonts.regular,
              }}
            >
              {String(item.first_publish_year)}
            </Text>
          ) : null}
          <View
            style={{
              flexDirection: "row",
              gap: 6,
              marginTop: 8,
              flexWrap: "wrap",
            }}
          >
            <TouchableOpacity
              style={{
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 6,
                backgroundColor: colors.warning,
              }}
              onPress={() => addToLibrary(item, "reading")}
              disabled={isAdding}
            >
              <Text
                style={{
                  fontSize: 11,
                  color: "#fff",
                  fontFamily: theme.fonts.semibold,
                }}
              >
                Reading
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 6,
                backgroundColor: colors.primary,
              }}
              onPress={() => addToLibrary(item, "want_to_read")}
              disabled={isAdding}
            >
              <Text
                style={{
                  fontSize: 11,
                  color: "#fff",
                  fontFamily: theme.fonts.semibold,
                }}
              >
                Want to Read
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 6,
                backgroundColor: colors.success,
              }}
              onPress={() => addToLibrary(item, "read")}
              disabled={isAdding}
            >
              <Text
                style={{
                  fontSize: 11,
                  color: "#fff",
                  fontFamily: theme.fonts.semibold,
                }}
              >
                Finished
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          flexDirection: "row",
          padding: 16,
          gap: 10,
          backgroundColor: colors.card,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <TextInput
          style={{
            flex: 1,
            backgroundColor: colors.input,
            borderRadius: 10,
            paddingHorizontal: 14,
            paddingVertical: 10,
            fontSize: 15,
            color: colors.text,
            fontFamily: theme.fonts.regular,
          }}
          placeholder="Search books, authors..."
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={searchBooks}
          returnKeyType="search"
        />
        <TouchableOpacity
          style={{
            backgroundColor: colors.primary,
            borderRadius: 10,
            paddingHorizontal: 18,
            justifyContent: "center",
          }}
          onPress={searchBooks}
        >
          <Text
            style={{
              color: "#fff",
              fontFamily: theme.fonts.semibold,
              fontSize: 14,
            }}
          >
            Search
          </Text>
        </TouchableOpacity>
      </View>
      {loading && (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{ marginTop: 40 }}
        />
      )}
      {!loading && searched && books.length === 0 && (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Text
            style={{
              fontSize: 16,
              color: colors.text,
              fontFamily: theme.fonts.semibold,
            }}
          >
            No books found
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: colors.textMuted,
              fontFamily: theme.fonts.regular,
            }}
          >
            Try a different search term
          </Text>
        </View>
      )}
      {!loading && !searched && (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Text style={{ fontSize: 40, marginBottom: 12 }}>🔍</Text>
          <Text
            style={{
              fontSize: 16,
              color: colors.text,
              fontFamily: theme.fonts.semibold,
            }}
          >
            Find your next read
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: colors.textMuted,
              fontFamily: theme.fonts.regular,
            }}
          >
            Search by title, author or ISBN
          </Text>
        </View>
      )}
      <FlatList
        data={books}
        keyExtractor={(item: any) => item.key}
        renderItem={renderBook}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({});
