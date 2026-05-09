import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../lib/supabase";
import { theme } from "../lib/theme";
import { useTheme } from "../lib/ThemeContext";

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    reading: 0,
    finished: 0,
    wantToRead: 0,
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { colors } = useTheme();

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user?.id)
        .single();
      if (profile) setUsername(profile.username);
      const { data, error } = await supabase
        .from("user_books")
        .select("status")
        .eq("user_id", user?.id);
      if (error) throw error;
      setStats({
        total: data.length,
        reading: data.filter((b) => b.status === "reading").length,
        finished: data.filter((b) => b.status === "read").length,
        wantToRead: data.filter((b) => b.status === "want_to_read").length,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, []),
  );

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

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={{
          backgroundColor: colors.hero,
          paddingTop: 40,
          paddingBottom: 32,
          alignItems: "center",
          gap: 6,
        }}
      >
        <TouchableOpacity
          style={{ position: "absolute", top: 40, right: 20, padding: 8 }}
          onPress={() => router.push("/settings" as any)}
        >
          <Ionicons name="settings-outline" size={22} color="#fff" />
        </TouchableOpacity>
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: "rgba(255,255,255,0.25)",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 4,
          }}
        >
          <Text
            style={{
              fontSize: 28,
              color: "#fff",
              fontFamily: theme.fonts.bold,
            }}
          >
            {username
              ? username.charAt(0).toUpperCase()
              : user?.email?.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text
          style={{ fontSize: 20, color: "#fff", fontFamily: theme.fonts.bold }}
        >
          @{username || user?.email?.split("@")[0]}
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.7)",
            fontFamily: theme.fonts.regular,
          }}
        >
          {user?.email}
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.6)",
            fontFamily: theme.fonts.regular,
          }}
        >
          Member since{" "}
          {new Date(user?.created_at).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </Text>
      </View>

      <View style={{ padding: 16, marginTop: 16 }}>
        <Text
          style={{
            fontSize: 18,
            color: colors.text,
            marginBottom: 12,
            fontFamily: theme.fonts.bold,
          }}
        >
          Your reading stats
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          {[
            {
              label: "Total books",
              value: stats.total,
              color: colors.primary,
              bg: colors.primary + "20",
            },
            {
              label: "Finished",
              value: stats.finished,
              color: colors.success,
              bg: colors.success + "20",
            },
            {
              label: "Reading",
              value: stats.reading,
              color: colors.warning,
              bg: colors.warning + "20",
            },
            {
              label: "Want to Read",
              value: stats.wantToRead,
              color: colors.primary,
              bg: colors.primary + "20",
            },
          ].map((stat) => (
            <View
              key={stat.label}
              style={{
                borderRadius: 16,
                padding: 16,
                alignItems: "center",
                width: "47%",
                backgroundColor: stat.bg,
              }}
            >
              <Text
                style={{
                  fontSize: 28,
                  marginBottom: 4,
                  fontFamily: theme.fonts.bold,
                  color: stat.color,
                }}
              >
                {stat.value}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: theme.fonts.semibold,
                  textAlign: "center",
                  color: stat.color,
                }}
              >
                {stat.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ paddingHorizontal: 16, marginTop: 8, marginBottom: 32 }}>
        <Text
          style={{
            fontSize: 18,
            color: colors.text,
            marginBottom: 12,
            fontFamily: theme.fonts.bold,
          }}
        >
          My reading
        </Text>
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: "hidden",
          }}
        >
          <TouchableOpacity
            style={{
              padding: 16,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
            onPress={() => router.push("/reviews" as any)}
          >
            <Text
              style={{
                fontSize: 15,
                color: colors.text,
                fontFamily: theme.fonts.semibold,
              }}
            >
              ⭐ My Reviews & Ratings
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({});
