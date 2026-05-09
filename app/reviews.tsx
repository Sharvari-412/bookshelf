import { Ionicons } from "@expo/vector-icons";
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
import { useTheme } from "../lib/ThemeContext";

export default function ReviewsScreen() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { colors } = useTheme();

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from("user_books")
        .select("*")
        .eq("user_id", user.id)
        .not("rating", "is", null)
        .order("date_added", { ascending: false });
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
      fetchReviews();
    }, []),
  );

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={{
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: colors.border,
      }}
      onPress={() => router.push(`/book-detail?id=${item.id}` as any)}
    >
      <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
        {item.cover_url ? (
          <Image
            source={{ uri: item.cover_url }}
            style={{ width: 55, height: 80, borderRadius: 8 }}
          />
        ) : (
          <View
            style={{
              width: 55,
              height: 80,
              borderRadius: 8,
              backgroundColor: colors.input,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 24 }}>📖</Text>
          </View>
        )}
        <View style={{ flex: 1, justifyContent: "center", gap: 6 }}>
          <Text
            style={{
              fontSize: 15,
              color: colors.text,
              fontFamily: theme.fonts.bold,
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
            {item.author}
          </Text>
          <View style={{ flexDirection: "row", gap: 2 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={star <= item.rating ? "star" : "star-outline"}
                size={14}
                color={star <= item.rating ? colors.warning : colors.border}
              />
            ))}
          </View>
        </View>
      </View>
      <View
        style={{
          backgroundColor: colors.input,
          borderRadius: 10,
          padding: 12,
          borderLeftWidth: 3,
          borderLeftColor: colors.primary,
        }}
      >
        {item.review ? (
          <Text
            style={{
              fontSize: 13,
              color: colors.textSecondary,
              lineHeight: 20,
              fontFamily: theme.fonts.regular,
            }}
            numberOfLines={4}
          >
            {item.review}
          </Text>
        ) : (
          <Text
            style={{
              fontSize: 13,
              color: colors.textMuted,
              fontFamily: theme.fonts.regular,
              fontStyle: "italic",
            }}
          >
            No written review
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{ marginTop: 40 }}
        />
      ) : books.length === 0 ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Text style={{ fontSize: 40, marginBottom: 12 }}>⭐</Text>
          <Text
            style={{
              fontSize: 16,
              color: colors.text,
              marginBottom: 4,
              fontFamily: theme.fonts.semibold,
            }}
          >
            No ratings yet
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: colors.textMuted,
              textAlign: "center",
              fontFamily: theme.fonts.regular,
            }}
          >
            Tap a book in your library and rate it
          </Text>
        </View>
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({});
