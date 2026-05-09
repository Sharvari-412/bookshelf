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
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { supabase } from "../lib/supabase";
import { theme } from "../lib/theme";
import { useTheme } from "../lib/ThemeContext";

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ total: 0, reading: 0, finished: 0 });
  const [currentlyReading, setCurrentlyReading] = useState<any[]>([]);
  const [recentlyFinished, setRecentlyFinished] = useState<any[]>([]);
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const fetchData = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user?.id)
        .single();
      setUser({ ...user, username: profile?.username });
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
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );

  const STAT_CARDS = [
    {
      label: "Total",
      value: stats.total,
      bg: isDark ? "#2D2B5E" : "#EEF2FF",
      color: colors.primary,
    },
    {
      label: "Finished",
      value: stats.finished,
      bg: isDark ? "#0D3D2E" : "#ECFDF5",
      color: colors.success,
    },
    {
      label: "Reading",
      value: stats.reading,
      bg: isDark ? "#3D2E0A" : "#FFFBEB",
      color: colors.warning,
    },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View
        entering={FadeInUp.duration(500)}
        style={{
          backgroundColor: colors.hero,
          paddingHorizontal: 24,
          paddingTop: 40,
          paddingBottom: 32,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            color: "rgba(255,255,255,0.8)",
            marginBottom: 4,
            fontFamily: theme.fonts.regular,
          }}
        >
          {getGreeting()}
        </Text>
        <Text
          style={{
            fontSize: 28,
            color: "#fff",
            textTransform: "capitalize",
            fontFamily: theme.fonts.bold,
          }}
        >
          {user?.username || user?.email?.split("@")[0]}
        </Text>
      </Animated.View>

      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: 16,
          gap: 10,
          marginTop: -20,
          marginBottom: 24,
        }}
      >
        {STAT_CARDS.map((stat, i) => (
          <Animated.View
            key={stat.label}
            entering={FadeInDown.delay(i * 100).duration(500)}
            style={{
              flex: 1,
              borderRadius: 16,
              padding: 16,
              alignItems: "center",
              backgroundColor: stat.bg,
              elevation: 3,
            }}
          >
            <Text
              style={{
                fontSize: 24,
                color: stat.color,
                marginBottom: 4,
                fontFamily: theme.fonts.bold,
              }}
            >
              {stat.value}
            </Text>
            <Text
              style={{
                fontSize: 11,
                color: stat.color,
                textAlign: "center",
                fontFamily: theme.fonts.semibold,
              }}
            >
              {stat.label}
            </Text>
          </Animated.View>
        ))}
      </View>

      <Animated.View
        entering={FadeInDown.delay(300).duration(500)}
        style={{ paddingHorizontal: 16, marginBottom: 24 }}
      >
        <Text
          style={{
            fontSize: 18,
            color: colors.text,
            marginBottom: 12,
            fontFamily: theme.fonts.bold,
          }}
        >
          Currently reading
        </Text>
        {currentlyReading.length === 0 ? (
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 12,
              padding: 32,
              alignItems: "center",
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ fontSize: 32, marginBottom: 12 }}>📚</Text>
            <Text
              style={{
                fontSize: 15,
                color: colors.text,
                marginBottom: 4,
                fontFamily: theme.fonts.semibold,
              }}
            >
              No books in progress
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: colors.textMuted,
                textAlign: "center",
                fontFamily: theme.fonts.regular,
              }}
            >
              Search for a book to get started
            </Text>
          </View>
        ) : (
          currentlyReading.map((book) => (
            <TouchableOpacity
              key={book.id}
              style={{
                backgroundColor: colors.card,
                borderRadius: 12,
                padding: 12,
                flexDirection: "row",
                gap: 12,
                borderWidth: 1,
                borderColor: colors.border,
                marginBottom: 8,
                alignItems: "center",
              }}
              onPress={() => router.push(`/book-detail?id=${book.id}` as any)}
            >
              {book.cover_url ? (
                <Image
                  source={{ uri: book.cover_url }}
                  style={{ width: 50, height: 70, borderRadius: 6 }}
                />
              ) : (
                <View
                  style={{
                    width: 50,
                    height: 70,
                    borderRadius: 6,
                    backgroundColor: colors.input,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 24 }}>📖</Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 15,
                    color: colors.text,
                    marginBottom: 4,
                    fontFamily: theme.fonts.semibold,
                  }}
                  numberOfLines={2}
                >
                  {book.title}
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: colors.textMuted,
                    marginBottom: 6,
                    fontFamily: theme.fonts.regular,
                  }}
                  numberOfLines={1}
                >
                  {book.author}
                </Text>
                <View
                  style={{
                    alignSelf: "flex-start",
                    backgroundColor: colors.warning + "20",
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 6,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      color: colors.warning,
                      fontFamily: theme.fonts.semibold,
                    }}
                  >
                    Reading
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </Animated.View>

      {recentlyFinished.length > 0 && (
        <Animated.View
          entering={FadeInDown.delay(400).duration(500)}
          style={{ paddingHorizontal: 16, marginBottom: 24 }}
        >
          <Text
            style={{
              fontSize: 18,
              color: colors.text,
              marginBottom: 12,
              fontFamily: theme.fonts.bold,
            }}
          >
            Recently finished
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {recentlyFinished.map((book) => (
              <TouchableOpacity
                key={book.id}
                style={{ width: 100, marginRight: 12 }}
                onPress={() => router.push(`/book-detail?id=${book.id}` as any)}
              >
                {book.cover_url ? (
                  <Image
                    source={{ uri: book.cover_url }}
                    style={{
                      width: 100,
                      height: 140,
                      borderRadius: 8,
                      marginBottom: 8,
                    }}
                  />
                ) : (
                  <View
                    style={{
                      width: 100,
                      height: 140,
                      borderRadius: 8,
                      marginBottom: 8,
                      backgroundColor: colors.input,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontSize: 32 }}>📖</Text>
                  </View>
                )}
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.text,
                    marginBottom: 4,
                    fontFamily: theme.fonts.semibold,
                  }}
                  numberOfLines={2}
                >
                  {book.title}
                </Text>
                {book.rating ? (
                  <Text style={{ fontSize: 11 }}>
                    {"⭐".repeat(book.rating)}
                  </Text>
                ) : null}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({});
