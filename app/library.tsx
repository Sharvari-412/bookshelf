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
  const { colors } = useTheme();

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
        return colors.warning;
      case "want_to_read":
        return colors.primary;
      case "read":
        return colors.success;
      case "dnf":
        return colors.danger;
      default:
        return colors.textMuted;
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
      style={{
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 12,
        flexDirection: "row",
        gap: 12,
        borderWidth: 1,
        borderColor: colors.border,
      }}
      onPress={() => router.push(`/book-detail?id=${item.id}` as any)}
    >
      <View
        style={{ width: 60, height: 90, borderRadius: 6, overflow: "hidden" }}
      >
        {item.cover_url ? (
          <Image
            source={{ uri: item.cover_url }}
            style={{ width: 60, height: 90 }}
          />
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
          {item.author}
        </Text>
        {item.year ? (
          <Text
            style={{
              fontSize: 12,
              color: colors.textMuted,
              fontFamily: theme.fonts.regular,
            }}
          >
            {item.year}
          </Text>
        ) : null}
        <View
          style={{
            alignSelf: "flex-start",
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 6,
            backgroundColor: getStatusColor(item.status) + "20",
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontFamily: theme.fonts.semibold,
              color: getStatusColor(item.status),
            }}
          >
            {getStatusLabel(item.status)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          flexDirection: "row",
          backgroundColor: colors.card,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          paddingHorizontal: 8,
        }}
      >
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.value}
            style={{
              flex: 1,
              paddingVertical: 12,
              alignItems: "center",
              borderBottomWidth: activeTab === tab.value ? 2 : 0,
              borderBottomColor: colors.primary,
            }}
            onPress={() => setActiveTab(tab.value)}
          >
            <Text
              style={{
                fontSize: 12,
                color:
                  activeTab === tab.value ? colors.primary : colors.textMuted,
                fontFamily:
                  activeTab === tab.value
                    ? theme.fonts.bold
                    : theme.fonts.semibold,
              }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
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
          <Text style={{ fontSize: 40, marginBottom: 12 }}>📚</Text>
          <Text
            style={{
              fontSize: 16,
              color: colors.text,
              marginBottom: 4,
              fontFamily: theme.fonts.semibold,
            }}
          >
            No books here yet
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: colors.textMuted,
              textAlign: "center",
              paddingHorizontal: 32,
              fontFamily: theme.fonts.regular,
            }}
          >
            Search for books and add them to your library
          </Text>
        </View>
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => item.id}
          renderItem={renderBook}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({});
